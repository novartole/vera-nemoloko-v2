import TestRing from  '../Models/TestRing.jsx';
import * as THREE from 'three';

export default [
  {
    id: THREE.MathUtils.generateUUID(),
    elements: [
      {
        info: {
          title: `Item #1`, 
          description: 'facny\ntext of ring provided',
        },
        model: TestRing
      }
    ],
    props: {
      distanceToOY: 5,
      rotationSpeed: 0.05,
      hoveredRotaionSpeed: 5,
      hoveredRotationLambda: 3,
      rotationDelta: 1,
      vectorToMoveModelsContainerOnScrollSelected: [1, 0, 6],
      vectorToMoveModelsContainerOnPresSelected: [-0.8,-0.2,7],
      radiusModelCenter: 2,
      visibleDelta: height => height * 1.5,
      activeDelta: height => 0.75, //height / 4,
      collectionInfoPosition: [-5.2,1,-4],
      modelInfoPosition: [4.5, 0, 0],
      polar: 30,
      azimuth: 30,
      title: 'Ring\ncollection #1',
      description: 'Created just for testing',
    }
  },
  {
    id: THREE.MathUtils.generateUUID(),
    elements: [
      {
        info: {
          title: `Item #1`, 
          description: 'facny\ntext of 1st ring provided',
        },
        model: TestRing
      },
      {
        info: {
          title: `Item #2`, 
          description: 'facny\ntext of 2nd ring provided',
        },
        model: TestRing
      }
    ],
    props: {
      distanceToOY: 5,
      rotationSpeed: 0.05,
      hoveredRotaionSpeed: 5,
      hoveredRotationLambda: 3,
      rotationDelta: 1,
      vectorToMoveModelsContainerOnScrollSelected: [3, 0, 0],
      vectorToMoveModelsContainerOnPresSelected: [-4, 0, 2],
      radiusModelCenter: 2,
      visibleDelta: height => height * 1.5,
      activeDelta: height => height / 4,
      collectionInfoPosition: [- 5.75, 1, 0],
      modelInfoPosition: [4.5, 0, 0],
      polar: 30,
      azimuth: 30,
      title: 'Ring\ncollection #2',
      description: 'Created just for testing',
    }
  },
  {
    id: THREE.MathUtils.generateUUID(),
    elements: [
      {
        info: {
          title: `Item #1`, 
          description: 'facny\ntext of 1st ring provided',
        },
        model: TestRing
      },
      {
        info: {
          title: `Item #2`, 
          description: 'facny\ntext of 2nd ring provided',
        },
        model: TestRing
      },
      {
        info: {
          title: `Item #3`, 
          description: 'facny\ntext of 3rd ring provided',
        },
        model: TestRing
      }
    ],
    props: {
      distanceToOY: 5,
      rotationSpeed: 0.05,
      hoveredRotaionSpeed: 5,
      hoveredRotationLambda: 3,
      rotationDelta: 1,
      vectorToMoveModelsContainerOnScrollSelected: [3, 0, 0],
      vectorToMoveModelsContainerOnPresSelected: [-4, 0, 2],
      radiusModelCenter: 2,
      visibleDelta: height => height * 1.5,
      activeDelta: height => height / 4,
      collectionInfoPosition: [- 5.75, 1, 0],
      modelInfoPosition: [4.5, 0, 0],
      polar: 30,
      azimuth: 30,
      title: 'Ring\ncollection #3',
      description: 'Created just for testing',
    }
  }
];