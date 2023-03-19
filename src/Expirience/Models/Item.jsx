import { useThree, useFrame } from '@react-three/fiber';
import { useScroll, useIntersect, Center } from '@react-three/drei';
import { useState, useEffect, useRef, useMemo, memo, useLayoutEffect, useCallback } from 'react';
import { useControls } from 'leva';
import { useSpring, animated, easings, config } from '@react-spring/three';
import * as THREE from 'three';

export default memo(function Item({ 
  index, 
  calculateItemPosition,
  calculateItemGlobalRange,
  calculateItemRangeDelta,
  onItemVisibilityChanged, 
  ...props 
}) {
  console.log('item');

  const scroll = useScroll();

  const outerItemGroupRef = useRef();
  const innerItemGroupRef = useRef();

  const { 
    distanceToOY,
    itemRangeDelta,
    itemRotationSpeed,
    distanceModelModel,
    distanceToMove
  } = useControls(
    'Item',
    {
      /* 
        TODO: changing of this field works strangly,
        and requieres one more re-render to be applied correctly
      */
      distanceToOY: { value: 5, min: 0, max: 25 },

      itemRangeDelta: { value: 0.5, min: 0.1, max: 1 },
      itemRotationSpeed: { value: 0.05, min: 0, max: 1 },
      distanceModelModel: { value: 2, min: 1, max: 5 },
      distanceToMove: { value: 3, min: 1, max: 5 }
    }
  );

  const range = useMemo(
    () => calculateItemGlobalRange(index), 
    [index, calculateItemGlobalRange] 
  );

  const rangeDelta = useMemo(
    () => calculateItemRangeDelta(itemRangeDelta), 
    [itemRangeDelta, calculateItemRangeDelta] 
  );

  const defaultValues = useMemo(
    () => ({ 
      scale: 0.1, 
      rotation: Array(3).fill( 2 * Math.PI * Math.random() ),
      opacity: 0.2, 
      position: [ ...calculateItemPosition(index, distanceToOY) ] 
    }),
    [calculateItemPosition, index, distanceToOY]
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
      moveDirection.multiplyScalar(distanceToMove);
      const newPosition = itemInitPosition
        .clone()
        .add(moveDirection); 

      return newPosition;
    },
    [defaultValues, distanceToMove]
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
          rotation: defaultValues.rotation.map(value => value + Math.PI / 1.5), 
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

  const modelRefs = [model_1_ref, model_2_ref];

  useLayoutEffect( 
    () => {
      modelRefs.forEach(ref => {
        ref.current.rotation.set( ...Array(3).fill(Math.random() * 2 * Math.PI) );
      });
    }, 
    [] 
  );

  const isItemHightlighted = useRef(false);

  useFrame(
    (state, delta) => {
      const item = outerItemGroupRef.current;

      item.rotation.x += itemRotationSpeed * delta;
      item.rotation.y += itemRotationSpeed * delta;
      item.rotation.z += itemRotationSpeed * delta;

      modelRefs.forEach(ref => {
        const model = ref.current;

        model.rotation.x += itemRotationSpeed * delta;
        model.rotation.y += itemRotationSpeed * delta;
        model.rotation.z += itemRotationSpeed * delta;
      });

      const scrollRange = scroll.curve(range - rangeDelta, 2 * rangeDelta);
      if (scrollRange > scroll.eps) {

        if (isItemHightlighted.current == false)
          onItemHightlighted(true);

        // item.position.set(
        //   THREE.MathUtils.lerp(defaultValues.position[0], movedItemPosition.x, scrollRange),
        //   THREE.MathUtils.lerp(defaultValues.position[1], movedItemPosition.y, scrollRange),
        //   THREE.MathUtils.lerp(defaultValues.position[2], movedItemPosition.z, scrollRange)
        // );

      } else {

        if (isItemHightlighted.current == true)
          onItemHightlighted(false);

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
      >
        <Center>
          <animated.mesh 
            position={ [0, 0, 0] }
            ref={ model_1_ref }
            onClick={ onModelClickHandler }
            { ...props }
          >
            <animated.meshNormalMaterial
              opacity={ itemSprings.opacity }
              transparent
            />
            <boxGeometry />
          </animated.mesh>

          <animated.mesh 
            position={ [0, distanceModelModel, 0] }
            ref={ model_2_ref }
            onClick={ onModelClickHandler }
            { ...props }
          >
            <animated.meshNormalMaterial
              opacity={ itemSprings.opacity }
              transparent
            />
            <boxGeometry />
          </animated.mesh>
        </Center>
      </animated.group> 
    </animated.group> 
  );

  function onModelClickHandler(event) {    
    event.stopPropagation();
    
    setItemClicked(currentValue => !currentValue);
  }

  function onItemHightlighted(value) {
    isItemHightlighted.current = value;

    itemApi.start(
      isItemHightlighted.current
      ?
        { opacity: 1 }
      :
        { opacity: defaultValues.opacity }
    );
  }

  function setItemVisibility() {
    setIsItemVisible(isModel_1_visible.current || isModel_2_visible.current)
  }
})