import mongoose, { Schema, Document } from 'mongoose';
import { Project, ProjectStatus } from '@/types/project';

export interface ProjectDocument extends Omit<Project, '_id'>, Document {}

const ProjectTeamMemberSchema = new Schema({
  userId: {
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
  },
  role: {
    type: String,
    required: true,
    trim: true
  }
});

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
    maxlength: 20,
    validate: {
      validator: function(v: string) {
        return /^[A-Z0-9-_]+$/.test(v);
      },
      message: 'Project code must contain only uppercase letters, numbers, hyphens, and underscores'
    }
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
    type: Date,
    validate: {
      validator: function(this: ProjectDocument, v: Date) {
        return !v || v > this.startDate;
      },
      message: 'End date must be after start date'
    }
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
  team: [ProjectTeamMemberSchema],
  technologies: [{
    type: String,
    trim: true
  }],
  repository: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Repository URL must be a valid HTTP/HTTPS URL'
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
ProjectSchema.index({ 'manager._id': 1 });
ProjectSchema.index({ startDate: 1 });
ProjectSchema.index({ endDate: 1 });

// Compound indexes
ProjectSchema.index({ status: 1, isActive: 1 });
ProjectSchema.index({ isActive: 1, startDate: -1 });

// Static methods
ProjectSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

ProjectSchema.statics.findByStatus = function(status: ProjectStatus) {
  return this.find({ status, isActive: true }).sort({ name: 1 });
};

export default mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);
