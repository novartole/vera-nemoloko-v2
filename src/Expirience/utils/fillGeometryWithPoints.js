import * as THREE from 'three';

// idea is taken from https://discourse.threejs.org/t/how-fill-a-loaded-stl-mesh-not-simple-shapes-like-cube-etc-with-random-particles-and-animate-with-this-geometry-bound-in-three-js/4702/6

const ray = new THREE.Ray();

const direction = new THREE.Vector3(1, 1, 1).normalize();

const a = new THREE.Vector3();
const b = new THREE.Vector3(); 
const c = new THREE.Vector3();

const target = new THREE.Vector3();

export default function fillGeometryWithPoints(geometry, count) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;

  const points = [ ...Array(count) ].map( () => findRandomVectorInsideGeometry() );
  
  return new THREE.BufferGeometry().setFromPoints(points);

  function isPointInsideGeometry(pointCondidate) {
    ray.set(pointCondidate, direction);
  
    let counter = 0;
    
    const position = geometry.attributes.position;
    const faces = position.count / 3;
  
    for(let i = 0; i < faces; i++) {
      a.fromBufferAttribute(position, i * 3 + 0);
      b.fromBufferAttribute(position, i * 3 + 1);
      c.fromBufferAttribute(position, i * 3 + 2);
  
      if ( ray.intersectTriangle(a, b, c, false, target) ) counter++;
    }
    
    return counter % 2 == 1;
  }

  function findRandomVectorInsideGeometry(){
    const pointCondidate = new THREE.Vector3(
      THREE.MathUtils.randFloat(min.x, max.x),
      THREE.MathUtils.randFloat(min.y, max.y),
      THREE.MathUtils.randFloat(min.z, max.z)
    );
  
    return isPointInsideGeometry(pointCondidate) ? pointCondidate : findRandomVectorInsideGeometry();
  }
}