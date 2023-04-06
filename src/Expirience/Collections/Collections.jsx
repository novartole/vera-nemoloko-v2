import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState, useCallback, useLayoutEffect } from "react";
import { useScroll, Center } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

import Collection from "./Collection.jsx";
import { useRef } from 'react';

export default function Collections({ content }) {
  console.log('collections');

  const ref = useRef();

  const scroll = useScroll();
  const reservedRange = 1 / (scroll.pages + 1); 

  const { height: viewportHeight } = useThree(state => state.viewport);
  
  const { 
    cameraRadius,
    cameraRadiusOffset,
    cameraRadiusOffsetFactor
  } = useControls(
    'Collections',
    {
      cameraRadius: { value: 15, min: 5 , max: 60, label: 'dist: cam -> OY' },
      cameraRadiusOffset: { value: 0, min: 0, max: 30, label: 'offs: cam' },
      cameraRadiusOffsetFactor: { value: 0, min: 0, max: 1, label: 'fac: offs' }
    }
  );

  useEffect(
    () => ref.current.children.forEach( 
      (child, index) => 
        child.rotation.y = 2 * Math.PI * (index + 0.5) / content.length 
    ), 
    [ content.length ]
  );

  const calculateCollectionPosition = useCallback(
    (index, distanceToOY) => {
      const rangeValue = calculateCollectionLocalRange(index);

      // x
      const angle = 2 * Math.PI * rangeValue + Math.PI / content.length;
      const x = distanceToOY * Math.sin(angle);

      // y
      const totalHeight = viewportHeight * content.length;
      const y = - rangeValue * totalHeight;

      // z
      const z = distanceToOY * Math.cos(angle);

      return new THREE.Vector3(x, y, z);
    },
    [content.length, viewportHeight]
  );

  const onCollectionVisibilityChangedHandler = useCallback(
    (index, value) => {
      // console.log(calculateItemGlobalRange(index));
    },
    []
  );

  const calculateCollectionRanges = useCallback(
    rangeDelta => {
      const mainRange = 0.5 * (1 - reservedRange) / content.length;
      
      return { main: mainRange, delta: rangeDelta * mainRange }
    },
    [reservedRange, content.length]
  );

  const calculateCollectionGlobalRange = useCallback(
    (index) => transformCollectionRangeFromLocalToGlobal( calculateCollectionLocalRange(index) ),
    [reservedRange, content.length, scroll.pages]
  );

  useFrame(
    (state, delta) => {
      if ( scroll.visible(reservedRange, 1 - reservedRange) ) {
        const scrollRange = scroll.range( reservedRange, 1 - reservedRange );
        const radiusOffset = cameraRadiusOffset * cameraRadiusOffsetFactor * scrollRange;
        const radius = cameraRadius + radiusOffset;

        // camera x
        const angle = 2 * Math.PI * scrollRange;
        const x = radius * Math.sin(angle);

        // camera y
        const totalHeight = state.viewport.height * content.length;
        const heightOffset = state.viewport.height;
        const y = - scrollRange * totalHeight - heightOffset;

        // camera z
        const z = radius * Math.cos(angle);

        state.camera.position.set(x, y, z);
        state.camera.lookAt(0, state.camera.position.y, 0);
      }
    }
  );

  return (
    <group ref={ ref } position-y={ - viewportHeight * 1.5 }>
      {
        content.map(
          (collection, index) => {
            return (
              <Collection 
                key={ Symbol( index ).toString() }
                index={ index }
                calculateCollectionPosition={ calculateCollectionPosition }
                calculateCollectionGlobalRange={ calculateCollectionGlobalRange }
                calculateCollectionRanges={ calculateCollectionRanges }
                title={collection.title}
                description={collection.description}
                elements={collection.elements}
                onCollectionVisibilityChangedHandler={ onCollectionVisibilityChangedHandler }
              /> 
            )
          }
        )
      }
    </group>
  );

  function transformCollectionRangeFromLocalToGlobal(range) {
    return reservedRange + range  * (1 - reservedRange) + 0.5 * (1 - reservedRange) / content.length;
  }

  function calculateCollectionLocalRange(order) { return order / content.length }
};