import * as THREE from 'three';
import { extend } from '@react-three/fiber';
// import glsl from 'babel-plugin-glsl/macro';

import curlNoise from '../curlNoise.js';

const transformToArrayOfVec4 = (positionAttribute, fourthValue = 0) => {
  const length = positionAttribute.count;

  const data = new Float32Array(length * 4);

  for (let i = 0; i < length; i++) {
    const i4 = i * 4;
    const i3 = i * 3;
    
    data[i4 + 0] = positionAttribute.array[i3 + 0];
    data[i4 + 1] = positionAttribute.array[i3 + 1];
    data[i4 + 2] = positionAttribute.array[i3 + 2];
    data[i4 + 3] = fourthValue;
  }

  return data;
}

export class TextAsPointsSimulationMaterial extends THREE.ShaderMaterial {
  constructor(size, positionAttribute) {
    const positionsTexture = new THREE.DataTexture(
      transformToArrayOfVec4(positionAttribute), 
      size, 
      size, 
      THREE.RGBAFormat, 
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    super({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;

          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
        
          gl_Position = projectedPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D positions;
        uniform float uTime;
        uniform float uScroll;
        
        varying vec2 vUv;

        //#pragma glslify: curl = require(glsl-curl-noise2)
        //#pragma glslify: noise = require(glsl-noise/classic/3d.glsl)      

        ${curlNoise}

        void main() {
          float t = uTime * 0.015;

          vec4 point = texture2D(positions, vUv);
          vec3 pos = point.rgb;
          pos += curlNoise(pos + t * 0.2) * mix(0.005, 50.0, uScroll);
          pos += curlNoise(pos + t * 2.0) * 0.001;
          pos += curlNoise(pos + t * 10.0) * 0.05;

          gl_FragColor = vec4(pos, 1.0);
        }
      `,
      uniforms: {
        positions: { value: positionsTexture },
        uTime: { value: 0 },
        uScroll: { value: 0 }
      }
    });
  }
};

extend({ TextAsPointsSimulationMaterial });