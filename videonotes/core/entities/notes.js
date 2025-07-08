class Note {
    constructor(id, title, content, createdAt, updatedAt, isPinned = false) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isPinned = isPinned;
    }
}

export default Note;
