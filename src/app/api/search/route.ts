import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Release from '@/models/Release';
import { WorkItemType } from '@/types/release';

// GET /api/search - Global search for work items
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Verify authentication using cookie
        const token = request.cookies.get('auth_token')?.value;
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
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type'); // Optional filter by work item type

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                results: [],
                totalCount: 0,
                message: 'Please enter at least 2 characters to search'
            });
        }

        // Build search criteria
        const searchCriteria: any = {
            $or: [
                // Search in work item ID (exact match or partial)
                { 'workItems.id': { $regex: query.trim(), $options: 'i' } },
                // Search in work item title
                { 'workItems.title': { $regex: query.trim(), $options: 'i' } }
            ]
        };

        // Add type filter if specified
        if (type && Object.values(WorkItemType).includes(type as WorkItemType)) {
            searchCriteria['workItems.type'] = type;
        }

        // Search releases that contain matching work items
        const releases = await Release.find(searchCriteria)
            .select('_id title applicationName version workItems createdAt isPublished')
            .limit(limit * 2) // Get more releases to ensure we have enough work items
            .lean();

        // Extract matching work items from releases
        const results: any[] = [];
        const queryLower = query.toLowerCase().trim();

        for (const release of releases) {
            if (results.length >= limit) break;

            for (const workItem of release.workItems) {
                if (results.length >= limit) break;

                // Check if this work item matches our search criteria
                const matchesId = workItem.id && workItem.id.toLowerCase().includes(queryLower);
                const matchesTitle = workItem.title.toLowerCase().includes(queryLower);
                const matchesType = !type || workItem.type === type;

                if ((matchesId || matchesTitle) && matchesType) {
                    results.push({
                        workItem: {
                            _id: workItem._id,
                            id: workItem.id,
                            type: workItem.type,
                            title: workItem.title,
                            flagName: workItem.flagName,
                            remarks: workItem.remarks,
                            hyperlink: workItem.hyperlink,
                            parentId: workItem.parentId,
                            actualHours: workItem.actualHours
                        },
                        release: {
                            _id: release._id,
                            title: release.title,
                            applicationName: release.applicationName,
                            version: release.version,
                            isPublished: release.isPublished,
                            createdAt: release.createdAt
                        },
                        // Highlight matching text
                        matchType: matchesId ? 'id' : 'title',
                        matchText: matchesId ? workItem.id : workItem.title
                    });
                }
            }
        }

        // Sort results by relevance (exact ID matches first, then title matches)
        results.sort((a, b) => {
            // Exact ID matches first
            if (a.matchType === 'id' && b.matchType === 'title') return -1;
            if (a.matchType === 'title' && b.matchType === 'id') return 1;
            
            // Then by how closely the match appears at the beginning
            const aMatch = a.matchText?.toLowerCase() || '';
            const bMatch = b.matchText?.toLowerCase() || '';
            const aIndex = aMatch.indexOf(queryLower);
            const bIndex = bMatch.indexOf(queryLower);
            
            if (aIndex !== bIndex) return aIndex - bIndex;
            
            // Finally by creation date (newest first)
            return new Date(b.release.createdAt).getTime() - new Date(a.release.createdAt).getTime();
        });

        return NextResponse.json({
            results: results.slice(0, limit),
            totalCount: results.length,
            query: query.trim(),
            hasMore: results.length > limit
        });

    } catch (error) {
        console.error('Error in global search:', error);
        return NextResponse.json(
            { error: 'Failed to perform search' },
            { status: 500 }
        );
    }
}
