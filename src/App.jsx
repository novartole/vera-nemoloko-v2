import { Canvas } from '@react-three/fiber';

import Expirience from './Expirience/Expirience.jsx';

export default function App() {
  return <>
    <Canvas
      camera={{
        fov: 45,
        position: [1, 1, 7]
      }}
    >
      <Expirience />
    </Canvas>
  </>
}