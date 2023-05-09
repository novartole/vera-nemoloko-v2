import { useControls } from 'leva';
import { useThree, useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

import Collection from './Collection.jsx';
import useCameraAcrossPoints from './utils/useCameraAcrossPoints.js';
import useCameraParallax from './utils/useCameraParallax.js';
import useStore from './utils/store.js';
import Title from './Title.jsx';

const Collections = ({ content, pointsOfCollections }) => {
  return content.map(
    (collection, index) => 
      <Collection key={ index } index={ index } content={ collection } point={ pointsOfCollections[index] } />
  );
};

export default 
  function ScrollableElements({ content }) {
  console.log('scollableElements');

  const elementIndex = useStore(state => state.elementIndex);
  const setElementIndex = useStore(state => state.setElementIndex);

  const { height } = useThree(state => state.viewport);
  const camera = useThree(state => state.camera);

  const { 
    cameraDistance,
    cameraRadiusOffset,
    cameraRadiusOffsetFactor,
    parallaxStrength
   } = useControls({
    cameraDistance: { value: 15, min: 5, max: 30 },
    cameraRadiusOffset: { value: 1, min: 0, max: 15 },
    cameraRadiusOffsetFactor: { value: 0, min: 0, max: 1 },
    parallaxStrength: { value: 1, min: 0, max: 2 }
  });

  const heightOfFirstElement = (2 / 3) * height;
  const heightOfSecondElement = height * content.length + height / 2;
  const heightOfThirdElement = height;

  const parametricPoints = useMemo(
    () => {
      const offset = heightOfFirstElement + height / 2;
      const precision = 2; 

      return [ ...Array(content.length * precision) ].map(
        (_, index, array) => {
          const t = index / array.length;
          const angle = 2 * Math.PI * t - Math.PI / 6;

          // x
          const x = Math.sin(angle);

          // y
          const y = - t * height * content.length - offset;

          // z
          const z = Math.cos(angle);

          return { vector: { x, y, z }, t };
        }
      );
    },
    [height, heightOfFirstElement, content.length]
  );

  const pointsOfCollections = parametricPoints
    .filter( (_, index) => index % 2 === 1)
    .map(point => point.vector);

  const camerPoints = useMemo(
    () => {
      const points = [
        [0, 0, cameraDistance],
        // little moving down to hide letters before first collection appears
        [0, - heightOfFirstElement, cameraDistance]
      ];
      
      const cameraRadius = cameraDistance;
      parametricPoints.forEach(
        parametricPoint => {
          const radiusOffset = cameraRadiusOffset * cameraRadiusOffsetFactor * parametricPoint.t;
          const radius = cameraRadius + radiusOffset;

          points.push([
            radius * parametricPoint.vector.x,
            parametricPoint.vector.y,
            radius * parametricPoint.vector.z
          ]);
        }
      );
      const totalHeightOfFirstAndSecondElements = heightOfFirstElement + heightOfSecondElement;
      points.push([0, - totalHeightOfFirstAndSecondElements - heightOfThirdElement / 2, cameraDistance]);

      return points.map( point => new THREE.Vector3(...point) );
    },
    [height, content.length, cameraDistance, parametricPoints, cameraRadiusOffset, cameraRadiusOffsetFactor]
  );

  useCameraAcrossPoints(camera, camerPoints);
  useCameraParallax(camera, parallaxStrength);

  useFrame(
    ({ camera }) => {
      if ( camera.position.y > - heightOfFirstElement ) {

        // console.log('_____++++____first');
        if (elementIndex !== 0)
          setElementIndex(0);

      } else if ( camera.position.y >= - (heightOfFirstElement + heightOfSecondElement) ) {

        // console.log('_____++++____second');
        if (elementIndex !== 1)
          setElementIndex(1);

      } else if ( camera.position.y >= - (heightOfFirstElement + heightOfSecondElement + heightOfThirdElement) ) {

        //  console.log('_____++++____third');
        if (elementIndex !== 2)
          setElementIndex(2);

      }
    }
  );

  return <>
    <Title />
    <Collections content={ content } pointsOfCollections={ pointsOfCollections } />
  </>;
};