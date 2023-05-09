import * as THREE from 'three'
import { extend } from '@react-three/fiber'

class CurvePointsMaterial extends THREE.ShaderMaterial {
  constructor(alphaMap) {
    super({
      vertexShader: `
        uniform sampler2D positions;
        uniform float uTime;
        uniform float uOpacity;
        
        void main() { 
          vec3 pos = texture2D(positions, position.xy).xyz;
          vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
        
          gl_Position = projectedPosition;

          gl_PointSize = 3.0;
          gl_PointSize *= step(1.0 - (1.0/64.0), position.x) + 0.5; 
        }
      `, 
      fragmentShader: `
        uniform float uOpacity;
        uniform sampler2D uAlphaMap;

        void main() {
          vec4 map = texture2D(uAlphaMap, gl_PointCoord);

          gl_FragColor = vec4(map.xyz, map.a * uOpacity);
        }
      `,
      uniforms: {
        positions: { value: null },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uAlphaMap: { value: alphaMap }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false
    })
  }
}

extend({ CurvePointsMaterial })