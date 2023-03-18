import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, ScrollControls, Scroll, CameraShake } from '@react-three/drei';
import { Leva, useControls } from 'leva';
import { subscribe, useSnapshot } from 'valtio';

import Letters from './Letters.jsx';
import Items from './Items.jsx';
import { state as globalState } from './util.js';

export default function App() {
  console.log('app');

  const { backgroundColor } = useControls({ backgroundColor: '#201919' });

  const snap = useSnapshot(globalState);

  return <>
    <Leva collapsed />

    <Canvas 
      camera={ { fov: 50, position: [0, 0, 15] } }>

      {/* <CameraShake 
        decay
        maxYaw={0.01} // Max amount camera can yaw in either direction
        maxPitch={0.01} // Max amount camera can pitch in either direction
        maxRoll={0.05} // Max amount camera can roll in either direction
        yawFrequency={0.1} // Frequency of the the yaw rotation
        pitchFrequency={0.1} // Frequency of the pitch rotation
        rollFrequency={0.1} // Frequency of the roll rotation
        intensity={1.2} // initial intensity of the shake
        decayRate={1.2} // if decay = true this is the rate at which intensity will reduce at />
      /> */}

      {/* <OrbitControls makeDefault /> */}

      <color args={ [ backgroundColor ] } attach="background" />

      <ambientLight intensity={ 0.75 } />

      {/* <Suspense fallback={ null }> */}
        <ScrollControls pages={ snap.itemsCount }>
          <Letters />
          <Items />
        </ScrollControls>
      {/* </Suspense> */}
    </Canvas>
  </>
}