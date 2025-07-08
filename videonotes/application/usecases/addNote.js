export const addNote = async (noteRepository, note) => {
    try {
        if (!note || !note.title || !note.content) {
        throw new Error('La nota debe tener un título y contenido');
        }
        const addedNote = await noteRepository.add(note);
        return addedNote;
    } catch (error) {
        console.error('Error al agregar la nota:', error);
        throw error;
    }
}
