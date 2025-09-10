// src/components/RayVisualizer.jsx - Enhanced Version
import { useRef, useEffect, useMemo } from 'react'
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
    color = 0x00ffff,
    length = 15
}) {
    const rayLineRef = useRef(null)
    const intersectionDotRef = useRef(null)
    const glowLineRef = useRef(null)
    const particleTrailRef = useRef(null)
    const rippleEffectRef = useRef(null)
    const groupRef = useRef(null)
    const { camera, scene } = useThree()

    // Animation state
    const animationState = useRef({
        rayOpacity: 0,
        targetOpacity: 0,
        pulsePhase: 0,
        particleTime: 0
    })

    // Create particle geometry for trail effect
    const particleGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry()
        const particleCount = 25
        const positions = new Float32Array(particleCount * 3)
        const opacities = new Float32Array(particleCount)
        const sizes = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0
            positions[i * 3 + 1] = 0
            positions[i * 3 + 2] = 0
            opacities[i] = 0
            // Much smaller particles with less variation
            sizes[i] = Math.random() * 0.006 + 0.004 // Size between 0.004 and 0.01
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

        return geometry
    }, [])

    // Create ripple effect geometry
    const rippleGeometry = useMemo(() => {
        return new THREE.RingGeometry(0.1, 0.3, 16)
    }, [])

    // Get all meshes in the scene for intersection testing
    const getSceneObjects = () => {
        const objects = []
        scene.traverse((child) => {
            if (child.isMesh && child.visible &&
                child !== rayLineRef.current &&
                child !== intersectionDotRef.current &&
                child !== glowLineRef.current &&
                child !== particleTrailRef.current &&
                child !== rippleEffectRef.current) {
                objects.push(child)
            }
        })
        return objects
    }

    // Create enhanced ray components
    useEffect(() => {
        const group = groupRef.current
        if (!group) return

        // Main ray line (core beam)
        const origin = new THREE.Vector3(0, 0, 0)
        const direction = new THREE.Vector3(0, 0, -1)
        const rayLine = createRayLine(origin, direction, length, color, 'cylinder')
        rayLine.visible = false
        rayLineRef.current = rayLine
        group.add(rayLine)

        // Glow effect line (wider, more transparent)
        const glowLine = createRayLine(origin, direction, length, color, 'cylinder')
        if (glowLine.userData.rayCylinder) {
            glowLine.userData.rayCylinder.scale.set(2, 1, 2) // Make it wider
            glowLine.userData.rayMaterial.opacity = 0.3
            glowLine.userData.rayMaterial.transparent = true
        }
        glowLine.visible = false
        glowLineRef.current = glowLine
        group.add(glowLine)

        // Particle trail effect with small round particles
        const particleMaterial = new THREE.PointsMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            size: 0.008, // Small base size
            sizeAttenuation: true,
            vertexColors: false,
            blending: THREE.AdditiveBlending,
            alphaTest: 0.1, // Makes particles more round by culling transparent edges
            depthWrite: false // Better blending
        })
        const particles = new THREE.Points(particleGeometry, particleMaterial)
        particles.visible = false
        particleTrailRef.current = particles
        group.add(particles)

        // Enhanced intersection dot with pulsing effect
        const intersectionDot = createIntersectionDot(null, 0xff4444)
        intersectionDot.visible = false
        intersectionDotRef.current = intersectionDot
        group.add(intersectionDot)

        // Ripple effect at intersection point
        const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        })
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial)
        ripple.visible = false
        rippleEffectRef.current = ripple
        group.add(ripple)

        return () => {
            if (group) {
                [rayLine, glowLine, particles, intersectionDot, ripple].forEach(obj => {
                    if (obj) {
                        group.remove(obj)
                        obj.geometry?.dispose()
                        if (obj.material) {
                            if (Array.isArray(obj.material)) {
                                obj.material.forEach(mat => mat.dispose())
                            } else {
                                obj.material.dispose()
                            }
                        }
                    }
                })
            }
        }
    }, [color, length, particleGeometry, rippleGeometry])

    // Enhanced animation loop
    useFrame((state, delta) => {
        if (!rayLineRef.current || !camera || !fingerPosition) {
            // Fade out when not active
            if (animationState.current.rayOpacity > 0) {
                animationState.current.rayOpacity -= delta * 3
                animationState.current.rayOpacity = Math.max(0, animationState.current.rayOpacity)

                // Update visibility based on fade
                const shouldShow = animationState.current.rayOpacity > 0.01
                if (rayLineRef.current) rayLineRef.current.visible = shouldShow
                if (glowLineRef.current) glowLineRef.current.visible = shouldShow
                if (particleTrailRef.current) particleTrailRef.current.visible = shouldShow
            }

            if (intersectionDotRef.current) intersectionDotRef.current.visible = false
            if (rippleEffectRef.current) rippleEffectRef.current.visible = false
            return
        }

        try {
            // Smooth fade in
            animationState.current.targetOpacity = visible ? 1 : 0
            animationState.current.rayOpacity += (animationState.current.targetOpacity - animationState.current.rayOpacity) * delta * 8

            // Update pulse phase for effects
            animationState.current.pulsePhase += delta * 4
            animationState.current.particleTime += delta

            // Convert screen coordinates to world ray
            const mouse = new THREE.Vector2(
                -(fingerPosition.x * 2 - 1),
                -fingerPosition.y * 2 + 1
            )

            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, camera)

            // Find intersection with scene objects
            const sceneObjects = getSceneObjects()
            const correctedX = 1 - fingerPosition.x
            const intersection = findSceneIntersection(camera, correctedX, fingerPosition.y, sceneObjects)

            const rayOpacity = animationState.current.rayOpacity
            const pulseFactor = 0.8 + 0.2 * Math.sin(animationState.current.pulsePhase)

            if (intersection) {
                const actualLength = raycaster.ray.origin.distanceTo(intersection.point)

                // Update main ray
                updateRayLine(rayLineRef.current, raycaster.ray.origin, raycaster.ray.direction, actualLength)
                updateRayLine(glowLineRef.current, raycaster.ray.origin, raycaster.ray.direction, actualLength)

                // Update ray materials with pulsing effect
                if (rayLineRef.current?.userData?.rayMaterial) {
                    rayLineRef.current.userData.rayMaterial.opacity = rayOpacity * pulseFactor
                }
                if (glowLineRef.current?.userData?.rayMaterial) {
                    glowLineRef.current.userData.rayMaterial.opacity = rayOpacity * 0.4 * pulseFactor
                }

                // Show intersection effects
                updateIntersectionDot(intersectionDotRef.current, intersection.point, 0xff4444, true)

                // Enhanced dot pulsing
                if (intersectionDotRef.current) {
                    const dotScale = 1 + 0.3 * Math.sin(animationState.current.pulsePhase * 2)
                    intersectionDotRef.current.scale.setScalar(dotScale)
                    intersectionDotRef.current.material.emissiveIntensity = 0.8 + 0.4 * Math.sin(animationState.current.pulsePhase * 3)
                }

                // Ripple effect at intersection
                if (rippleEffectRef.current) {
                    rippleEffectRef.current.position.copy(intersection.point)
                    rippleEffectRef.current.lookAt(intersection.point.clone().add(intersection.normal || new THREE.Vector3(0, 1, 0)))

                    const ripplePhase = (animationState.current.pulsePhase * 2) % (Math.PI * 2)
                    const rippleScale = 1 + Math.sin(ripplePhase) * 0.5
                    const rippleOpacity = Math.max(0, 0.6 * (1 - Math.sin(ripplePhase) * 0.5))

                    rippleEffectRef.current.scale.setScalar(rippleScale)
                    rippleEffectRef.current.material.opacity = rippleOpacity * rayOpacity
                    rippleEffectRef.current.visible = rayOpacity > 0.01
                }

                // Update particle trail along the ray
                if (particleTrailRef.current) {
                    const positions = particleTrailRef.current.geometry.attributes.position.array
                    const opacities = particleTrailRef.current.geometry.attributes.opacity.array

                    for (let i = 0; i < positions.length / 3; i++) {
                        const t = (i / (positions.length / 3 - 1)) * actualLength
                        const pos = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(t))

                        // Add minimal, subtle randomness to particles for organic feel
                        const offset = Math.sin(animationState.current.particleTime * 1.5 + i * 0.5) * 0.008
                        pos.x += offset
                        pos.y += Math.cos(animationState.current.particleTime * 1.5 + i * 0.7) * 0.008

                        positions[i * 3] = pos.x
                        positions[i * 3 + 1] = pos.y
                        positions[i * 3 + 2] = pos.z

                        // Smooth falloff along the ray
                        const falloff = 1 - Math.pow(i / (positions.length / 3), 1.5)
                        opacities[i] = rayOpacity * falloff * 0.9
                    }

                    particleTrailRef.current.geometry.attributes.position.needsUpdate = true
                    particleTrailRef.current.geometry.attributes.opacity.needsUpdate = true
                    particleTrailRef.current.material.opacity = rayOpacity * 0.8
                    particleTrailRef.current.visible = rayOpacity > 0.01
                }

            } else {
                // No intersection - show full ray
                updateRayLine(rayLineRef.current, raycaster.ray.origin, raycaster.ray.direction, length)
                updateRayLine(glowLineRef.current, raycaster.ray.origin, raycaster.ray.direction, length)

                // Update materials
                if (rayLineRef.current?.userData?.rayMaterial) {
                    rayLineRef.current.userData.rayMaterial.opacity = rayOpacity * pulseFactor
                }
                if (glowLineRef.current?.userData?.rayMaterial) {
                    glowLineRef.current.userData.rayMaterial.opacity = rayOpacity * 0.3 * pulseFactor
                }

                // Hide intersection effects
                updateIntersectionDot(intersectionDotRef.current, null, null, false)
                if (rippleEffectRef.current) rippleEffectRef.current.visible = false
                if (particleTrailRef.current) particleTrailRef.current.visible = false
            }

            // Show ray components if opacity is sufficient
            const shouldShow = rayOpacity > 0.01
            rayLineRef.current.visible = shouldShow
            glowLineRef.current.visible = shouldShow

        } catch (error) {
            console.warn('Enhanced RayVisualizer update error:', error)
            if (rayLineRef.current) rayLineRef.current.visible = false
            if (glowLineRef.current) glowLineRef.current.visible = false
            if (intersectionDotRef.current) intersectionDotRef.current.visible = false
            if (particleTrailRef.current) particleTrailRef.current.visible = false
            if (rippleEffectRef.current) rippleEffectRef.current.visible = false
        }
    })

    return <group ref={groupRef} />
}
