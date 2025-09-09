import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, forwardRef, useImperativeHandle, useState } from 'react'

// Preload audio outside component to avoid re-creation
let clickAudio = null
try {
    clickAudio = new Audio('/sounds/click.wav')
    clickAudio.volume = 0.7
    clickAudio.preload = 'auto'
} catch (error) {
    console.warn('Could not preload audio:', error)
}

const Bulb = forwardRef(({ id, position, onToggle }, ref) => {
    const [on, setOn] = useState(false)
    const meshRef = useRef()

    const playClickSound = async () => {
        try {
            if (clickAudio) {
                clickAudio.currentTime = 0
                await clickAudio.play()
            }
        } catch (error) {
            console.warn('Could not play sound:', error)
            // Fallback: create new audio instance
            try {
                const audio = new Audio('/sounds/click.wav')
                audio.volume = 0.7
                await audio.play()
            } catch (fallbackError) {
                console.warn('Fallback audio also failed:', fallbackError)
            }
        }
    }

    useImperativeHandle(ref, () => ({
        toggle: () => {
            setOn(prevOn => {
                const newOn = !prevOn
                playClickSound()
                return newOn
            })
        },
        id,
        mesh: meshRef.current
    }))

    return (
        <mesh
            ref={meshRef}
            position={position}
            userData={{ id }}
            onClick={() => {
                setOn(prev => {
                    const newOn = !prev
                    playClickSound()
                    onToggle?.(id)
                    return newOn
                })
            }}
        >
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial
                color={on ? '#ffeb3b' : '#ffffff'}
                emissive={on ? '#ffeb3b' : '#000000'}
                emissiveIntensity={on ? 0.8 : 0}
                roughness={0.1}
                metalness={0.1}
            />
        </mesh>
    )
})

Bulb.displayName = 'Bulb'

export default function LightsScene({ bulbRefs, onCameraReady }) {
    const handleBulbToggle = (bulbId) => {
        console.log(`Bulb ${bulbId} toggled`)
    }

    return (
        <Canvas
            camera={{ position: [0, 1.6, 3], fov: 60 }}
            style={{ width: '100vw', height: '100vh' }}
            onCreated={({ camera }) => {
                if (onCameraReady) {
                    onCameraReady(camera)
                }
            }}
        >
            {/* Ambient lighting for overall scene illumination */}
            <ambientLight intensity={0.4} />

            {/* Main directional light */}
            <directionalLight
                position={[5, 10, 5]}
                intensity={0.8}
                castShadow
            />

            {/* Point light for additional brightness */}
            <pointLight position={[10, 10, 10]} intensity={0.5} />

            {/* Orbit controls - disable pan and zoom for better UX */}
            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.2}
            />

            {/* Three light bulbs positioned horizontally */}
            {[[-1.5, 1, 0], [0, 1, 0], [1.5, 1, 0]].map((position, index) => (
                <Bulb
                    key={index}
                    id={index + 1}
                    position={position}
                    ref={(el) => {
                        if (bulbRefs && bulbRefs.current) {
                            bulbRefs.current[index] = el
                        }
                    }}
                    onToggle={handleBulbToggle}
                />
            ))}

            {/* Ground plane */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                receiveShadow
            >
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial
                    color="#2a2a2a"
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Back wall for better depth perception */}
            <mesh position={[0, 2, -2]}>
                <planeGeometry args={[8, 4]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </Canvas>
    )
}
