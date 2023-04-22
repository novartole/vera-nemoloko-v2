import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { memo, useCallback, forwardRef } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

export default memo(forwardRef(function Letter(
  { 
    position, 
    path,
    symbol,
    order,
    onLoaded = () => {}
  }, 
  ref
){
  console.log('letter');

  // const { width, height } = useThree(state => state.size);

  // const [spring, api] = useSpring(
  //   () => ({
  //     position: [0, 0],
  //     config: { mass: 4, friction: 220 },
  //   }),
  //   []
  // );

  // const pointerMoveHandler = useCallback(
  //   event => {
  //     const x = (event.offsetX / width) * 2 - 1
  //     const y = (event.offsetY / height) * -2 + 1

  //     api.start({ position: [x * 5, y * 2] });
  //   },
  //   [api, width, height]
  // );

  const { positionXY, positionZ, scale, rotationZ } = useControls(
    `${symbol}_${order}`,
    {
      positionXY: { value: position.slice(0, 2), step: 0.5 },
      positionZ: { value: position[2] },
      scale: { value: 1, min: 1, max: 5, step: 0.01 },
      rotationZ: { value: 0, min: -180, max: 180 }
    },
    [ position ]
  );

  const map = useTexture(path, onLoaded);

  return (
    <animated.mesh ref={ ref }
      scale={ scale } 
      // position={ spring.position.to( (x, y) => [positionXY[0] + x, positionXY[1] + y, positionZ] ) }
      position={ [positionXY, positionZ].flat() } 
      rotation-z={ THREE.MathUtils.degToRad(rotationZ) }
      // onPointerMove={ pointerMoveHandler }
    >
      <planeGeometry />
      <meshStandardMaterial transparent={ true } map={ map }/>
    </animated.mesh>
  )
}));