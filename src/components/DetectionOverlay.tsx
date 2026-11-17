import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Detection } from '../types/detection';

interface DetectionOverlayProps {
  detections: Detection[];
  frameWidth: number;
  frameHeight: number;
  viewWidth: number;
  viewHeight: number;
}

/**
 * Renderiza as caixas de detecção sobre a câmera.
 * As coordenadas do modelo são normalizadas [0..1] em relação ao frame;
 * aqui convertemos para pixels da view, respeitando o letterbox/pillarbox.
 */
export function DetectionOverlay({
  detections,
  frameWidth,
  frameHeight,
  viewWidth,
  viewHeight,
}: DetectionOverlayProps) {
  // Calcula a escala mantendo a proporção (contain)
  const scaleX = viewWidth / frameWidth;
  const scaleY = viewHeight / frameHeight;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (viewWidth - frameWidth * scale) / 2;
  const offsetY = (viewHeight - frameHeight * scale) / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {detections.map((det, idx) => {
        const { x, y, width, height } = det.box;

        // Converte de centro+tamanho normalizado → pixels da view
        const px = (x - width / 2) * frameWidth * scale + offsetX;
        const py = (y - height / 2) * frameHeight * scale + offsetY;
        const pw = width * frameWidth * scale;
        const ph = height * frameHeight * scale;

        return (
          <View
            key={idx}
            style={[
              styles.box,
              { left: px, top: py, width: pw, height: ph },
            ]}
          >
            <View style={styles.labelContainer}>
              <Text style={styles.label}>
                {det.label} {(det.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00ff88',
    borderRadius: 4,
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: -1,
    backgroundColor: '#00ff88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  label: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
