import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert, ToastAndroid } from 'react-native';

export default function NoteDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { note } = params;

  const handleCopyContent = () => {
    // Implementar lógica de copiado
    ToastAndroid.show('Texto copiado al portapapeles', ToastAndroid.SHORT);
  };

  const handleDeleteNote = () => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que quieres eliminar esta nota?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            // Aquí deberías implementar la lógica para eliminar la nota
            navigation.goBack();
            ToastAndroid.show('Nota eliminada', ToastAndroid.SHORT);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button 
          onPress={() => navigation.goBack()} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'arrow-back',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
        <View style={styles.headerActions}>
          <Button 
            onPress={handleCopyContent}
            buttonStyle={styles.headerButton}
            icon={{
              name: 'content-copy',
              type: 'material',
              color: '#34A853',
              size: 24,
            }}
          />
          <Button 
            onPress={handleDeleteNote}
            buttonStyle={styles.headerButton}
            icon={{
              name: 'delete',
              type: 'material',
              color: '#EA4335',
              size: 24,
            }}
          />
        </View>
      </View>

      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.url}>{note.videoUrl}</Text>
      <Text style={styles.date}>{note.date}</Text>

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.content}>{note.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#7659EF',
    
  },
  url: {
    fontSize: 14,
    color: '#7659EF',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  contentContainer: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
    maxHeight: '70%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    marginTop: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});