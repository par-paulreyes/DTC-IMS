# Camera Network Setup Guide

This guide will help you enable camera access for the QR scanner when accessing the DTC-IMS application over the network.

## Why HTTPS is Required

Modern browsers require HTTPS for camera access when accessing websites over the network (not localhost). This is a security feature to protect user privacy.

## Setup Instructions

### 1. Start Frontend with HTTPS Support

**Option A: Using the new script (Recommended)**
```bash
cd frontend
npm run dev:https
```

**Option B: Using the updated dev script**
```bash
cd frontend
npm run dev
```

### 2. Access the Application

- **Local access**: `http://localhost:3000` (camera works without HTTPS)
- **Network access**: `https://192.168.100.188:3000` (HTTPS required for camera)

### 3. Browser Security Warning

When accessing via HTTPS for the first time, you may see a security warning because we're using a self-signed certificate. This is normal for development.

**To proceed:**
1. Click "Advanced" or "Show Details"
2. Click "Proceed to 192.168.100.188 (unsafe)" or similar
3. The camera should now work

### 4. Camera Permissions

When you first access the QR scanner:
1. Your browser will ask for camera permissions
2. Click "Allow" to enable camera access
3. If denied, you can still use the file upload option

## Troubleshooting

### Camera Not Working Over Network

1. **Check HTTPS**: Make sure you're accessing via `https://` not `http://`
2. **Browser Permissions**: Check if camera permissions are allowed
3. **Firewall**: Ensure port 3000 is open in your firewall
4. **Network Access**: Verify you can reach the server IP

### Alternative: File Upload

If camera access still doesn't work:
1. The scanner will automatically show the file upload option
2. You can upload QR code images from your device
3. The scanner will process the image to extract QR codes

### Manual QR Code Entry

As a last resort:
1. Click "Enter Manually" button
2. Type the QR code directly
3. The system will process it the same way

## Network Configuration

### Frontend (Next.js)
- **Port**: 3000
- **Protocol**: HTTPS (for network access)
- **Host**: 0.0.0.0 (all network interfaces)

### Backend (Express)
- **Port**: 5000
- **Protocol**: HTTP
- **Host**: 0.0.0.0 (all network interfaces)

## Security Notes

- The HTTPS certificate is self-signed for development
- In production, use a proper SSL certificate
- Camera access is only available over HTTPS or localhost
- File upload and manual entry work over any protocol

## Testing

1. **Local Test**: Access `http://localhost:3000` - camera should work
2. **Network Test**: Access `https://192.168.100.188:3000` - camera should work with HTTPS
3. **Fallback Test**: If camera fails, file upload should be available

## Commands Summary

```bash
# Start backend
cd backend && npm start

# Start frontend with HTTPS (for network camera access)
cd frontend && npm run dev:https

# Or use the regular dev command (also includes HTTPS)
cd frontend && npm run dev
``` 