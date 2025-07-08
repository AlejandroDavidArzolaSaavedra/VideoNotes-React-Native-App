export const getAllNotes = async (noteRepository) => {
  try {
    const notes = await noteRepository.getAll();
    return notes;
  } catch (error) {
    console.error('Error al obtener las notas:', error);
    throw error;
  }
};
