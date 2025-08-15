import mongoose, { Schema, Document } from 'mongoose';
import { Release, ReleaseStatus, ReleaseType, FeatureCategory } from '@/types/release';

export interface ReleaseDocument extends Omit<Release, '_id'>, Document { }

const ReleaseFeatureSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: Object.values(FeatureCategory),
    required: true
  }
});

const ReleaseSchema = new Schema({
  version: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple documents with null/undefined version
    trim: true,
    validate: {
      validator: function (v: string) {
        if (!v) return true; // Optional field
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
  projectName: {
    type: String,
    required: true,
    trim: true,
    enum: ['NRE', 'NVE', 'E-Vite', 'Portal Plus', 'Fast 2.0', 'FMS']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  releaseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(ReleaseStatus),
    required: true,
    default: ReleaseStatus.DRAFT
  },
  type: {
    type: String,
    enum: Object.values(ReleaseType),
    required: true
  },
  features: [ReleaseFeatureSchema],
  bugFixes: [{
    type: String,
    trim: true
  }],
  breakingChanges: [{
    type: String,
    trim: true
  }],
  author: {
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
  downloadUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Download URL must be a valid HTTP/HTTPS URL'
    }
  },

  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes for better query performance
ReleaseSchema.index({ version: 1 });
ReleaseSchema.index({ status: 1 });
ReleaseSchema.index({ type: 1 });
ReleaseSchema.index({ releaseDate: -1 });
ReleaseSchema.index({ isPublished: 1 });
ReleaseSchema.index({ 'author._id': 1 });

// Compound indexes
ReleaseSchema.index({ status: 1, releaseDate: -1 });
ReleaseSchema.index({ isPublished: 1, releaseDate: -1 });

// Pre-save middleware to ensure published releases have stable status
ReleaseSchema.pre('save', function (next) {
  if (this.isPublished && this.status === ReleaseStatus.DRAFT) {
    this.status = ReleaseStatus.STABLE;
  }
  next();
});

// Static methods
ReleaseSchema.statics.findPublished = function () {
  return this.find({ isPublished: true }).sort({ releaseDate: -1 });
};

ReleaseSchema.statics.findByStatus = function (status: ReleaseStatus) {
  return this.find({ status }).sort({ releaseDate: -1 });
};

ReleaseSchema.statics.findLatest = function (limit: number = 5) {
  return this.find({ isPublished: true })
    .sort({ releaseDate: -1 })
    .limit(limit);
};

export default mongoose.models.Release || mongoose.model<ReleaseDocument>('Release', ReleaseSchema);
