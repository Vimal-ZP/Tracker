import mongoose, { Schema, Document } from 'mongoose';
import { PromptCategory } from '@/types/prompt';

// Interface for Mongoose document
export interface IPromptCategory extends Omit<PromptCategory, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// PromptCategory schema
const PromptCategorySchema = new Schema<IPromptCategory>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  color: {
    type: String,
    required: true,
    trim: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    default: '#3B82F6'
  },
  icon: {
    type: String,
    required: true,
    trim: true,
    default: 'Folder'
  },
  promptCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  parentId: {
    type: String,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
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
PromptCategorySchema.index({ name: 1, isActive: 1 });
PromptCategorySchema.index({ parentId: 1, order: 1 });
PromptCategorySchema.index({ createdBy: 1, createdAt: -1 });
PromptCategorySchema.index({ isActive: 1, order: 1 });

// Pre-save middleware to generate ID if not provided
PromptCategorySchema.pre('save', function(next) {
  if (!this.id) {
    this.id = this._id.toString();
  }
  next();
});

// Instance methods
PromptCategorySchema.methods.updatePromptCount = async function() {
  const PromptModel = mongoose.models.Prompt;
  if (PromptModel) {
    const count = await PromptModel.countDocuments({ 
      category: this.id, 
      isActive: true 
    });
    this.promptCount = count;
    return this.save();
  }
  return this;
};

PromptCategorySchema.methods.getChildren = function() {
  return mongoose.models.PromptCategory.find({ 
    parentId: this.id, 
    isActive: true 
  }).sort({ order: 1, name: 1 });
};

PromptCategorySchema.methods.getParent = function() {
  if (!this.parentId) return null;
  return mongoose.models.PromptCategory.findOne({ 
    id: this.parentId, 
    isActive: true 
  });
};

PromptCategorySchema.methods.getFullPath = async function() {
  const path = [this.name];
  let current = this;
  
  while (current.parentId) {
    const parent = await mongoose.models.PromptCategory.findOne({ 
      id: current.parentId, 
      isActive: true 
    });
    if (!parent) break;
    path.unshift(parent.name);
    current = parent;
  }
  
  return path.join(' > ');
};

// Static methods
PromptCategorySchema.statics.findRootCategories = function() {
  return this.find({ 
    parentId: { $exists: false }, 
    isActive: true 
  }).sort({ order: 1, name: 1 });
};

PromptCategorySchema.statics.findByParent = function(parentId: string) {
  return this.find({ 
    parentId, 
    isActive: true 
  }).sort({ order: 1, name: 1 });
};

PromptCategorySchema.statics.getHierarchy = async function() {
  const categories = await this.find({ isActive: true }).sort({ order: 1, name: 1 });
  const categoryMap = new Map();
  const rootCategories: any[] = [];
  
  // Create a map of all categories
  categories.forEach((cat: any) => {
    categoryMap.set(cat.id, { ...cat.toObject(), children: [] });
  });
  
  // Build the hierarchy
  categories.forEach((cat: any) => {
    const categoryObj = categoryMap.get(cat.id);
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      categoryMap.get(cat.parentId).children.push(categoryObj);
    } else {
      rootCategories.push(categoryObj);
    }
  });
  
  return rootCategories;
};

PromptCategorySchema.statics.updateAllPromptCounts = async function() {
  const PromptModel = mongoose.models.Prompt;
  if (!PromptModel) return;
  
  const categories = await this.find({ isActive: true });
  
  for (const category of categories) {
    const count = await PromptModel.countDocuments({ 
      category: category.id, 
      isActive: true 
    });
    await this.updateOne({ _id: category._id }, { promptCount: count });
  }
};

PromptCategorySchema.statics.getStats = async function() {
  const totalCategories = await this.countDocuments();
  const activeCategories = await this.countDocuments({ isActive: true });
  const rootCategories = await this.countDocuments({ 
    parentId: { $exists: false }, 
    isActive: true 
  });
  
  const categoriesWithPrompts = await this.countDocuments({ 
    promptCount: { $gt: 0 }, 
    isActive: true 
  });
  
  const topCategories = await this.find({ isActive: true })
    .sort({ promptCount: -1 })
    .limit(10);
  
  const recentCategories = await this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(10);
  
  return {
    totalCategories,
    activeCategories,
    rootCategories,
    categoriesWithPrompts,
    topCategories,
    recentCategories
  };
};

// Pre-remove middleware to handle cascading deletes
PromptCategorySchema.pre('deleteOne', { document: true, query: false }, async function() {
  // Move child categories to parent or root
  const children = await mongoose.models.PromptCategory.find({ parentId: this.id });
  for (const child of children) {
    child.parentId = this.parentId || undefined;
    await child.save();
  }
  
  // Update prompts to use parent category or a default category
  const PromptModel = mongoose.models.Prompt;
  if (PromptModel) {
    const defaultCategory = await mongoose.models.PromptCategory.findOne({ 
      name: 'General', 
      isActive: true 
    });
    
    const newCategoryId = this.parentId || defaultCategory?.id || 'general';
    
    await PromptModel.updateMany(
      { category: this.id },
      { category: newCategoryId }
    );
  }
});

// Export the model
const PromptCategoryModel = mongoose.models.PromptCategory || mongoose.model<IPromptCategory>('PromptCategory', PromptCategorySchema);

export default PromptCategoryModel;
