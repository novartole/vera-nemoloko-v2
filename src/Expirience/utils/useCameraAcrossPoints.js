import { useScroll } from '@react-three/drei';
import { useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function useCameraAcrossPoints(camera, points, needsUpdateMatrixWorld = true) {
  const scroll = useScroll();

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points, false, 'centripetal'),
    [ points ]
  );

  const [ pointOnCurve ] = useState( () => new THREE.Vector3() );

  useEffect(
    () => { 
      if (camera.position.equals(points[0]) === false)
        camera.position.set(points[0]);
    },
    []
  );

  useFrame(
    state => {
      pointOnCurve.copy(
        
        curve.getPoint( THREE.MathUtils.clamp(scroll.offset, 0, 1) )
        
      );
      state.camera.position.copy(pointOnCurve);
      state.camera.lookAt(0, pointOnCurve.y, 0);

      if (needsUpdateMatrixWorld)
        state.camera.updateMatrixWorld();
   }
  );
};