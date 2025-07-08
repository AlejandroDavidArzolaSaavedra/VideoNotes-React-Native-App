import { NoteRepository } from '../domain/noteRepository.js';

// TODO: IMPLEMENTAR USANDO 
export default class NoteRepositoryImpl extends NoteRepository {
    async getAll() {
        const notes = await window.electronAPI.getAllNotes();
        return notes;
    }

    async add(note) {
        const addedNote = await window.electronAPI.addNote(note);
        return addedNote;
    }

    async search(query) {
        const results = await window.electronAPI.searchNotes(query);
        return results;
    }

    async update(note) {
        const updatedNote = await window.electronAPI.updateNote(note);
        return updatedNote;
    }

    async remove(id) {
        await window.electronAPI.removeNote(id);
    }

    async clear() {
        await window.electronAPI.clearNotes();
    }
}