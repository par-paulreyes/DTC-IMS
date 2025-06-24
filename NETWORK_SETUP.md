# Network Setup Guide

This guide will help you configure the DTC-IMS application to work over a network instead of just localhost.

## Backend Changes (Already Applied)

The backend has been updated to:
1. Listen on all network interfaces (0.0.0.0) instead of just localhost
2. Allow CORS requests from any origin for network access

## Frontend Configuration

### Option 1: Environment Variable (Recommended)

1. Create a `.env.local` file in the `frontend` directory:
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:5000" > .env.local
```

2. Replace `YOUR_SERVER_IP` with your actual server IP address.

### Option 2: Direct Configuration

1. Find your server's IP address by running:
```bash
node get-ip.js
```

2. Update `frontend/src/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_SERVER_IP:5000';
```

## Steps to Enable Network Access

### 1. Find Your Server IP Address
Run the provided script:
```bash
node get-ip.js
```

### 2. Configure Frontend
Choose one of the configuration options above.

### 3. Start the Backend
```bash
cd backend
npm start
```

### 4. Start the Frontend
```bash
cd frontend
npm run dev
```

### 5. Access from Other Devices
- From the server machine: `http://localhost:3000`
- From other devices on the network: `http://YOUR_SERVER_IP:3000`

## Troubleshooting

### Firewall Issues
If you can't access the application from other devices:

1. **Windows Firewall**: Allow Node.js through the firewall
2. **Antivirus**: Check if your antivirus is blocking the connections
3. **Router**: Ensure your router allows internal network communication

### Port Issues
If port 5000 or 3000 is already in use:
1. Change the backend port in `backend/app.js`
2. Update the frontend configuration accordingly

### CORS Issues
If you see CORS errors:
1. Ensure the backend is running with the updated CORS configuration
2. Check that the frontend is using the correct server IP address

## Security Considerations

For production use:
1. Use HTTPS instead of HTTP
2. Configure CORS to only allow specific origins
3. Implement proper authentication and authorization
4. Use environment variables for sensitive configuration

## Example Configuration

If your server IP is `192.168.1.100`:

**Backend** (already configured):
- Listens on: `0.0.0.0:5000`
- Accessible at: `http://192.168.1.100:5000`

**Frontend**:
- Environment variable: `NEXT_PUBLIC_API_URL=http://192.168.1.100:5000`
- Accessible at: `http://192.168.1.100:3000` 