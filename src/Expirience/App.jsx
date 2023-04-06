import { Suspense, useEffect, useMemo, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Sky, ScrollControls } from '@react-three/drei';
import { Leva, useControls } from 'leva';

import Letters from './Letters/Letters.jsx';
import Collections from './Collections/Collections.jsx';
import TestRing from './Models/TestRing.jsx';

/**
 * TODO:
 * - camera parallax
 */

// function Rig({ center = new THREE.Vector3() }) {
//   const camera = useThree(state => state.camera);
//   const [ cameraGroup ] = useState( () => new THREE.Group() );

//   useEffect( () => { cameraGroup.add(camera) }, [cameraGroup] );

//   return useFrame(state => {

//     cameraGroup.position.lerp(center.set(state.mouse.x / 2, state.mouse.y / 2, 15), 0.05)

//   });
// }
const test_collection_1 = {
  title: 'Ring\ncollection #1',
  description: 'Created just for testing',
  elements: [
    {
      title: `Item #1`, 
      description: 'facny\ntext of ring 1 provided',
      model: TestRing
    }
  ]
}

const test_collection_2 = {
  title: 'Ring\ncollection #2',
  description: 'Created just for testing',
  elements: [
    {
      title: `Item #1`, 
      description: 'facny\ntext of ring 1 provided',
      model: TestRing
    },
    {
      title: `Item #2`, 
      description: 'facny\ntext of ring 2 provided',
      model: TestRing
    }
  ]
}

const test_collection_3 = {
  title: 'Ring\ncollection #3',
  description: 'Created just for testing',
  elements: [
    {
      title: `Item #1`, 
      description: 'facny\ntext of ring 1 provided',
      model: TestRing
    },
    {
      title: `Item #2`, 
      description: 'facny\ntext of ring 2 provided',
      model: TestRing
    },
    {
      title: `Item #2`, 
      description: 'facny\ntext of ring 2 provided',
      model: TestRing
    }
  ]
}

const collections = [
  test_collection_1,
  test_collection_2,
  test_collection_3
];

export default function App() {
  console.log('app');

  const { backgroundColor } = useControls({ backgroundColor: '#201919' });

  return <>
    <Leva collapsed />

    <Canvas camera={ { fov: 50, position: [0, 0, 15] } }>
      
      {/* <Rig /> */}

      <color args={ [ backgroundColor ] } attach="background" />

      <ambientLight intensity={ 0.75 } />

      {/* <Suspense fallback={ null }> */}
        <ScrollControls pages={ collections.length }>
          <Letters />
          <Collections content={collections} />
        </ScrollControls>
      {/* </Suspense> */}
    </Canvas>
  </>
};