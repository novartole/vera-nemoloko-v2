import { useThree, useFrame } from '@react-three/fiber';
import { useScroll, PresentationControls } from '@react-three/drei';
import { useState, useEffect, useRef, memo, useLayoutEffect, Suspense } from 'react';
import { useControls } from 'leva';
import { useSpring, animated, easings, config } from '@react-spring/three';
import * as THREE from 'three';

import CollectionInfo from './CollectionInfo.jsx';
import { Modes, useMode } from '../utils/mode.js';
import ModelInfo from './ModelInfo.jsx';

/**
 * TODO: 
 * - fix freez happens in pres mode (only current Chrome?)
 */

export default function Collection({ 
  index, 
  content: { elements, title, description }, 
  point 
}) {
  console.log('collection');

  const scroll = useScroll();

  const camera = useThree(state => state.camera);
  const { height } = useThree(state => state.viewport);

  const modelContainerOfMoving = useRef();
  const modelContainerOfRotating = useRef();

  // set model which is far and start moving it closer to camera
  const nearestModelCondidate = useRef(null);

  // if false when collection is not active
  const isCollectionActive = useRef(false);

  // timer to process click-and-wait action to activate PRES mode
  const timerId = useRef();

  // models in collection
  const modelsRef = useRef( Array(elements.length) );

  // ref of collection
  const ref = useRef();

  // used both in SCROLL and PRES modes to show info about collection/selected model, 
  // and locate all moved parts
  const [isCollectionSelected, setIsCollectionSelected] = useState(false);

  // trigger to show animation when collection is in view, but is not active yet
  const [isCollectionVisible, setIsCollectionVisible] = useState(false);

  // model which is used to fetch info for PRES mode
  const [selectedModel, setSelectedModel] = useState(null);
  
  const { 
    distanceToOY: distanceCollectionOY,
    rotationSpeed: collectionRotationSpeed,
    hoveredRotaionSpeed: collectionHoveredRotationSpeed,
    hoveredRotationLambda: collectionHoveredRotationLambda,
    rotationDelta: collectionRotationDelta,
    radiusModelCenter,
    vectorToMoveModelsContainerOnScrollSelected,
    vectorToMoveModelsContainerOnPresSelected,
    visibleDelta,
    activeDelta,
    collectionInfoPosition,
    modelInfoPosition,
    polar,
    azimuth,
    title: collectionTitle,
    description: collectionDescription
  } = useControls(
    `Collection #${index}`,
    {
      distanceToOY: { value: 5, min: 0, max: 25, label: 'dist: col -> OY' },
      rotationSpeed: { value: 0.05, min: 0, max: 1, label: 'rot: init' },
      hoveredRotaionSpeed: { value: 5, min: 0, max: 10, label: 'rot: hovered' },
      hoveredRotationLambda: { value: 3, min: 1, max: 10, label: 'lam: rot', hint: 'how fast target value is gonna be reached' },
      rotationDelta: { value: 1, min: 0, max: 4, label: 'del: . -> rot', hint: 'distance from center to model toward camera' },
      vectorToMoveModelsContainerOnScrollSelected: { value: [3, 0, 0], label: 'pos: mod -> selected(SCROLL)' },
      vectorToMoveModelsContainerOnPresSelected: { value: [-4, 0, 2], label: 'pos: mod -> selected(PRES)' },
      radiusModelCenter: { value: 2, min: 1, max: 5, label: 'dist: center -> mod' },
      visibleDelta: { value: height * 1.5, min: 0.5, max: height * 1.5, label: 'del: visible'},
      activeDelta: { value: height / 4, min: 0.5, max: height / 2, label: 'del: active'},
      collectionInfoPosition: { value: [- 5.75, 1, 0], label: 'pos: col info' },
      modelInfoPosition: { value: [4.5, 0, 0], label: 'pos: mod info' },
      polar: { value: 30, min: 0, max: 360, step: 1, label: 'angle, vert: mod' },
      azimuth: { value: 30, min: 0, max: 360, step: 1, label: 'angle, horiz: mod' },
      title,
      description
    },
    [title, description, height]
  );

  const collectionPosition = [distanceCollectionOY * point.x, point.y, distanceCollectionOY * point.z];
  
  const collectionRotation = useRef(collectionRotationSpeed);

  const defaultValues = { 
    scale: 0.1, 
    rotation: [0, 0, 0],
    opacity: 0.5, 
    position: [0, 0, 0]
  };
  
  const [spring, springApi] = useSpring(
    () => ({
      scale: defaultValues.scale,
      rotation: defaultValues.rotation,
      modelsContainerPosition: defaultValues.position,
      opacity: defaultValues.opacity,

      config: key => {
        if (key === 'scale') return { mass: 2, ...config.wobbly }
        else if (key === 'rotation') return { duration: 1000, easing: easings.easeOutCubic }
        else return {};
      }
    }),
    []
  );

  useLayoutEffect( 
    () => {
      ref.current.lookAt(
        (1 + distanceCollectionOY) * point.x, 
        point.y, 
        (1 + distanceCollectionOY) * point.z
      );

      modelsRef.current.forEach( model => model.rotation.set( ...Array(3).fill(Math.random() * 2 * Math.PI) ) );
    },
    [] 
  );

  const [mode, modeActions] = useMode(
    Modes.SCROLL, 
    currentMode => {
      if (currentMode === Modes.PRESENTATION) {
        console.log('** NEED to handle PRESENTATION mode');

        scroll.el.style.overflow = "hidden";

        setIsCollectionSelected(true);

      } else if (currentMode === Modes.SCROLL) {
        console.log('** NEED to handle SCROLL mode');

        scroll.el.style.overflow = "auto";

        setSelectedModel(null);
      }
    },
    [ isCollectionSelected ]
  );

  useEffect( 
    () => {
      if (mode.current === Modes.SCROLL) {
        springApi.start(
          isCollectionSelected
          ?
            { 
              rotation: [
                modelContainerOfRotating.current.rotation.x + Math.PI,
                modelContainerOfRotating.current.rotation.y - Math.PI,
                modelContainerOfRotating.current.rotation.z
              ],              
              modelsContainerPosition: vectorToMoveModelsContainerOnScrollSelected
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
      } else if (mode.current === Modes.PRESENTATION) {
        springApi.start(
          isCollectionSelected
          ?
            { modelsContainerPosition: vectorToMoveModelsContainerOnPresSelected }
          :
            { modelsContainerPosition: defaultValues.position }
        );
      }
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
    }, 
    [index, isCollectionVisible] 
  );

  useFrame(
    (state, delta) => {
      modelContainerOfMoving.current.rotation.y += calculateModelContainerRotation(delta) * delta;

      modelsRef.current.forEach(model => {
        model.rotation.x += collectionRotationSpeed * delta;
        model.rotation.y += collectionRotationSpeed * delta;
        model.rotation.z += collectionRotationSpeed * delta;
      });

      const isCollectionInActiveRange = Math.abs(state.camera.position.y - collectionPosition[1]) < activeDelta;
      if (isCollectionInActiveRange) {

        if (isCollectionActive.current === false)
          onCollectionInActiveRange(true);

      } else {

        if (isCollectionActive.current === true)
          onCollectionInActiveRange(false);

      }

      const isCollectionInVisibleRange = Math.abs(state.camera.position.y - collectionPosition[1]) < visibleDelta;
      if (isCollectionInVisibleRange) {

        if (isCollectionVisible === false) 
          setIsCollectionVisible(true);

      } else {

        if (isCollectionVisible === true)
          setIsCollectionVisible(false);

      }
    }
  );

  const [modelInfoContent, setModelInfoContent] = useState(null);

  useEffect(
    () => {
      const index = modelsRef.current.findIndex(model => model === selectedModel);
    
      setModelInfoContent(index > - 1 ? elements[index].info : null);
    },
    [selectedModel, elements]
  );

  return (   
    <group ref={ ref } position={ collectionPosition }>
      <CollectionInfo 
        position={ collectionInfoPosition } 
        title={ collectionTitle } 
        description={ collectionDescription }
        visible={ mode.current === Modes.SCROLL && isCollectionSelected } 
      />
      <ModelInfo 
        content={ modelInfoContent }
        position={ modelInfoPosition }
        visible={ mode.current === Modes.PRESENTATION && modelInfoContent !== null }
      />
      <animated.group ref={ modelContainerOfMoving } position={ spring.modelsContainerPosition }>
        <animated.group
          ref={ modelContainerOfRotating}
          rotation={ spring.rotation}
          scale={ spring.scale}
          onPointerEnter={ onModelContainerOfRotatingPointerEnter }
          onPointerLeave={ onModelContainerOfRotatingPointerLeave }
          onClick={ onModelContainerOfRotatingClick }
          onPointerDown={ onModelContainerOfRotatingPointerDown }
          onPointerUp={ onModelContainerOfRotatingPointerUp }
          onPointerMissed={ onCollectionPointerMissed }
          onDoubleClick={ onModelContainerOfRotatingDoubleClick }
        >
          {
            elements.map(
              (element, index) => (
                <group 
                  key={ index } 
                  position={ [...calculateModelPosition(index)] } 
                  scale={ 1 - 0.5 * (1 + index) / elements.length }
                >
                  <PresentationControls 
                    global={ false }
                    enabled={
                      mode.current === Modes.PRESENTATION 
                      && modelsRef.current[index] === selectedModel
                    }
                    polar={ [- THREE.MathUtils.degToRad(polar), THREE.MathUtils.degToRad(polar)] }
                    azimuth={ [- THREE.MathUtils.degToRad(azimuth), THREE.MathUtils.degToRad(azimuth)] }
                    config={{ mass: 2, tension: 400 }}
                    snap={{ mass: 4, tension: 400 }}
                  >
                    <Suspense>
                      <element.model ref={ modelRef => modelsRef.current[index] = modelRef } opacity={ spring.opacity } />
                    </Suspense>
                  </PresentationControls>
                </group>  
              )
            )
          }
        </animated.group>
      </animated.group>
    </group>
  );

  function onCollectionInActiveRange(value) {
    isCollectionActive.current = value;

    if (isCollectionActive.current) {

      springApi.start({ opacity: 1 });

    } else {
      springApi.start({ opacity: defaultValues.opacity });
      setIsCollectionSelected(false);
    }
  }

  function isModelFar(model) {

    if (modelsRef.current.length === 1)
      return false;

    // world position of hovered model
    const modelWorldPosition = new THREE.Vector3();
    model.getWorldPosition(modelWorldPosition);
    
    // world position of center of models
    const centerWorldPosition = new THREE.Vector3();
    modelContainerOfRotating.current.getWorldPosition(centerWorldPosition);

    // (world) position of camera
    const cameraPosition = camera.position;

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
    const length = modelContainerOfRotating.current?.children.length ?? 1;
    
    if (length === 1) 
      return new THREE.Vector3();

    const angle = 2 * Math.PI * index / length;

    // x
    const x = radiusModelCenter * Math.sin(angle);

    //y 
    const y = 0;

    // z
    const z = radiusModelCenter * Math.cos(angle);

    return new THREE.Vector3(x, y, z);
  };

  function onModelContainerOfRotatingPointerEnter(event) {
    if (isCollectionActive.current === false)
      return;

    // console.log('*** enter', mode.current);

    event.stopPropagation();

    // set nearest model condidate
    const model = event.object;
    if (isModelFar(model))
      nearestModelCondidate.current = model;

    if (mode.current === Modes.PRESENTATION)
      setSelectedModel(event.object);
  }
  
  function onModelContainerOfRotatingPointerLeave(event) {
    if (isCollectionActive.current === false)
      return;

    // console.log('*** leave', mode.current);

    event.stopPropagation();

    // reset nearest model condidate
    nearestModelCondidate.current = null;

    // stop processing of click-and-wait (SCROLL -> PRES)
    if (mode.current === Modes.SCROLL) {
      clearTimeout(timerId.current); 
      timerId.current = null;
      modeActions.resetNext();
    }
  }

  function onModelContainerOfRotatingClick(event) {
    if (isCollectionActive.current === false)
      return;

    // console.log('___clicked', mode.current);

    // event.stopPropagation();
  }
  
  function onModelContainerOfRotatingPointerDown(event) {
    if (isCollectionActive.current === false)
      return;

    // console.log('___down', mode.current);

    event.stopPropagation();

    if (mode.current === Modes.SCROLL) {
      timerId.current = setTimeout(
        // !!! shouldn't be called if cursor beyond any model
        () => {
          console.log('__mode change queued: SCROLL -> PRES');

          // queue next and apply when pointer goes up
          modeActions.setNext(Modes.PRESENTATION);
  
          // clear the timer
          timerId.current = null;
        },
        2000
      );
    }
  }

  function onModelContainerOfRotatingPointerUp(event) {
    if (isCollectionActive.current === false)
      return;

    event.stopPropagation();

    // console.log('___up', mode.current);

    if (mode.current === Modes.SCROLL) {
      // stop processing of click-and-wait (SCROLL -> PRES)
      // note: next will be reseted during handling of current mode
      clearTimeout(timerId.current);
      timerId.current = null;

      // simple click
      if (mode.next === null) {

        setIsCollectionSelected(currentValue => !currentValue);

      // mode change has been called - handle it
      } else if (mode.next === Modes.PRESENTATION) {
        // if colllection is selected in current mode, then unselect it
        if (isCollectionSelected) {
  
          setIsCollectionSelected(false);
  
        }
  
        // set selected model for PRES mode
        setSelectedModel(event.object);

        // change current mode 
        modeActions.applyNextToCurrent();
      }  
    }
  }

  function onCollectionPointerMissed(event) {
    if (isCollectionActive.current === false)
      return;

    event.stopPropagation();
    
    // console.log('clicked outside of collection');
  }

  function onModelContainerOfRotatingDoubleClick(event) {
    if (isCollectionActive.current === false)
      return;

    // console.log('___double clicked', mode.current);

    event.stopPropagation();

    if (mode.current === Modes.PRESENTATION) {
      setIsCollectionSelected(false);
      modeActions.applyNextToCurrent(Modes.SCROLL);
    }
  }
};
