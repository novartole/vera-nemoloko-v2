import { useControls } from 'leva';
import { useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export default function Particles({ length }) {
  console.log('particles');

  const { scaleYOffset, diameter , ...props } = useControls(
    'Particles',
    {
      scaleYOffset: { value: 2, min: 0, max: 4 },
      diameter: { value: 45, min: 1 },
      
      color: '#ffffff',
      speed: { value: 0.25, min: 0, max: 1 },
      size: { value: 15, min: 1, max: 50 }
    }
  );

  const { height } = useThree(state => state.viewport);

  const scale = new THREE.Vector3(diameter, height * (length + scaleYOffset), diameter);

  const ref = useRef();

  return <>
    <group position={ [0, - scale.y / 2 + height, 0] }>
      <Sparkles count={ 200 } scale={ scale } { ...props } />
    </group>
  </>;
  };