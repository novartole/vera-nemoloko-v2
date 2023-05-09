import { useScroll, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useRef, Children } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';

import '../shaders/text/pointsMaterial.js';
import '../shaders/text/simulationMaterial.js';
import usePointGeometryFromText from './utils/usePointsGeometryFromText.js';
import FBOPoints from './FBOPoints.jsx';

const alphaMapSource = './textures/1.png';

export default memo(function TextAsPoints({ 
  children,
  textProps,
  position: positionProp = [0, 0, 0],
  rotation: rotationProp = [0, 0, 0],
  scale: scaleProp = [1, 1, 1],
  count: countProp = 4 * 1024
}) {
  console.log('textAsProps');

  const scroll = useScroll();

  const textArray = Children.toArray(children).filter(child => typeof(child) === 'string');

  if (textArray.length === 0)
    throw new Error('Text must be provided as child');

  const text = String().concat(...textArray);

  const { position, rotation, scale, count } = useControls(
    `Text: ${text}`,
    {
      position: positionProp,
      rotation: rotationProp,
      scale: { value: Array.isArray(scaleProp) ? scaleProp : Array(3).fill(scaleProp), lock: true },
      count: countProp
    },
    [positionProp, rotationProp, scaleProp, countProp]  
  );

  const alphaMap = useTexture(alphaMapSource);

  const size = Math.ceil( Math.sqrt(count) );

  const pointsGeometry = usePointGeometryFromText(text, textProps, size * size);

  const simulationMaterial = useRef();
  const pointsMaterial = useRef();

  useFrame(
    ({ clock }) => {
      const range = scroll.range(0, 0.5 / (scroll.pages + 1));

      pointsMaterial.current.uniforms.uTime.value = clock.elapsedTime;
      pointsMaterial.current.uniforms.uOpacity.value = 1 - THREE.MathUtils.clamp(range, 0, 1);

      simulationMaterial.current.uniforms.uTime.value = clock.elapsedTime;
      simulationMaterial.current.uniforms.uScroll.value = range;
    }
  );

  return (
    <group position={ position } rotation={ rotation } scale={ scale }>
      <FBOPoints size={ size }>
        <textAsPointsSimulationMaterial ref={ simulationMaterial } args={ [size, pointsGeometry.getAttribute('position')] } />
        <textAsPointsMaterial ref={ pointsMaterial } args={ [alphaMap] } />
      </FBOPoints>
    </group>
  );
});

useTexture.preload(alphaMapSource);