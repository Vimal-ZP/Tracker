import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromptModel from '@/models/Prompt';
import PromptCategoryModel from '@/models/PromptCategory';
import { verifyToken } from '@/lib/auth';

// GET /api/prompts/stats - Get prompt statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includePersonal = searchParams.get('personal') === 'true';
    
    // Build base filter
    let baseFilter: any = { isActive: true };
    if (includePersonal && userId) {
      baseFilter.createdBy = userId;
    } else if (includePersonal) {
      baseFilter.createdBy = decoded.userId;
    }
    
    // Get basic stats
    const [
      totalPrompts,
      activePrompts,
      favoritePrompts,
      usageStats,
      categoryStats,
      tagStats,
      modelStats,
      languageStats,
      usageByMonth,
      topPrompts,
      recentPrompts
    ] = await Promise.all([
      PromptModel.countDocuments(baseFilter),
      PromptModel.countDocuments({ ...baseFilter, isActive: true }),
      PromptModel.countDocuments({ ...baseFilter, isFavorite: true }),
      
      // Total usage
      PromptModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
      ]),
      
      // Category stats
      PromptModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } },
        { $sort: { count: -1 } }
      ]),
      
      // Tag stats
      PromptModel.aggregate([
        { $match: baseFilter },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      
      // Model stats
      PromptModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$model', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } },
        { $sort: { count: -1 } }
      ]),
      
      // Language stats
      PromptModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$language', count: { $sum: 1 }, usage: { $sum: '$usageCount' } } },
        { $sort: { count: -1 } }
      ]),
      
      // Usage by month
      PromptModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              year: { $year: '$updatedAt' },
              month: { $month: '$updatedAt' }
            },
            count: { $sum: '$usageCount' },
            prompts: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
        {
          $project: {
            month: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                { $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]}
              ]
            },
            count: 1,
            prompts: 1
          }
        }
      ]),
      
      // Top prompts by usage
      PromptModel.find(baseFilter)
        .sort({ usageCount: -1 })
        .limit(10)
        .select('title usageCount category tags createdAt')
        .lean(),
      
      // Recent prompts
      PromptModel.find(baseFilter)
        .sort({ updatedAt: -1 })
        .limit(10)
        .select('title usageCount category tags updatedAt')
        .lean()
    ]);
    
    // Get category information
    const categoryIds = categoryStats.map((stat: any) => stat._id);
    const categories = await PromptCategoryModel.find({
      id: { $in: categoryIds },
      isActive: true
    }).select('id name color icon').lean();
    
    const categoryMap = categories.reduce((acc: any, cat: any) => {
      acc[cat.id] = cat;
      return acc;
    }, {});
    
    // Format category stats with category info
    const formattedCategoryStats = categoryStats.map((stat: any) => ({
      ...stat,
      categoryInfo: categoryMap[stat._id] || { name: stat._id, color: '#6B7280', icon: 'Folder' }
    }));
    
    // Calculate averages and additional metrics
    const averageUsagePerPrompt = totalPrompts > 0 ? (usageStats[0]?.totalUsage || 0) / totalPrompts : 0;
    const favoritePercentage = totalPrompts > 0 ? (favoritePrompts / totalPrompts) * 100 : 0;
    
    // Get user-specific stats if requested
    let userStats = null;
    if (includePersonal) {
      const userPrompts = await PromptModel.countDocuments({
        createdBy: userId || decoded.userId,
        isActive: true
      });
      
      const userUsage = await PromptModel.aggregate([
        { $match: { createdBy: userId || decoded.userId, isActive: true } },
        { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
      ]);
      
      userStats = {
        totalPrompts: userPrompts,
        totalUsage: userUsage[0]?.totalUsage || 0,
        averageUsage: userPrompts > 0 ? (userUsage[0]?.totalUsage || 0) / userPrompts : 0
      };
    }
    
    const stats = {
      totalPrompts,
      activePrompts,
      favoritePrompts,
      totalUsage: usageStats[0]?.totalUsage || 0,
      averageUsagePerPrompt: Math.round(averageUsagePerPrompt * 100) / 100,
      favoritePercentage: Math.round(favoritePercentage * 100) / 100,
      
      categoryStats: formattedCategoryStats,
      tagStats,
      modelStats,
      languageStats,
      usageByMonth,
      
      topPrompts,
      recentPrompts,
      
      userStats
    };
    
    return NextResponse.json({ stats });
    
  } catch (error) {
    console.error('Error fetching prompt stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt stats' },
      { status: 500 }
    );
  }
}
