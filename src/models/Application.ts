import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
    name: string;
    displayName: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
    name: {
        type: String,
        required: [true, 'Application name is required'],
        unique: true,
        trim: true,
        minlength: [2, 'Application name must be at least 2 characters long'],
        maxlength: [50, 'Application name cannot exceed 50 characters'],
        match: [/^[a-zA-Z0-9\s\-_.]+$/, 'Application name can only contain letters, numbers, spaces, hyphens, underscores, and dots']
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        minlength: [2, 'Display name must be at least 2 characters long'],
        maxlength: [100, 'Display name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc: any, ret: any) {
            ret._id = ret._id.toString();
            return ret;
        }
    }
});

// Indexes for better query performance
ApplicationSchema.index({ name: 1 });
ApplicationSchema.index({ isActive: 1 });

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
