// src/hooks/useRaycasting.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { findIntersectedBulb } from '../utils/raycastUtils'

export default function useRaycasting(camera, landmarks, bulbRefs) {
    const [hitInfo, setHitInfo] = useState(null)
    const [pointing, setPointing] = useState(false)
    const lastHitIdRef = useRef(null)

    // Get the index finger tip position (landmark 8)
    const getFingerTipPosition = useCallback(() => {
        if (!landmarks || !landmarks[8]) {
            return null
        }

        return {
            x: landmarks[8].x,
            y: landmarks[8].y,
            z: landmarks[8].z
        }
    }, [landmarks])

    // Perform raycasting and update hit information
    const performRaycast = useCallback(() => {
        const fingerTip = getFingerTipPosition()

        if (!camera || !fingerTip || !bulbRefs?.current) {
            setHitInfo(null)
            setPointing(false)
            lastHitIdRef.current = null
            return
        }

        // Get bulb meshes from refs
        const bulbMeshes = bulbRefs.current
            .filter(bulbRef => bulbRef && bulbRef.mesh)
            .map(bulbRef => bulbRef.mesh)

        if (bulbMeshes.length === 0) {
            setHitInfo(null)
            setPointing(false)
            lastHitIdRef.current = null
            return
        }

        // Perform intersection test
        const intersection = findIntersectedBulb(
            camera,
            fingerTip.x,
            fingerTip.y,
            bulbMeshes
        )

        if (intersection) {
            const newHitInfo = {
                bulbId: intersection.bulbId,
                object: intersection.object,
                point: intersection.point,
                distance: intersection.distance,
                fingerPosition: fingerTip
            }

            setHitInfo(newHitInfo)
            setPointing(true)

            // Log when hitting a new bulb
            if (lastHitIdRef.current !== intersection.bulbId) {
                console.log(`🎯 Pointing at Bulb ${intersection.bulbId}`)
                lastHitIdRef.current = intersection.bulbId
            }
        } else {
            setHitInfo(null)
            setPointing(false)

            // Log when no longer pointing at any bulb
            if (lastHitIdRef.current !== null) {
                console.log('👆 No longer pointing at any bulb')
                lastHitIdRef.current = null
            }
        }
    }, [camera, getFingerTipPosition, bulbRefs])

    // Perform raycasting whenever landmarks change
    useEffect(() => {
        performRaycast()
    }, [performRaycast])

    // Manual raycast function for external use
    const raycast = useCallback(() => {
        performRaycast()
    }, [performRaycast])

    return {
        hitInfo,           // Current hit information { bulbId, object, point, distance, fingerPosition }
        pointing,          // Boolean: whether currently pointing at a bulb
        fingerPosition: getFingerTipPosition(), // Current finger tip position
        raycast            // Manual raycast function
    }
}
