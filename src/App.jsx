import { useRef, useEffect } from 'react'
import LightsScene from './components/LightsScene'
import HandOverlay from './components/HandOverlay'
import DebugPanel from './components/DebugPanel'
import useHandPython from './hooks/useHandPython'
import useRaycasting from './hooks/useRaycasting'
import usePinchDetection from './hooks/usePinchDetection'

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

  // Pinch detection for bulb toggling
  const { isPinching, pinchStrength, onPinch } = usePinchDetection(landmarks)

  // Handle pinch events to toggle bulbs
  useEffect(() => {
    onPinch((pinchEvent) => {
      if (pinchEvent.type === 'pinch_start' && hitInfo) {
        // Toggle the bulb that's being pointed at
        const targetBulb = bulbRefs.current.find(bulbRef =>
          bulbRef && bulbRef.id === hitInfo.bulbId
        )

        if (targetBulb && targetBulb.toggle) {
          console.log(`🔄 Toggling bulb ${hitInfo.bulbId} via pinch gesture`)
          targetBulb.toggle()
        }
      }
    })
  }, [onPinch, hitInfo])

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

      {/* Modern Debug Panel */}
      <DebugPanel
        connectionStatus={connectionStatus}
        error={error}
        frameCount={frameCount}
        landmarks={landmarks}
        hitInfo={hitInfo}
        pointing={pointing}
        fingerPosition={fingerPosition}
        isPinching={isPinching}
        pinchStrength={pinchStrength}
        cameraReady={!!cameraRef.current}
        bulbCount={bulbRefs.current?.length || 0}
        onReconnect={reconnect}
      />
    </div>
  )
}

export default App
