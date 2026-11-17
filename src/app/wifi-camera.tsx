import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DetectionOverlay } from '../components/DetectionOverlay';
import { useDominoModel } from '../hooks/useDominoModel';
import type { Detection } from '../types/detection';
import { MODEL_INPUT_SIZE } from '../types/detection';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// IPs mais comuns utilizados pelo chipset AX3292 da D100
const DEFAULT_IPS = [
  'http://192.168.1.1:8080/?action=stream',
  'http://192.168.1.1:8080',
  'http://192.168.169.1:8080',
  'http://192.168.0.1:8080',
];

export default function WifiCameraScreen() {
  const [streamUrl, setStreamUrl] = useState<string>(DEFAULT_IPS[0]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hasStreamError, setHasStreamError] = useState<boolean>(false);
  const [detections] = useState<Detection[]>([]);

  const { isLoading: isModelLoading, error: modelError } = useDominoModel();

  const handleConnect = () => {
    if (!streamUrl.trim()) {
      Alert.alert('URL Inválida', 'Digite o endereço de stream da câmera D100.');
      return;
    }
    setHasStreamError(false);
    setIsConnecting(true);
    // Simula tentativa de conexão
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setHasStreamError(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Barra de cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Câmera Wi-Fi D100</Text>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? '#00ff88' : '#ff4444' },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Área de Visualização do Stream */}
      <View style={styles.streamContainer}>
        {isConnected ? (
          <>
            <Image
              source={{ uri: streamUrl }}
              style={styles.streamImage}
              resizeMode="contain"
              onError={() => setHasStreamError(true)}
            />

            {/* Overlay com caixas de detecção da IA */}
            <DetectionOverlay
              detections={detections}
              frameWidth={MODEL_INPUT_SIZE}
              frameHeight={MODEL_INPUT_SIZE}
              viewWidth={SCREEN_W}
              viewHeight={SCREEN_H * 0.55}
            />

            {hasStreamError && (
              <View style={styles.streamErrorContainer}>
                <Text style={styles.streamErrorTitle}>
                  ⚠️ Sinal do Stream Não Detectado
                </Text>
                <Text style={styles.streamErrorDesc}>
                  Verifique se o celular está conectado na rede Wi-Fi da D100
                  (SSID iniciado por H88... ou D100... com senha 12345678).
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>📡</Text>
            <Text style={styles.placeholderTitle}>Aguardando Conexão</Text>
            <Text style={styles.placeholderSubtitle}>
              Siga os passos do manual para conectar a D100:
            </Text>
            <View style={styles.stepsList}>
              <Text style={styles.stepItem}>
                1. Ligue a D100 e dê 2 cliques rápidos no botão até a luz verde
                piscar.
              </Text>
              <Text style={styles.stepItem}>
                2. No celular, conecte na rede Wi-Fi H88... ou D100...
              </Text>
              <Text style={styles.stepItem}>
                3. Digite a senha: <Text style={styles.codeText}>12345678</Text>
              </Text>
              <Text style={styles.stepItem}>
                4. Clique em Conectar Stream abaixo.
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Painel de Controle e Configuração da URL */}
      <ScrollView style={styles.controlPanel} contentContainerStyle={styles.controlContent}>
        <Text style={styles.label}>Endereço do Stream da Câmera:</Text>
        <TextInput
          style={styles.input}
          value={streamUrl}
          onChangeText={setStreamUrl}
          placeholder="http://192.168.1.1:8080/?action=stream"
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Atalhos de IP do Chipset AX3292 */}
        <Text style={styles.shortcutLabel}>Atalhos sugeridos (Chip AX3292):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutsRow}>
          {DEFAULT_IPS.map((ip, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.shortcutChip,
                streamUrl === ip && styles.shortcutChipActive,
              ]}
              onPress={() => setStreamUrl(ip)}
            >
              <Text
                style={[
                  styles.shortcutChipText,
                  streamUrl === ip && styles.shortcutChipTextActive,
                ]}
              >
                {ip.replace('http://', '')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Botão Conectar / Desconectar */}
        <TouchableOpacity
          style={[styles.mainButton, isConnected ? styles.buttonDisconnect : styles.buttonConnect]}
          onPress={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting}
          activeOpacity={0.8}
        >
          {isConnecting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.mainButtonText}>
              {isConnected ? 'Desconectar da Câmera' : 'Conectar ao Stream Wi-Fi'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Status da IA */}
        <View style={styles.modelStatusCard}>
          <Text style={styles.modelStatusTitle}>Status do Modelo IA (best.tflite):</Text>
          {isModelLoading ? (
            <Text style={styles.modelStatusText}>⏳ Carregando pesos do modelo...</Text>
          ) : modelError ? (
            <Text style={[styles.modelStatusText, styles.modelStatusError]}>
              ❌ Erro: {String(modelError)}
            </Text>
          ) : (
            <Text style={[styles.modelStatusText, styles.modelStatusSuccess]}>
              ✅ Modelo Pronto (28 classes de dominó 0|0 a 6|6)
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12121e',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2b2b40',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#2b2b40',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#24243a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  streamContainer: {
    width: '100%',
    height: SCREEN_H * 0.45,
    backgroundColor: '#0a0a14',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  streamImage: {
    width: '100%',
    height: '100%',
  },
  streamErrorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    borderRadius: 8,
    padding: 10,
  },
  streamErrorTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streamErrorDesc: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  placeholderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  placeholderSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepsList: {
    gap: 6,
    backgroundColor: '#18182b',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d2d48',
  },
  stepItem: {
    color: '#bbb',
    fontSize: 12,
    lineHeight: 18,
  },
  codeText: {
    color: '#00ff88',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: 'bold',
  },
  controlPanel: {
    flex: 1,
    backgroundColor: '#161628',
  },
  controlContent: {
    padding: 16,
    gap: 12,
  },
  label: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f1f35',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#343454',
  },
  shortcutLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
  },
  shortcutChip: {
    backgroundColor: '#23233a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#343454',
  },
  shortcutChipActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  shortcutChipText: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '500',
  },
  shortcutChipTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  mainButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonConnect: {
    backgroundColor: '#00ff88',
  },
  buttonDisconnect: {
    backgroundColor: '#ff4444',
  },
  mainButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modelStatusCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2b2b42',
    marginTop: 4,
  },
  modelStatusTitle: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modelStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modelStatusSuccess: {
    color: '#00ff88',
  },
  modelStatusError: {
    color: '#ff4444',
  },
});
