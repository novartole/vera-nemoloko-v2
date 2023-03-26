import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useState, useCallback, useLayoutEffect } from "react";
import { useScroll, Center } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

import Item from "./Models/Item.jsx";
import { state as globalState } from './util.js';

export default function Items() {
  console.log('items');

  const scroll = useScroll();
  const reservedRange = 1 / (scroll.pages + 1); 

  const getThree = useThree(state => state.get);

  const snap = useSnapshot(globalState);
  
  const { 
    cameraRadius,
    cameraRadiusOffset,
    cameraRadiusOffsetFactor
  } = useControls(
    'Items',
    {
      cameraRadius: { value: 15, min: 5 , max: 30 },
      cameraRadiusOffset: { value: 0, min: 0, max: 30 },
      cameraRadiusOffsetFactor: { value: 0, min: 0, max: 1 }
    }
  );

  useEffect( () => { globalState.itemsCount = 2 }, [] );

  // const [itemsCount, setItemsCount] = useState(state.itemsCount);
  // useEffect( () => onItemsCountReady(itemsCount), [ itemsCount ] );

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
        const totalHeight = state.viewport.height * globalState.itemsCount;
        const heightOffset = state.viewport.height;
        const y = - scrollRange * totalHeight - heightOffset;

        // camera z
        const z = radius * Math.cos(angle);

        state.camera.position.set(x, y, z);
        state.camera.lookAt(0, state.camera.position.y, 0);
      }
    }
  );

  const calculateItemPosition = useCallback(
    (index, distanceToOY) => {
      const rangeValue = calculateItemLocalRange(index);

      // x
      const angle = 2 * Math.PI * rangeValue + Math.PI / globalState.itemsCount;
      const x = distanceToOY * Math.sin(angle);

      // y
      const totalHeight = getThree().viewport.height * globalState.itemsCount;
      const y = - rangeValue * totalHeight;

      // z
      const z = distanceToOY * Math.cos(angle);

      return new THREE.Vector3(x, y, z);
    },
    [ globalState.itemsCount ]
  );

  const onItemVisibilityChangedHandler = useCallback(
    (index, value) => {
      // console.log(calculateItemGlobalRange(index));
    },
    []
  );

  const calculateItemRangeDelta = useCallback(
    rangeDelta => rangeDelta * 0.5 * (1 - reservedRange) / globalState.itemsCount,
    [reservedRange, globalState.itemsCount]
  );

  const calculateItemGlobalRange = useCallback(
    (index) => transformItemRangeFromLocalToGlobal( calculateItemLocalRange(index) ),
    [reservedRange, globalState.itemsCount, scroll.pages]
  );

  return (
    <group position-y={ - getThree().viewport.height * 1.5 }>
      {
        [ ...Array(snap.itemsCount) ].map(
          (v, i, a) => {
            return (
              <Item key={ Symbol( i ).toString() }
                index={ i }
                calculateItemPosition={ calculateItemPosition }
                calculateItemGlobalRange={ calculateItemGlobalRange }
                calculateItemRangeDelta={ calculateItemRangeDelta }
                onItemVisibilityChanged={ onItemVisibilityChangedHandler }
              /> 
            )
          }
        )
      }
    </group>
  );

  function transformItemRangeFromLocalToGlobal(range) {
    return reservedRange + range  * (1 - reservedRange) + 0.5 * (1 - reservedRange) / globalState.itemsCount;
  }

  function calculateItemLocalRange(order) {
    return order / globalState.itemsCount;
  }
}