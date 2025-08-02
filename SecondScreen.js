// SecondScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useApp } from './App';

export default function SecondScreen() {
  const {
    timeA,
    setTimeA,
    timeB,
    setTimeB,
    proxima,
    setProxima,
    limparTimes,
  } = useApp();

  const [loading, setLoading] = useState(false);

  // Perdeu Time A / B (mantém existentes se quiser manter também)
  const perdeuTime = async (time, setTime) => {
    if (time.length === 0) return;
    setLoading(true);

    // pega os 5 primeiros do time, move para o final de proxima
    const movingOut = time.slice(0, 5);
    const restanteTime = time.slice(5);
    const novaProximaIntermediaria = [...proxima, ...movingOut];

    // atualiza imediatamente proxima e time (removendo os 5)
    setProxima(novaProximaIntermediaria);
    setTime(restanteTime);

    // simula aguarde
    await new Promise((r) => setTimeout(r, 400));

    // pega os 5 primeiros de proxima e adiciona ao final do time
    const substitutos = novaProximaIntermediaria.slice(0, 5);
    const restanteProximaFinal = novaProximaIntermediaria.slice(5);
    const novoTime = [...restanteTime, ...substitutos];

    setTime(novoTime);
    setProxima(restanteProximaFinal);

    setLoading(false);
  };

  const perdeuTimeA = () => perdeuTime(timeA, setTimeA);
  const perdeuTimeB = () => perdeuTime(timeB, setTimeB);

  // Long press em um nome do Time A
  const onLongPressTimeA = async (item, index) => {
    if (loading) return;
    setLoading(true);

    // Remove o item pressionado de timeA
    const novoTimeAWithout = [...timeA];
    novoTimeAWithout.splice(index, 1); // remove específico
    // adiciona esse item ao final de proxima
    const proximaComMovido = [...proxima, item];
    setTimeA(novoTimeAWithout);
    setProxima(proximaComMovido);

    // aguarda
    await new Promise((r) => setTimeout(r, 300));

    // pega o primeiro da proxima e coloca no final de timeA
    if (proximaComMovido.length > 0) {
      const primeiro = proximaComMovido[0];
      const proximaRestante = proximaComMovido.slice(1);
      setTimeA([...novoTimeAWithout, primeiro]);
      setProxima(proximaRestante);
    }

    setLoading(false);
  };

  // Long press em um nome do Time B
  const onLongPressTimeB = async (item, index) => {
    if (loading) return;
    setLoading(true);

    const novoTimeBWithout = [...timeB];
    novoTimeBWithout.splice(index, 1);
    const proximaComMovido = [...proxima, item];
    setTimeB(novoTimeBWithout);
    setProxima(proximaComMovido);

    await new Promise((r) => setTimeout(r, 300));

    if (proximaComMovido.length > 0) {
      const primeiro = proximaComMovido[0];
      const proximaRestante = proximaComMovido.slice(1);
      setTimeB([...novoTimeBWithout, primeiro]);
      setProxima(proximaRestante);
    }

    setLoading(false);
  };

  // Long press em Próxima remove o item (não afeta cadastros)
  const onLongPressProxima = (item, index) => {
    const novaProxima = [...proxima];
    novaProxima.splice(index, 1);
    setProxima(novaProxima);
  };

  const renderTimeAItem = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => onLongPressTimeA(item, index)}
      style={styles.item}
    >
      <Text>
        {item.nome} (Nível {item.nivel})
      </Text>
    </TouchableOpacity>
  );

  const renderTimeBItem = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => onLongPressTimeB(item, index)}
      style={styles.item}
    >
      <Text>
        {item.nome} (Nível {item.nivel})
      </Text>
    </TouchableOpacity>
  );

  const renderProximaItem = ({ item, index }) => (
    <TouchableOpacity
      onLongPress={() => onLongPressProxima(item, index)}
      style={styles.item}
    >
      <Text>
        {item.nome} (Nível {item.nivel}){' '}
        <Text style={{ fontStyle: 'italic', color: '#888' }}></Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 4 }}>Aguarde...</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Time A</Text>
      <FlatList style={styles.TimeA}
        data={timeA}
        keyExtractor={(item) => item.id}
        renderItem={renderTimeAItem}
        ListEmptyComponent={<Text>Sem jogadores</Text>}
      />

      <View style={styles.ButtonA}>
        <Button
          title="Perdeu Time A"
          onPress={perdeuTimeA}
          disabled={loading}
        />
      </View>

      <Text style={styles.sectionTitle}>Time B</Text>
      <FlatList style={styles.TimeB}
        data={timeB}
        keyExtractor={(item) => item.id}
        renderItem={renderTimeBItem}
        ListEmptyComponent={<Text>Sem jogadores</Text>}
      />

      <View style={styles.ButtonB}>
        <Button
          title="Perdeu Time B"
          onPress={perdeuTimeB}
          disabled={loading}
        />
      </View>

      <Text style={styles.sectionTitle}>Sedentários</Text>
      <FlatList style={styles.sedentarios}
        data={proxima}
        keyExtractor={(item) => item.id}
        renderItem={renderProximaItem}
        ListEmptyComponent={<Text>Sem jogadores</Text>}
      />

      <Button title="Limpar Times" onPress={limparTimes} disabled={loading} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 13, backgroundColor: '#fff'},
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 15,
  },
  item: {
    padding: 5,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
   TimeA: {
    padding: 6,
    backgroundColor: '#7d98f1ff',
    marginVertical: 4,
  },
  ButtonA: {
  
  },
  TimeB: {
    padding: 6,
    backgroundColor: '#db6030ff',
    marginVertical: 4,
  },
  ButtonB: {
  
  },
  sedentarios: {
    padding: 6,
    backgroundColor: '#9b9797ff',
    marginVertical: 4,
  },
});
