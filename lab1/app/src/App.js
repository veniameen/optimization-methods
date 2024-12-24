import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Stage, CameraShake, useAnimations } from '@react-three/drei'

useGLTF.preload('/robot.gltf')
function Model(props) {
  const { scene, animations } = useGLTF('/robot-draco.glb')
  const { actions } = useAnimations(animations, scene)
  useEffect(() => {
    actions.Idle.play()
    scene.traverse((obj) => obj.isMesh && (obj.receiveShadow = obj.castShadow = true))
  }, [actions, scene])
  return <primitive object={scene} {...props} />
}

export default function Viewer() {
  return (
    <Canvas shadows camera={{ fov: 50 }}>
      <Suspense fallback={null}>
        <Stage contactShadow={{ opacity: 1, blur: 2 }}>
          <Model />
        </Stage>
      </Suspense>
      <OrbitControls makeDefault />
      <CameraShake maxYaw={0.1} maxPitch={0.1} maxRoll={0.1} yawFrequency={0.1} pitchFrequency={0.1} rollFrequency={0.1} intensity={1} decayRate={0.65} />
    </Canvas>
  )
}
