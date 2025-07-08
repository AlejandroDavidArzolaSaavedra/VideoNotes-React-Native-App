export const searchNote = async (noteRepository, query) => {
  try {
    const notes = await noteRepository.search(query);
    return notes;
  } catch (error) {
    console.error('Error al buscar notas:', error);
    throw error;
  }
}