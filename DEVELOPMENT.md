# 🛠️ SmartHealth-Bot Development Guide

## 🚀 Getting Started

### Quick Setup
1. Run `start-services.ps1` (PowerShell) or `start-services.bat` (Command Prompt)
2. Wait for all services to start
3. Access the application at `http://localhost:5173`

### Manual Setup
If you prefer to start services manually:

```bash
# Terminal 1 - AI Model
cd ai-model
python app.py

# Terminal 2 - Server
cd server  
npm run dev

# Terminal 3 - Client
cd client
npm run dev
```

## 🔧 Development Workflow

### Making Changes

#### Frontend Changes
- Edit files in `client/src/`
- Hot reload is enabled - changes appear immediately
- Build for production: `npm run build`

#### Backend Changes  
- Edit files in `server/`
- Nodemon auto-restarts server on changes
- API documentation: `http://localhost:5000/api/health`

#### AI Model Changes
- Edit `ai-model/app.py`
- Restart manually: `Ctrl+C` then `python app.py`
- Test endpoints: `http://localhost:5001/symptoms`

### Common Development Tasks

#### Adding New API Endpoint
1. Create route in `server/routes/`
2. Add to `server/server.js`
3. Test with Postman or curl
4. Update frontend to use new endpoint

#### Adding New Frontend Page
1. Create component in `client/src/pages/`
2. Add route in `client/App.tsx`
3. Update navigation in `client/Navbar.tsx`

#### Database Changes
1. Update model in `server/models/`
2. Restart server
3. Test with MongoDB Compass

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Auth test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# AI Model test
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \  
  -d '{"symptoms":["fever","headache","cough"]}'
```

### Frontend Testing
```bash
cd client
npm run build    # Test production build
npm run preview  # Preview production build
```

## 🐛 Troubleshooting

### Port Issues
- **Error**: `EADDRINUSE: address already in use`
- **Solution**: Run `start-services.ps1` which auto-kills existing processes

### Database Issues
- **Error**: `MongoDB connection failed`
- **Solution**: Ensure MongoDB is running or update connection string

### Python/AI Model Issues
- **Error**: `ModuleNotFoundError`
- **Solution**: `pip install -r requirements.txt`

### Node.js Issues
- **Error**: `Module not found`
- **Solution**: `npm install` in server and client directories

### CORS Issues
- **Error**: `CORS policy` in browser console
- **Solution**: Check server CORS configuration and client API URL

## 📁 Key Files

### Configuration
- `server/.env` - Server environment variables
- `client/.env` - Client environment variables
- `ai-model/requirements.txt` - Python dependencies
- `server/package.json` - Node.js dependencies
- `client/package.json` - React dependencies

### Main Application Files
- `server/server.js` - Express server entry point
- `client/App.tsx` - React app entry point
- `ai-model/app.py` - Flask AI service
- `server/models/` - Database schemas
- `client/src/pages/` - React pages

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 📊 Monitoring

### Logs
- **AI Model**: Check terminal output for training progress
- **Server**: Check terminal for API requests and errors  
- **Client**: Check browser console for React errors

### Health Checks
- AI Model: `http://localhost:5001/symptoms`
- Server: `http://localhost:5000/api/health`
- Client: Browser developer tools

## 🚀 Deployment Notes

### Environment Setup
- Development: Use `.env` files
- Production: Set environment variables in hosting platform
- Never commit `.env` files to git

### Build Process
```bash
# Client production build
cd client
npm run build

# Server preparation  
cd server
npm install --production
```

### Security Checklist
- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Validate all user inputs
- [ ] Update dependencies regularly
- [ ] Enable CORS only for trusted domains

---

**Happy Coding! 🎉**