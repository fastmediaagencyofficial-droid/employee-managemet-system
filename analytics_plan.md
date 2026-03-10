# Analytics Dashboard Implementation Plan

## Overview
Implement a comprehensive analytics dashboard to provide insights into employee performance, attendance, demographics, and recruitment (if applicable). This will support Executive, HR, and Manager roles with data-driven decision-making tools.

## Backend Implementation

### 1. Controllers (`backend/src/controllers/analyticsController.ts`)
Create a new controller with the following methods:
- `getExecutiveStats`: High-level overview (Headcount, Turnover rate, Attendance rate, Average performance score).
- `getHRStats`: Detailed HR metrics (Review status, Department distribution, Leave trends, Attrition risk).
- `getManagerStats`: Team-specific stats (Team attendance, Goals completion, Upcoming reviews).

### 2. Routes (`backend/src/routes/analyticsRoutes.ts`)
- `GET /api/analytics/executive`
- `GET /api/analytics/hr`
- `GET /api/analytics/manager`

### 3. Integration
- Register new routes in `backend/src/routes/index.ts`.

## Frontend Implementation

### 1. Page Structure (`frontend/src/app/dashboard/analytics/page.tsx`)
- Create a main analytics page.
- Implement tabs or a role-based view selector (Executive / HR / Manager).

### 2. Components
- **Stats Cards**: Reuse existing `StatsCard`.
- **Charts**:
    - **Performance Distribution**: BarChart of performance scores.
    - **Attrition/Turnover**: LineChart of employee departures over time.
    - **Attendance Heatmap**: Visual representation of attendance patterns.

### 3. Navigation
- Add "Analytics" to the Sidebar.

## Data Sources (Prisma)
- **Employee**: Count, Dept, Status.
- **Attendance**: Rates, specific dates.
- **Performance/Review**: Average scores, distribution.
- **LeaveRequest**: Trends.
