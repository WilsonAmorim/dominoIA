import type { Detection } from '../types/detection';
import { CONFIDENCE_THRESHOLD, DOMINO_LABELS, IOU_THRESHOLD } from '../types/detection';

/**
 * Calcula a área de interseção sobre união (IoU) de duas caixas no formato
 * [x_center, y_center, width, height] normalizadas.
 */
function iou(a: number[], b: number[]): number {
  const ax1 = a[0] - a[2] / 2;
  const ay1 = a[1] - a[3] / 2;
  const ax2 = a[0] + a[2] / 2;
  const ay2 = a[1] + a[3] / 2;

  const bx1 = b[0] - b[2] / 2;
  const by1 = b[1] - b[3] / 2;
  const bx2 = b[0] + b[2] / 2;
  const by2 = b[1] + b[3] / 2;

  const interX1 = Math.max(ax1, bx1);
  const interY1 = Math.max(ay1, by1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
  const aArea = (ax2 - ax1) * (ay2 - ay1);
  const bArea = (bx2 - bx1) * (by2 - by1);

  return interArea / (aArea + bArea - interArea + 1e-6);
}

/**
 * Supressão de não-máximos simples (NMS).
 * Recebe lista de [x, y, w, h, conf, classId] e retorna índices vencedores.
 */
function nms(boxes: number[][]): number[] {
  // Ordena por confiança decrescente
  const sorted = boxes
    .map((b, i) => ({ b, i }))
    .sort((a, b) => b.b[4] - a.b[4]);

  const kept: number[] = [];
  const suppressed = new Set<number>();

  for (const { b, i } of sorted) {
    if (suppressed.has(i)) continue;
    kept.push(i);
    for (const { b: b2, i: i2 } of sorted) {
      if (i2 !== i && !suppressed.has(i2)) {
        if (iou(b, b2) > IOU_THRESHOLD) {
          suppressed.add(i2);
        }
      }
    }
  }

  return kept;
}

/**
 * Converte o tensor de saída YOLO (formato [1, num_classes+4, num_anchors])
 * em detecções legíveis, aplicando filtro de confiança e NMS.
 *
 * Layout esperado do modelo YOLOv8/YOLO11:
 *   output shape: [1, (4 + num_classes), num_anchors]
 *   cada coluna: [cx, cy, w, h, cls0_score, cls1_score, ...]
 */
export function parseYoloOutput(
  outputData: Float32Array | Int8Array | Uint8Array,
  numClasses: number,
  numAnchors: number,
): Detection[] {
  const rawBoxes: number[][] = [];

  for (let a = 0; a < numAnchors; a++) {
    const cx = Number(outputData[0 * numAnchors + a]);
    const cy = Number(outputData[1 * numAnchors + a]);
    const w  = Number(outputData[2 * numAnchors + a]);
    const h  = Number(outputData[3 * numAnchors + a]);

    let maxScore = 0;
    let classId = 0;

    for (let c = 0; c < numClasses; c++) {
      const score = Number(outputData[(4 + c) * numAnchors + a]);
      if (score > maxScore) {
        maxScore = score;
        classId = c;
      }
    }

    if (maxScore >= CONFIDENCE_THRESHOLD) {
      rawBoxes.push([cx, cy, w, h, maxScore, classId]);
    }
  }

  if (rawBoxes.length === 0) return [];

  const keptIdx = nms(rawBoxes);

  return keptIdx.map((i) => {
    const [cx, cy, bw, bh, conf, cls] = rawBoxes[i];
    return {
      box: { x: cx, y: cy, width: bw, height: bh },
      classId: cls,
      label: DOMINO_LABELS[cls] ?? `cls_${cls}`,
      confidence: conf,
    };
  });
}
