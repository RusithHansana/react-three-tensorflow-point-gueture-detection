// src/components/HandOverlay.jsx
import { useRef, useEffect, useState } from 'react'
import './HandOverlay.css'

export default function HandOverlay({ landmarks, connectionStatus }) {
    const canvasRef = useRef(null)
    const [isMinimized, setIsMinimized] = useState(false)
    const [showDetails, setShowDetails] = useState(true)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const { width, height } = canvas

        // Clear canvas with transparent background for glassmorphism effect
        ctx.clearRect(0, 0, width, height)

        if (!landmarks) {
            // Draw "no hand" state with better styling
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.font = '14px Inter, system-ui, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('No hand detected', width / 2, height / 2)

            // Draw scanning animation
            const time = Date.now() * 0.003
            const scanY = (Math.sin(time) * 0.5 + 0.5) * height
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + Math.sin(time * 2) * 0.3})`
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(0, scanY)
            ctx.lineTo(width, scanY)
            ctx.stroke()
            ctx.setLineDash([])
            return
        }

        // Enhanced landmark drawing
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * width
            const y = landmark.y * height

            // Create glow effect for landmarks
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8)

            // Different colors for different finger parts
            let color = '#3b82f6' // Default blue
            if ([4, 8, 12, 16, 20].includes(index)) {
                color = '#8b5cf6' // Purple for fingertips
            } else if ([0].includes(index)) {
                color = '#22c55e' // Green for thumb base
            }

            gradient.addColorStop(0, color)
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

            // Draw glow
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, 2 * Math.PI)
            ctx.fill()

            // Draw landmark point
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()

            // Enhanced landmark labels for key points
            if ([0, 4, 8, 12, 16, 20].includes(index) && showDetails) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                ctx.font = 'bold 9px Inter, system-ui, sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(index.toString(), x, y - 12)
            }
        })

        // Enhanced connections with gradient lines
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],       // Index finger
            [5, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
            [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
            [13, 17], [17, 18], [18, 19], [19, 20] // Pinky
        ]

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start]
            const endPoint = landmarks[end]
            const startX = startPoint.x * width
            const startY = startPoint.y * height
            const endX = endPoint.x * width
            const endY = endPoint.y * height

            // Create gradient for connection lines
            const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY)
            lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
            lineGradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)')

            ctx.strokeStyle = lineGradient
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
        })

        // Enhanced fingertip highlighting (index finger tip - landmark 8)
        const fingertip = landmarks[8]
        if (fingertip) {
            const x = fingertip.x * width
            const y = fingertip.y * height

            // Animated ring around fingertip
            const time = Date.now() * 0.005
            const pulseRadius = 10 + Math.sin(time) * 3

            // Outer glow
            const fingertipGradient = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius + 5)
            fingertipGradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)')
            fingertipGradient.addColorStop(1, 'rgba(239, 68, 68, 0)')

            ctx.fillStyle = fingertipGradient
            ctx.beginPath()
            ctx.arc(x, y, pulseRadius + 5, 0, 2 * Math.PI)
            ctx.fill()

            // Pulsing ring
            ctx.beginPath()
            ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI)
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 + Math.sin(time * 2) * 0.2})`
            ctx.lineWidth = 2
            ctx.stroke()

            // Crosshair for precision
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x - 6, y)
            ctx.lineTo(x + 6, y)
            ctx.moveTo(x, y - 6)
            ctx.lineTo(x, y + 6)
            ctx.stroke()
        }
    }, [landmarks, connectionStatus, showDetails])

    if (isMinimized) {
        return (
            <div className="hand-overlay-minimized" onClick={() => setIsMinimized(false)}>
                <span className="minimize-icon">👋</span>
                <span className="minimize-text">Hand Tracking</span>
                <div className={`status-dot ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`} />
            </div>
        )
    }

    return (
        <div className="hand-overlay-container">
            <div className="hand-overlay-header">
                <div className="overlay-title">
                    <span className="title-icon">👋</span>
                    <h4>Hand Tracking</h4>
                </div>
                <div className="overlay-controls">
                    <button
                        className="control-btn"
                        onClick={() => setShowDetails(!showDetails)}
                        title="Toggle details"
                    >
                        {showDetails ? '🔍' : '👁️'}
                    </button>
                    <button
                        className="control-btn"
                        onClick={() => setIsMinimized(true)}
                        title="Minimize"
                    >
                        −
                    </button>
                </div>
            </div>

            <div className="hand-overlay-content">
                <div className="connection-status">
                    <div className={`connection-indicator ${connectionStatus}`}>
                        <div className="connection-dot" />
                        <span>Camera {connectionStatus}</span>
                    </div>
                    {landmarks && (
                        <div className="landmark-count">
                            <span className="count-badge">{landmarks.length}</span>
                            <span className="count-label">landmarks</span>
                        </div>
                    )}
                </div>

                <canvas
                    ref={canvasRef}
                    width={280}
                    height={180}
                    className="hand-canvas"
                />

                <div className="overlay-footer">
                    {landmarks ? (
                        <div className="detection-info">
                            <span className="detection-status active">✨ Hand detected</span>
                            {showDetails && (
                                <div className="fingertip-coords">
                                    {landmarks[8] && (
                                        <>
                                            <span className="coord-label">Fingertip:</span>
                                            <span className="coord-value">
                                                ({landmarks[8].x.toFixed(3)}, {landmarks[8].y.toFixed(3)})
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="detection-info">
                            <span className="detection-status scanning">🔍 Scanning for hand...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
