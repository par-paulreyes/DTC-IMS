# DTC-IMS

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- MySQL server

## Backend Setup
1. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your values:
   ```sh
   cp .env.example .env
   ```
   - Set your database credentials, JWT secret, and certificate paths.
4. Start the backend server:
   ```sh
   npm start
   ```
   - The server will run on the host/port specified in your `.env` file.

## Frontend Setup
1. Navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```
   - The app will be available at http://localhost:3000 by default.

## Notes
- Make sure your MySQL server is running and accessible.
- For HTTPS, provide valid certificate and key files, and update the paths in your `.env` file.
- If you encounter issues, check the console output for errors.