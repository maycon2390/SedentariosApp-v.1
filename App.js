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

// Constantes para AsyncStorage
const SALVAR_CADASTROS = 'cadastros';
const SALVAR_TIME_A = 'timeA';
const SALVAR_TIME_B = 'timeB';
const SALVAR_PROXIMA = 'proxima';

// AsyncStorage helpers
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

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const Tab = createBottomTabNavigator();

// Função para distribuir 10 primeiros da lista entre timeA e timeB niveladamente por categoria
const distribuir = (lista) => {
  const dezPrimeiros = lista.slice(0, 10);
  const restante = lista.slice(10);

  // Agrupa por categoria (S, J, I)
  const porCategoria = {};
  dezPrimeiros.forEach((item) => {
    if (!porCategoria[item.categoria]) porCategoria[item.categoria] = [];
    porCategoria[item.categoria].push(item);
  });

  const timeA = [];
  const timeB = [];

  Object.values(porCategoria).forEach((listaCategoria) => {
    const metade = Math.floor(listaCategoria.length / 2);
    const sobra = listaCategoria.length % 2;

    timeA.push(...listaCategoria.slice(0, metade));
    timeB.push(...listaCategoria.slice(metade, metade + metade));

    if (sobra) {
      if (timeA.length <= timeB.length) {
        timeA.push(listaCategoria[listaCategoria.length - 1]);
      } else {
        timeB.push(listaCategoria[listaCategoria.length - 1]);
      }
    }
  });

  const trimTime = (time) => (time.length <= 5 ? time : time.slice(0, 5));
  const finalA = trimTime(timeA);
  const finalB = trimTime(timeB);

  // Remove usados da proxima e junta resto com o restante da lista
  const usados = finalA.concat(finalB);
  const novaProxima = [
    ...restante,
    ...lista.filter((item) => !dezPrimeiros.includes(item)),
  ].filter((item) => !usados.some((u) => u.id === item.id));

  return { timeA: finalA, timeB: finalB, proxima: novaProxima };
};

// Tela Principal: cadastro e ativar/desativar nomes
function MainScreen() {
  const { cadastros, setCadastros, proxima, setProxima } = useApp();

  const [nome, setNome] = useState('');
  const [gols, setGols] = useState('0');
  const [categoria, setCategoria] = useState('S');
  const [editandoId, setEditandoId] = useState(null);
  const [ativosIds, setAtivosIds] = useState([]);

  useEffect(() => {
    const ativos = proxima.map((item) => item.id);
    setAtivosIds(ativos);
  }, [proxima]);

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
          <Text style={styles.text}>Gols: {item.gols || 0}</Text>
          <Text style={styles.text}>Categoria: {item.categoria}</Text>
        </View>
        <Button
          title={ativado ? 'Desativar' : 'Ativar'}
          color={ativado ? 'red' : 'green'}
          onPress={() => toggleAtivar(item)}
        />
        <Button id="delete" style={styles.delete} title="🗑️" color="gray" onPress={() => excluirCadastro(item.id)} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={{ fontSize: 16, marginBottom: 6 }}>Gols</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        value={gols}
        onChangeText={setGols}
        keyboardType="numeric"
      />

      {/* <Text style={{ fontSize: 16, marginBottom: 6 }}>Categoria</Text> */}
      <Picker
        selectedValue={categoria}
        style={styles.picker}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        <Picker.Item label="Sedentário" value="S" />
        <Picker.Item label="Jovem" value="J" />
        <Picker.Item label="Infantil" value="I" />
      </Picker>

      <Button
        title={editandoId ? 'Atualizar Cadastro' : 'Cadastrar'}
        onPress={adicionarOuAtualizarCadastro}
      />

      <Text style={styles.title}>Novos Sedentários</Text>
      <FlatList
        data={cadastros}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

// Importando telas externas
import SecondScreen from './SecondScreen';
import CalculationScreen from './CalculationScreen';

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

  // Distribui os 10 primeiros da lista passada (normalmente proxima)
  const distribuirTimes = useCallback(
    (lista) => {
      if (!lista || lista.length === 0) {
        Alert.alert('Sem nomes suficientes para distribuir');
        return;
      }
      const { timeA, timeB, proxima: novaProxima } = distribuir(lista);
      setTimeA(timeA);
      setTimeB(timeB);
      setProxima(novaProxima);
    },
    []
  );

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
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Home" component={MainScreen} />
          <Tab.Screen name="Times" component={SecondScreen} />
          <Tab.Screen name="Proxima" component={CalculationScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, marginVertical: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: { height: 70, marginBottom: 0 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 0,
    marginVertical: 0,
    borderRadius: 4,
  },
  text: { fontSize: 10 },
});
