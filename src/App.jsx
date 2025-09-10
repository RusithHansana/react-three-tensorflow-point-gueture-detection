import { useRef, useEffect } from 'react'
import LightsScene from './components/LightsScene'
import HandOverlay from './components/HandOverlay'
import DebugPanel from './components/DebugPanel'
import MetricsPanel from './components/MetricsPanel'
import useHandPython from './hooks/useHandPython'
import useRaycasting from './hooks/useRaycasting'
import usePinchDetection from './hooks/usePinchDetection'
import useMetrics from './hooks/useMetrics'

function App() {
  const bulbRefs = useRef([])
  const cameraRef = useRef(null)

  // Connect to Python backend for hand tracking
  const { landmarks, connectionStatus, error, frameCount, reconnect } = useHandPython()

  // Metrics system for performance tracking
  const metrics = useMetrics()

  // Ray casting logic with selection hold
  const { hitInfo, pointing, fingerPosition, isHoldingSelection } = useRaycasting(
    cameraRef.current,
    landmarks,
    bulbRefs
  )

  // Pinch detection for bulb toggling
  const { isPinching, pinchStrength, onPinch } = usePinchDetection(landmarks)

  // Handle pinch events to toggle bulbs
  useEffect(() => {
    onPinch((pinchEvent) => {
      if (pinchEvent.type === 'pinch_start') {
        metrics.logPinchStart(hitInfo?.bulbId)

        if (hitInfo) {
          // Start measuring latency
          const pinchStartTime = performance.now()

          // Toggle the bulb that's being pointed at
          const targetBulb = bulbRefs.current.find(bulbRef =>
            bulbRef && bulbRef.id === hitInfo.bulbId
          )

          if (targetBulb && targetBulb.toggle) {
            console.log(`🔄 Toggling bulb ${hitInfo.bulbId} via pinch gesture`)
            targetBulb.toggle()

            // Log successful toggle with latency
            metrics.logToggleSuccess(hitInfo.bulbId, pinchStartTime)
          } else {
            // Log miss if target not found
            metrics.logMiss(hitInfo.bulbId)
          }
        } else {
          // Log miss if no target
          metrics.logMiss()
        }
      } else if (pinchEvent.type === 'pinch_end') {
        metrics.logPinchEnd(hitInfo?.bulbId, !!hitInfo)
      }
    })
  }, [onPinch, hitInfo, metrics])

  // Track pointing events for dwell time and accuracy metrics
  useEffect(() => {
    const currentTargetId = hitInfo?.bulbId
    const wasPointing = pointing

    if (wasPointing && currentTargetId) {
      metrics.logPointingStart(currentTargetId)
    } else if (!wasPointing && currentTargetId) {
      metrics.logPointingEnd(currentTargetId, false)
    }
  }, [pointing, hitInfo?.bulbId, metrics])

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
        isHoldingSelection={isHoldingSelection}
        onReconnect={reconnect}
      />

      {/* Performance Metrics Panel */}
      <MetricsPanel
        metrics={metrics}
        onExport={() => metrics.exportToCSV()}
        onReset={() => metrics.resetMetrics()}
        visible={true}
      />
    </div>
  )
}

export default App
