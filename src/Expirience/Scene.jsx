import { ScrollControls } from '@react-three/drei';
import { useControls, folder } from 'leva';

import Particles from './Particles.jsx';
import ScrollableElements from './ScrollableElements.jsx';
import collections from './collections.js';

export default function Scene() {
  console.log('scene');

  const { backgroundColor, intensity: ambientLightIntencity } = useControls({ 
    backgroundColor: '#201919', 
    'Lights': folder({
      'Ambient': folder({
        intensity: { value: 0.75, min: 0, max: 1 }
      })
    })
  });

  return <>
    <color args={ [ backgroundColor ] } attach="background" />

    <ambientLight intensity={ ambientLightIntencity } />

    <Particles length={ collections.length } />

    <ScrollControls pages={ collections.length }>
      <ScrollableElements content={ collections } /> 
    </ScrollControls>
  </>;
};