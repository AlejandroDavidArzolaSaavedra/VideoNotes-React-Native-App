import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as aesjs from 'aes-js';
import { GoTrueClient } from '@supabase/gotrue-js';
import { PostgrestClient } from '@supabase/postgrest-js';

class LargeSecureStore {
  async _encrypt(key, value) {
    const encryptionKey = await Crypto.getRandomBytesAsync(32); // 256 bits = 32 bytes
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  async _decrypt(key, value) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return null;

    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(encryptionKeyHex), new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return await this._decrypt(key, encrypted);
  }

  async removeItem(key) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key, value) {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

const supabaseUrl = 'https://xtwpnwclvxaujjdlnlxr.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3Bud2NsdnhhdWpqZGxubHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mjg3MTYsImV4cCI6MjA2NDIwNDcxNn0.aj2gd2H6fxYKPkslp266N2jHfzVbUKmpJWEULs2MXYk";

export const auth = new GoTrueClient({
  url: `${supabaseUrl}/auth/v1`,
  autoRefreshToken: true,
  persistSession: true,
  storageKey: 'supabase.auth.token',
  storage: new LargeSecureStore(),
  fetch,
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
});

export const db = () => {
  const token = auth.session()?.access_token;

  return new PostgrestClient(`${supabaseUrl}/rest/v1`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey}`,
    },
    fetch,
  });
};


