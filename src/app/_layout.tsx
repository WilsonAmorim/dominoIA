import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#1a1a2e' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'DominóIA', headerShown: false }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: 'Câmera do Celular',
            headerBackTitle: 'Voltar',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="wifi-camera"
          options={{
            title: 'Câmera Wi-Fi D100',
            headerBackTitle: 'Voltar',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
