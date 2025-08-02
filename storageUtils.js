// storageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SALVAR_CADASTROS = 'cadastros';
export const SALVAR_TIME_A = 'timeA';
export const SALVAR_TIME_B = 'timeB';
export const SALVAR_PROXIMA = 'proxima';

export const loadJSON = async (key, fallback) => {
  try {
    const v = await AsyncStorage.getItem(key);
    if (v !== null) return JSON.parse(v);
  } catch (e) {
    // opcional: logar se quiser
    console.warn(`Erro ao carregar ${key}`, e);
  }
  return fallback;
};

export const saveJSON = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao salvar ${key}`, e);
  }
};
