import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { NitroModules } from 'react-native-nitro-modules';

/**
 * Carrega o modelo best.tflite e o embala em um BoxedHybridObject
 * para uso seguro dentro de worklets de frame processor.
 */
export function useDominoModel() {
  const tflite = useTensorflowModel(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../assets/models/best.tflite'),
    Platform.OS === 'ios' ? ['core-ml'] : ['nnapi'],
  );

  const model = tflite.state === 'loaded' ? tflite.model : undefined;

  // Embala (box) o HybridObject para cruzar a fronteira do worklet runtime
  const boxedModel = useMemo(
    () => (model != null ? NitroModules.box(model) : undefined),
    [model],
  );

  return {
    boxedModel,
    isLoading: tflite.state === 'loading',
    isLoaded: tflite.state === 'loaded',
    error: tflite.state === 'error' ? tflite.error : undefined,
  };
}
