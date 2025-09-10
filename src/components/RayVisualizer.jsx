// src/components/RayVisualizer.jsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
    createRayLine,
    updateRayLine,
    createIntersectionDot,
    updateIntersectionDot,
    findSceneIntersection
} from '../utils/raycastUtils'

export default function RayVisualizer({
    fingerPosition,
    visible = true,
    color = 0x00ffff, // Cyan for better visibility
    length = 15
}) {
    const rayLineRef = useRef(null)
    const intersectionDotRef = useRef(null)
    const groupRef = useRef(null)
    const { camera, scene } = useThree()

    // Get all meshes in the scene for intersection testing
    const getSceneObjects = () => {
        const objects = []
        scene.traverse((child) => {
            if (child.isMesh && child.visible && child !== rayLineRef.current && child !== intersectionDotRef.current) {
                objects.push(child)
            }
        })
        return objects
    }

    // Create the ray line and intersection dot on mount
    useEffect(() => {
        const group = groupRef.current
        if (!group) return

        // Create cylindrical ray line for better visibility
        const origin = new THREE.Vector3(0, 0, 0)
        const direction = new THREE.Vector3(0, 0, -1)
        const rayLine = createRayLine(origin, direction, length, color, 'cylinder')

        // The cylindrical ray is a group with materials in userData
        // No need to modify materials here as they're already styled in createRayLine
        rayLine.material = rayLine.userData.rayMaterial // For compatibility
        rayLine.visible = visible && !!fingerPosition

        rayLineRef.current = rayLine
        group.add(rayLine)

        // Create intersection dot
        const intersectionDot = createIntersectionDot(null, 0xff4444) // Pass color in constructor
        intersectionDot.visible = false

        intersectionDotRef.current = intersectionDot
        group.add(intersectionDot)

        return () => {
            if (group) {
                if (rayLine) {
                    group.remove(rayLine)
                    rayLine.geometry?.dispose()
                    rayLine.material?.dispose()
                }
                if (intersectionDot) {
                    group.remove(intersectionDot)
                    intersectionDot.geometry?.dispose()
                    intersectionDot.material?.dispose()
                }
            }
        }
    }, [color, length, visible, fingerPosition])

    // Update ray line and intersection dot every frame
    useFrame(() => {
        if (!rayLineRef.current || !intersectionDotRef.current || !camera || !fingerPosition) {
            if (rayLineRef.current) rayLineRef.current.visible = false
            if (intersectionDotRef.current) intersectionDotRef.current.visible = false
            return
        }

        try {
            // Convert screen coordinates to world ray
            const mouse = new THREE.Vector2(
                fingerPosition.x * 2 - 1,
                -fingerPosition.y * 2 + 1
            )

            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, camera)

            // Find intersection with scene objects
            const sceneObjects = getSceneObjects()
            const intersection = findSceneIntersection(camera, fingerPosition.x, fingerPosition.y, sceneObjects)

            if (intersection) {
                // Show intersection dot at hit point
                updateIntersectionDot(intersectionDotRef.current, intersection.point, 0xff4444, true)

                // Adjust ray length to stop at intersection point
                const actualLength = raycaster.ray.origin.distanceTo(intersection.point)
                updateRayLine(
                    rayLineRef.current,
                    raycaster.ray.origin,
                    raycaster.ray.direction,
                    actualLength
                )
            } else {
                // No intersection - hide dot and show full ray
                updateIntersectionDot(intersectionDotRef.current, null, null, false)
                updateRayLine(
                    rayLineRef.current,
                    raycaster.ray.origin,
                    raycaster.ray.direction,
                    length
                )
            }

            rayLineRef.current.visible = visible

        } catch (error) {
            console.warn('RayVisualizer update error:', error)
            if (rayLineRef.current) rayLineRef.current.visible = false
            if (intersectionDotRef.current) intersectionDotRef.current.visible = false
        }
    })

    return <group ref={groupRef} />
}
