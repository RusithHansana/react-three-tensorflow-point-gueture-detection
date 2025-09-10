// src/hooks/useMetrics.js - Comprehensive Gesture Metrics System
import { useEffect, useCallback } from 'react';

/* ---------- 1. Configuration ---------- */
const MAX_LOG_ENTRIES = 1000;
const FPS_SAMPLE_SIZE = 60; // Track last 60 frames for FPS stability
const DWELL_THRESHOLD = 500; // ms - minimum time pointing at target for valid dwell
const MISS_DISTANCE_THRESHOLD = 0.5; // meters - max distance to count as "near miss"

/* ---------- 2. Global metrics storage ---------- */
let metricsData = {
    // Core events
    events: [],

    // FPS tracking
    fpsHistory: [],
    lastFrameTime: performance.now(),

    // Interaction tracking
    currentSession: {
        startTime: null,
        totalAttempts: 0,
        successfulHits: 0,
        misses: 0,
        nearMisses: 0,
        dwellTimes: [],
        latencies: [],
        pointingStartTime: null,
        lastTargetId: null
    },

    // System performance
    systemMetrics: {
        averageFPS: 0,
        fpsStability: 0, // coefficient of variation
        memoryUsage: 0,
        cpuIntensive: false
    }
};

let sessionStartTime = performance.now();

/* ---------- 3. Core metrics functions ---------- */
export function useMetrics() {
    // Track FPS
    const trackFPS = useCallback(() => {
        const now = performance.now();
        const deltaTime = now - metricsData.lastFrameTime;
        const fps = 1000 / deltaTime;

        metricsData.fpsHistory.push(fps);
        if (metricsData.fpsHistory.length > FPS_SAMPLE_SIZE) {
            metricsData.fpsHistory.shift();
        }

        // Calculate FPS stability (lower coefficient of variation = more stable)
        if (metricsData.fpsHistory.length >= 10) {
            const mean = metricsData.fpsHistory.reduce((a, b) => a + b) / metricsData.fpsHistory.length;
            const variance = metricsData.fpsHistory.reduce((acc, fps) => acc + Math.pow(fps - mean, 2), 0) / metricsData.fpsHistory.length;
            const stdDev = Math.sqrt(variance);

            metricsData.systemMetrics.averageFPS = Math.round(mean);
            metricsData.systemMetrics.fpsStability = mean > 0 ? (stdDev / mean) : 1; // Lower is better
        }

        metricsData.lastFrameTime = now;
    }, []);

    // Log pointing events
    const logPointingStart = useCallback((targetId) => {
        const timestamp = performance.now() - sessionStartTime;

        metricsData.currentSession.pointingStartTime = timestamp;
        metricsData.currentSession.lastTargetId = targetId;

        addEvent('POINTING_START', {
            targetId,
            timestamp
        });
    }, []);

    const logPointingEnd = useCallback((targetId, successful = false) => {
        const timestamp = performance.now() - sessionStartTime;
        const dwellTime = metricsData.currentSession.pointingStartTime
            ? timestamp - metricsData.currentSession.pointingStartTime
            : 0;

        if (dwellTime > DWELL_THRESHOLD) {
            metricsData.currentSession.dwellTimes.push(dwellTime);
        }

        addEvent('POINTING_END', {
            targetId,
            timestamp,
            dwellTime,
            successful
        });

        metricsData.currentSession.pointingStartTime = null;
    }, []);

    // Log pinch events
    const logPinchStart = useCallback((targetId = null) => {
        const timestamp = performance.now() - sessionStartTime;

        addEvent('PINCH_START', {
            targetId,
            timestamp
        });
    }, []);

    const logPinchEnd = useCallback((targetId = null, successful = false) => {
        const timestamp = performance.now() - sessionStartTime;

        addEvent('PINCH_END', {
            targetId,
            timestamp,
            successful
        });
    }, []);

    // Log toggle events
    const logToggleSuccess = useCallback((targetId, pinchStartTime = null) => {
        const timestamp = performance.now() - sessionStartTime;
        const latency = pinchStartTime ? timestamp - pinchStartTime : 0;

        metricsData.currentSession.successfulHits++;
        metricsData.currentSession.totalAttempts++;

        if (latency > 0) {
            metricsData.currentSession.latencies.push(latency);
        }

        addEvent('TOGGLE_SUCCESS', {
            targetId,
            timestamp,
            latency
        });
    }, []);

    const logMiss = useCallback((attemptedTargetId = null, actualDistance = null) => {
        const timestamp = performance.now() - sessionStartTime;

        metricsData.currentSession.misses++;
        metricsData.currentSession.totalAttempts++;

        // Classify as near miss if close enough
        const isNearMiss = actualDistance !== null && actualDistance <= MISS_DISTANCE_THRESHOLD;
        if (isNearMiss) {
            metricsData.currentSession.nearMisses++;
        }

        addEvent('MISS', {
            targetId: attemptedTargetId,
            timestamp,
            distance: actualDistance,
            nearMiss: isNearMiss
        });
    }, []);

    // Get current metrics summary
    const getMetricsSummary = useCallback(() => {
        const session = metricsData.currentSession;
        const system = metricsData.systemMetrics;

        const accuracy = session.totalAttempts > 0
            ? (session.successfulHits / session.totalAttempts) * 100
            : 0;

        const averageLatency = session.latencies.length > 0
            ? session.latencies.reduce((a, b) => a + b) / session.latencies.length
            : 0;

        const averageDwellTime = session.dwellTimes.length > 0
            ? session.dwellTimes.reduce((a, b) => a + b) / session.dwellTimes.length
            : 0;

        const missToHitRatio = session.successfulHits > 0
            ? session.misses / session.successfulHits
            : session.misses;

        return {
            // Accuracy metrics
            accuracy: Math.round(accuracy * 100) / 100,
            totalAttempts: session.totalAttempts,
            successfulHits: session.successfulHits,
            misses: session.misses,
            nearMisses: session.nearMisses,

            // Performance metrics
            averageLatency: Math.round(averageLatency * 100) / 100,
            averageDwellTime: Math.round(averageDwellTime * 100) / 100,
            missToHitRatio: Math.round(missToHitRatio * 100) / 100,

            // System metrics
            averageFPS: system.averageFPS,
            fpsStability: Math.round(system.fpsStability * 1000) / 1000,

            // Session info
            sessionDuration: Math.round((performance.now() - sessionStartTime) / 1000),
            totalEvents: metricsData.events.length
        };
    }, []);

    // Export to CSV
    const exportToCSV = useCallback(() => {
        const summary = getMetricsSummary();
        const csvData = buildCSVData(summary);

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.href = url;
        link.download = `gesture_metrics_${timestamp}.csv`;
        link.click();

        URL.revokeObjectURL(url);

        console.log('📊 Metrics exported to CSV:', summary);
    }, [getMetricsSummary]);

    // Reset metrics
    const resetMetrics = useCallback(() => {
        metricsData.events = [];
        metricsData.fpsHistory = [];
        metricsData.currentSession = {
            startTime: performance.now(),
            totalAttempts: 0,
            successfulHits: 0,
            misses: 0,
            nearMisses: 0,
            dwellTimes: [],
            latencies: [],
            pointingStartTime: null,
            lastTargetId: null
        };
        sessionStartTime = performance.now();

        console.log('🔄 Metrics reset');
    }, []);

    // Auto-track FPS
    useEffect(() => {
        let animationId;

        const trackFrame = () => {
            trackFPS();
            animationId = requestAnimationFrame(trackFrame);
        };

        trackFrame();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [trackFPS]);

    return {
        // Logging functions
        logPointingStart,
        logPointingEnd,
        logPinchStart,
        logPinchEnd,
        logToggleSuccess,
        logMiss,

        // Data access
        getMetricsSummary,
        exportToCSV,
        resetMetrics,

        // Real-time tracking
        trackFPS
    };
}

/* ---------- 4. Helper functions ---------- */
function addEvent(type, data) {
    const event = {
        id: generateId(),
        type,
        timestamp: data.timestamp,
        data
    };

    metricsData.events.push(event);

    // Keep memory usage reasonable
    if (metricsData.events.length > MAX_LOG_ENTRIES) {
        metricsData.events.shift();
    }

    console.log(`📊 ${type}:`, data);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function buildCSVData(summary) {
    const headers = [
        'Metric',
        'Value',
        'Unit',
        'Description'
    ];

    const rows = [
        headers.join(','),

        // Accuracy metrics
        `Accuracy,${summary.accuracy},%,Hit rate percentage`,
        `Total Attempts,${summary.totalAttempts},count,Number of interaction attempts`,
        `Successful Hits,${summary.successfulHits},count,Number of successful toggles`,
        `Misses,${summary.misses},count,Number of failed attempts`,
        `Near Misses,${summary.nearMisses},count,Misses within threshold distance`,
        `Miss-to-Hit Ratio,${summary.missToHitRatio},ratio,Misses divided by hits`,

        // Performance metrics
        `Average Latency,${summary.averageLatency},ms,Pinch to toggle response time`,
        `Average Dwell Time,${summary.averageDwellTime},ms,Time spent pointing at targets`,
        `Average FPS,${summary.averageFPS},fps,Frames per second`,
        `FPS Stability,${summary.fpsStability},coefficient,Lower = more stable (std/mean)`,

        // Session info
        `Session Duration,${summary.sessionDuration},seconds,Total session time`,
        `Total Events,${summary.totalEvents},count,Number of tracked events`,
        `Timestamp,${new Date().toISOString()},datetime,Export timestamp`
    ];

    // Add detailed events log
    rows.push('', '--- Event Log ---');
    rows.push('Event ID,Type,Timestamp,Target ID,Latency,Dwell Time,Distance,Success');

    metricsData.events.forEach(event => {
        const data = event.data;
        rows.push([
            event.id,
            event.type,
            event.timestamp.toFixed(2),
            data.targetId || '',
            data.latency?.toFixed(2) || '',
            data.dwellTime?.toFixed(2) || '',
            data.distance?.toFixed(3) || '',
            data.successful ? 'true' : 'false'
        ].join(','));
    });

    return rows.join('\n');
}

/* ---------- 5. Global access for console ---------- */
window.exportGestureMetrics = () => {
    const summary = metricsData;
    console.log('📊 Current metrics:', summary);
    // Trigger export would need the hook instance
};

window.resetGestureMetrics = () => {
    metricsData.events = [];
    metricsData.currentSession = {
        startTime: performance.now(),
        totalAttempts: 0,
        successfulHits: 0,
        misses: 0,
        nearMisses: 0,
        dwellTimes: [],
        latencies: [],
        pointingStartTime: null,
        lastTargetId: null
    };
    sessionStartTime = performance.now();
    console.log('🔄 Metrics reset from console');
};

export default useMetrics;
