# Backend - Hand Tracking Server

This directory contains the Python FastAPI backend for real-time hand tracking using MediaPipe.

## Files

- **`server.py`** - FastAPI WebSocket server with MediaPipe hand detection
- **`requirements.txt`** - Python dependencies
- **`setup-backend.bat`** - Windows setup script
- **`venv/`** - Python virtual environment (created automatically)

## Key Dependencies

- **FastAPI** - Modern async web framework
- **MediaPipe** - Google's hand tracking ML framework
- **OpenCV** - Computer vision and webcam access
- **Uvicorn** - ASGI server for FastAPI
- **WebSockets** - Real-time communication

## Quick Setup

```bash
# From project root
npm run setup:backend

# Or manually
cd backend
python -m venv venv

# Activate virtual environment
# Windows (cmd/PowerShell):
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

## Running

```bash
# From project root
npm run dev:backend

# Or manually
cd backend

# Activate virtual environment first
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

python server.py
```

## API Endpoints

- **WebSocket**: `ws://localhost:8000/ws` - Real-time hand landmarks
- **Health Check**: `http://localhost:8000/health` - Server status
- **Root**: `http://localhost:8000/` - Basic info

## Hand Landmarks

The server sends 21 hand landmarks in the format:

```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.3, "z": 0.1},
    ...
  ],
  "frame_count": 123,
  "timestamp": 1234567890.123
}
```

Landmark indices follow MediaPipe convention:

- 0: Wrist
- 4: Thumb tip
- 8: Index finger tip
- 12: Middle finger tip
- 16: Ring finger tip
- 20: Pinky tip

## Troubleshooting

### Camera not detected

- Ensure webcam is connected and not in use by other applications
- Check if OpenCV can access the camera: `python -c "import cv2; print(cv2.VideoCapture(0).isOpened())"`
- Try a different camera index in `server.py` if you have multiple cameras

### Port already in use

- Check if another process is using port 8000: 
  - Windows: `netstat -ano | findstr :8000`
  - Linux/Mac: `lsof -i :8000`
- Kill the conflicting process or change the port in `server.py`

### MediaPipe installation fails

- Ensure Python 3.8+ is installed
- Try upgrading pip: `pip install --upgrade pip`
- On some systems, you may need: `pip install mediapipe --no-cache-dir`

### WebSocket connection refused

- Verify the server is running and shows "Uvicorn running"
- Check firewall settings aren't blocking port 8000
- Ensure the frontend is using the correct WebSocket URL
