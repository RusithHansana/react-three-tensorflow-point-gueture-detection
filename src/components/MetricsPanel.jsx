// src/components/MetricsPanel.jsx - Real-time Metrics Display
import { useState, useEffect } from 'react'
import './MetricsPanel.css'

export default function MetricsPanel({
    metrics,
    onExport,
    onReset,
    visible = true
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [summary, setSummary] = useState(null)

    useEffect(() => {
        if (metrics?.getMetricsSummary) {
            const updateSummary = () => {
                setSummary(metrics.getMetricsSummary())
            }

            updateSummary()
            const interval = setInterval(updateSummary, 1000) // Update every second

            return () => clearInterval(interval)
        }
    }, [metrics])

    if (!visible || !summary) return null

    const getFPSQuality = (fps) => {
        if (fps >= 55) return 'excellent'
        if (fps >= 45) return 'good'
        if (fps >= 30) return 'fair'
        return 'poor'
    }

    const getStabilityQuality = (stability) => {
        if (stability <= 0.1) return 'excellent'
        if (stability <= 0.2) return 'good'
        if (stability <= 0.3) return 'fair'
        return 'poor'
    }

    const getAccuracyQuality = (accuracy) => {
        if (accuracy >= 90) return 'excellent'
        if (accuracy >= 75) return 'good'
        if (accuracy >= 60) return 'fair'
        return 'poor'
    }

    if (!isExpanded) {
        return (
            <div className="metrics-panel-minimized" onClick={() => setIsExpanded(true)}>
                <span className="metrics-icon">📊</span>
                <span className="metrics-text">Metrics</span>
                <div className="metrics-summary-indicators">
                    <div className={`metric-dot ${getAccuracyQuality(summary.accuracy)}`} />
                    <div className={`metric-dot ${getFPSQuality(summary.averageFPS)}`} />
                </div>
            </div>
        )
    }

    return (
        <div className="metrics-panel">
            <div className="metrics-header">
                <div className="metrics-title">
                    <span className="title-icon">📊</span>
                    <h3>Performance Metrics</h3>
                </div>
                <div className="metrics-controls">
                    <button
                        className="control-btn export-btn"
                        onClick={onExport}
                        title="Export to CSV"
                    >
                        💾
                    </button>
                    <button
                        className="control-btn reset-btn"
                        onClick={onReset}
                        title="Reset metrics"
                    >
                        🔄
                    </button>
                    <button
                        className="control-btn"
                        onClick={() => setIsExpanded(false)}
                        title="Minimize"
                    >
                        −
                    </button>
                </div>
            </div>

            <div className="metrics-content">
                {/* Accuracy Section */}
                <div className="metrics-section">
                    <div className="section-header">
                        <span className="section-icon">🎯</span>
                        <h4>Accuracy</h4>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-label">Success Rate</div>
                            <div className={`metric-value ${getAccuracyQuality(summary.accuracy)}`}>
                                {summary.accuracy.toFixed(1)}%
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Attempts</div>
                            <div className="metric-value">{summary.totalAttempts}</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Hits</div>
                            <div className="metric-value success">{summary.successfulHits}</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Misses</div>
                            <div className="metric-value error">{summary.misses}</div>
                        </div>
                    </div>
                </div>

                {/* Performance Section */}
                <div className="metrics-section">
                    <div className="section-header">
                        <span className="section-icon">⚡</span>
                        <h4>Performance</h4>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-label">Avg Latency</div>
                            <div className="metric-value">
                                {summary.averageLatency > 0 ? `${summary.averageLatency.toFixed(0)}ms` : 'N/A'}
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Dwell Time</div>
                            <div className="metric-value">
                                {summary.averageDwellTime > 0 ? `${summary.averageDwellTime.toFixed(0)}ms` : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Performance */}
                <div className="metrics-section">
                    <div className="section-header">
                        <span className="section-icon">💻</span>
                        <h4>System</h4>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-label">FPS</div>
                            <div className={`metric-value ${getFPSQuality(summary.averageFPS)}`}>
                                {summary.averageFPS}
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Stability</div>
                            <div className={`metric-value ${getStabilityQuality(summary.fpsStability)}`}>
                                {(summary.fpsStability * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Metrics */}
                <div className="metrics-section">
                    <div className="section-header">
                        <span className="section-icon">📈</span>
                        <h4>Analysis</h4>
                    </div>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-label">Miss/Hit Ratio</div>
                            <div className="metric-value">
                                {summary.missToHitRatio.toFixed(2)}
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Near Misses</div>
                            <div className="metric-value warning">{summary.nearMisses}</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Session Time</div>
                            <div className="metric-value">
                                {Math.floor(summary.sessionDuration / 60)}:{(summary.sessionDuration % 60).toString().padStart(2, '0')}
                            </div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-label">Events</div>
                            <div className="metric-value">{summary.totalEvents}</div>
                        </div>
                    </div>
                </div>

                {/* Real-time Status */}
                <div className="metrics-status">
                    <div className="status-indicator">
                        <span className="status-dot active" />
                        <span>Recording metrics...</span>
                    </div>
                    <div className="status-info">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    )
}
