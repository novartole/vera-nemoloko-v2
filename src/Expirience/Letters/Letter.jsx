import { Float, useTexture } from '@react-three/drei';
import { memo, useMemo } from 'react';

export default memo(function Letter({ 
  scale,
  position, 
  path,
  onLoaded
}) {
  console.log('letter');

  const map = useTexture(path, onLoaded);

  return (
    <mesh 
      scale={ scale }
      position={ [ ...position ] }
    >
      <planeGeometry />
      <meshStandardMaterial 
        transparent={ true }
        map={ map }
      />
    </mesh>
  )
});