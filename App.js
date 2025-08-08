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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Ícones

// Constantes para AsyncStorage
const SALVAR_CADASTROS = 'cadastros';
const SALVAR_TIME_A = 'timeA';
const SALVAR_TIME_B = 'timeB';
const SALVAR_PROXIMA = 'proxima';

// Funções de armazenamento
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

// Contexto global
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// Navegação por abas
const Tab = createBottomTabNavigator();

// Tela principal
function MainScreen() {
  const { cadastros, setCadastros, proxima, setProxima } = useApp();
  const [cadastrosOrdenados, setCadastrosOrdenados] = useState([]);

  const [nome, setNome] = useState('');
  const [gols, setGols] = useState('0');
  const [categoria, setCategoria] = useState('S');
  const [editandoId, setEditandoId] = useState(null);
  const [ativosIds, setAtivosIds] = useState([]);

  useEffect(() => {
    const ativos = proxima.map((item) => item.id);
    setAtivosIds(ativos);
  }, [proxima]);

  useEffect(() => {
  const ordenados = [...cadastros].sort((a, b) => Number(b.gols) - Number(a.gols));
  setCadastrosOrdenados(ordenados);
}, [cadastros]);

  const adicionarOuAtualizarCadastro = () => {
    if (nome.trim() === '') {
      Alert.alert('Preencha o nome');
      return;
    }

    if (editandoId) {
      const atualizados = cadastros.map((item) =>
        item.id === editandoId ? { ...item, nome, gols, categoria } : item
      );
      setCadastros(atualizados);

      if (ativosIds.includes(editandoId)) {
        const proximaAtualizada = proxima.map((item) =>
          item.id === editandoId ? { ...item, nome, gols, categoria } : item
        );
        setProxima(proximaAtualizada);
      }

      setEditandoId(null);
    } else {
      const novoCadastro = {
        id: Date.now().toString(),
        nome,
        gols,
        categoria,
      };
      setCadastros([...cadastros, novoCadastro]);
    }

    setNome('');
    setGols('0');
    setCategoria('S');
  };

  const iniciarEdicao = (item) => {
    setNome(item.nome);
    setGols(item.gols || '0');
    setCategoria(item.categoria);
    setEditandoId(item.id);
  };

  const excluirCadastro = (id) => {
    Alert.alert('Confirmação', 'Deseja excluir este cadastro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        onPress: () => {
          const atualizados = cadastros.filter((item) => item.id !== id);
          setCadastros(atualizados);

          if (ativosIds.includes(id)) {
            const proximaAtualizada = proxima.filter((item) => item.id !== id);
            setProxima(proximaAtualizada);
            setAtivosIds((prev) => prev.filter((pid) => pid !== id));
          }

          if (editandoId === id) {
            setEditandoId(null);
            setNome('');
            setGols('0');
            setCategoria('S');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const toggleAtivar = (item) => {
    if (ativosIds.includes(item.id)) {
      setAtivosIds((prev) => prev.filter((id) => id !== item.id));
      setProxima((prev) => prev.filter((p) => p.id !== item.id));
    } else {
      setAtivosIds((prev) => [...prev, item.id]);
      setProxima((prev) => [...prev, item]);
    }
  };

  const renderItem = ({ item }) => {
    const ativado = ativosIds.includes(item.id);
    return (
      <TouchableOpacity onPress={() => iniciarEdicao(item)} style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>{item.nome}</Text>
          <Text style={styles.text}>⚽ {item.gols || 0}</Text>
        </View>
        <Button
          title={ativado ? 'Desativar' : 'Ativar'}
          color={ativado ? 'black' : 'green'}
          onPress={() => toggleAtivar(item)}
        />
        <Button title="Delete" color="red" onPress={() => excluirCadastro(item.id)} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerCadastro}>
        <TextInput
          style={styles.inputCadastro}
          placeholder="Nome Sedentário"
          value={nome}
          onChangeText={setNome}
        />
        <Text>⚽</Text>
        <TextInput
          style={styles.inputGols}
          placeholder="0"
          value={gols}
          onChangeText={setGols}
          keyboardType="numeric"
        />
      </View>

      {/* Categoria desativada por agora */}
      {/* <View style={styles.containerCategoria}>
        <Picker
          selectedValue={categoria}
          style={styles.picker}
          onValueChange={(itemValue) => setCategoria(itemValue)}
        >
          <Picker.Item label="Sedentário" value="S" />
          <Picker.Item label="Jovem" value="J" />
          <Picker.Item label="Infantil" value="I" />
        </Picker>
      </View> */}

      <Button
        title={editandoId ? 'Atualizar Cadastro' : 'Cadastrar'}
        onPress={adicionarOuAtualizarCadastro}
      />

      <Text style={styles.title}>Sedentários</Text>

     <FlatList
  style={styles.FlatList}
  data={cadastrosOrdenados}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
/>
    </View>
  );
}

// Telas externas
import SecondScreen from './SecondScreen';
import CalculationScreen from './CalculationScreen';

// Função fictícia para distribuir (você pode substituir pela real)
const distribuir = (lista) => {
  const metade = Math.ceil(lista.length / 2);
  return {
    timeA: lista.slice(0, metade),
    timeB: lista.slice(metade, lista.length),
    proxima: [],
  };
};

// App principal
export default function App() {
  const [cadastros, setCadastros] = useState([]);
  const [timeA, setTimeA] = useState([]);
  const [timeB, setTimeB] = useState([]);
  const [proxima, setProxima] = useState([]);

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

  useEffect(() => {
    saveJSON(SALVAR_CADASTROS, cadastros);
  }, [cadastros]);

  useEffect(() => {
    saveJSON(SALVAR_TIME_A, timeA);
  }, [timeA]);

  useEffect(() => {
    saveJSON(SALVAR_TIME_B, timeB);
  }, [timeB]);

  useEffect(() => {
    saveJSON(SALVAR_PROXIMA, proxima);
  }, [proxima]);

  const distribuirTimes = useCallback((lista) => {
    if (!lista || lista.length === 0) {
      Alert.alert('Sem nomes suficientes para distribuir');
      return;
    }
    const { timeA, timeB, proxima: novaProxima } = distribuir(lista);
    setTimeA(timeA);
    setTimeB(timeB);
    setProxima(novaProxima);
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
  };

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Times') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Proxima') {
                iconName = focused ? 'arrow-forward-circle' : 'arrow-forward-circle-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Home" component={MainScreen} options={{ title: 'Home' }} />
          <Tab.Screen name="Times" component={SecondScreen} options={{ title: 'Times' }} />
          <Tab.Screen name="Proxima" component={CalculationScreen} options={{ title: 'Próxima' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    flex: 1,
  },
  containerCadastro: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 10,
  },
  inputCadastro: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 5,
    borderRadius: 10,
    width: 270,
    marginRight: 15,
  },
  inputGols: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 5,
    borderRadius: 10,
    width: 90,
    marginLeft: 15,
  },
  FlatList: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginVertical: 3,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 13,
  },
});
