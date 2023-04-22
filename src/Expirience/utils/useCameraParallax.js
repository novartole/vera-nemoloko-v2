import { useLayoutEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function useCameraParallax(camera, strength = 1, needsUpdateMatrixWorld = false) {
  const [{ OY, toTurnHalfPIAroundOY }] = useState(
    () => ({
      OY: new THREE.Vector3(0, 1, 0),
      toTurnHalfPIAroundOY: new THREE.Euler(0, - Math.PI / 2, 0)
    })
  );
  
  useLayoutEffect(
    () => {
      const cameraGroup = new THREE.Group();
      cameraGroup.add(camera);

      return () => { cameraGroup.remove(camera) };
    },
    [ camera ]
  );

  useFrame(
    (state, delta) => {
      state.camera.parent.position.lerp(
        state.camera.position
          .clone()
          .projectOnPlane(OY)
          .applyEuler(toTurnHalfPIAroundOY)
          .normalize()
          .multiplyScalar(state.mouse.x)
          .setY( - state.mouse.y )

        , delta * strength
      );

      if (needsUpdateMatrixWorld)
        state.camera.parent.updateMatrixWorld();
    }
  );
};