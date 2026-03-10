# PostgreSQL Database Setup Guide

## 🎯 Quick Decision Guide

| Option | Best For | Cost | Setup Time | Recommended |
|--------|----------|------|------------|-------------|
| **Neon** | Development & Production | Free (3GB) | 2 minutes | ⭐ **Highly Recommended** |
| **Supabase** | Development with extras | Free (500MB) | 3 minutes | ⭐ Good |
| **Railway** | All-in-one deployment | Free $5 credit | 5 minutes | Good |
| **Local PostgreSQL** | Complete control | Free | 15 minutes | For advanced users |

---

## ✨ Option 1: Neon (Recommended - Fastest Setup)

**Why Neon?**
- ✅ 3GB free storage (largest free tier)
- ✅ Serverless PostgreSQL (auto-scales)
- ✅ Instant setup (no credit card)
- ✅ Built-in branching for dev/staging
- ✅ Connection pooling included

### Setup Steps:

1. **Create Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up with GitHub (quickest) or email
   - No credit card required

2. **Create Project**
   ```
   Project Name: employee-management
   Region: Select closest to you
   PostgreSQL Version: 15 (recommended)
   ```

3. **Get Connection String**
   - After creation, copy the connection string
   - It looks like: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

4. **Configure Backend**
   
   Create `backend/.env`:
   ```env
   # Neon PostgreSQL Connection
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/employee_db?sslmode=require"
   
   # Add connection pooling for better performance
   DIRECT_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/employee_db?sslmode=require"
   
   # Other settings
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=5000
   NODE_ENV=development
   ```

5. **Update Prisma Schema**
   
   In `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

6. **Run Migrations**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

✅ **Done!** Your database is ready in the cloud.

---

## 🔥 Option 2: Supabase (With Extra Features)

**Why Supabase?**
- ✅ PostgreSQL + extras (authentication, storage, realtime)
- ✅ 500MB free storage
- ✅ Web-based SQL editor
- ✅ Automatic API generation

### Setup Steps:

1. **Create Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up with GitHub
   - No credit card required

2. **Create Project**
   ```
   Organization: Your name
   Project Name: employee-management
   Database Password: Create a strong password
   Region: Select closest to you
   ```

3. **Get Connection Details**
   - Go to Project Settings → Database
   - Connection string (Pooler): Copy this
   - It looks like: `postgresql://postgres.xxx:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`

4. **Configure Backend**
   
   Create `backend/.env`:
   ```env
   # Supabase PostgreSQL Connection
   DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres"
   
   # Other settings
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=5000
   NODE_ENV=development
   ```

5. **Run Migrations**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

✅ **Done!** Plus you get extra Supabase features if needed.

---

## 🚂 Option 3: Railway (All-in-One)

**Why Railway?**
- ✅ Can deploy both backend AND database
- ✅ $5 free credit per month
- ✅ Easy deployment
- ✅ Environment variable management

### Setup Steps:

1. **Create Account**
   - Go to [https://railway.app](https://railway.app)
   - Sign up with GitHub
   - Get $5 free credit (no credit card)

2. **Create Database**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Database will be created automatically

3. **Get Connection String**
   - Click on the PostgreSQL service
   - Go to "Connect" tab
   - Copy "DATABASE_URL"

4. **Configure Backend**
   
   Create `backend/.env`:
   ```env
   # Railway PostgreSQL Connection
   DATABASE_URL="postgresql://postgres:password@containers-xxx.railway.app:5432/railway"
   
   # Other settings
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=5000
   NODE_ENV=development
   ```

5. **Run Migrations**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

✅ **Done!** Plus you can deploy your backend here later.

---

## 💻 Option 4: Local PostgreSQL (Advanced)

**Why Local?**
- ✅ Complete control
- ✅ No internet required
- ✅ Fastest queries
- ⚠️ Requires installation

### Windows Setup:

1. **Download PostgreSQL**
   - Go to [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Download PostgreSQL 15.x installer
   - Run the installer

2. **Installation Steps**
   ```
   Installation Directory: Default (C:\Program Files\PostgreSQL\15)
   Components: Select all
   Data Directory: Default
   Password: Create a strong password (remember this!)
   Port: 5432 (default)
   Locale: Default
   ```

3. **Verify Installation**
   
   Open PowerShell:
   ```powershell
   # Add PostgreSQL to PATH (if not automatically done)
   $env:Path += ";C:\Program Files\PostgreSQL\15\bin"
   
   # Check version
   psql --version
   ```

4. **Create Database**
   
   ```powershell
   # Login to PostgreSQL
   psql -U postgres
   
   # Enter your password when prompted
   
   # Create database
   CREATE DATABASE employee_db;
   
   # Create user (optional - for better security)
   CREATE USER emp_admin WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE employee_db TO emp_admin;
   
   # Exit
   \q
   ```

5. **Configure Backend**
   
   Create `backend/.env`:
   ```env
   # Local PostgreSQL Connection
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/employee_db"
   
   # Or with custom user
   # DATABASE_URL="postgresql://emp_admin:your_password@localhost:5432/employee_db"
   
   # Other settings
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=5000
   NODE_ENV=development
   ```

6. **Run Migrations**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

### Using pgAdmin (GUI Tool)

PostgreSQL installer includes pgAdmin - a visual database management tool:

1. Open pgAdmin 4
2. Connect to your local server
3. Right-click "Databases" → Create → Database
4. Name: `employee_db`
5. Click Save

✅ **Done!** You have full local database control.

---

## 🔧 Testing Your Connection

After setting up any option above, test your connection:

```bash
cd backend
npx prisma db pull
```

Expected output:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "employee_db" at "..."

✔ Introspected 0 models and 0 enums
```

---

## 📊 Database GUI Tools (Optional)

Visualize and manage your database:

### Free Options:

1. **Prisma Studio** (Included with Prisma)
   ```bash
   cd backend
   npx prisma studio
   ```
   Opens at `http://localhost:5555` - Visual editor for your data

2. **pgAdmin** (Most powerful)
   - Included with local PostgreSQL installation
   - Or download separately
   - Full-featured database management

3. **DBeaver** (Cross-platform)
   - Download: [https://dbeaver.io](https://dbeaver.io)
   - Free and open-source
   - Supports many databases

4. **TablePlus** (Beautiful UI)
   - Download: [https://tableplus.com](https://tableplus.com)
   - Free tier available
   - Modern, clean interface

---

## 🎯 My Recommendation

**For this project, use Neon:**

1. ⚡ **Fastest setup** - Less than 2 minutes
2. 💰 **Best free tier** - 3GB storage
3. 🚀 **Production-ready** - Can use same for deployment
4. 🔧 **Prisma-optimized** - Built with Prisma in mind
5. 🌍 **No installation** - Works immediately

### Quick Start Command:

Once you have your Neon connection string:

```bash
# Backend setup
cd backend

# Create .env file
echo DATABASE_URL="your-neon-connection-string" > .env
echo DIRECT_URL="your-neon-connection-string" >> .env
echo JWT_SECRET="super-secret-change-this" >> .env
echo PORT=5000 >> .env
echo NODE_ENV=development >> .env

# Install dependencies
npm install

# Initialize database
npx prisma migrate dev --name init

# Seed with demo data
npx prisma db seed

# Open Prisma Studio to view data
npx prisma studio
```

---

## 🆘 Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
1. Check your connection string is correct
2. Verify database is running (cloud) or PostgreSQL service is started (local)
3. Check firewall settings

### Issue: "Password authentication failed"

**Solution:**
1. Double-check password in connection string
2. Ensure special characters in password are URL-encoded
3. Reset password in your cloud provider dashboard

### Issue: Migration fails

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --create-only
# Edit the migration SQL if needed
npx prisma migrate dev
```

### Issue: "SSL connection required"

**Solution:**
Add `?sslmode=require` to your connection string:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

---

## 📝 Next Steps After Database Setup

1. ✅ Database is running
2. ✅ Connection string configured
3. ✅ Migrations applied
4. ✅ Seed data loaded

**What's next:**
- Start backend server: `npm run dev`
- View data in Prisma Studio: `npx prisma studio`
- Begin building API endpoints
- Connect frontend to backend

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong passwords** - At least 16 characters
3. **Rotate secrets** - Change JWT_SECRET regularly
4. **Use different databases** - Separate dev/staging/prod
5. **Enable SSL** - Always use SSL in production
6. **Backup regularly** - Cloud providers auto-backup, but verify

---

**Need help?** Let me know which option you choose and I'll guide you through the setup!
