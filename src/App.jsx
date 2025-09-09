import { useRef } from 'react'
import LightsScene from './components/LightsScene'

function App() {
  const bulbRefs = useRef([])
  const cameraRef = useRef(null)

  const handleCameraReady = (camera) => {
    cameraRef.current = camera
    console.log('Camera ready:', camera)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <LightsScene
        bulbRefs={bulbRefs}
        onCameraReady={handleCameraReady}
      />

      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>DAY 1: 3D Light Bulbs Scene</div>
        <div>Click bulbs to toggle them!</div>
        <div>Camera: {cameraRef.current ? '✅ Ready' : '⏳ Loading...'}</div>
        <div>Bulbs: {bulbRefs.current?.length || 0}/3 loaded</div>
      </div>
    </div>
  )
}

export default App
