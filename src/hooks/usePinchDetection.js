import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook for detecting pinch gestures from hand landmarks
 * @param {Array} landmarks - Hand landmarks from MediaPipe
 * @returns {Object} - { isPinching, pinchStrength, onPinch }
 */
export default function usePinchDetection(landmarks) {
    const [isPinching, setIsPinching] = useState(false)
    const [pinchStrength, setPinchStrength] = useState(0)
    const lastPinchStateRef = useRef(false)
    const pinchCallbackRef = useRef(null)

    // Register callback for pinch events
    const onPinch = useCallback((callback) => {
        pinchCallbackRef.current = callback
    }, [])

    // Calculate distance between thumb tip and index finger tip
    const calculatePinchDistance = useCallback(() => {
        if (!landmarks || landmarks.length < 21) {
            return null
        }

        const thumbTip = landmarks[4]  // Thumb tip
        const indexTip = landmarks[8]  // Index finger tip

        if (!thumbTip || !indexTip) {
            return null
        }

        // Calculate 3D distance
        const dx = thumbTip.x - indexTip.x
        const dy = thumbTip.y - indexTip.y
        const dz = thumbTip.z - indexTip.z

        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }, [landmarks])

    // Calculate pinch strength and detect pinch state
    const calculatePinchStrength = useCallback(() => {
        const distance = calculatePinchDistance()

        if (distance === null) {
            setPinchStrength(0)
            setIsPinching(false)
            return 0
        }

        // Normalize distance to strength (0-1)
        // Typical pinch distance ranges from ~0.02 (touching) to ~0.15 (spread)
        const minDistance = 0.02  // Fully pinched
        const maxDistance = 0.08  // Relaxed/open

        const normalizedDistance = Math.max(0, Math.min(1, (distance - minDistance) / (maxDistance - minDistance)))
        const strength = 1 - normalizedDistance // Invert so 1 = pinched, 0 = open

        setPinchStrength(strength)

        // Hysteresis for pinch detection to avoid flickering
        const pinchThreshold = 0.7   // Threshold to start pinching
        const releaseThreshold = 0.5 // Threshold to stop pinching

        const currentlyPinching = lastPinchStateRef.current
        let newPinchState = currentlyPinching

        if (!currentlyPinching && strength > pinchThreshold) {
            newPinchState = true
            console.log('🤏 Pinch started! Strength:', strength.toFixed(2))

            // Trigger pinch callback
            if (pinchCallbackRef.current) {
                pinchCallbackRef.current({
                    type: 'pinch_start',
                    strength,
                    distance,
                    thumbTip: landmarks[4],
                    indexTip: landmarks[8]
                })
            }
        } else if (currentlyPinching && strength < releaseThreshold) {
            newPinchState = false
            console.log('✋ Pinch released! Strength:', strength.toFixed(2))

            // Trigger release callback
            if (pinchCallbackRef.current) {
                pinchCallbackRef.current({
                    type: 'pinch_end',
                    strength,
                    distance,
                    thumbTip: landmarks[4],
                    indexTip: landmarks[8]
                })
            }
        }

        lastPinchStateRef.current = newPinchState
        setIsPinching(newPinchState)

        return strength
    }, [calculatePinchDistance, landmarks])

    // Update pinch state whenever landmarks change
    useEffect(() => {
        calculatePinchStrength()
    }, [calculatePinchStrength])

    return {
        isPinching,
        pinchStrength,
        onPinch,
        calculatePinchDistance,
        calculatePinchStrength
    }
}
