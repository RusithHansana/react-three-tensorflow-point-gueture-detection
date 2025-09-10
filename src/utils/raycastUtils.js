// src/utils/raycastUtils.js
import * as THREE from 'three'

/**
 * Convert screen coordinates to a ray in 3D space
 * @param {THREE.Camera} camera - The Three.js camera
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} y - Normalized y coordinate (0-1)
 * @returns {THREE.Raycaster} - The raycaster object
 */
export function screenToRay(camera, x, y) {
    // Convert normalized coordinates (0-1) to NDC (-1 to 1)
    const mouse = new THREE.Vector2(
        x * 2 - 1,     // Convert 0-1 to -1 to 1
        -y * 2 + 1     // Convert 0-1 to 1 to -1 (flip Y axis)
    )

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    return raycaster
}

/**
 * Get intersected objects from a ray
 * @param {THREE.Raycaster} raycaster - The raycaster
 * @param {Array} objects - Array of Three.js objects to test intersection
 * @param {boolean} recursive - Whether to check children recursively
 * @returns {Array} - Array of intersection results
 */
export function getIntersections(raycaster, objects, recursive = true) {
    return raycaster.intersectObjects(objects, recursive)
}

/**
 * Find the closest bulb that the ray intersects
 * @param {THREE.Camera} camera - The Three.js camera
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} y - Normalized y coordinate (0-1)
 * @param {Array} bulbMeshes - Array of bulb mesh objects
 * @returns {Object|null} - The intersection result or null
 */
export function findIntersectedBulb(camera, x, y, bulbMeshes) {
    if (!camera || !bulbMeshes || bulbMeshes.length === 0) {
        return null
    }

    // Filter out null/undefined meshes
    const validMeshes = bulbMeshes.filter(mesh => mesh && mesh.geometry)

    if (validMeshes.length === 0) {
        return null
    }

    const raycaster = screenToRay(camera, x, y)
    const intersections = getIntersections(raycaster, validMeshes, false)

    if (intersections.length > 0) {
        // Return the closest intersection
        const closest = intersections[0]
        return {
            object: closest.object,
            point: closest.point,
            distance: closest.distance,
            bulbId: closest.object.userData?.id || null
        }
    }

    return null
}

/**
 * Create a visual ray line for debugging
 * @param {THREE.Vector3} origin - Ray origin point
 * @param {THREE.Vector3} direction - Ray direction (normalized)
 * @param {number} length - Length of the ray line
 * @param {number} color - Color of the line (default: red)
 * @param {string} type - 'line' or 'cylinder' for different visualizations
 * @returns {THREE.Object3D} - The ray object (line or cylinder)
 */
export function createRayLine(origin, direction, length = 10, color = 0xff0000, type = 'cylinder') {
    if (type === 'cylinder') {
        return createRayCylinder(origin, direction, length, color)
    } else {
        return createRayLineBasic(origin, direction, length, color)
    }
}

/**
 * Create a basic line ray (original implementation)
 */
function createRayLineBasic(origin, direction, length, color) {
    const geometry = new THREE.BufferGeometry()
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(length))

    const points = [origin, endPoint]
    geometry.setFromPoints(points)

    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 3,
        transparent: true,
        opacity: 0.8
    })
    const line = new THREE.Line(geometry, material)

    return line
}

/**
 * Create a cylindrical ray with gradient effect
 */
function createRayCylinder(origin, direction, length, color) {
    const group = new THREE.Group()

    // Main cylinder ray
    const rayGeometry = new THREE.CylinderGeometry(0.003, 0.001, length, 8)
    const rayMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.3
    })

    const rayCylinder = new THREE.Mesh(rayGeometry, rayMaterial)

    // Position and orient the cylinder
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(length))
    const midPoint = origin.clone().add(endPoint).multiplyScalar(0.5)

    rayCylinder.position.copy(midPoint)
    rayCylinder.lookAt(endPoint)
    rayCylinder.rotateX(Math.PI / 2) // Correct orientation for cylinder

    group.add(rayCylinder)

    // Add glow effect (outer cylinder)
    const glowGeometry = new THREE.CylinderGeometry(0.006, 0.002, length, 8)
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.1
    })

    const glowCylinder = new THREE.Mesh(glowGeometry, glowMaterial)
    glowCylinder.position.copy(midPoint)
    glowCylinder.lookAt(endPoint)
    glowCylinder.rotateX(Math.PI / 2)

    group.add(glowCylinder)

    // Store references for updates
    group.userData.rayCylinder = rayCylinder
    group.userData.glowCylinder = glowCylinder
    group.userData.rayMaterial = rayMaterial
    group.userData.glowMaterial = glowMaterial

    return group
}

/**
 * Create an intersection dot at a specific point
 * @param {THREE.Vector3} position - Position to place the dot (optional, defaults to origin)
 * @param {number} color - Color of the dot
 * @param {number} size - Size of the dot
 * @returns {THREE.Mesh} - The intersection dot mesh
 */
export function createIntersectionDot(position = null, color = 0xff0000, size = 0.02) {
    const geometry = new THREE.SphereGeometry(size, 16, 16)
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.5
    })

    const dot = new THREE.Mesh(geometry, material)

    // Set position if provided, otherwise default to origin
    if (position) {
        dot.position.copy(position)
    } else {
        dot.position.set(0, 0, 0)
    }

    return dot
}/**
 * Update an existing ray line with new origin and direction
 * @param {THREE.Object3D} rayObject - The existing ray object (line or group)
 * @param {THREE.Vector3} origin - New ray origin
 * @param {THREE.Vector3} direction - New ray direction
 * @param {number} length - Length of the ray line
 * @param {number} color - Optional color update
 */
export function updateRayLine(rayObject, origin, direction, length = 10, color = null) {
    if (!rayObject) return

    if (rayObject.type === 'Line') {
        // Update basic line ray
        updateBasicRayLine(rayObject, origin, direction, length)
    } else if (rayObject.type === 'Group') {
        // Update cylinder ray
        updateCylinderRay(rayObject, origin, direction, length, color)
    }
}

/**
 * Update basic line ray
 */
function updateBasicRayLine(rayLine, origin, direction, length) {
    if (!rayLine.geometry) return

    const endPoint = origin.clone().add(direction.clone().multiplyScalar(length))
    const points = [origin, endPoint]

    rayLine.geometry.setFromPoints(points)
    rayLine.geometry.attributes.position.needsUpdate = true
}

/**
 * Update cylinder ray group
 */
function updateCylinderRay(group, origin, direction, length, color = null) {
    const rayCylinder = group.userData.rayCylinder
    const glowCylinder = group.userData.glowCylinder

    if (!rayCylinder || !glowCylinder) return

    // Calculate new position and orientation
    const endPoint = origin.clone().add(direction.clone().multiplyScalar(length))
    const midPoint = origin.clone().add(endPoint).multiplyScalar(0.5)

    // Update both cylinders
    const cylinders = [rayCylinder, glowCylinder]
    cylinders.forEach(cylinder => {
        cylinder.position.copy(midPoint)
        cylinder.lookAt(endPoint)
        cylinder.rotateX(Math.PI / 2)

        // Update scale if length changed
        const currentLength = cylinder.geometry.parameters.height
        if (Math.abs(currentLength - length) > 0.001) {
            cylinder.scale.y = length / currentLength
        }
    })

    // Update color if provided
    if (color !== null) {
        const colorObj = new THREE.Color(color)
        group.userData.rayMaterial.color.copy(colorObj)
        group.userData.rayMaterial.emissive.copy(colorObj)
        group.userData.glowMaterial.color.copy(colorObj)
        group.userData.glowMaterial.emissive.copy(colorObj)
    }
}

/**
 * Find any intersection point in the scene (walls, floor, objects)
 * @param {THREE.Camera} camera - The Three.js camera
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} y - Normalized y coordinate (0-1)
 * @param {Array} sceneObjects - Array of all scene objects to test
 * @returns {Object|null} - The intersection result or null
 */
export function findSceneIntersection(camera, x, y, sceneObjects) {
    if (!camera || !sceneObjects || sceneObjects.length === 0) {
        return null
    }

    const raycaster = screenToRay(camera, x, y)
    const intersections = getIntersections(raycaster, sceneObjects, true)

    if (intersections.length > 0) {
        const closest = intersections[0]
        return {
            point: closest.point,
            object: closest.object,
            distance: closest.distance,
            normal: closest.face?.normal || new THREE.Vector3(0, 1, 0)
        }
    }

    return null
}

/**
 * Update intersection dot position and visibility
 * @param {THREE.Mesh} dot - The intersection dot mesh
 * @param {THREE.Vector3} position - New position for the dot
 * @param {number} color - Optional color update
 * @param {boolean} visible - Whether the dot should be visible
 */
export function updateIntersectionDot(dot, position, color = null, visible = true) {
    if (!dot || !dot.material) return

    if (position) {
        dot.position.copy(position)
    }

    if (color !== null && dot.material.color && dot.material.emissive) {
        const colorObj = new THREE.Color(color)
        dot.material.color.copy(colorObj)
        dot.material.emissive.copy(colorObj)
    }

    dot.visible = visible
}

/**
 * Calculate the pointing accuracy (how close the ray is to the target)
 * @param {THREE.Vector3} rayPoint - Point on the ray closest to target
 * @param {THREE.Vector3} targetPoint - Target center point
 * @param {number} targetRadius - Target radius for hit detection
 * @returns {Object} - Accuracy info { distance, isHit, accuracy }
 */
export function calculatePointingAccuracy(rayPoint, targetPoint, targetRadius = 0.2) {
    const distance = rayPoint.distanceTo(targetPoint)
    const isHit = distance <= targetRadius
    const accuracy = Math.max(0, (targetRadius - distance) / targetRadius)

    return {
        distance,
        isHit,
        accuracy: Math.min(1, Math.max(0, accuracy)) // Clamp to 0-1
    }
}
