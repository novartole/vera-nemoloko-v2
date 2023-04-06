import { useTexture, Center, Float, useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { memo, Suspense, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useControls, button } from 'leva';
import * as THREE from 'three';

import Letter from './Letter.jsx';
import { state } from '../utils/state.js';

export default function Letters() { 
  console.log('letters');

  const scroll = useScroll();

  const { 
    horizontalOffsetFactor: letterHorizontalOffsetFactor,
    maxVerticalOffset: letterMaxVerticalOffset,
    scale: letterScale,
    positionY: lettersPositionY
  } = useControls(
    'Letters', 
    {
      horizontalOffsetFactor: { value: 0.2, min: 0, max: 1, step: 0.01, label: 'fac: hrz offs' },
      maxVerticalOffset: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'max: vrt offs' },
      scale: { value: 1, min: 1, max: 5, step: 0.01},
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
          const offset = letterHorizontalOffsetFactor * order * letterScale;
          const x = order + offset;

          // y
          const y = source.randomness * letterMaxVerticalOffset;

          // z
          const z = (Math.random() - 0.5) * 2;

          return [ source, new THREE.Vector3(x, y, z) ];
        }
      ) 
    ),
    [sources, letterHorizontalOffsetFactor, letterScale, letterMaxVerticalOffset]
  );

  {/* Once map loadings are done, force the re-render to center letters. */}
  const setState = useState()[1];
  const forceRender = () => setState({});
  const onLetterLoadedHandler = useCallback(
    ( () => {
      let readyCount = 0;

      return () => { 
        if ( ++readyCount == sources.length )
          forceRender();
      }
    } )(), 
    [ sources ]
  );

  useFrame(
    (state, delta) => { 
      if ( scroll.visible( 0, 1 / (scroll.pages + 1) ) ) {
        const scrollRange = scroll.range( 0, 1 / (scroll.pages + 1) );
        const totalHeight = state.viewport.height;
        
        state.camera.position.set(0, - scrollRange * totalHeight, 15);
      }
    }
  );

  return (
    <group position-y={ lettersPositionY }>
      <Center> 
        {
          sources.map( source =>   
            <Suspense key={ source.order }>
              <Letter
                position={ positions.get(source) }
                scale={ letterScale }
                path={ source.path }
                // TODO: handle loading errors
                onLoaded={ onLetterLoadedHandler }
              />
             </Suspense>
          )
        }
      </Center>
    </group>
  );
}

state.letterSources.forEach( source => useTexture.preload(source.path) );