import React, { useState } from 'react';
import { Alert, StyleSheet, View, Image } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { auth } from '../../utils/supabase';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    console.log('Iniciando sesión con email:', email);
    setLoading(true);
    try {
      const { error } = await auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Error', 'Credenciales incorrectas');
        return;
      }
      onLogin(); // cambia de pantalla
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    try {
      const { error } = await auth.signUp({ email, password });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      Alert.alert('Verifica tu correo', 'Revisa tu bandeja de entrada.');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <View style={styles.card}>
        <Input
          label="Email"
          labelStyle={styles.label}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#888' }}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Contraseña"
          labelStyle={styles.label}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: '#888' }}
          rightIcon={{
            type: 'font-awesome',
            name: passwordVisible ? 'eye-slash' : 'eye',
            color: '#888',
            onPress: () => setPasswordVisible(!passwordVisible),
          }}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
          onChangeText={setPassword}
          value={password}
          secureTextEntry={!passwordVisible}
          placeholder="Contraseña"
          autoCapitalize="none"
        />
        <Button title="Iniciar sesión" onPress={signInWithEmail} loading={loading} buttonStyle={styles.button} />
        <Button title="Registrarse" onPress={signUpWithEmail} type="outline" buttonStyle={styles.outlineButton} titleStyle={styles.outlineButtonText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  verticallySpaced: {
    marginVertical: 12,
    alignSelf: 'stretch',
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7659EF',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  outlineButton: {
    borderColor: '#7659EF',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: '#7659EF',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#7659EF',
    borderRadius: 10,
    paddingVertical: 12,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  }
});
