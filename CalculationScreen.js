import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import { useApp } from './App';

export default function CalculationScreen() {
  const { cadastros, proxima, setProxima } = useApp();
  const total = cadastros.length;

  const [valor, setValor] = React.useState('1');

  const resultado = total && valor ? (total / parseFloat(valor)).toFixed(2) : 0;

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Cálculo</Text>

      <Text style={styles.text}>Total de nomes: {total}</Text>

      <View style={styles.inputRow}>
        <Text style={styles.text}>Dividir por:</Text>
        <Text style={styles.valor}>{valor}</Text>
      </View>

      <Text style={styles.text}>Resultado: {resultado}</Text> */}

      <Text style={styles.title}>Proxima</Text>

      <FlatList
        data={proxima}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.text}>
              {index + 1} - {item.nome}
            </Text>
            <Text style={styles.text}>Gols: {item.gols}</Text>
            {/* <Text style={styles.text}>Categoria: {item.categoria}</Text> */}
          </View>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Limpar Proxima"
          color="red"
          onPress={() => {
            Alert.alert('Confirmação', 'Deseja limpar toda a tabela Proxima?', [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Confirmar',
                style: 'destructive',
                onPress: () => setProxima([]),
              },
            ]);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  valor: {
    fontSize: 16,
    marginLeft: 10,
  },
  item: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 5,
    marginVertical: 4,
  },
});
