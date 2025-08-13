const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker-app';

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  code: String,
  status: String,
  startDate: Date,
  endDate: Date,
  manager: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String
  },
  isActive: Boolean
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const sampleProjects = [
  {
    name: 'E-Commerce Platform',
    description: 'Modern e-commerce platform with React and Node.js',
    code: 'ECOM-001',
    status: 'active',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    manager: {
      _id: new mongoose.Types.ObjectId(),
      name: 'John Doe',
      email: 'john@example.com'
    },
    isActive: true
  },
  {
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application for iOS and Android',
    code: 'BANK-001',
    status: 'active',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-10-31'),
    manager: {
      _id: new mongoose.Types.ObjectId(),
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    isActive: true
  },
  {
    name: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard for business intelligence',
    code: 'DASH-001',
    status: 'planning',
    startDate: new Date('2024-03-01'),
    manager: {
      _id: new mongoose.Types.ObjectId(),
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    isActive: true
  }
];

async function seedProjects() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Insert sample projects
    await Project.insertMany(sampleProjects);
    console.log('Sample projects inserted successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding projects:', error);
    process.exit(1);
  }
}

seedProjects();
