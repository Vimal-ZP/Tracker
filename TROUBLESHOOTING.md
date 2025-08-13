# Troubleshooting Guide

## 500 Error on Create Account Button

If you're getting a 500 error when clicking the "Create Account" button, follow these steps:

### 1. Check MongoDB Connection

The most common cause is MongoDB not running. 

**For Local MongoDB:**
```bash
# Start MongoDB
mongod

# Or if you installed via Homebrew on macOS:
brew services start mongodb-community

# Check if MongoDB is running
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

**For MongoDB Atlas (Cloud):**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 2. Verify Environment Variables

Check that your `.env.local` file exists and contains:

```env
MONGODB_URI=mongodb://localhost:27017/tracker-app
JWT_SECRET=your-jwt-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Run the setup script to create/verify:**
```bash
node setup-env.js
```

### 3. Check Server Logs

Look at the terminal where you ran `npm run dev` for detailed error messages. The registration API now includes comprehensive logging.

### 4. Common Error Messages and Solutions

#### "Database connection not configured"
- Missing `MONGODB_URI` in environment variables
- Run `node setup-env.js` to create proper `.env.local`

#### "JWT secret not configured"
- Missing `JWT_SECRET` in environment variables
- Run `node setup-env.js` to generate secure secrets

#### "MongoNetworkError" or "MongooseServerSelectionError"
- MongoDB is not running
- Start MongoDB with `mongod` command
- Or check your MongoDB Atlas connection string

#### "User with this email already exists"
- Try registering with a different email address
- Or check your database to remove existing test users

### 5. Database Reset (if needed)

If you need to reset your database:

```bash
# Connect to MongoDB
mongo

# Switch to your database
use tracker-app

# Drop the users collection
db.users.drop()

# Exit MongoDB shell
exit
```

### 6. Test API Directly

You can test the registration API directly using curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 7. Development Server Issues

If the development server is having issues:

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart the server
npm run dev
```

### 8. Port Conflicts

If port 3000 is in use:

```bash
# Run on different port
npm run dev -- -p 3001

# Update NEXTAUTH_URL in .env.local
NEXTAUTH_URL=http://localhost:3001
```

## Additional Debugging Steps

### Enable Detailed Logging

The registration API now includes detailed console logging. Check your terminal for:

- "Registration attempt started"
- "Database connected successfully"
- "Request body parsed"
- "User saved successfully"
- "JWT token generated successfully"

### Check Network Tab

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to register
4. Look for the `/api/auth/register` request
5. Check the response for detailed error messages

### Verify Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

Key dependencies that must be present:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `next` - Next.js framework

## Getting Help

If you're still having issues:

1. Check the console logs in your terminal
2. Check the browser console for client-side errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB is running and accessible
5. Try the curl command to test the API directly

## Quick Fix Checklist

- [ ] MongoDB is running (`mongod` command)
- [ ] `.env.local` file exists with all required variables
- [ ] Dependencies are installed (`npm install`)
- [ ] Development server is running (`npm run dev`)
- [ ] No port conflicts (default: 3000)
- [ ] Browser cache cleared (hard refresh: Ctrl+Shift+R)

Most 500 errors are caused by MongoDB not running or missing environment variables. The enhanced error logging will help identify the exact issue.
