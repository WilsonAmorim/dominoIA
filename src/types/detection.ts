// Tipos de detecção do modelo YOLO para dominó
export interface BoundingBox {
  x: number;      // centro X normalizado [0..1]
  y: number;      // centro Y normalizado [0..1]
  width: number;  // largura normalizada [0..1]
  height: number; // altura normalizada [0..1]
}

export interface Detection {
  box: BoundingBox;
  classId: number;
  label: string;
  confidence: number;
}

// Pares de dominó (lado A | lado B)
// Classes 0-27 correspondem a peças 0|0 até 6|6
export const DOMINO_LABELS: string[] = [
  '0|0', '0|1', '0|2', '0|3', '0|4', '0|5', '0|6',
  '1|1', '1|2', '1|3', '1|4', '1|5', '1|6',
  '2|2', '2|3', '2|4', '2|5', '2|6',
  '3|3', '3|4', '3|5', '3|6',
  '4|4', '4|5', '4|6',
  '5|5', '5|6',
  '6|6',
];

// Dimensão de entrada do modelo (quadrado)
export const MODEL_INPUT_SIZE = 640;
// Limiar de confiança mínima
export const CONFIDENCE_THRESHOLD = 0.4;
// Limiar IoU para NMS
export const IOU_THRESHOLD = 0.45;
