import { useTexture, Center } from '@react-three/drei';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useSprings, animated } from '@react-spring/three';

import Letter from './Letter.jsx';
import { state } from '../utils/state.js';

const AnimatedLetter = animated(Letter);

export default function Letters() { 
  console.log('letters');

  const { 
    horizontalOffsetFactor: letterHorizontalOffsetFactor,
    maxVerticalOffset: letterMaxVerticalOffset,
    positionY: lettersPositionY
  } = useControls(
    'Letters', 
    {
      horizontalOffsetFactor: { value: 0.2, min: 0, max: 1, step: 0.01, label: 'fac: hrz offs' },
      maxVerticalOffset: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'max: vrt offs' },
      positionY: { value: 0, min: - 10, max: 5, step: 0.01, label: 'pos: Y' }
    }
  );

  const sources = useMemo(
    () => state.letterSources
      // flat by order
      .map(source =>
        Array.isArray(source.order) 
        ? 
          source.order.map( order => ({ ...source, order }) )
        :
          source
      )
      .flat()
      // add randomness field
      .map(letter => ({ ...letter, randomness: Math.random() }) )
      // sort by order
      .sort( (a, b) => a.order - b.order )

    , [ state.letterSources ]
  );

  const positions = useMemo(
    () => new Map(
      sources.map(
        source => {
          // x
          const order = source.order;
          const offset = letterHorizontalOffsetFactor * order;
          const x = order + offset;

          // y
          const y = source.randomness * letterMaxVerticalOffset;

          // z
          const z = (Math.random() - 0.5) * 2;

          return [ source, [x, y, z] ];
        }
      ) 
    ),
    [sources, letterHorizontalOffsetFactor, letterMaxVerticalOffset]
  );

  // const { width, height } = useThree(state => state.size);

  // const [springs, api] = useSprings(
  //   sources.length,
  //   index => ({
  //     positionXY: [0, 0],
  //     config: { mass: 4, friction: 220 },
  //   }),
  //   []
  // );

  // const pointerMoveHandler = useCallback(
  //   event => {
  //     const x = (event.offsetX / width) * 2 - 1
  //     const y = (event.offsetY / height) * -2 + 1

  //     api.start({ positionXY: [x * 5, y * 2] });
  //   },
  //   [api, width, height]
  // );

  // useEffect(
  //   () => {
  //     window.addEventListener('pointermove', pointerMoveHandler);

  //     return () => {
  //       window.removeEventListener('pointermove', pointerMoveHandler);
  //     };
  //   },
  //   [ pointerMoveHandler ]
  // );

  const lettersRef = useRef( Array(sources.length) );

  //     lettersRef.current.forEach(
  //       (letter, index) => {
  //         letter.position.setX(springs[index].positionXY[0] + letter.position.x);
  //         letter.position.setY(springs[index].positionXY[1] + letter.position.y);
  //       }
  //     )
  

  return (
    <group position-y={ lettersPositionY }>
      <Center>
        {
          sources.map(source => 
            <AnimatedLetter 
              ref={ letter => lettersRef.current[source.order] = letter }
              key={ source.order }
              position={ positions.get(source) }
              path={ source.path }
              symbol={ source.symbol }
              order={ source.order }
            />
          )
        }
      </Center>
    </group>
  );
};

state.letterSources.forEach( source => useTexture.preload(source.path) );