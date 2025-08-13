# Quick Setup Guide

This guide will help you get the Tracker application up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB installed locally or MongoDB Atlas account
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/tracker-app
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env.local`

### 4. Run the Application

```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Create First Super Admin

1. Register a new user at `/register`
2. Connect to MongoDB and update the user role:

```javascript
// MongoDB Shell
use tracker-app
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "super_admin" } }
)
```

3. Login with the updated user

## Default User Roles

- **Super Admin**: Full system access
- **Admin**: User management, reports (cannot manage Super Admins)
- **Basic**: Personal dashboard only

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`

2. **JWT Secret Error**
   - Ensure JWT_SECRET is at least 32 characters
   - Use a secure random string

3. **Port Already in Use**
   ```bash
   npm run dev -- -p 3001
   ```

4. **Module Not Found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Quick Test

1. Register a user
2. Login
3. Check dashboard access
4. Upgrade user to admin/super_admin in database
5. Test user management features

## Next Steps

- Customize the UI/branding
- Add additional features
- Configure production deployment
- Set up monitoring and logging

Need help? Check the main README.md for detailed documentation.
