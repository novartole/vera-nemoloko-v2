import { useEffect, memo, useState } from "react";
import { useThree } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import { useSpring, animated as animatedThree } from '@react-spring/three';
import { animated as animatedWeb } from '@react-spring/web';

export default memo(function ModelInfo(props) {
  console.log('ModelInfo');

  // need to fix a bug when Html gets wrong position
  // https://github.com/pmndrs/drei/pull/1126#issuecomment-1410468830
  const { domElement } = useThree(state => state.gl);

  // animate content and visibility
  const [content, setContent] = useState(props.content);
  const [visible, setVisible] = useState(props.visible);

  const defaultValues = { opacity: 0, position: [10, 0, 0] }
  const [spring, springApi] = useSpring(
    () => ({
      opacity: defaultValues.opacity,
      position: defaultValues.position,

      config: key => {
        if (key === 'opacity') return { duration: 300 }
        else if (key === 'position') return { duration: 200 }
        else return {};
      }
    }),
    []
  );

  useEffect(
    () => {
      springApi.start(
        props.visible === true
        ?
          { 
            opacity: 1, 
            position: props.position, 
            
            delay: 200, 
            
            onStart: () => setVisible(true) 
          }
        :
          { 
            opacity: defaultValues.opacity, 
            position: defaultValues.position, 
            
            onRest: () => setVisible(false)
          }
      );  
    },
    [ props.visible ]
  );

  useEffect(
    () => {
      if (visible === false)
        return;

      const contentProp = props.content;

      // this should happen only when content is changing right after a new selected model has been set
      if (content !== null && contentProp !== null) {
        springApi.start({
          to: [
            { 
              opacity: 0, 
              
              onRest: () => setContent(contentProp) 
            },
            { opacity: 1 }
          ]
        });

      // happens when content is set first time and before visible gets false
      } else setContent(contentProp);
    },
    [props.content, visible]
  );

  return (
    <animatedThree.group position={ spring.position } visible={ visible }> 
      <Float>
        <Html transform portal={{ current: domElement.parentElement }}>
          <animatedWeb.div style={{ opacity: spring.opacity, color: 'white' }}>
            { 
              // should be here to handle visible and content separatly
              content !== null 
              ? 
                <>
                  <h1>{ content.title }</h1>
                  <p>{ content.description }</p>
                </>
              : null
            }
          </animatedWeb.div>
        </Html> 
      </Float> 
    </animatedThree.group>
  );
});