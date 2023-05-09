import { useRef, useState, useMemo, Children } from 'react';
import { useFrame, createPortal } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

const isSimulationMaterial = 
  material => material?.type?.search(/SimulationMaterial$/) > 0 ?? false;

const isPointsMaterial = 
  material => material?.type?.search(/PointsMaterial$/) > 0 ?? false;

export default function FBOPoints({ children, size }) {
  console.log('____FBOPoints');

  if (Children.count(children) !== 2)
    throw new Error('Two arguments as children must be provided');

  const simulationMaterial = children.find( child => isSimulationMaterial(child) );
  const pointsMaterial = children.find( child => isPointsMaterial(child) );

  const [ scene ] = useState( () => new THREE.Scene() );
  const [ camera ] = useState( () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1) )
  const [ positions ] = useState(
    () => new Float32Array([
      -1, -1, 0, 
      1, -1, 0, 
      1, 1, 0, 
      -1, -1, 0, 
      1, 1, 0, 
      -1, 1, 0
    ])
  );
  const [ uvs ] = useState( () => new Float32Array([
    0, 1, 1, 
    1, 1, 0, 
    0, 1, 1, 
    0, 0, 0])
  );

  const target = useFBO(
    size, 
    size, 
    {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType
    }
  );

  const particles = useMemo(
    () => {
      const length = size * size
      const particles = new Float32Array(length * 3)
      for (let i = 0; i < length; i++) {
        let i3 = i * 3
        particles[i3 + 0] = (i % size) / size
        particles[i3 + 1] = i / size / size
      };

      return particles
    }, 
    [ size ]
  );

  useFrame(
    state => {
      state.gl.setRenderTarget(target)
      state.gl.clear()
      state.gl.render(scene, camera)
      state.gl.setRenderTarget(null)

      if (pointsMaterial.ref?.current)
        pointsMaterial.ref.current.uniforms.positions.value = target.texture;
    }
  );

  return (
    <>
      {
        createPortal(
          <mesh>
            { simulationMaterial }
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={ positions.length / 3 } array={ positions } itemSize={ 3 } />
              <bufferAttribute attach="attributes-uv" count={ uvs.length / 2 } array={ uvs } itemSize={ 2 } />
            </bufferGeometry>
          </mesh>,
          scene
        )
      }
      <points>
        { pointsMaterial }
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count= { particles.length / 3 } array={ particles } itemSize={ 3 } />
        </bufferGeometry>
      </points>
    </>
  );
};