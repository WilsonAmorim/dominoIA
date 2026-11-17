import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🁣</Text>
      <Text style={styles.title}>DominóIA</Text>
      <Text style={styles.subtitle}>
        Reconhecimento inteligente de peças de dominó com Visão Computacional
      </Text>

      <View style={styles.buttonGroup}>
        {/* Opção 1: Câmera Wi-Fi Externa D100 */}
        <TouchableOpacity
          style={[styles.button, styles.buttonWifi]}
          onPress={() => router.push('/wifi-camera')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonIcon}>📡</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Câmera Wi-Fi D100</Text>
            <Text style={styles.buttonSubtitle}>
              Conectar via rede local / hotspot (chip AX3292)
            </Text>
          </View>
        </TouchableOpacity>

        {/* Opção 2: Câmera Local do Celular */}
        <TouchableOpacity
          style={[styles.button, styles.buttonNative]}
          onPress={() => router.push('/camera')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonIcon}>📱</Text>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Câmera do Celular</Text>
            <Text style={styles.buttonSubtitle}>
              Usar a lente do smartphone com IA em tempo real
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        O modelo best.tflite detecta todas as 28 peças do jogo (0|0 até 6|6).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131322',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  buttonGroup: {
    width: '100%',
    gap: 14,
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonWifi: {
    backgroundColor: '#1b2d2b',
    borderColor: '#00ff88',
  },
  buttonNative: {
    backgroundColor: '#1d2238',
    borderColor: '#4d6eff',
  },
  buttonIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  buttonSubtitle: {
    color: '#999',
    fontSize: 12,
    lineHeight: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
