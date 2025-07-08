import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotesStore = create(
  persist(
    (set, get) => ({
      notes: [],
      
      // Añadir una nueva nota
      addNote: (note) => {
        const newNote = {
          ...note,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },
      
      // Eliminar una nota por ID
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== id),
        }));
      },
            // Obtener una nota por ID
      getNoteById: (id) => {
        return get().notes.find(note => note.id === id);
      },
      
      // Buscar notas por título o contenido
      searchNotes: (query) => {
        const lowerCaseQuery = query.toLowerCase();
        return get().notes.filter(note => 
          note.title.toLowerCase().includes(lowerCaseQuery) || 
          note.content.toLowerCase().includes(lowerCaseQuery)
        );
      }
    }),
    {
      name: 'notes-storage', // nombre único para el almacenamiento
      storage: createJSONStorage(() => AsyncStorage), // usa AsyncStorage en React Native
      partialize: (state) => ({ notes: state.notes }), // solo persistir las notas
    }
  )
);