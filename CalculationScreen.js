// CalculationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import { useApp } from './App';

export default function CalculationScreen() {
  const { cadastros } = useApp();
  const quantidade = cadastros.length;

  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const numero = parseFloat(valor.replace(',', '.'));
    if (isNaN(numero)) {
      Alert.alert('Erro', 'Digite um número válido.');
      return;
    }
    if (quantidade === 0) {
      Alert.alert('Erro', 'Não há cadastros para dividir.');
      return;
    }
    const res = numero / quantidade;
    setResultado(res);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cálculo</Text>
      <Text style={styles.label}>
        Quantidade de nomes cadastrados: {quantidade}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite um valor"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />

      <Button title="Calcular" onPress={calcular} />

      <View style={{ marginTop: 20 }}>
        {resultado !== null ? (
          <Text style={styles.result}>
            Resultado: {resultado.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </Text>
        ) : (
          <Text style={styles.hint}>Insira um valor e pressione Calcular</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 30,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 16,
  },
  result: { fontSize: 18, fontWeight: '600' },
  hint: { fontSize: 14, fontStyle: 'italic', color: '#555' },
});
