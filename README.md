# 🎯 HandCast - Hand Gesture Point Detection System

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-R166-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.5-FF6B35?style=for-the-badge&logo=google&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)

A cutting-edge **gesture-based 3D lighting control system** that detects hand pointing gestures and allows users to toggle smart bulbs in a realistic 3D environment using pinch gestures. Built with React Three.js frontend and Python MediaPipe backend.

## Demo

![Demo-Preview](https://github.com/user-attachments/assets/eda98879-f875-4f07-8af6-47d04c4f5ab3)

## 🌟 Features

### 🎮 **Core Functionality**

- **Real-time hand tracking** using MediaPipe and webcam input
- **3D pointing detection** with precise ray casting in 3D space
- **Pinch gesture recognition** for device interaction
- **Smart bulb simulation** with realistic 3D models and lighting effects
- **WebSocket communication** between frontend and backend

### 🎨 **Visual Experience**

- **Realistic 3D room environment** with walls, ceiling, and furniture
- **Dynamic lighting system** with shadows and ambient effects
- **Particle system** for atmospheric ambiance
- **Enhanced ray visualization** with static crosshair targeting
- **Skybox backgrounds** for immersive experience

### 🖥️ **Modern UI/UX**

- **Glassmorphism design** with backdrop blur effects
- **Modern debug panel** with comprehensive system monitoring
- **Enhanced hand tracking overlay** with minimizable interface
- **Real-time status indicators** and performance metrics
- **Responsive design** with mobile support

### 🔊 **Audio System**

- **Spatial audio effects** for bulb interactions
- **Web Audio API integration** with proper user interaction handling
- **Sound feedback** for gesture recognition and device toggling

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌──────────────────────┐
│   React Frontend │ ←──────────────→ │   Python Backend     │
│                 │                 │                      │
│ • Three.js 3D   │                 │ • MediaPipe Hand     │
│ • Ray Casting   │                 │   Tracking           │
│ • Pinch Detection│                 │ • FastAPI Server     │
│ • UI Components │                 │ • Real-time Data     │
└─────────────────┘                 └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Webcam** for hand tracking
- **Modern browser** with WebRTC support

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the hand tracking server
python server.py
```

### Access the Application

- Frontend: `http://localhost:5173`
- Backend WebSocket: `ws://localhost:8000/ws`

## 📁 Project Structure

```
gesture-control-react-three/
├── src/
│   ├── components/
│   │   ├── LightsScene.jsx          # Main 3D scene with bulbs
│   │   ├── RayVisualizer.jsx        # Ray casting visualization
│   │   ├── HandOverlay.jsx          # Hand tracking display
│   │   ├── DebugPanel.jsx           # Modern debug interface
│   │   ├── Room.jsx                 # 3D room environment
│   │   ├── AdvancedLighting.jsx     # Dynamic lighting system
│   │   ├── ParticleSystem.jsx       # Ambient particle effects
│   │   └── Skybox.jsx               # Background environment
│   ├── hooks/
│   │   ├── useHandPython.js         # WebSocket hand tracking
│   │   ├── useRaycasting.js         # 3D pointing detection
│   │   ├── usePinchDetection.js     # Gesture recognition
│   │   └── useAudio.js              # Audio system integration
│   ├── utils/
│   │   └── raycastUtils.js          # Ray casting utilities
│   └── App.jsx                      # Main application component
├── backend/
│   ├── server.py                    # MediaPipe hand tracking server
│   └── requirements.txt             # Python dependencies
├── public/                          # Static assets
└── package.json                     # Project dependencies
```

## 🎯 How It Works

### 1. **Hand Tracking Pipeline**

```
Webcam Input → MediaPipe → Hand Landmarks → WebSocket → React Frontend
```

### 2. **3D Pointing Detection**

- Converts 2D hand landmarks to 3D world coordinates
- Creates ray from camera through fingertip position
- Performs intersection tests with 3D bulb objects
- Provides visual feedback with crosshair and ray visualization

### 3. **Gesture Recognition**

- Monitors distance between thumb tip and index finger tip
- Detects pinch gestures based on configurable threshold
- Triggers bulb toggle actions when pointing at targets

### 4. **Visual Feedback System**

- Real-time ray visualization with particles and glow effects
- Static crosshair for precise targeting (no blinking/pulsing)
- Color-coded status indicators for system state
- Smooth animations and transitions

## 🛠️ Technology Stack

### **Frontend Technologies**

- **React 19.1.1** - Modern UI framework with concurrent features
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers and abstractions
- **Three.js** - 3D graphics library
- **Vite** - Fast build tool and development server

### **Backend Technologies**

- **Python 3.8+** - Backend runtime
- **FastAPI** - Modern web framework for APIs
- **MediaPipe** - Google's machine learning framework
- **OpenCV** - Computer vision library
- **WebSockets** - Real-time communication

### **Development Tools**

- **ESLint** - Code linting and formatting
- **Hot Module Replacement** - Fast development iteration
- **Modern browser DevTools** - Debugging and profiling

## 🎮 Usage Guide

### **Basic Operation**

1. **Start the system** - Run both frontend and backend servers
2. **Allow camera access** - Grant webcam permissions when prompted
3. **Show your hand** - Hold your hand in front of the camera
4. **Point at bulbs** - Extend your index finger toward a bulb
5. **Pinch to toggle** - Bring thumb and index finger together

### **Interface Controls**

- **Debug Panel** - Toggle visibility and monitor system status
- **Hand Overlay** - Minimize/maximize hand tracking visualization
- **Detail Mode** - Show/hide landmark numbers and coordinates

### **Gesture Recognition**

- **Pointing** - Extend index finger toward target
- **Pinch** - Bring thumb and index finger together (< 0.1 units)
- **Release** - Separate fingers to complete gesture

## 🎨 Visual Features

### **3D Environment**

- **Realistic room** with 3 walls, ceiling, and floor
- **Furniture placement** including table and chair
- **Window and decorative elements** for ambiance
- **Professional lighting setup** with shadows

### **Bulb Interactions**

- **Ceiling-mounted bulb** - Central overhead lighting
- **Wall sconces** - Two decorative wall-mounted fixtures
- **Dynamic lighting** - Real-time light source updates
- **Smooth transitions** - Animated on/off states

### **Modern UI Design**

- **Glassmorphism effects** - Backdrop blur and transparency
- **Smooth animations** - CSS transitions and transforms
- **Responsive layout** - Adapts to different screen sizes
- **Accessibility features** - High contrast and reduced motion support

## 🔧 Configuration

### **Hand Tracking Settings**

```javascript
// Pinch detection threshold
const PINCH_THRESHOLD = 0.1;

// Ray casting distance
const MAX_RAY_DISTANCE = 15;

// Hand confidence threshold
const MIN_HAND_CONFIDENCE = 0.7;
```

### **Visual Settings**

```javascript
// Ray visualization
const RAY_COLOR = 0x00ffff;
const RAY_OPACITY = 0.8;

// Particle system
const PARTICLE_COUNT = 25;
const PARTICLE_SIZE = 0.004;
```

## 📊 Performance Optimization

### **Frontend Optimizations**

- **React.memo** for component memoization
- **useCallback** for event handler optimization
- **Efficient re-rendering** with proper dependency arrays
- **Three.js object pooling** for particles and effects

### **Backend Optimizations**

- **MediaPipe GPU acceleration** when available
- **Efficient landmark processing** with NumPy operations
- **WebSocket connection pooling** for multiple clients
- **Frame rate limiting** to prevent CPU overload

## 🐛 Troubleshooting

### **Common Issues**

**Camera not working:**

- Ensure webcam is connected and not used by other applications
- Check browser permissions for camera access
- Try refreshing the page or restarting the browser

**Hand tracking not responding:**

- Ensure good lighting conditions
- Keep hand within camera frame
- Avoid wearing gloves or jewelry that obscures fingers
- Check if backend server is running and connected

**Ray casting inaccurate:**

- Calibrate camera position relative to screen
- Ensure proper lighting for hand detection
- Check if 3D scene camera settings match expected view

**Performance issues:**

- Close unnecessary browser tabs
- Check CPU/GPU usage in system monitor
- Reduce particle count or visual effects if needed
- Ensure adequate system specifications

### **Development Issues**

**Build errors:**

- Clear node_modules and reinstall:
  - Windows (PowerShell): `Remove-Item -Recurse -Force node_modules; npm install`
  - Windows (cmd): `rmdir /s /q node_modules && npm install`
  - Linux/Mac: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are properly installed

**WebSocket connection fails:**

- Ensure backend server is running on correct port (8000)
- Check firewall settings
- Verify CORS configuration in FastAPI

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### **Development Guidelines**

- Follow existing code style and conventions
- Add comprehensive comments for complex logic
- Include unit tests for new features
- Update documentation as needed
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe Team** - For the excellent hand tracking framework
- **Three.js Community** - For the powerful 3D graphics library
- **React Three Fiber** - For the seamless React-Three.js integration
- **FastAPI** - For the modern Python web framework
- **Vite Team** - For the lightning-fast development experience

## 🔮 Future Enhancements

### **Planned Features**

- **Multi-hand support** - Track both hands simultaneously
- **Voice commands** - Combine gesture and voice control
- **Device templates** - Support for different smart home devices
- **Gesture customization** - User-defined gesture mappings
- **Cloud integration** - Real smart home device control
- **Mobile app** - React Native companion application

### **Technical Improvements**

- **WebRTC optimization** - Reduced latency for real-time tracking
- **Machine learning enhancement** - Custom gesture recognition models
- **Performance profiling** - Advanced optimization techniques
- **Testing framework** - Comprehensive unit and integration tests
- **Docker deployment** - Containerized application setup

---

<div align="center">

**Built with ❤️ by the React Three.js Community**

</div>
