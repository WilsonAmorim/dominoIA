import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useRunOnJS } from 'react-native-worklets-core';
import { DetectionOverlay } from '../components/DetectionOverlay';
import { useDominoModel } from '../hooks/useDominoModel';
import type { Detection } from '../types/detection';
import { MODEL_INPUT_SIZE } from '../types/detection';
import { parseYoloOutput } from '../utils/parseYoloOutput';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Número de classes do modelo (ajuste para 14 se usar o modelo Double-Twelve-Dominos-16)
const NUM_CLASSES = 28;
// YOLOv8 640×640: num_anchors = 8400
const NUM_ANCHORS = 8400;

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { boxedModel, isLoading, error } = useDominoModel();
  const { resize } = useResizePlugin();

  const [detections, setDetections] = useState<Detection[]>([]);

  // useRunOnJS para chamar setDetections de dentro do worklet
  const handleDetections = useRunOnJS(
    (dets: Detection[]) => {
      setDetections(dets);
    },
    [setDetections],
  );

  // useFrameProcessor: API do VisionCamera v4 para processar frames
  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (boxedModel == null) {
        return;
      }

      const model = boxedModel.unbox();

      // Redimensiona e normaliza o frame para 640×640 RGB float32
      const resized = resize(frame, {
        scale: {
          width: MODEL_INPUT_SIZE,
          height: MODEL_INPUT_SIZE,
        },
        pixelFormat: 'rgb',
        dataType: 'float32',
      });

      // Inferência síncrona no LiteRT / TFLite
      const inputBuffer = resized.buffer.slice(
        resized.byteOffset,
        resized.byteOffset + resized.byteLength,
      );
      if (!(inputBuffer instanceof ArrayBuffer)) {
        throw new Error('Expected resize output to use an ArrayBuffer');
      }
      const outputs = model.runSync([inputBuffer]);
      const outputTensor = new Float32Array(outputs[0]);

      // Parseia saída YOLO → detecções
      const dets = parseYoloOutput(outputTensor, NUM_CLASSES, NUM_ANCHORS);

      handleDetections(dets);
    },
    [boxedModel, resize, handleDetections],
  );

  // ── Permissão ──
  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Câmera precisa de permissão</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            requestPermission().then((granted) => {
              if (!granted) Alert.alert('Permissão negada', 'Habilite nas configurações.');
            });
          }}
        >
          <Text style={styles.buttonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Sem dispositivo ──
  if (!device) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#00ff88" />
        <Text style={styles.message}>Iniciando câmera…</Text>
      </View>
    );
  }

  // ── Erro no modelo ──
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar modelo</Text>
        <Text style={styles.message}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera component do VisionCamera v4 — passa frameProcessor e pixelFormat="yuv" */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        pixelFormat="yuv"
        frameProcessor={frameProcessor}
        resizeMode="cover"
      />

      {/* Overlay com caixas de detecção */}
      <DetectionOverlay
        detections={detections}
        frameWidth={MODEL_INPUT_SIZE}
        frameHeight={MODEL_INPUT_SIZE}
        viewWidth={SCREEN_W}
        viewHeight={SCREEN_H}
      />

      {/* HUD superior */}
      <View style={styles.hud}>
        {isLoading ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.hudText}>  Carregando modelo…</Text>
          </>
        ) : (
          <Text style={styles.hudText}>
            {detections.length > 0
              ? `${detections.length} peça(s) detectada(s)`
              : 'Aponte para as peças de dominó'}
          </Text>
        )}
      </View>

      {/* Lista de peças detectadas */}
      {detections.length > 0 && (
        <View style={styles.detectionList}>
          {detections.map((d, i) => (
            <View key={i} style={styles.detectionChip}>
              <Text style={styles.detectionChipText}>
                {d.label}  {(d.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  message: { color: '#ccc', fontSize: 16, textAlign: 'center' },
  errorText: { color: '#ff4444', fontSize: 18, fontWeight: 'bold' },
  button: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hudText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  detectionList: {
    position: 'absolute',
    bottom: 40,
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  detectionChip: {
    backgroundColor: 'rgba(0,255,136,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detectionChipText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
});