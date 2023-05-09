import * as THREE from 'three';
import { extend } from '@react-three/fiber';
// import glsl from 'babel-plugin-glsl/macro';

import curlNoise from '../curlNoise.js';

const getPositions = (size, curve) => {
  const length = size * size * 4;

  const data = new Float32Array(length);
  const points = curve.getPoints(size * size - 1);

  for (let i = 0; i < length / 4; i += 4) {
    const offset = 1 - THREE.MathUtils.pingpong(i, length / 8) / (length / 8);
    const point = points[i];

    const distance = offset * 0.05 + 0.01;
    data[i] = point.x + (Math.random() - 0.5) * 2 * distance;
    data[i + 1] = point.y + (Math.random() - 0.5) * 2 * distance;
    data[i + 2] = point.z + (Math.random() - 0.5) * 2 * distance;

    data[i + 3] = offset;
  }

  return data;
}

class CurveSimulationMaterial extends THREE.ShaderMaterial {
  constructor(size, curve) {
    const positionsTexture = new THREE.DataTexture(
      getPositions(size, curve), 
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
          float distance = point.a + uScroll * 50.0;
          pos += curlNoise(pos + t * 0.55) * distance;
          pos += curlNoise(pos + t) * 0.05;
          pos += curlNoise(pos + t) * 0.15;

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

extend({ CurveSimulationMaterial });