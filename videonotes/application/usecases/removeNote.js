export const removeNote = async (noteRepository, id) => {
  try {
    if (!id) {
      throw new Error('El ID de la nota es requerido para eliminarla');
    }
    await noteRepository.remove(id);
    return { success: true, message: 'Nota eliminada correctamente' };
  } catch (error) {
    console.error('Error al eliminar la nota:', error);
    throw error;
  }
}
