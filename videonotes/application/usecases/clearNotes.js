export const clearNotes = async (noteRepository) => { 
    try {
        await noteRepository.clear();
        return { message: 'Todas las notas han sido eliminadas' };
    } catch (error) {
        console.error('Error al eliminar todas las notas:', error);
        throw error;
    }
}
