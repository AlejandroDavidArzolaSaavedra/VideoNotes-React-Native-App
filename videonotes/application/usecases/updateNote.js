export const updateNote = async (noteRepository, note) => {
  try {
    if (!note.id) {
      throw new Error('La nota debe tener un ID para ser actualizada');
    }
    const updatedNote = await noteRepository.update(note);    
    return updatedNote;
  } catch (error) {
    console.error('Error al actualizar la nota:', error);
    throw error;
  }
};
