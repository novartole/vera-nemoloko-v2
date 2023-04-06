import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

export class Modes {
  static SCROLL = 0;
  static PRESENTATION = 1;
}
  
export const useMode = (mode, onModeChange, deps) => {
  const onModeChangeHandler = useRef(null);

  const [current, setCurrent] = useState(mode);
  const [next, setNext] = useState(null);

  useEffect(
    () => {
      if (onModeChangeHandler.current !== null)
        onModeChangeHandler.current(current, next);
    },
    [ current ]
  );

  useEffect(
    () => { onModeChangeHandler.current = onModeChange },
    [ ...deps ]
  );

  return [
    {
      current, 
      next
    }, 
    {
      setNext: (mode) => { setNext(mode) },
      resetNext: () => { setNext(null) },
      applyNextToCurrent: () => {
        if (next === null)
          return;
    
        setCurrent(next);
        setNext(null);
      },
      toggleNextByCurrent: (modeA, modeB) => {
        if (current === modeA) {

          setNext(modeB);

        } else if (current === modeB) {

          setNext(modeA);

        }
      }
    }
  ];
};