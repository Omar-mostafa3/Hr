# MongoDB URI Update - Database Name Changed to HR

## Overview
All MongoDB connection string URIs have been updated to use the database name 'HR' instead of 'hr-main'.

## Files Modified

### 1. backend/.env.example
**Line 10:**
```
MONGODB_URI=mongodb://localhost:27017/HR
```
**Change:** `hr-main` → `HR`

### 2. backend/src/app.module.ts
**Line 37 (MongoDB fallback URI):**
```typescript
uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/HR',
```
**Change:** `hr-main` → `HR`

### 3. backend/scripts/seed.js
**Line 10 (Database name for seed script):**
```javascript
const DATABASE_NAME = process.env.DATABASE_NAME || 'HR';
```
**Change:** `'hr-main'` → `'HR'`

### 4. backend/scripts/add-employees-and-fix.js
**Line 9 (Database name for employee fixture script):**
```javascript
const DATABASE_NAME = process.env.DATABASE_NAME || 'HR';
```
**Change:** `'hr-main'` → `'HR'`

## Commits

1. **fix: Update MongoDB URI database name from hr-main to HR** (backend/.env.example)
2. **fix: Update MongoDB fallback URI from hr-main to HR in app.module.ts** (backend/src/app.module.ts)
3. **fix: Update DATABASE_NAME from hr-main to HR in seed.js** (backend/scripts/seed.js)
4. **fix: Update DATABASE_NAME from hr-main to HR in add-employees-and-fix.js** (backend/scripts/add-employees-and-fix.js)

## Impact

✅ **Consistent Database Naming**
- All components now reference the same database name: 'HR'
- Development, seeding, and production configurations aligned
- Reduces confusion and potential connection errors

✅ **Setup Instructions**
When setting up the project:
```bash
# Create MongoDB database named 'HR'
mongosh
use HR

# Or use environment variable
MONGODB_URI=mongodb://localhost:27017/HR npm run seed
```

## Environment Variable

If using custom configuration:
```env
# .env file
MONGODB_URI=mongodb://localhost:27017/HR
DATABASE_NAME=HR
```

## Verification

To verify the database connection:
```javascript
// Should connect to 'HR' database
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/HR';
```

## Notes

- All MongoDB connection strings now consistently use 'HR' as the database name
- This is a breaking change - ensure 'HR' database exists before running the application
- Update any custom `.env` files to use the new database name
