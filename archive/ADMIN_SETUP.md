# Admin Account Setup

This document explains how to create the admin account with the specified credentials.

## Admin Credentials
- **Email**: `admin@iwanyu.store`
- **Password**: `Admin$100`
- **Role**: `ADMIN`

## Methods to Create Admin Account

### Method 1: Using the TypeScript Script (Recommended)

Once your database is running, execute:

```bash
npm run create-admin
```

This will:
- Hash the password securely using bcrypt
- Create or update the admin user in the database
- Display confirmation with user details

### Method 2: Using the Database Seed Script

The admin account is also included in the seed script. Run:

```bash
npm run db:seed
```

This will create the admin account along with other initial data (categories, etc.).

### Method 3: Direct SQL Execution

If you prefer to run SQL directly against your PostgreSQL database:

```bash
psql -d iwanyu -f scripts/create-admin.sql
```

Or copy the contents of `scripts/create-admin.sql` and run it in your database client.

## Prerequisites

Before running any of these methods, ensure:

1. **PostgreSQL is running** on `localhost:5432`
2. **Database exists** (named `iwanyu` or as configured in your DATABASE_URL)
3. **Prisma migrations have been applied**:
   ```bash
   npm run db:migrate
   ```

## Troubleshooting

### Database Connection Error
If you get a connection error:
1. Check if PostgreSQL is running: `brew services start postgresql` (macOS)
2. Verify the DATABASE_URL in your `.env` file
3. Ensure the database exists: `createdb iwanyu`

### Permission Issues
If you get permission errors, make sure your PostgreSQL user has the necessary privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE iwanyu TO your_username;
```

## Login Testing

After creating the admin account, you can test login with:
- Navigate to `/login` on your frontend
- Enter email: `admin@iwanyu.store`
- Enter password: `Admin$100`
- Should redirect to admin dashboard at `/admin`

## Security Notes

- The password `Admin$100` is hashed using bcrypt with 12 salt rounds
- Change the default password after first login in production
- The admin role has full access to all system functions
- Consider enabling 2FA for admin accounts in production

## Files Created

- `scripts/create-admin.ts` - TypeScript script to create admin
- `scripts/create-admin.sql` - Direct SQL script
- Updated `prisma/seed.ts` - Admin included in seed data
- Updated `package.json` - Added `create-admin` script
