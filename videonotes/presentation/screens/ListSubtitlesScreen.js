import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet, 
  TextInput,
  Alert,
  ToastAndroid
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@rneui/themed';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ListSubtitlesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Cómo aprender React Native',
      content: 'React Native es un framework para construir aplicaciones móviles usando JavaScript y React...',
      date: '2023-05-15',
      videoUrl: 'https://youtube.com/watch?v=abc123'
    },
    {
      id: '2',
      title: 'Guía completa de hooks',
      content: 'Los hooks son funciones que te permiten usar estado y otras características de React...',
      date: '2023-06-20',
      videoUrl: 'https://youtube.com/watch?v=def456'
    },
    {
      id: '3',
      title: 'Estilado en React Native',
      content: 'React Native usa una versión simplificada de CSS para estilar componentes...',
      date: '2023-07-10',
      videoUrl: 'https://youtube.com/watch?v=ghi789'
    },
  ]);

  // Filtrar notas basadas en la búsqueda
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReloadHome = () => {
    navigation.navigate('Home');
  };

  const handleViewDetails = (note) => {
    navigation.navigate('NoteDetailScreen', { note });
  };

  const handleCopyContent = (content) => {
    ToastAndroid.show('Texto copiado al portapapeles', ToastAndroid.SHORT);
  };

  const handleDeleteNote = (id) => {
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
            setNotes(notes.filter(note => note.id !== id));
            ToastAndroid.show('Nota eliminada', ToastAndroid.SHORT);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.noteItem} 
      onPress={() => handleViewDetails(item)}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.notePreview} numberOfLines={2}>{item.content}</Text>
        <Text style={styles.noteDate}>{item.date}</Text>
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity 
          onPress={() => handleCopyContent(item.content)}
          style={styles.actionButton}
        >
          <MaterialIcons name="content-copy" size={20} color="#34A853" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteNote(item.id)}
          style={styles.actionButton}
        >
          <AntDesign name="delete" size={20} color="#EA4335" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header idéntico al HomeScreen */}
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
        <Button 
          onPress={handleReloadHome} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'home',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
        <Button 
          onPress={() => {}} 
          buttonStyle={styles.headerButton}
          icon={{
            name: 'logout',
            type: 'material',
            color: '#7659EF',
            size: 24,
          }}
        />
      </View>

      <Text style={styles.title}>Mis Notas</Text>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar notas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity 
            style={styles.clearSearchButton} 
            onPress={() => setSearchQuery('')}
          >
            <MaterialIcons name="clear" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Lista de notas */}
      <SafeAreaView style={styles.listContainer}>
        {filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No se encontraron notas' : 'No tienes notas guardadas'}
            </Text>
          </View>
        )}
      </SafeAreaView>

      <StatusBar style="auto" />
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
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 20,
    borderRadius: 10,
  },
  headerButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#7659EF'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    paddingRight: 40,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteContent: {
    flex: 1,
    marginRight: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  noteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});