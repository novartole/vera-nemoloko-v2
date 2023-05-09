import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { Loader } from '@react-three/drei';

import Scene from './Scene.jsx';

/**
 * TODO:
 * - mini-scene in SCROLL mode -> models flowing in PRES mode (as they do now)
 * - apply material partially: stone + grass
 */


export default function App() {
  console.log('app');

  return <>
    <Leva collapsed />
    <Canvas camera={ { fov: 50, position: [0, 0, 15] } }>
      <Scene />    
    </Canvas>
    <Loader />
  </>
};