Atue como um Engenheiro Sênior de Mobile (React Native / Expo) e Visão Computacional On-Device.

Estou desenvolvendo o aplicativo **dominoIA** em Expo + TypeScript (Development Build, sem Expo Go), cujo objetivo é ler partidas de dominó em duplas (4 jogadores, duplo-seis) em tempo real e recomendar a melhor jogada tática de forma 100% offline.

### Contexto Atual do Projeto
- Estrutura Expo TypeScript já inicializada na raiz do projeto.
- Dependências já instaladas: `react-native-vision-camera`, `react-native-fast-tflite`, `react-native-worklets-core` e `vision-camera-resize-plugin`.
- `metro.config.js` já configurado com `assetExts.push('tflite')`.
- Modelo treinado (YOLOv8n exportado para Google LiteRT) salvo em: `assets/models/best.tflite` (input: `1x3x640x640` RGB float32, output: `1x18x8400`, 14 classes: `0`, `1`, `10`, `11`, `12`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `blank`).
- No futuro, o app também receberá stream de vídeo de uma mini câmera corporal Wi-Fi (`CAM-1080P-WIFI`), portanto a entrada de vídeo deve ser desacoplada da lógica de visão e do motor do jogo (padrão Ports & Adapters / Hexagonal).

### Tarefa: Implementar a Fase 1 (Configuração Nativa + Pipeline de Visão + Engine Base)

Gere os arquivos completos e prontos para rodar, sem placeholders ou código omitido:

1. **Configuração de Ambiente (`babel.config.js` e `app.json`)**:
   - Configure o plugin `react-native-worklets-core/plugin` no `babel.config.js`.
   - Configure os plugins nativos (`react-native-vision-camera` com permissão de câmera e `react-native-fast-tflite`) no `app.json`.

2. **Pós-processamento YOLOv8 (`src/core/vision/yoloPostProcessor.ts`)**:
   - Decodifique o tensor de saída `(1, 18, 8400)` do `best.tflite`.
   - Mapeie os índices das classes exatamente na ordem alfabética do dataset: `['0', '1', '10', '11', '12', '2', '3', '4', '5', '6', '7', '8', '9', 'blank']`.
   - Converta `blank` para `0` e descarte qualquer detecção com valor numérico `> 6` (filtro para dominó tradicional duplo-seis).
   - Aplique filtro de confiança (`conf >= 0.50`) e **NMS (Non-Maximum Suppression)** para eliminar caixas sobrepostas.

3. **Pareamento Espacial e Zonas (`src/core/vision/tilePairing.ts` e `src/core/vision/zoneMapper.ts`)**:
   - Agrupe pares de metades detectadas próximas entre si (distância euclidiana proporcional ao tamanho da bounding box) para formar objetos `DominoTile` (`{ top: number, bottom: number, bbox, center }`).
   - Separe as peças detectadas em **Mão do Jogador** (ROI inferior da tela, ex: `y > 0.72` normalizado) e **Mesa/Tabuleiro** (`y <= 0.72`).

4. **Motor Tático de Duplas (`src/core/engine/strategySolver.ts`)**:
   - Receba as peças da mão do jogador e as duas pontas abertas da mesa (com opção de ajuste manual rápido na UI enquanto o rastreamento de pontas evolui).
   - Implemente a pontuação heurística para dominó de 4 jogadores:
     - Prioridade para descarregar buchas/duplos;
     - Manter a ponta de saída/força do parceiro;
     - Induzir passe no adversário da direita com base no histórico de passes;
     - Contagem de domínio de terno (Regra dos 7);
     - Descarte de pedras pesadas quando houver risco de fechamento.

5. **Adapter de Câmera e Tela Principal (`src/adapters/VisionCameraSource.tsx`, `src/components/HudOverlay.tsx` e `App.tsx`)**:
   - Carregue `assets/models/best.tflite` via `useTensorflowModel` (`react-native-fast-tflite`).
   - Use `useFrameProcessor` do `react-native-vision-camera` com `vision-camera-resize-plugin` para redimensionar os frames para `640x640` RGB (`float32`), rodar a inferência e enviar as detecções para a thread JS via `Worklets.createRunOnJS`.
   - Exiba um HUD limpo sobre a câmera mostrando: peças detectadas na mão, peças na mesa, botão para registrar "Adversário Passou" e destaque visual claro da **melhor pedra para jogar**.

Estruture o código com tipagem estrita em TypeScript, separação clara de responsabilidades e explique ao final apenas os comandos necessários para executar o `expo prebuild` e testar no Android.