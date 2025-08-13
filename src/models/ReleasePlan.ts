import mongoose, { Schema, Document } from 'mongoose';
import { ReleasePlan, ReleasePlanStatus, ReleasePlanPriority } from '@/types/project';

export interface ReleasePlanDocument extends Omit<ReleasePlan, '_id'>, Document {}

const ReleasePlanSchema = new Schema({
  project: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  plannedDate: {
    type: Date,
    required: true
  },
  version: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // Validate semantic versioning format (e.g., 1.0.0, 2.1.3-beta.1)
        return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(v);
      },
      message: 'Version must follow semantic versioning format (e.g., 1.0.0)'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: Object.values(ReleasePlanStatus),
    required: true,
    default: ReleasePlanStatus.PLANNED
  },
  priority: {
    type: String,
    enum: Object.values(ReleasePlanPriority),
    required: true,
    default: ReleasePlanPriority.MEDIUM
  },
  estimatedEffort: {
    type: Number,
    required: true,
    min: 0,
    max: 10000 // Max 10,000 hours
  },
  assignedTo: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  dependencies: [{
    type: String,
    trim: true
  }],
  risks: [{
    type: String,
    trim: true
  }],
  createdBy: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes
ReleasePlanSchema.index({ 'project._id': 1 });
ReleasePlanSchema.index({ plannedDate: 1 });
ReleasePlanSchema.index({ status: 1 });
ReleasePlanSchema.index({ priority: 1 });
ReleasePlanSchema.index({ 'assignedTo._id': 1 });
ReleasePlanSchema.index({ 'createdBy._id': 1 });

// Compound indexes
ReleasePlanSchema.index({ 'project._id': 1, plannedDate: 1 });
ReleasePlanSchema.index({ status: 1, plannedDate: 1 });
ReleasePlanSchema.index({ priority: 1, plannedDate: 1 });

// Unique constraint for project + version combination
ReleasePlanSchema.index({ 'project._id': 1, version: 1 }, { unique: true });

// Static methods
ReleasePlanSchema.statics.findByProject = function(projectId: string) {
  return this.find({ 'project._id': projectId }).sort({ plannedDate: 1 });
};

ReleasePlanSchema.statics.findByStatus = function(status: ReleasePlanStatus) {
  return this.find({ status }).sort({ plannedDate: 1 });
};

ReleasePlanSchema.statics.findUpcoming = function(days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    plannedDate: { $gte: new Date(), $lte: futureDate },
    status: { $in: [ReleasePlanStatus.PLANNED, ReleasePlanStatus.IN_PROGRESS] }
  }).sort({ plannedDate: 1 });
};

export default mongoose.models.ReleasePlan || mongoose.model<ReleasePlanDocument>('ReleasePlan', ReleasePlanSchema);
