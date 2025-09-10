import { useState, useEffect } from 'react'
import './DebugPanel.css'

export default function DebugPanel({
    cameraReady = false,
    bulbCount = 0,
    connectionStatus = 'disconnected',
    handDetected = false,
    frameCount = 0,
    pointing = false,
    hitInfo = null,
    fingerPosition = null,
    isPinching = false,
    pinchStrength = 0,
    error = null,
    onReconnect = () => {}
}) {
    const [isVisible, setIsVisible] = useState(true)
    const [isExpanded, setIsExpanded] = useState(true)
    const [animationClass, setAnimationClass] = useState('')

    // Animate status changes
    useEffect(() => {
        setAnimationClass('pulse')
        const timer = setTimeout(() => setAnimationClass(''), 300)
        return () => clearTimeout(timer)
    }, [connectionStatus, handDetected, pointing, isPinching])

    // Calculate connection quality based on frame rate
    const getConnectionQuality = () => {
        if (connectionStatus !== 'connected') return 'poor'
        if (frameCount > 25) return 'excellent'
        if (frameCount > 15) return 'good'
        if (frameCount > 5) return 'fair'
        return 'poor'
    }

    const toggleVisibility = () => {
        setIsVisible(!isVisible)
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded)
    }

    if (!isVisible) {
        return (
            <div className="debug-toggle-btn" onClick={toggleVisibility}>
                <div className="toggle-icon">🔧</div>
                <span className="toggle-text">Debug</span>
            </div>
        )
    }

    return (
        <div className={`debug-panel ${animationClass} ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Header */}
            <div className="debug-header">
                <div className="debug-title">
                    <span className="title-icon">🎯</span>
                    <h3>Gesture Control Debug</h3>
                </div>
                <div className="debug-controls">
                    <button 
                        className="control-btn expand-btn" 
                        onClick={toggleExpanded}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {isExpanded ? '−' : '+'}
                    </button>
                    <button 
                        className="control-btn close-btn" 
                        onClick={toggleVisibility}
                        title="Hide Debug Panel"
                    >
                        ×
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="debug-content">
                    {/* System Status */}
                    <div className="debug-section">
                        <div className="section-header">
                            <span className="section-icon">⚙️</span>
                            <h4>System Status</h4>
                        </div>
                        
                        <div className="status-grid">
                            <div className="status-item">
                                <div className="status-label">Camera</div>
                                <div className={`status-indicator ${cameraReady ? 'active' : 'inactive'}`}>
                                    <div className="status-dot"></div>
                                    <span>{cameraReady ? 'Ready' : 'Loading...'}</span>
                                </div>
                            </div>
                            
                            <div className="status-item">
                                <div className="status-label">Bulbs</div>
                                <div className="status-value">
                                    <span className="count-badge">{bulbCount}</span>/3 loaded
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="debug-section">
                        <div className="section-header">
                            <span className="section-icon">🔗</span>
                            <h4>Connection</h4>
                        </div>
                        
                        <div className="connection-info">
                            <div className="connection-status">
                                <div className={`connection-indicator ${connectionStatus}`}>
                                    <div className="connection-dot"></div>
                                    <span className="connection-text">{connectionStatus}</span>
                                </div>
                                <div className="connection-quality">
                                    <div className={`quality-badge ${getConnectionQuality()}`}>
                                        {getConnectionQuality().toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="frame-counter">
                                <span className="frame-label">FPS:</span>
                                <span className="frame-count">{frameCount}</span>
                                <div className="frame-bar">
                                    <div 
                                        className="frame-fill" 
                                        style={{ width: `${Math.min(frameCount / 30 * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hand Tracking */}
                    <div className="debug-section">
                        <div className="section-header">
                            <span className="section-icon">👋</span>
                            <h4>Hand Tracking</h4>
                        </div>
                        
                        <div className="hand-tracking-info">
                            <div className="tracking-status">
                                <div className={`hand-indicator ${handDetected ? 'detected' : 'not-detected'}`}>
                                    <div className="hand-dot"></div>
                                    <span>{handDetected ? 'Hand Detected' : 'No Hand'}</span>
                                </div>
                            </div>
                            
                            {fingerPosition && (
                                <div className="finger-position">
                                    <div className="coordinate-display">
                                        <div className="coord-item">
                                            <span className="coord-label">X:</span>
                                            <span className="coord-value">{fingerPosition.x.toFixed(3)}</span>
                                        </div>
                                        <div className="coord-item">
                                            <span className="coord-label">Y:</span>
                                            <span className="coord-value">{fingerPosition.y.toFixed(3)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Visual hand position indicator */}
                                    <div className="hand-visualizer">
                                        <div className="hand-area">
                                            <div 
                                                className="hand-cursor"
                                                style={{
                                                    left: `${fingerPosition.x * 100}%`,
                                                    top: `${fingerPosition.y * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ray Casting */}
                    <div className="debug-section">
                        <div className="section-header">
                            <span className="section-icon">🎯</span>
                            <h4>Ray Casting</h4>
                        </div>
                        
                        <div className="raycasting-info">
                            <div className="pointing-status">
                                <div className={`pointing-indicator ${pointing ? 'pointing' : 'not-pointing'}`}>
                                    <div className="pointing-dot"></div>
                                    <span>{pointing ? 'Targeting' : 'Scanning'}</span>
                                </div>
                            </div>
                            
                            {hitInfo && (
                                <div className="hit-info">
                                    <div className="hit-details">
                                        <div className="hit-item">
                                            <span className="hit-label">Target:</span>
                                            <span className="hit-value">Bulb {hitInfo.bulbId}</span>
                                        </div>
                                        <div className="hit-item">
                                            <span className="hit-label">Distance:</span>
                                            <span className="hit-value">{hitInfo.distance?.toFixed(2)}m</span>
                                        </div>
                                    </div>
                                    
                                    <div className="distance-bar">
                                        <div 
                                            className="distance-fill" 
                                            style={{ width: `${100 - Math.min(hitInfo.distance / 5 * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pinch Detection */}
                    <div className="debug-section">
                        <div className="section-header">
                            <span className="section-icon">🤏</span>
                            <h4>Pinch Gesture</h4>
                        </div>
                        
                        <div className="pinch-info">
                            <div className="pinch-status">
                                <div className={`pinch-indicator ${isPinching ? 'pinching' : 'released'}`}>
                                    <div className="pinch-dot"></div>
                                    <span>{isPinching ? 'Pinching' : 'Released'}</span>
                                </div>
                            </div>
                            
                            <div className="pinch-strength">
                                <div className="strength-label">
                                    <span>Strength:</span>
                                    <span className="strength-percentage">{(pinchStrength * 100).toFixed(0)}%</span>
                                </div>
                                <div className="strength-bar">
                                    <div 
                                        className="strength-fill" 
                                        style={{ width: `${pinchStrength * 100}%` }}
                                    ></div>
                                    <div className="strength-threshold" style={{ left: '70%' }}></div>
                                </div>
                            </div>
                            
                            {isPinching && hitInfo && (
                                <div className="action-ready">
                                    <div className="ready-indicator">
                                        <span className="ready-icon">⚡</span>
                                        <span>Ready to toggle Bulb {hitInfo.bulbId}!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="debug-section error-section">
                            <div className="section-header">
                                <span className="section-icon">⚠️</span>
                                <h4>Error</h4>
                            </div>
                            <div className="error-content">
                                <div className="error-message">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Reconnect Button */}
                    {connectionStatus !== 'connected' && (
                        <div className="debug-actions">
                            <button className="reconnect-btn" onClick={onReconnect}>
                                <span className="btn-icon">🔄</span>
                                <span>Reconnect</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
