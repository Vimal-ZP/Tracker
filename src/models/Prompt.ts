import mongoose, { Schema, Document } from 'mongoose';
import { Prompt, PromptVariable, PromptStatus, PromptType, PromptLanguage, AIModel } from '@/types/prompt';

// Interface for Mongoose document
export interface IPrompt extends Omit<Prompt, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Variable sub-schema
const PromptVariableSchema = new Schema<PromptVariable>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'textarea'],
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: Schema.Types.Mixed
  },
  options: [{
    type: String,
    trim: true
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  }
}, { _id: false });

// Main Prompt schema
const PromptSchema = new Schema<IPrompt>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],
  variables: [PromptVariableSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    enum: Object.values(PromptLanguage),
    default: PromptLanguage.ENGLISH,
    index: true
  },
  version: {
    type: String,
    default: '1.0.0',
    trim: true
  },
  
  // AI Model settings
  model: {
    type: String,
    enum: Object.values(AIModel),
    default: AIModel.GPT_4,
    index: true
  },
  temperature: {
    type: Number,
    min: 0,
    max: 2,
    default: 0.7
  },
  maxTokens: {
    type: Number,
    min: 1,
    max: 4096,
    default: 1000
  },
  topP: {
    type: Number,
    min: 0,
    max: 1,
    default: 1
  },
  frequencyPenalty: {
    type: Number,
    min: -2,
    max: 2,
    default: 0
  },
  presencePenalty: {
    type: Number,
    min: -2,
    max: 2,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes for better performance
PromptSchema.index({ title: 'text', content: 'text', description: 'text' });
PromptSchema.index({ category: 1, isActive: 1 });
PromptSchema.index({ tags: 1, isActive: 1 });
PromptSchema.index({ createdBy: 1, createdAt: -1 });
PromptSchema.index({ usageCount: -1, isActive: 1 });
PromptSchema.index({ isFavorite: 1, createdBy: 1 });
PromptSchema.index({ updatedAt: -1 });

// Pre-save middleware to generate ID if not provided
PromptSchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

// Instance methods
PromptSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

PromptSchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite;
  return this.save();
};

PromptSchema.methods.updateContent = function(content: string, variables?: PromptVariable[]) {
  this.content = content;
  if (variables) {
    this.variables = variables;
  }
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
PromptSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true }).sort({ updatedAt: -1 });
};

PromptSchema.statics.findByTags = function(tags: string[]) {
  return this.find({ tags: { $in: tags }, isActive: true }).sort({ updatedAt: -1 });
};

PromptSchema.statics.findFavorites = function(userId: string) {
  return this.find({ createdBy: userId, isFavorite: true, isActive: true }).sort({ updatedAt: -1 });
};

PromptSchema.statics.findMostUsed = function(limit: number = 10) {
  return this.find({ isActive: true }).sort({ usageCount: -1 }).limit(limit);
};

PromptSchema.statics.findRecent = function(limit: number = 10) {
  return this.find({ isActive: true }).sort({ updatedAt: -1 }).limit(limit);
};

PromptSchema.statics.searchPrompts = function(query: string) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  }).sort({ usageCount: -1, updatedAt: -1 });
};

PromptSchema.statics.getStats = async function() {
  const totalPrompts = await this.countDocuments();
  const activePrompts = await this.countDocuments({ isActive: true });
  const favoritePrompts = await this.countDocuments({ isFavorite: true });
  
  const usageStats = await this.aggregate([
    { $group: { _id: null, totalUsage: { $sum: '$usageCount' } } }
  ]);
  
  const categoryStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const tagStats = await this.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
  
  const modelStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$model', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const languageStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const usageByMonth = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' }
        },
        count: { $sum: '$usageCount' }
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
        count: 1
      }
    }
  ]);
  
  const topPrompts = await this.find({ isActive: true })
    .sort({ usageCount: -1 })
    .limit(10);
  
  const recentPrompts = await this.find({ isActive: true })
    .sort({ updatedAt: -1 })
    .limit(10);
  
  return {
    totalPrompts,
    activePrompts,
    favoritePrompts,
    totalUsage: usageStats[0]?.totalUsage || 0,
    categoryStats: categoryStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    tagStats: tagStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    modelStats: modelStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    languageStats: languageStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    usageByMonth,
    topPrompts,
    recentPrompts
  };
};

// Export the model
const PromptModel = mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);

export default PromptModel;
