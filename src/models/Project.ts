import mongoose, { Schema, Document } from 'mongoose';
import { Project, ProjectStatus } from '@/types/project';

export interface ProjectDocument extends Omit<Project, '_id'>, Document {}

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20
  },
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    required: true,
    default: ProjectStatus.PLANNING
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  manager: {
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
  isActive: {
    type: Boolean,
    default: true
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
ProjectSchema.index({ code: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isActive: 1 });

export default mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);
