# IoT Mobile App 🚀

**IoT Smart Home** — Aplicativo móvel (React Native + Expo) para monitoramento e controle de dispositivos IoT via Firebase Realtime Database.

---

## 🔍 Descrição
Aplicativo demonstrativo que conecta-se a um backend Firebase (Realtime Database), exibe leituras de sensores e permite controlar atuadores (ventilador, iluminação, etc.). O app é construído com Expo (SDK ~54) e tem suporte para Android, iOS (macOS + Xcode) e Web.

## ✨ Recursos
- Conexão via URL do Firebase Realtime Database
- Dashboard com sensores (Temperatura, Umidade, Luminosidade)
- Controle de atuadores (estado e modo Manual / Automático)
- Configurações (limites de temperatura e luminosidade)
- Auto-refresh de dados a cada 3 segundos + pull-to-refresh

## 📋 Pré-requisitos
- Node.js (>= 20 recomendado)
- npm ou yarn
- Expo CLI (opc): `npm install -g expo-cli` (opcional)
- Para iOS: macOS + Xcode + CocoaPods
- Para Android: Android Studio com SDK e emulador ou dispositivo físico

> Observação: o projeto usa *expo-managed/build scripts* como `expo run:android` / `expo run:ios` e `expo start --dev-client`.

## 🚀 Iniciando (Quick Start)
1. Clone o repositório

```bash
git clone <repo-url>
cd iot-mobile-app
```

2. Instale dependências

```bash
npm install
# ou
# yarn
```

3. (iOS) Instale pods

```bash
npx pod-install ios
# ou
cd ios && pod install
```

4. Inicie o Metro

```bash
npm run start
# isso executa: expo start --dev-client
```

5. Execute no emulador/dispositivo

```bash
npm run android
# ou
npm run ios
# ou
npm run web
```

## ⚙️ Uso
- Ao abrir o app, insira a **URL do Firebase Realtime Database** (ex: `https://seu-projeto.firebaseio.com`) e o **ID do dispositivo** (ex: `device_001`).
- Toque em **Conectar** para carregar dados do dispositivo e controlar atuadores.

### Estrutura esperada no Firebase (exemplo)

```json
{
  "devices": {
    "device_001": {
      "name": "Sala de Estar",
      "location": "Casa",
      "status": "offline",
      "lastUpdate": 0,
      "sensors": {
        "temperature": {
          "value": 22,
          "unit": "°C",
          "timestamp": 0
        },
        "humidity": {
          "value": 60,
          "unit": "%",
          "timestamp": 0
        },
        "light": {
          "value": 400,
          "unit": "lux",
          "timestamp": 0
        }
      },
      "actuators": {
        "fan": {
          "state": false,
          "mode": "manual"
        },
        "light": {
          "state": false,
          "mode": "manual"
        }
      },
      "settings": {
        "tempThreshold": 26,
        "lightThreshold": 300,
        "autoMode": true
      }
    }
  }
}
```

- O app usa requisições HTTP (REST do Firebase). Atualizações de atuadores e settings são feitas via `PUT` diretamente nos caminhos:
  - `/devices/{deviceId}/actuators/{actuator}/{field}.json`
  - `/devices/{deviceId}/settings/{setting}.json`

> Certifique-se de que as regras do Realtime Database permitem leitura/escrita durante testes (ou adicione autenticação adequada).

## 🛠️ Desenvolvimento
- Arquivo principal: `App.js` (componentes inline para sensores, atuadores e configurações)
- Intervalo de atualização: 3 segundos (configurado em `setInterval` dentro do `useEffect`)
- Para limpar cache do Metro: `expo start -c`

## 🐞 Solução de problemas
- Erro de instalação de pods: rode `npx pod-install` ou atualize CocoaPods
- Problemas de rede: verifique se o dispositivo/emulador tem acesso à URL do Firebase
- Se o app não carregar dados, verifique a URL e as regras do Realtime Database