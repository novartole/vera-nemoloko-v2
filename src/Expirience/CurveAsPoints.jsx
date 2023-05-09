import { memo, useMemo, useRef } from 'react';
import { useScroll, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import '../shaders/curve/pointsMaterial.js';
import '../shaders/curve/simulationMaterial.js';
import FBOPoints from './FBOPoints.jsx';

const alphaMapSource = './textures/1.png';

export default memo(function CurveAsPoints({ 
  points,
  showPoints = false,
  size = 64, 
  position = [0, 0, 0],
}) {
  const scroll = useScroll();

  const alphaMap = useTexture(alphaMapSource);

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(
      points.map( point => new THREE.Vector3().fromArray(point) ),
      false,
      'centripetal'
    ),
    [ points ]
  );

  useFrame(
    ({ gl, clock }) => {
      const range = scroll.range(0, 0.5 / (scroll.pages + 1));

      pointsMaterial.current.uniforms.uTime.value = clock.elapsedTime;
      pointsMaterial.current.uniforms.uOpacity.value = 1 - THREE.MathUtils.clamp(range, 0, 1);

      simulationMaterial.current.uniforms.uTime.value = clock.elapsedTime;
      simulationMaterial.current.uniforms.uScroll.value = range;
    }
  );

  const simulationMaterial = useRef();
  const pointsMaterial = useRef();

  return (
    <group position={ position }>
      <FBOPoints size={ size }>
        <curvePointsMaterial ref={ pointsMaterial } args={ [ alphaMap ] } />
        <curveSimulationMaterial ref={ simulationMaterial } args={ [size, curve] } />
      </FBOPoints>
      {
        showPoints ? points.map(
          (position, index) => (
            <mesh key={index} scale={ 0.2 } position={ position }>
              <meshStandardMaterial color="red" />
              <sphereGeometry />
            </mesh>
          )
        ) : null
      }
    </group>
  );
});

useTexture.preload(alphaMapSource);