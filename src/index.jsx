const isTraining = false;

if (isTraining) {
  const moveZeros = arr => {
    return arr.reduceRight(
      (previousValue, currentValue) => 
        ( currentValue === 0 ? previousValue.push(0) : previousValue.unshift(currentValue) ) 
        && previousValue, 
      [] 
    );
  }


  const getResult = moveZeros;

  const foo = undefined
  const t1 = [false,1,0,1,2,0,1,3,"a"] // false,1,1,2,1,3,"a",0,0
  const t2 = [ NaN, {}, null, foo, 0, false, 0, '0', undefined, 0, false, "a"] 
  const t3 = [1,2,0,1,0,1,0,3,0,1]; const t3_r = [1, 2, 1, 1, 3, 1, 0, 0, 0, 0];
  const t4 = [0, 1];
  const t5 = [NaN, 0,1];

  const input = t5;

  console.log('___input:', input);
  const r = getResult(input)
  console.log('___result:', r);

  // for (const key in r) {
  //   if (Object.hasOwnProperty.call(r, key)) {
  //     const element = r[key];
  //     console.log('test', element, t3_r[key]);
  //   }
  // }

  // r.forEach( (v, i) => {
  //   if (v != t3_r[i]) 
  //     console.log(v, t3_r[i]);
  // })
  
  // let eq = true;
  // r.forEach( (v, i, arr) => {
  //   eq = eq && (v === t2_result[i]);

  //   if (!eq) console.log(v, t2_result[i]);
    
  // });

  // console.log(eq);
}

// ----------------------------------------

import './style.css'

import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react';

import App from './Expirience/App.jsx';

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(!isTraining && 
  // <StrictMode>
    <App />
  // </StrictMode>
);