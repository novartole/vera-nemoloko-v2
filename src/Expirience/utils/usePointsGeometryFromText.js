import { useFont } from '@react-three/drei';
import { useMemo } from 'react';

import fillGeometryWithPoints from './fillGeometryWithPoints.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default function usePointGeometryFromText(text, textProps, count) {
  const { font: fontAsString, ...props } = textProps;
  const font = useFont(fontAsString);
  const pointsGeometry = useMemo(
    () => {
      const textGeometry = new TextGeometry(text, { font, ...props });
      textGeometry.center();

      const pointsGeometry = fillGeometryWithPoints(textGeometry, count);

      return pointsGeometry;
    },
    [text, textProps, count]
  );

  return pointsGeometry;
}