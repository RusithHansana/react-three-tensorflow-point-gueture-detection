import { useRef } from 'react'
import LightsScene from './components/LightsScene'
import HandOverlay from './components/HandOverlay'
import useHandPython from './hooks/useHandPython'
import useRaycasting from './hooks/useRaycasting'

function App() {
  const bulbRefs = useRef([])
  const cameraRef = useRef(null)

  // Connect to Python backend for hand tracking
  const { landmarks, connectionStatus, error, frameCount, reconnect } = useHandPython()

  // Ray casting logic
  const { hitInfo, pointing, fingerPosition } = useRaycasting(
    cameraRef.current,
    landmarks,
    bulbRefs
  )

  const handleCameraReady = (camera) => {
    cameraRef.current = camera
    console.log('Camera ready:', camera)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <LightsScene
        bulbRefs={bulbRefs}
        onCameraReady={handleCameraReady}
        pointedBulbId={hitInfo?.bulbId || null}
        fingerPosition={fingerPosition}
        pointing={pointing}
      />

      {/* Hand tracking visualization */}
      <HandOverlay
        landmarks={landmarks}
        connectionStatus={connectionStatus}
      />

      {/* Debug info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '280px'
      }}>
        <div style={{ color: '#ffeb3b', fontWeight: 'bold', marginBottom: '8px' }}>
          DAY 3: Ray Casting & Intersection
        </div>
        <div>Point at bulbs to highlight them!</div>
        <div>Camera: {cameraRef.current ? '✅ Ready' : '⏳ Loading...'}</div>
        <div>Bulbs: {bulbRefs.current?.length || 0}/3 loaded</div>

        <hr style={{ margin: '8px 0', borderColor: '#444' }} />

        <div>Backend: <span style={{
          color: connectionStatus === 'connected' ? '#22c55e' : '#ef4444'
        }}>
          {connectionStatus}
        </span></div>

        <div>Hand Detected: {landmarks ? '✅ Yes' : '❌ No'}</div>
        <div>Frames: {frameCount}</div>

        <hr style={{ margin: '8px 0', borderColor: '#444' }} />

        <div style={{ color: '#00ff00', fontWeight: 'bold' }}>Raycasting:</div>
        <div>Pointing: {pointing ? '🎯 Yes' : '👆 No'}</div>
        {hitInfo && (
          <>
            <div>Target: Bulb {hitInfo.bulbId}</div>
            <div>Distance: {hitInfo.distance?.toFixed(2)}m</div>
          </>
        )}
        {fingerPosition && (
          <div style={{ fontSize: '11px', color: '#a0a0a0' }}>
            Finger: ({fingerPosition.x.toFixed(3)}, {fingerPosition.y.toFixed(3)})
          </div>
        )}

        {error && (
          <div style={{ color: '#ef4444', marginTop: '4px' }}>
            Error: {error}
          </div>
        )}

        {connectionStatus !== 'connected' && (
          <button
            onClick={reconnect}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🔄 Reconnect
          </button>
        )}
      </div>
    </div>
  )
}

export default App
