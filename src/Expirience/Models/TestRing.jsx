import { forwardRef, memo } from 'react';
import { animated } from '@react-spring/three';
import { useGLTF, meshBounds } from '@react-three/drei';

const modelPath = './models/Ring2.glb';

export default forwardRef(function TestRingModel({ opacity }, ref) {
  const { nodes } = useGLTF(modelPath);

  return (
    <mesh ref={ref} geometry={nodes.object_1.geometry} scale={0.1} raycast={meshBounds}>
      <animated.meshNormalMaterial transparent opacity={opacity} />
    </mesh>
  );
});

useGLTF.preload('./models/Ring2.glb');