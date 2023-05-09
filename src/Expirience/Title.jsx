import * as THREE from 'three';
import { useState } from 'react';
import { useControls } from 'leva';

import CurveAsPoints from './CurveAsPoints.jsx';
import TextAsPoints from './TextAsPoints.jsx';

export default function Title() {
  const [ textProps ] = useState(
    () => ({
      font: 'helvetiker_regular.typeface.json',
      size: 1.0,
      height: 1.5,
      curveSegments: 2,
      bevelEnabled: false,
    })
  );

  const { showPoints, leftPoint_2, leftPoint_1, middlePoint, rightPoint_1, rightPoint_2, position } = useControls(
    'Title curve', 
    {
      showPoints: false,
      leftPoint_2: [-7,3,2],
      leftPoint_1: [-1.8,2,1],
      middlePoint: [0.5,0,0],
      rightPoint_1: [-1,-2.2,-1],
      rightPoint_2: [10,-2,3],
      position: [0, 0, 0]
    }
  );

  const points = [ leftPoint_2, leftPoint_1, middlePoint, rightPoint_1, rightPoint_2 ];

  return (
    <>
      <CurveAsPoints points={ points } showPoints={ showPoints } position={ position } />
      <TextAsPoints 
        count={ 2 * 1024 } 
        position={ [-3, 2, 0] } 
        rotation={ [0, THREE.MathUtils.degToRad(10), 0] } 
        scale={ 1.2 } 
        textProps={ textProps }
      >
        vera
      </TextAsPoints>
      <TextAsPoints count={ 1024 } textProps={ textProps }>
        ne
      </TextAsPoints>
      <TextAsPoints 
        count={ 3 * 1024 } 
        position={ [2, -2, 0] } 
        rotation={ [0, THREE.MathUtils.degToRad(-12), 0] } 
        scale={ 1.2 } 
        textProps={ textProps }
      >
        moloko
      </TextAsPoints>
    </>
  );
};