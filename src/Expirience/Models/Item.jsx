import { useThree, useFrame } from '@react-three/fiber';
import { useScroll, useIntersect, Center } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo, memo, useLayoutEffect, useCallback } from 'react';
import { useControls } from 'leva';
import { useSpring, animated, easings, config } from '@react-spring/three';
import * as THREE from 'three';

/**
 * TODO:
 * - onClick HTML
 * - onWaitClick presentation mode
 */

export default memo(function Item({
  index, 
  calculateItemPosition,
  calculateItemGlobalRange,
  calculateItemRangeDelta,
  onItemVisibilityChanged, 
  ...props 
}) {
  console.log('item');

  const outerItemGroupRef = useRef();
  const innerItemGroupRef = useRef();

  const scroll = useScroll();

  const getThree = useThree(state => state.get);

  const { 
    distanceToOY: distanceItemOY,
    rangeDelta: itemRangeDelta,
    rotationSpeed: itemRotationSpeed,
    hoveredRotaionSpeed: itemHoveredRotationSpeed,
    hoveredRotationLambda: itemHoveredRotationLambda,
    rotationDelta: itemRotationDelta,
    radiusModelCenter,
    distanceToMove: distanceToMoveItem
  } = useControls(
    'Item',
    {
      /* 
        TODO: changing of this field works strangly,
        and requieres one more re-render to be applied correctly
      */
      distanceToOY: { value: 5, min: 0, max: 25 },

      rangeDelta: { value: 0.5, min: 0.1, max: 1 },
      rotationSpeed: { value: 0.05, min: 0, max: 1 },
      hoveredRotaionSpeed: { value: 5, min: 0, max: 10 },
      hoveredRotationLambda: { value: 3, min: 1, max: 10 },
      rotationDelta: { value: 1, min: 0, max: 4 },
      radiusModelCenter: { value: 2, min: 1, max: 5 },
      distanceToMove: { value: 3, min: 1, max: 5 }
    }
  );

  const defaultValues = useMemo(
    () => ({ 
      scale: 0.1, 
      rotation: Array(3).fill(0),
      opacity: 0.2, 
      position: [ ...calculateItemPosition(index, distanceItemOY) ] 
    }),
    [calculateItemPosition, index, distanceItemOY]
  );
  
  const [itemSprings, itemApi] = useSpring(
    () => ({
      scale: defaultValues.scale,
      rotation: defaultValues.rotation,
      position: defaultValues.position,
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
    [ defaultValues ]
  );

  const movedItemPosition = useMemo(
    () => {
      const itemInitPosition = new THREE.Vector3( ...defaultValues.position )
      const itemPostionProjectedOnOY = new THREE.Vector3(0, itemInitPosition.y, 0);
      const directionFromItemPosition = itemInitPosition
        .clone()
        .sub(itemPostionProjectedOnOY);
      const moveDirection = directionFromItemPosition.clone();
      moveDirection.normalize();
      moveDirection.applyEuler(
        new THREE.Euler(
          0,
          Math.PI * 0.5,
          0
        )
      );
      moveDirection.multiplyScalar(distanceToMoveItem);
      const newPosition = itemInitPosition
        .clone()
        .add(moveDirection); 

      return newPosition;
    },
    [defaultValues, distanceToMoveItem]
  );

  const [isItemClicked, setItemClicked] = useState(false);

  useEffect( 
    () => {
      itemApi.start(
        isItemClicked
        ?
          { 
            rotation: innerItemGroupRef.current.rotation
              .toArray()
              .slice(0, -1)
              .map(value => value + Math.PI), 
              
            position: [ ...movedItemPosition ] 
          }
        :
          { 
            rotation: innerItemGroupRef.current.rotation
              .toArray()
              .slice(0, -1)
              .map(value => value - Math.PI), 

            position: defaultValues.position 
          }
      );
    }, 
    [ isItemClicked ] 
  ); 

  const [isItemVisible, setIsItemVisible] = useState(false);

  useEffect( 
    () => {
      if (isItemVisible) {
        itemApi.start({ 
          rotation: defaultValues.rotation.map(value => value + (Math.random() - 0.5) * 2 * Math.PI * 0.1 + Math.PI), 
          scale: 1 
        });
      } else {
        itemApi.set({ 
          rotation: defaultValues.rotation, 
          scale: defaultValues.scale 
        });
      }

      onItemVisibilityChanged(index, isItemVisible);
    }, 
    [index, isItemVisible] 
  );

  const isModel_1_visible = useRef(false);

  const model_1_ref = useIntersect( 
    visible => {
      isModel_1_visible.current = visible;

      setItemVisibility();
    } 
  );

  const isModel_2_visible = useRef(false);

  const model_2_ref = useIntersect( 
    visible => {
      isModel_2_visible.current = visible;

      setItemVisibility();
    } 
  ); 

  const isModel_3_visible = useRef(false);

  const model_3_ref = useIntersect( 
    visible => {
      isModel_3_visible.current = visible;

      setItemVisibility();
    } 
  ); 

  const modelRefs = [model_1_ref, model_2_ref, model_3_ref];

  useLayoutEffect( 
    () => {
      modelRefs.forEach(ref => {
        ref.current.rotation.set( ...Array(3).fill(Math.random() * 2 * Math.PI) );
      });
    }, 
    [] 
  );

  const itemRotation = useRef(itemRotationSpeed);
  
  const hoveredModel = useRef(null);

  const range = calculateItemGlobalRange(index);
  const rangeDelta = calculateItemRangeDelta(itemRangeDelta);

  const isItemInRange = useRef(false);

  useFrame(
    (state, delta) => {
      const item = outerItemGroupRef.current;
      item.rotation.y += calculateRotation(delta) * delta;

      modelRefs.forEach(ref => {
        const model = ref.current;

        model.rotation.x += itemRotationSpeed * delta;
        model.rotation.y += itemRotationSpeed * delta;
        model.rotation.z += itemRotationSpeed * delta;
      });

      const isScrollRangeVisible = scroll.visible(range - rangeDelta, 2 * rangeDelta);
      if (isScrollRangeVisible) {
        if (isItemInRange.current === false)
          onItemInRange(true);

      } else {

        if (isItemInRange.current === true)
          onItemInRange(false);

      }
    }
  );

  return ( 
    <animated.group 
      ref={ outerItemGroupRef }
      position={ itemSprings.position }
    >
      <animated.group
        ref={ innerItemGroupRef } 
        rotation={ itemSprings.rotation }
        scale={ itemSprings.scale }
        onPointerEnter={ 
          event => {
            if (isItemInRange.current === false)
              return;

            event.stopPropagation();

            const model = event.object;
            if ( isModelFar(model) )
              hoveredModel.current = model;
          }
        } 
        onPointerLeave={ 
          event => {
            if (isItemInRange.current === false)
              return;

            event.stopPropagation();

            hoveredModel.current = null 
          } 
        }
        onClick={ 
          event => {
            if (isItemInRange.current === false)
              return;

            event.stopPropagation();
    
            setItemClicked(currentValue => !currentValue);
          }
         }
      >
        <animated.mesh 
          ref={ model_1_ref }
          position={ [ ...calculateModelPosition(0) ] }
          { ...props }
        >
          <animated.meshNormalMaterial
            transparent
            opacity={ itemSprings.opacity }
          />
          <boxGeometry />
        </animated.mesh>

        <animated.mesh 
          ref={ model_2_ref }
          position={ [ ...calculateModelPosition(1) ] }
          { ...props }
        >
          <animated.meshNormalMaterial
            transparent
            opacity={ itemSprings.opacity }
          />
          <boxGeometry />
        </animated.mesh>

        <animated.mesh 
          ref={ model_3_ref }
          position={ [ ...calculateModelPosition(2) ] }
          { ...props }
        >
          <animated.meshNormalMaterial
            transparent
            opacity={ itemSprings.opacity }
          />
          <boxGeometry />
        </animated.mesh>
      </animated.group> 
    </animated.group> 
  );

  function onItemInRange(value) {
    isItemInRange.current = value;

    itemApi.start(
      isItemInRange.current
      ?
        { opacity: 1 }
      :
        { opacity: defaultValues.opacity }
    );
  }

  function setItemVisibility() {
    setIsItemVisible(
      isModel_1_visible.current 
      || isModel_2_visible.current
      || isModel_3_visible.current  
    );
  }

  function isModelFar(model) {

    // world position of hovered model
    const modelWorldPosition = new THREE.Vector3();
    model.getWorldPosition(modelWorldPosition);
    
    // world position of center of models
    const centerWorldPosition = new THREE.Vector3();
    innerItemGroupRef.current.getWorldPosition(centerWorldPosition);

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

    return distanceFromCameraToCenterProjection - distanceFromCameraToModel < itemRotationDelta;
  }

  function calculateRotation(deltaTime) {
    if (innerItemGroupRef.current === undefined)
      return 0;

    const model = hoveredModel.current;
    if (model === null)
      return itemRotation.current = 
        THREE.MathUtils.damp(itemRotation.current, itemRotationSpeed, itemHoveredRotationLambda, deltaTime);

    return itemRotation.current =
      isModelFar(model)
      ? 
        THREE.MathUtils.damp(itemRotation.current, itemRotationSpeed + itemHoveredRotationSpeed, 1 / itemHoveredRotationLambda, deltaTime)
      : 
        THREE.MathUtils.damp(itemRotation.current, itemRotationSpeed, itemHoveredRotationLambda, deltaTime);
  }

  function calculateModelPosition(index) {
    const angle = 2 * Math.PI * index / innerItemGroupRef.current?.children.length ?? 1;

    // x
    const x = radiusModelCenter * Math.sin(angle);

    //y 
    const y = 0;

    // z
    const z = radiusModelCenter * Math.cos(angle);

    return new THREE.Vector3(x, y, z);
  };
})