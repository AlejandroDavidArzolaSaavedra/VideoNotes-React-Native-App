import React, { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OrientationProvider } from './OrientationContext';
import LoginScreen from './presentation/screens/LoginScreen';
import HomeScreen from './presentation/screens/HomeScreen';
import ListSubtitlesScreen from './presentation/screens/ListSubtitlesScreen'; 
import NoteDetailScreen from './presentation/screens/NoteDetailScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from './utils/supabase';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const subscription = AppState.addEventListener('change', (state) => {
      state === 'active' ? auth.startAutoRefresh() : auth.stopAutoRefresh();
    });

    const { data: { subscription: authListener } } = auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.remove();
      authListener?.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <MainApp session={session} />
    </SafeAreaProvider>
  );
}

function MainApp({ session }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: '#000000',
      }}
    >
      <OrientationProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!session ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ListSubtitlesScreen" component={ListSubtitlesScreen} />
                <Stack.Screen name="NoteDetailScreen" component={NoteDetailScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" translucent backgroundColor="transparent" />
      </OrientationProvider>
    </View>
  );
}
