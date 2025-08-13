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
    trim: true
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

// Unique constraint for project + version combination
ReleasePlanSchema.index({ 'project._id': 1, version: 1 }, { unique: true });

export default mongoose.models.ReleasePlan || mongoose.model<ReleasePlanDocument>('ReleasePlan', ReleasePlanSchema);
