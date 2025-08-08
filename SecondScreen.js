import React, { useState } from 'react';
import { distribuir } from './distribuir';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from './App';
import { FontAwesome } from '@expo/vector-icons';

export default function SecondScreen() {
  const {
    timeA,
    setTimeA,
    timeB,
    setTimeB,
    proxima,
    setProxima,
    setCadastros,
    cadastros,
    distribuirTimes,
  } = useApp();

  const [loadingDistribuir10, setLoadingDistribuir10] = useState(false);

  const substituirJogador = (item, origem, setOrigem) => {
    const atualProxima = [...proxima];
    if (atualProxima.length === 0) return;

    const novoOrigem = origem.filter((j) => j.id !== item.id);
    const primeiroDaProxima = atualProxima.shift();

    setOrigem([...novoOrigem, primeiroDaProxima]);
    setProxima([...atualProxima, item]);
  };

  const incrementarGols = (item, origem, setOrigem) => {
    const novoCadastros = cadastros.map((c) =>
      c.id === item.id ? { ...c, gols: (parseInt(c.gols) || 0) + 1 } : c
    );
    setCadastros(novoCadastros);

    setOrigem((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, gols: (parseInt(c.gols) || 0) + 1 } : c
      )
    );
  };

  const renderItem = (item, origem, setOrigem) => {
    const scale = new Animated.Value(1);

    const pulse = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => incrementarGols(item, origem, setOrigem));
    };

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>{item.nome}</Text>
          <Text style={styles.text}>⚽ {item.gols}</Text>
        </View>
        <TouchableOpacity onPress={pulse}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Text style={styles.icon}>⚽</Text>
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.subIcon}
          onPress={() => substituirJogador(item, origem, setOrigem)}
        >
          <FontAwesome name="exchange" size={22} color="#333" />
        </TouchableOpacity>
      </View>
    );
  };

  const limparTimes = () => {
    Alert.alert('Confirmação', 'Deseja mover todos os nomes de A e B para Próxima?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: () => {
          const todos = [...timeA, ...timeB];
          setProxima((prev) => [...prev, ...todos]);
          setTimeA([]);
          setTimeB([]);
        },
      },
    ]);
  };

  const distribuir10DaProxima = () => {
    if (timeA.length === 5 && timeB.length === 5) {
      Alert.alert(
        'Times já estão cheios',
        'Os times A e B já possuem 5 jogadores cada. Deseja continuar e substituir os times?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: () => executarDistribuicao10(),
          },
        ]
      );
    } else {
      executarDistribuicao10();
    }
  };

  const executarDistribuicao10 = () => {
    if (proxima.length === 0) {
      Alert.alert('Tabela Próxima está vazia.');
      return;
    }

    setLoadingDistribuir10(true);

    setTimeout(() => {
      const primeiros10 = proxima.slice(0, 10);
      const { timeA: novoA, timeB: novoB, proxima: novaProxima } = distribuir(primeiros10);

      setTimeA(novoA);
      setTimeB(novoB);

      const restanteProxima = proxima.slice(10);
      setProxima([...novaProxima, ...restanteProxima]);

      setLoadingDistribuir10(false);
      Alert.alert('Distribuição concluída com sucesso!');
    }, 1000);
  };

  const timePerdeu = (time, setTime, nomeTime) => {
    if (time.length < 5) {
      Alert.alert(`${nomeTime} possui menos de 5 jogadores.`);
      return;
    }

    Alert.alert(
      `${nomeTime} perdeu`,
      `Deseja mover os 5 jogadores atuais do ${nomeTime} para o final da tabela Próxima e repor com os 5 primeiros da lista (após atualizar)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setLoadingDistribuir10(true);

            setTimeout(() => {
              // Mover os 5 jogadores do time para o final da proxima
              const removidos = time.slice(0, 5);
              const novaProximaTemp = [...proxima, ...removidos];

              // Verificar se agora há pelo menos 5 jogadores disponíveis para reposição
              if (novaProximaTemp.length < 5) {
                setLoadingDistribuir10(false);
                Alert.alert('Erro', 'Mesmo após mover, a tabela Próxima ainda não tem jogadores suficientes para reposição.');
                return;
              }

              // Pegar os 5 primeiros da nova lista proxima
              const novosDaProxima = novaProximaTemp.slice(0, 5);
              const restanteProxima = novaProximaTemp.slice(5);

              // Atualizar os estados
              setProxima(restanteProxima);
              setTime(novosDaProxima);

              setLoadingDistribuir10(false);
              Alert.alert(`Reposição concluída para ${nomeTime}`);
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}></Text>
      <FlatList style={styles.FlatListAzul}
        data={timeA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item, timeA, setTimeA)}
      />
      <Button
        title="Time AZUL Perdeu"
        color="#212ea7ff"
        onPress={() => timePerdeu(timeA, setTimeA, 'Time A')}
        disabled={loadingDistribuir10}
      />

      <Text style={styles.title}></Text>
      <FlatList style={styles.FlatListLaranja}
        data={timeB}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item, timeB, setTimeB)}
      />
      <Button
        title="Time LARANJA Perdeu"
        color="#f59426d2"
        onPress={() => timePerdeu(timeB, setTimeB, 'Time B')}
        disabled={loadingDistribuir10}
      />

      {loadingDistribuir10 && (
        <Text style={{ color: 'white', textAlign: 'center', marginVertical: 5 }}>
          Processando substituição...
        </Text>
      )}

      <View style={{ marginTop: 3 }}>
        {loadingDistribuir10 ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <Button title="Distribuir Times" color="#0f0f0fff" onPress={distribuir10DaProxima} />
        )}
      </View>

      <View style={{ marginTop: 3 }}>
        <Button title="Limpar Times" color="red" onPress={limparTimes} disabled={loadingDistribuir10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#808080',
  },
  FlatListAzul: {
    backgroundColor: '#0000ff'
  },
  FlatListLaranja: {
    backgroundColor: '#ffa500'
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 0,
    marginVertical: 1,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  subIcon: {
    marginHorizontal: 8,
  },
});
