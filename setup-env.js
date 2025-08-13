#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate secure random strings
const generateSecret = (length = 64) => {
    return crypto.randomBytes(length).toString('hex');
};

// Default environment configuration
const envConfig = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tracker-app

# JWT Configuration
JWT_SECRET=${generateSecret(32)}

# NextAuth Configuration
NEXTAUTH_SECRET=${generateSecret(32)}
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists');

    // Read existing file and check for missing variables
    const existingEnv = fs.readFileSync(envPath, 'utf8');
    const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missingVars = requiredVars.filter(varName => !existingEnv.includes(varName));

    if (missingVars.length > 0) {
        console.log('⚠️  Missing environment variables:', missingVars.join(', '));
        console.log('Please add them to your .env.local file');
    } else {
        console.log('✅ All required environment variables are present');
    }
} else {
    // Create new .env.local file
    try {
        fs.writeFileSync(envPath, envConfig);
        console.log('✅ Created .env.local with default configuration');
        console.log('📝 Please update MONGODB_URI if you\'re using a different MongoDB setup');
    } catch (error) {
        console.error('❌ Failed to create .env.local:', error.message);
        process.exit(1);
    }
}

// Check if MongoDB is likely running (basic check)
const { exec } = require('child_process');

exec('mongod --version', (error, stdout, stderr) => {
    if (error) {
        console.log('\n⚠️  MongoDB doesn\'t seem to be installed or not in PATH');
        console.log('   Please install MongoDB or use MongoDB Atlas');
        console.log('   Installation guide: https://docs.mongodb.com/manual/installation/');
    } else {
        console.log('\n✅ MongoDB is installed');

        // Check if MongoDB is running
        exec('mongo --eval "db.runCommand({ connectionStatus: 1 })"', (error, stdout, stderr) => {
            if (error) {
                console.log('⚠️  MongoDB is not running. Start it with: mongod');
            } else {
                console.log('✅ MongoDB is running');
            }
        });
    }
});

console.log('\n🚀 Setup complete! You can now run:');
console.log('   npm install');
console.log('   npm run dev');
