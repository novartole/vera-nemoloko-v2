import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSprings, animated } from '@react-spring/three';
import { Float, Text } from '@react-three/drei';

const AnimatedText = animated(Text);

export default function Description({
  title, text, 
  position, visible: isVisible
}) {
  const ref = useRef();

  const [springs, springsApi] = useSprings(
    2,
    index => ({ 
      opacity: 0, 
      position: [0, 0, 0], 

      config: { duration: 200 }
    }),
    []
  );

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
          position: index === 0 ? [0 - 2, 0, 0] : [0, -2 - 2, 0],

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

  return <group
      ref={ ref }
      position={ position }
      visible={ visible }
    >
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
        { text }
      </AnimatedText>
      </Float>
    </group>
};