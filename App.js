import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function App() {
  const [firebaseUrl, setFirebaseUrl] = useState('');
  const [deviceId, setDeviceId] = useState('device_001');
  const [isConnected, setIsConnected] = useState(false);
  const [deviceData, setDeviceData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Connect to Firebase
  const connectToFirebase = () => {
    if (!firebaseUrl.trim()) {
      Alert.alert('Erro', 'Por favor, insira a URL do Firebase');
      return;
    }
    setIsConnected(true);
    fetchDeviceData();
    Alert.alert('Sucesso', 'Conectado ao Firebase!');
  };

  // Disconnect from Firebase
  const disconnectFromFirebase = () => {
    setIsConnected(false);
    setDeviceData(null);
    Alert.alert('Info', 'Desconectado do Firebase');
  };

  // Fetch device data from Firebase
  const fetchDeviceData = async () => {
    if (!firebaseUrl || !isConnected) return;

    try {
      const url = `${firebaseUrl}/devices/${deviceId}.json`;
      const response = await fetch(url);
      const data = await response.json();
      setDeviceData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Falha ao buscar dados do dispositivo');
    }
  };

  // Update actuator state
  const updateActuator = async (actuator, field, value) => {
    if (!firebaseUrl || !isConnected) return;

    try {
      const url = `${firebaseUrl}/devices/${deviceId}/actuators/${actuator}/${field}.json`;
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      
      // Update local state
      setDeviceData(prev => ({
        ...prev,
        actuators: {
          ...prev.actuators,
          [actuator]: {
            ...prev.actuators[actuator],
            [field]: value
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao atualizar atuador:', error);
      Alert.alert('Erro', 'Falha ao atualizar atuador');
    }
  };

  // Update settings
  const updateSettings = async (setting, value) => {
    if (!firebaseUrl || !isConnected) return;

    try {
      const url = `${firebaseUrl}/devices/${deviceId}/settings/${setting}.json`;
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      
      // Update local state
      setDeviceData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [setting]: value
        }
      }));
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    }
  };

  // Auto-refresh data
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(fetchDeviceData, 3000);
      return () => clearInterval(interval);
    }
  }, [isConnected, firebaseUrl, deviceId]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeviceData();
    setRefreshing(false);
  };

  // Connection screen
  if (!isConnected) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.connectionContainer}>
          <Text style={styles.title}>🔌 IoT Smart Home</Text>
          <Text style={styles.subtitle}>Sistema de Monitoramento Residencial</Text>
          
          <View style={styles.card}>
            <Text style={styles.label}>URL do Firebase</Text>
            <TextInput
              style={styles.input}
              placeholder="https://seu-projeto.firebaseio.com"
              value={firebaseUrl}
              onChangeText={setFirebaseUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <Text style={styles.label}>ID do Dispositivo</Text>
            <TextInput
              style={styles.input}
              placeholder="device_001"
              value={deviceId}
              onChangeText={setDeviceId}
            />
            
            <TouchableOpacity 
              style={styles.button}
              onPress={connectToFirebase}
            >
              <Text style={styles.buttonText}>Conectar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Camadas: Edge → Fog → Cloud</Text>
        </View>
      </LinearGradient>
    );
  }

  // Main dashboard
  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>IoT Smart Home</Text>
            <Text style={styles.headerSubtitle}>
              {deviceData?.name || 'Dispositivo'}
            </Text>
          </View>
          <TouchableOpacity onPress={disconnectFromFirebase}>
            <Text style={styles.disconnectBtn}>Desconectar</Text>
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {deviceData?.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Sensors */}
        <Text style={styles.sectionTitle}>📊 Sensores</Text>
        <View style={styles.sensorsGrid}>
          <SensorCard
            icon="🌡️"
            title="Temperatura"
            value={deviceData?.sensors?.temperature?.value}
            unit="°C"
            color="#ef4444"
          />
          <SensorCard
            icon="💧"
            title="Umidade"
            value={deviceData?.sensors?.humidity?.value}
            unit="%"
            color="#3b82f6"
          />
          <SensorCard
            icon="☀️"
            title="Luminosidade"
            value={deviceData?.sensors?.light?.value}
            unit="lux"
            color="#f59e0b"
          />
        </View>

        {/* Actuators */}
        <Text style={styles.sectionTitle}>🎛️ Atuadores</Text>
        
        <ActuatorCard
          icon="🌀"
          title="Ventilador"
          state={deviceData?.actuators?.fan?.state}
          mode={deviceData?.actuators?.fan?.mode}
          onToggle={(value) => updateActuator('fan', 'state', value)}
          onModeChange={(mode) => updateActuator('fan', 'mode', mode)}
        />

        <ActuatorCard
          icon="💡"
          title="Iluminação"
          state={deviceData?.actuators?.light?.state}
          mode={deviceData?.actuators?.light?.mode}
          onToggle={(value) => updateActuator('light', 'state', value)}
          onModeChange={(mode) => updateActuator('light', 'mode', mode)}
        />

        {/* Settings */}
        <Text style={styles.sectionTitle}>⚙️ Configurações</Text>
        <View style={styles.card}>
          <SettingRow
            label="Temperatura Limite"
            value={deviceData?.settings?.tempThreshold}
            unit="°C"
            onIncrease={() => updateSettings('tempThreshold', (deviceData?.settings?.tempThreshold || 26) + 1)}
            onDecrease={() => updateSettings('tempThreshold', (deviceData?.settings?.tempThreshold || 26) - 1)}
          />
          <SettingRow
            label="Luminosidade Limite"
            value={deviceData?.settings?.lightThreshold}
            unit="lux"
            onIncrease={() => updateSettings('lightThreshold', (deviceData?.settings?.lightThreshold || 300) + 50)}
            onDecrease={() => updateSettings('lightThreshold', (deviceData?.settings?.lightThreshold || 300) - 50)}
          />
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Modo Automático</Text>
            <Switch
              value={deviceData?.settings?.autoMode}
              onValueChange={(value) => updateSettings('autoMode', value)}
              trackColor={{ false: '#ddd', true: '#667eea' }}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// Sensor Card Component
const SensorCard = ({ icon, title, value, unit, color }) => (
  <View style={styles.sensorCard}>
    <Text style={styles.sensorIcon}>{icon}</Text>
    <Text style={styles.sensorTitle}>{title}</Text>
    <Text style={[styles.sensorValue, { color }]}>
      {value !== null && value !== undefined ? value.toFixed(1) : '--'}
    </Text>
    <Text style={styles.sensorUnit}>{unit}</Text>
  </View>
);

// Actuator Card Component
const ActuatorCard = ({ icon, title, state, mode, onToggle, onModeChange }) => (
  <View style={styles.card}>
    <View style={styles.actuatorHeader}>
      <View style={styles.actuatorTitle}>
        <Text style={styles.actuatorIcon}>{icon}</Text>
        <Text style={styles.actuatorName}>{title}</Text>
      </View>
      <View style={styles.modeBadge}>
        <Text style={styles.modeText}>{mode?.toUpperCase()}</Text>
      </View>
    </View>
    
    <View style={styles.actuatorControl}>
      <Text style={styles.actuatorLabel}>Estado</Text>
      <Switch
        value={state}
        onValueChange={onToggle}
        trackColor={{ false: '#ddd', true: '#10b981' }}
      />
    </View>

    <View style={styles.modeButtons}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'manual' && styles.modeButtonActive]}
        onPress={() => onModeChange('manual')}
      >
        <Text style={[styles.modeButtonText, mode === 'manual' && styles.modeButtonTextActive]}>
          Manual
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'auto' && styles.modeButtonActive]}
        onPress={() => onModeChange('auto')}
      >
        <Text style={[styles.modeButtonText, mode === 'auto' && styles.modeButtonTextActive]}>
          Automático
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Setting Row Component
const SettingRow = ({ label, value, unit, onIncrease, onDecrease }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <View style={styles.settingControl}>
      <TouchableOpacity style={styles.settingButton} onPress={onDecrease}>
        <Text style={styles.settingButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.settingValue}>
        {value} {unit}
      </Text>
      <TouchableOpacity style={styles.settingButton} onPress={onIncrease}>
        <Text style={styles.settingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  disconnectBtn: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    marginTop: 8,
  },
  sensorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sensorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: (width - 56) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sensorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sensorTitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sensorUnit: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actuatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actuatorTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actuatorIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  actuatorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modeBadge: {
    backgroundColor: '#ddd6fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#5b21b6',
  },
  actuatorControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actuatorLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 80,
    textAlign: 'center',
  },
});