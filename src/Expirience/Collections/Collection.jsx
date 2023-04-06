import { useThree, useFrame, useLoader } from '@react-three/fiber';
import { MeshRefractionMaterial, useScroll, PresentationControls, useGLTF, meshBounds } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo, memo, useLayoutEffect } from 'react';
import { useControls, folder } from 'leva';
import { useSpring, animated, easings, config } from '@react-spring/three';
import * as THREE from 'three';

import Description from './Description.jsx';
import { Modes, useMode } from '../utils/mode.js';
import TestRing from '../Models/TestRing.jsx';

/**
 * TODO: 
 * - fix freez happens in pres mode
 * - commit
 * - format
 * - description.onClick - show details
 */

export default memo(function Collection({
  index, 
  calculateCollectionPosition,
  calculateCollectionGlobalRange,
  calculateCollectionRanges,
  title,
  description,
  elements,
  onCollectionVisibilityChangedHandler
}) {
  console.log('collection');

  const range = calculateCollectionGlobalRange(index);

  const scroll = useScroll();

  const getThree = useThree(state => state.get);

  const modelContainerOfMoving = useRef();
  const modelContainerOfRotating = useRef();

  const nearestModelCondidate = useRef(null);

  const isCollectionInRange = useRef(false);
  const timerId = useRef();

  const modelRefs = useRef([ ...Array(elements.length) ]);

  const [isCollectionSelected, setIsCollectionSelected] = useState(false);
  const [isCollectionVisible, setIsCollectionVisible] = useState(false);

  const [hoveredModel, setHoveredModel] = useState(null);
  
  const { 
    distanceToOY: distanceCollectionOY,
    rangeDelta: collectionRangeDelta,
    rotationSpeed: collectionRotationSpeed,
    hoveredRotaionSpeed: collectionHoveredRotationSpeed,
    hoveredRotationLambda: collectionHoveredRotationLambda,
    rotationDelta: collectionRotationDelta,
    radiusModelCenter,
    distanceToMoveModelsContainer,
    rangeMainFactor,
    title: collectionTitle,
    description: collectionDescription
  } = useControls(
    `Collection #${index}`,
    {
      distanceToOY: { value: 5, min: 0, max: 25, label: 'dist: col -> OY' },
      rangeDelta: { value: 0.1, min: 0.1, max: 1, label: 'del: . -> visible' },
      rotationSpeed: { value: 0.05, min: 0, max: 1, label: 'rot: init' },
      hoveredRotaionSpeed: { value: 5, min: 0, max: 10, label: 'rot: hovered' },
      hoveredRotationLambda: { value: 3, min: 1, max: 10, label: 'lam: rot', hint: 'how fast target value is gonna be reached' },
      rotationDelta: { value: 1, min: 0, max: 4, label: 'del: . -> rot', hint: 'distance from center to model toward camera' },
      distanceToMoveModelsContainer: { value: 3, min: 1, max: 10, label: 'dist: mod -> selected' },
      radiusModelCenter: { value: 2, min: 1, max: 5, label: 'dist: center -> mod' },
      rangeMainFactor: { value: 0.9, min: 0.5, max: 1.5, label: 'fac: range'},
      title,
      description
    },
    [title, description]
  );

  const collectionPosition = useMemo(
    () => [ ...calculateCollectionPosition(index, distanceCollectionOY) ],
    [calculateCollectionPosition, index, distanceCollectionOY]
  );

  const ranges = calculateCollectionRanges(collectionRangeDelta);
  const rangeDelta = ranges.delta;
  const rangeMain = ranges.main * rangeMainFactor;

  const collectionRotation = useRef(collectionRotationSpeed);

  const defaultValues = { 
    scale: 0.1, 
    rotation: [0, 0, 0],
    opacity: 0.2, 
    position: [0, 0, 0]
  };
  
  const [spring, springApi] = useSpring(
    () => ({
      scale: defaultValues.scale,
      rotation: defaultValues.rotation,
      modelsContainerPosition: defaultValues.position,
      opacity: defaultValues.opacity,

      config: key => {
        switch (key) {
          case 'scale':
            return { mass: 2, ...config.wobbly }

          case 'rotation':
            return { duration: 1000, easing: easings.easeOutCubic }

          default: 
            return {}
        }
      }
    }),
    []
  );

  useLayoutEffect( 
    () => modelRefs.current.forEach( model => model.rotation.set( ...Array(3).fill(Math.random() * 2 * Math.PI) ) ),
    [] 
  );

  const [mode, modeActions] = useMode(
    Modes.SCROLL, 
    currentMode => {
      if (currentMode === Modes.PRESENTATION) {
        console.log('** NEED to handle PRESENTATION mode');

        scroll.el.style.overflow = "hidden";
        
        if (isCollectionSelected) {

          setIsCollectionSelected(false);

        }


      } else if (currentMode === Modes.SCROLL) {
        console.log('** NEED to handle SCROLL mode');

        scroll.el.style.overflow = "auto";
      }
    },
    [ isCollectionSelected ]
  );

  useEffect( 
    () => {
      springApi.start(
        isCollectionSelected
        ?
          { 
            rotation: [
              modelContainerOfRotating.current.rotation.x + Math.PI,
              modelContainerOfRotating.current.rotation.y - Math.PI,
              modelContainerOfRotating.current.rotation.z
            ],              
            modelsContainerPosition: [ distanceToMoveModelsContainer, 0, 0 ]
          }
        :
          { 
            rotation: [
              modelContainerOfRotating.current.rotation.x - Math.PI,
              modelContainerOfRotating.current.rotation.y + Math.PI,
              modelContainerOfRotating.current.rotation.z
            ],
            modelsContainerPosition: defaultValues.position
          }
      );
    }, 
    [ isCollectionSelected ] 
  ); 

  useEffect( 
    () => {
      if (isCollectionVisible) {
        springApi.start({ 
          rotation: defaultValues.rotation.map(value => value + (Math.random() - 0.5) * 2 * Math.PI * 0.1 + Math.PI), 
          scale: 1 
        });
      } else {
        springApi.set({ 
          rotation: defaultValues.rotation,
          scale: defaultValues.scale 
        });
      }

      onCollectionVisibilityChangedHandler(index, isCollectionVisible);
    }, 
    [index, isCollectionVisible] 
  );

  useFrame(
    (state, delta) => {
      modelContainerOfMoving.current.rotation.y += calculateModelContainerRotation(delta) * delta;

      modelRefs.current.forEach(model => {
        model.rotation.x += collectionRotationSpeed * delta;
        model.rotation.y += collectionRotationSpeed * delta;
        model.rotation.z += collectionRotationSpeed * delta;
      });

      const isCollectionInSelectableRange = scroll.visible(range - rangeDelta, 2 * rangeDelta);
      if (isCollectionInSelectableRange) {

        if (isCollectionInRange.current === false)
          onCollectionInRange(true);

      } else {

        if (isCollectionInRange.current === true)
          onCollectionInRange(false);

      }

      const isCollectionInVisibleRange = scroll.visible(range - rangeMain, 2 * rangeMain);
      if (isCollectionInVisibleRange) {

        if (isCollectionVisible === false) 
          setIsCollectionVisible(true);

      } else {

        if (isCollectionVisible === true)
          setIsCollectionVisible(false);

      }
    }
  );

  return (   
    <group position={collectionPosition}>
      <Description position={[- 5.75, 1, 0]} visible={isCollectionSelected} title={collectionTitle} text={collectionDescription}/>
      <animated.group ref={modelContainerOfMoving} position={spring.modelsContainerPosition}>
        <animated.group
          ref={modelContainerOfRotating}
          rotation={spring.rotation}
          scale={spring.scale}
          onPointerEnter={onModelContainerOfRotatingPointerEnter}
          onPointerLeave={onModelContainerOfRotatingPointerLeave}
          onClick={onModelContainerOfRotatingClick}
          onPointerDown={onModelContainerOfRotatingPointerDown}
          onPointerUp={onModelContainerOfRotatingPointerUp}
          onPointerMissed={onCollectionPointerMissed}
        >
          {
            elements.map(
              (element, index) => (
                <group key={index} position={[...calculateModelPosition(index)]}>
                  <PresentationControls
                    enabled={
                      mode.current === Modes.PRESENTATION 
                      && modelRefs.current[index] === hoveredModel
                    }
                    polar={[- Math.PI / 4, Math.PI / 4]}
                    azimuth={[- Math.PI / 2, Math.PI / 2]}
                    config={{ mass: 2, tension: 400 }}
                    snap={{ mass: 4, tension: 400 }}
                  >
                    <element.model ref={modelRef => modelRefs.current[index] = modelRef} opacity={spring.opacity} />
                  </PresentationControls>
                </group>  
              )
            )
          }
        </animated.group>
      </animated.group>
    </group>
  );

  function onCollectionInRange(value) {
    isCollectionInRange.current = value;

    if (isCollectionInRange.current) {

      springApi.start({ opacity: 1 });

    } else {
      springApi.start({ opacity: defaultValues.opacity });
      setIsCollectionSelected(false);
    }
  }

  function isModelFar(model) {
    // world position of hovered model
    const modelWorldPosition = new THREE.Vector3();
    model.getWorldPosition(modelWorldPosition);
    
    // world position of center of models
    const centerWorldPosition = new THREE.Vector3();
    modelContainerOfRotating.current.getWorldPosition(centerWorldPosition);

    // (world) position of camera
    const cameraPosition = getThree().camera.position;

    // direction from camera to center of models
    const fromCameraToCenter = centerWorldPosition.clone().sub(cameraPosition);
    
    // direction from camera to hovered model and its length
    const fromCameraToModel = modelWorldPosition.clone().sub(cameraPosition);
    const distanceFromCameraToModel = fromCameraToModel.length();
    
    // projected center on the direction and its length
    const centerProjection = fromCameraToCenter.clone().projectOnVector(fromCameraToModel);
    const distanceFromCameraToCenterProjection = centerProjection.length();

    return distanceFromCameraToCenterProjection - distanceFromCameraToModel < collectionRotationDelta;
  }

  function calculateModelContainerRotation(deltaTime) {
    if (modelContainerOfRotating.current === undefined)
      return 0;

    const model = nearestModelCondidate.current;
    const baseRotation = mode.current === Modes.PRESENTATION ? 0 : collectionRotationSpeed;
    if (model === null)
      return collectionRotation.current = 
        THREE.MathUtils.damp(collectionRotation.current, baseRotation, collectionHoveredRotationLambda, deltaTime);

    return collectionRotation.current =
      isModelFar(model)
      ? 
        THREE.MathUtils.damp(collectionRotation.current, baseRotation + collectionHoveredRotationSpeed, 1 / collectionHoveredRotationLambda, deltaTime)
      : 
        THREE.MathUtils.damp(collectionRotation.current, baseRotation, collectionHoveredRotationLambda, deltaTime);
  }

  function calculateModelPosition(index) {
    const angle = 2 * Math.PI * index / modelContainerOfRotating.current?.children.length ?? 1;

    // x
    const x = radiusModelCenter * Math.sin(angle);

    //y 
    const y = 0;

    // z
    const z = radiusModelCenter * Math.cos(angle);

    return new THREE.Vector3(x, y, z);
  };

  function onModelContainerOfRotatingPointerEnter(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();

    const model = event.object;
    if (isModelFar(model))
      nearestModelCondidate.current = model;

    setHoveredModel(model);
  }
  
  function onModelContainerOfRotatingPointerLeave(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();

    nearestModelCondidate.current = null;

    setHoveredModel(null);
    clearTimeout(timerId.current);
    timerId.current = null;
    modeActions.resetNext();
  }

  function onModelContainerOfRotatingClick(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();

    if (mode.next !== null) {

      modeActions.applyNextToCurrent();

    } else if (mode.current === Modes.SCROLL) {

      setIsCollectionSelected(currentValue => !currentValue);

    }
  }
  
  function onModelContainerOfRotatingPointerDown(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();

    timerId.current = setTimeout(
      () => {
        if (hoveredModel !== null) {
          console.log('__mode change toggled');

          modeActions.toggleNextByCurrent(Modes.SCROLL, Modes.PRESENTATION);
        }

        timerId.current = null;
      },
      2000
    );
  }

  function onModelContainerOfRotatingPointerUp(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();

    clearTimeout(timerId.current);
    timerId.current = null;
  }

  function onCollectionPointerMissed(event) {
    if (isCollectionInRange.current === false)
      return;

    event.stopPropagation();
    
    // console.log('clicked outside of collection');
  }
});
