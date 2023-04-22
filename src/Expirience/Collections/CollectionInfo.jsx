import { useRef, useState, useEffect, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSprings, animated } from '@react-spring/three';
import { Float, Text } from '@react-three/drei';

const AnimatedText = animated(Text);

export default memo(function Description({
  title, description, 
  position, visible: isVisible
}) {
  const ref = useRef();

  const defaultValues = {
    opacity: 0,
    positions: [
      [0 - 2, 0, 0],
      [0, -2 - 2, 0]
    ]
  };

  const [springs, springsApi] = useSprings(
    2,
    index => ({ 
      opacity: defaultValues.opacity, 
      position: defaultValues.positions[index], 

      config: { duration: 200 }
    }),
    []
  );

  // animate visibility
  const [visible, setVisible] = useState(isVisible);

  useEffect(
    () => {  
      springsApi.start(index =>
        isVisible 
        ?
          { 
            opacity: 1,
            position: index === 0 ? [0, 0, 0] : [0, -2, 0],

            delay: 100,
            onStart: () => setVisible(true)
          }
        :
          { 
            opacity: 0,
            position: defaultValues.positions[index],

            onRest: () => setVisible(false)
          }
      );
    },
    [ isVisible ]
  );

  useFrame(
    (state, delta) => {
      ref.current.lookAt(state.camera.position);
    }
  );

  return <group ref={ ref } position={ position } visible={ visible }>
      <Float>
        <AnimatedText
          fontSize={ 1 } 
          position={ springs[0].position }
          fillOpacity={ springs[0].opacity }
        >
          { title }
        </AnimatedText>
      </Float>
      <Float>
        <AnimatedText 
          fontSize={ 0.7 }
          position={ springs[1].position }
          fillOpacity={ springs[1].opacity }
        >
          { description }
        </AnimatedText>
      </Float>
    </group>
});