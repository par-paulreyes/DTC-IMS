# DTC-IMS Setup Guide

## Issues Fixed

1. ✅ **Database Name**: Updated from `dtc_ims` to `ims_db` in:
   - `backend/db.js`
   - `backend/app.js`
   - `database_setup.sql`

2. ✅ **Authentication**: Fixed JWT token handling to accept both "Bearer token" and direct token formats

3. ✅ **User Registration**: Added admin-only access with proper authentication checks

4. ✅ **Form Fields**: Updated all forms to use `company_name` instead of `company_id`

## Setup Instructions

### 1. Database Setup

First, create the database and tables:

```sql
-- Run this in MySQL to create the database
CREATE DATABASE ims_db;
```

Then run the complete setup script:

```bash
mysql -u root -p ims_db < database_setup.sql
```

Or copy and paste the contents of `database_setup.sql` into your MySQL client.

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Test the database connection:

```bash
node test-db.js
```

If successful, start the backend server:

```bash
npm start
# or for development with auto-restart:
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Environment Variables (Optional)

Create a `.env` file in the backend directory if you need custom settings:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ims_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

## Default Login Credentials

- **Username**: `admin`
- **Password**: `123456`
- **Role**: Admin

## Testing the Application

1. **Database Test**: Run `node test-db.js` in the backend directory
2. **Backend Test**: Visit `http://localhost:5000` - should show "Inventory Management System API"
3. **Frontend Test**: Visit `http://localhost:3000` - should show the login page
4. **Login Test**: Use the default admin credentials to log in
5. **QR Scanner Test**: Use the QR scanner to scan item property numbers

## Network Access

To access the application over the network:

1. Update `frontend/src/config/api.ts`:
   ```typescript
   export const API_BASE_URL = 'http://YOUR_SERVER_IP:5000';
   ```

2. The backend is already configured to listen on all network interfaces (`0.0.0.0`)

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials
- Verify the `ims_db` database exists
- Run `node test-db.js` to test connection

### Backend Issues
- Check if port 5000 is available
- Ensure all dependencies are installed
- Check console for error messages

### Frontend Issues
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check browser console for errors
- Verify API_BASE_URL is correct

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set (if using .env)
- Verify token format in requests

## File Structure

```
DTC-IMS/
├── backend/                 # Node.js backend
│   ├── app.js              # Main server file
│   ├── db.js               # Database configuration
│   ├── test-db.js          # Database test script
│   ├── controllers/        # API controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── middleware/         # Authentication middleware
├── frontend/               # Next.js frontend
│   ├── src/app/           # Pages and components
│   ├── src/config/        # API configuration
│   └── src/components/    # Reusable components
└── database_setup.sql     # Database schema and sample data
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/users/profile` - Get user profile
- `GET /api/items` - Get items by company
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/logs` - Get maintenance logs
- `POST /api/logs` - Create maintenance log
- `GET /api/diagnostics` - Get diagnostics
- `POST /api/diagnostics` - Create diagnostic

All endpoints (except login) require authentication via JWT token. 