// App.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SecondScreen from './SecondScreen';
import CalculationScreen from './CalculationScreen';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys para AsyncStorage
const SALVAR_CADASTROS = 'cadastros';
const SALVAR_TIME_A = 'timeA';
const SALVAR_TIME_B = 'timeB';
const SALVAR_PROXIMA = 'proxima';

// Funções auxiliares AsyncStorage
const loadJSON = async (key, fallback) => {
  try {
    const v = await AsyncStorage.getItem(key);
    if (v !== null) return JSON.parse(v);
  } catch (e) {
    console.warn(`Erro ao carregar ${key}`, e);
  }
  return fallback;
};

const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao salvar ${key}`, e);
  }
};

const Tab = createBottomTabNavigator();

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Função para distribuir proporcionalmente os 10 primeiros nomes por nível
const distribuir = (cadastros) => {
  const primeiros = cadastros.slice(0, 10);
  const restante = cadastros.slice(10);

  // Agrupa por nível
  const porNivel = {};
  primeiros.forEach((item) => {
    if (!porNivel[item.nivel]) porNivel[item.nivel] = [];
    porNivel[item.nivel].push(item);
  });

  const timeA = [];
  const timeB = [];

  Object.values(porNivel).forEach((listaNivel) => {
    const metade = Math.floor(listaNivel.length / 2);
    const sobra = listaNivel.length % 2;

    // Divide metade para A e metade para B
    timeA.push(...listaNivel.slice(0, metade));
    timeB.push(...listaNivel.slice(metade, metade + metade));

    // Distribui a sobra para quem tiver menos itens
    if (sobra) {
      if (timeA.length <= timeB.length) {
        timeA.push(listaNivel[listaNivel.length - 1]);
      } else {
        timeB.push(listaNivel[listaNivel.length - 1]);
      }
    }
  });

  // Limita o tamanho máximo 5 para cada time
  const trimTime = (time) => (time.length <= 5 ? time : time.slice(0, 5));
  const finalA = trimTime(timeA);
  const finalB = trimTime(timeB);

  // Sobras que extrapolam 5 em cada time retornam para proxima junto com os restantes
  const excedenteA = timeA.length > 5 ? timeA.slice(5) : [];
  const excedenteB = timeB.length > 5 ? timeB.slice(5) : [];
  const proxima = [...restante, ...excedenteA, ...excedenteB];

  return { timeA: finalA, timeB: finalB, proxima };
};

function MainScreen() {
  const {
    cadastros,
    setCadastros,
    distribuirTimes,
    adicionarReserva,
  } = useApp();

  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState('1');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    if (editandoId) {
      const item = cadastros.find((c) => c.id === editandoId);
      if (item) {
        setNome(item.nome);
        setNivel(item.nivel);
      }
    }
  }, [editandoId, cadastros]);

  const adicionarOuAtualizarCadastro = () => {
    if (nome.trim() === '') {
      Alert.alert('Preencha o nome');
      return;
    }

    if (editandoId) {
      const atualizados = cadastros.map((item) =>
        item.id === editandoId ? { ...item, nome, nivel } : item
      );
      setCadastros(atualizados);
      setEditandoId(null);
    } else {
      const novoCadastro = {
        id: Date.now().toString(),
        nome,
        nivel,
      };
      setCadastros([...cadastros, novoCadastro]);
    }

    setNome('');
    setNivel('1');
  };

  const iniciarEdicao = (item) => {
    setNome(item.nome);
    setNivel(item.nivel);
    setEditandoId(item.id);
  };

  const excluirCadastro = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este cadastro?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        onPress: () => {
          const atualizados = cadastros.filter((item) => item.id !== id);
          setCadastros(atualizados);
          if (editandoId === id) {
            setEditandoId(null);
            setNome('');
            setNivel('1');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>{item.nome}</Text>
        <Text style={styles.text}>Nível: {item.nivel}</Text>
      </View>
      <Button title="🗑️" color="red" onPress={() => excluirCadastro(item.id)} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <Picker
        selectedValue={nivel}
        style={styles.picker}
        onValueChange={(itemValue) => setNivel(itemValue)}
      >
        <Picker.Item label="Nível 1" value="1" />
        <Picker.Item label="Nível 2" value="2" />
        <Picker.Item label="Nível 3" value="3" />
      </Picker>

      <Button
        title={editandoId ? 'Atualizar Cadastro' : 'Cadastrar'}
        onPress={adicionarOuAtualizarCadastro}
      />

      <View style={{ marginVertical: 10 }}>
        <Button
          title="Distribuir Times"
          onPress={distribuirTimes}
        />
      </View>

      {/* Botão Novo Reserva */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title="Novo Reserva"
          onPress={() => {
            adicionarReserva(nome, nivel);
            setNome('');
            setNivel('1');
            setEditandoId(null);
          }}
        />
      </View>

      <Text style={styles.title}>Novo Cadastros</Text>

      <FlatList
        data={cadastros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

export default function App() {
  const [cadastros, setCadastros] = useState([]);
  const [timeA, setTimeA] = useState([]);
  const [timeB, setTimeB] = useState([]);
  const [proxima, setProxima] = useState([]);

  // Carrega os dados ao iniciar
  useEffect(() => {
    (async () => {
      const loadedCad = await loadJSON(SALVAR_CADASTROS, []);
      const loadedA = await loadJSON(SALVAR_TIME_A, []);
      const loadedB = await loadJSON(SALVAR_TIME_B, []);
      const loadedP = await loadJSON(SALVAR_PROXIMA, []);
      setCadastros(loadedCad);
      setTimeA(loadedA);
      setTimeB(loadedB);
      setProxima(loadedP);
    })();
  }, []);

  // Persiste cadastros quando alterados
  useEffect(() => {
    saveJSON(SALVAR_CADASTROS, cadastros);
  }, [cadastros]);

  // Função para distribuir os 10 primeiros nos times e salvar
  const distribuirTimes = useCallback(() => {
    if (cadastros.length === 0) {
      Alert.alert('Sem cadastros suficientes');
      return;
    }
    const { timeA: a, timeB: b, proxima: p } = distribuir(cadastros);
    setTimeA(a);
    setTimeB(b);
    setProxima(p);
    saveJSON(SALVAR_TIME_A, a);
    saveJSON(SALVAR_TIME_B, b);
    saveJSON(SALVAR_PROXIMA, p);
  }, [cadastros]);

  // Limpa os times
  const limparTimes = useCallback(() => {
    setTimeA([]);
    setTimeB([]);
    setProxima([]);
    saveJSON(SALVAR_TIME_A, []);
    saveJSON(SALVAR_TIME_B, []);
    saveJSON(SALVAR_PROXIMA, []);
  }, []);

  // Adiciona reserva nos cadastros e na lista proxima
  const adicionarReserva = useCallback((nome, nivel) => {
    if (nome.trim() === '') {
      Alert.alert('Preencha o nome para reserva');
      return;
    }
    const novo = {
      id: Date.now().toString(),
      nome,
      nivel,
    };
    setCadastros((prev) => {
      const updated = [...prev, novo];
      saveJSON(SALVAR_CADASTROS, updated);
      return updated;
    });
    setProxima((prev) => {
      const updated = [...prev, novo];
      saveJSON(SALVAR_PROXIMA, updated);
      return updated;
    });
  }, []);

  const contextValue = {
    cadastros,
    setCadastros,
    timeA,
    setTimeA,
    timeB,
    setTimeB,
    proxima,
    setProxima,
    distribuirTimes,
    distribuir,
    limparTimes,
    adicionarReserva,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Principal" component={MainScreen} />
          <Tab.Screen name="Times" component={SecondScreen} />
          <Tab.Screen name="Cálculo" component={CalculationScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: {
    height: 70,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    marginVertical: 4,
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
  },
});
