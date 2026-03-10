# Employee Management System

A modern, full-stack employee management system with AI-powered insights, performance tracking, and comprehensive analytics.

## 🚀 Features

- **Employee Management**: Complete CRUD operations with advanced search and filters
- **Performance Tracking**: KPI monitoring, goal setting, 360-degree feedback
- **AI-Powered Insights**: Predictive analytics, chatbot assistance, sentiment analysis
- **Advanced Analytics**: Interactive dashboards with charts (Recharts)
- **Role-Based Access**: Admin, HR, Manager, and Employee roles
- **Attendance & Leave**: Time tracking, leave management, calendar views
- **Real-time Updates**: Live notifications and data synchronization
- **Responsive Design**: Mobile-first approach for all devices
- **Dark/Light Theme**: Beautiful UI with theme switching

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Auth**: NextAuth v4
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15.x
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **AI**: OpenAI API + Google Gemini API

## 📋 Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x
- npm or yarn
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd emplyee-managemet-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your:
# - Database credentials (already set for local: postgres/12345)
# - OpenAI API key (get from https://platform.openai.com/api-keys)
# - Gemini API key (get from https://makersuite.google.com/app/apikey)
# - JWT secrets

# Create database
# Option 1: Using psql (if PostgreSQL is in PATH)
psql -U postgres -c "CREATE DATABASE employee_db;"

# Option 2: Using pgAdmin GUI

# Run migrations
npx prisma migrate dev --name init

# Seed database with demo data
npx prisma db seed

# Start development server
npm run dev

# prisma studion
cd backend
npx prisma studio
http://localhost:5555/

```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local if needed (default values should work)

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📚 Documentation

- [Constitution](./constitution.md) - Complete system architecture and guidelines
- [Implementation Plan](./brain/implementation_plan.md) - Detailed development roadmap
- [Skills Guide](./SKILLS.md) - Advanced features and capabilities
- [Database Setup](./DATABASE_SETUP.md) - PostgreSQL configuration guide

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:12345@localhost:5432/employee_db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 🎯 Getting Started

1. **Login** with demo credentials (created by seed):
   - Admin: `admin@company.com` / `password123`
   - HR: `hr@company.com` / `password123`
   - Manager: `manager@company.com` / `password123`
   - Employee: `employee@company.com` / `password123`

2. **Explore** the dashboard and features

3. **Create** new employees, set goals, track performance

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🚀 Deployment

- **Frontend**: Deploy to Vercel (recommended)
- **Backend**: Deploy to Railway or Render
- **Database**: Use Neon, Supabase, or Railway

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for cloud options.

## 🔒 Security

- All passwords are hashed with bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- CORS protection
- Rate limiting
- Input validation

## 📝 Project Structure

```
emplyee-managemet-system/
├── frontend/           # Next.js application
├── backend/            # Node.js/Express API
├── constitution.md     # System architecture
├── SKILLS.md          # Advanced features guide
└── DATABASE_SETUP.md  # Database configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation files
- Review the implementation plan
- Open an issue on GitHub

## 🎨 Color Palette

**Light Theme**:
- Primary: #7CB8E8
- Secondary: #A8D5F2
- Accent: #FDB813

**Dark Theme**:
- Primary: #2C3E50
- Secondary: #B8B5A8
- Accent: #6C7278

---

Built with ❤️ using Next.js, Node.js, and PostgreSQL


**Manual Testing in attendance module**:
- Manual Verification
- Create a "Morning Shift" (9 AM - 5 PM).
- Assign it to an employee.
- Check-in after 9 AM and verify if the status is marked as "LATE".
- Generate an attendance report for the current week and verify the accuracy of the summary stats.

**🎯 Task Deadline Tracking (Performance)**:
- Navigate to the Attendance Page.
- Test the Clock In and Clock Out buttons. Notice the Work Duration timer updates live.
- Go to the Goals Page.
- Mark a goal as COMPLETED. If it was done before the due date, it will show an "On-time" badge. Otherwise, it will show as "Late".