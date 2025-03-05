# Note-Taking Feature Documentation

## Overview

The note-taking feature provides users with a modern, intuitive interface for creating, editing, and managing personal notes. This feature enables users to quickly jot down thoughts, create reminders, or store important information in a secure, easily accessible environment.

## Functionality

### Core Features

1. **Create Notes**: Users can create new notes with a title and content body.
2. **Edit Notes**: Real-time editing with automatic saving as users type.
3. **Delete Notes**: Remove unwanted notes with keyboard shortcuts or UI controls.
4. **List View**: Browse all notes in a list, sorted by last modified date.
5. **Preview**: View a preview of each note's content in the list view.
6. **Search**: Filter notes by searching for text in titles or content.

### User Experience

- **Keyboard Shortcuts**:

  - `n` - Create a new note
  - `f` - Focus the search box
  - `Shift + Cmd/Ctrl + Backspace` - Delete the selected note

- **Responsive Design**: The interface adapts to different screen sizes, with a side-by-side layout for larger screens.

## Technical Implementation

### Component Structure

The feature is built using Angular with a component-based architecture:

1. **NotesComponent** (`notes.component.ts`):

   - The main container component that manages the overall note application state
   - Handles user interactions (keyboard shortcuts, note selection, etc.)
   - Manages communication with the backend service

2. **NoteListComponent** (`note-list.component.ts`):

   - Displays the list of notes with titles, previews, and dates
   - Handles note selection
   - Displays a "No notes found" message when appropriate

3. **NoteEditorComponent** (`note-editor.component.ts`):
   - Provides the editing interface for a selected note
   - Handles the actual editing of note title and content
   - Emits updates to the parent component

### Data Model

The note feature uses the following data models:

- **Note**: Represents a complete note with all properties:

  ```typescript
  interface Note {
    id: number;
    title: string;
    content: string;
    lastModifiedDate: string;
    createdDate: string;
    user_id: number;
  }
  ```

- **NewNote**: Used when creating a new note (omits server-generated fields):
  ```typescript
  interface NewNote extends Omit<Note, 'id' | 'lastModifiedDate' | 'createdDate' | 'user_id'> {
    title: string;
    content: string;
  }
  ```

### Services

The **NoteService** (`note.service.ts`) handles all communication with the backend:

- `create(note: NewNote)`: Creates a new note
- `update(note: Note)`: Updates an existing note
- `find(id: number)`: Retrieves a specific note by ID
- `query()`: Retrieves all notes for the current user
- `delete(id: number)`: Deletes a note by ID

### API Endpoints

The note feature uses the following RESTful API endpoints:

- `GET /api/notes`: Retrieve all notes for the current user
- `GET /api/notes/{id}`: Retrieve a specific note by ID
- `POST /api/notes`: Create a new note
- `PUT /api/notes/{id}`: Update an existing note
- `DELETE /api/notes/{id}`: Delete a note

## Performance Considerations

1. **Debounced Saves**: Note updates are debounced (300ms) to prevent excessive API calls while typing.
2. **Optimistic Updates**: UI updates happen immediately before the API call completes for a responsive feel.
3. **Efficient Filtering**: Note filtering happens client-side for quick search results.

## Security Considerations

1. **User Isolation**: Each user can only access their own notes.
2. **Server-side Validation**: All note operations verify the current user owns the note.
3. **Input Sanitization**: Content is properly sanitized to prevent XSS attacks.

## User Interface

The notes feature has a clean, modern interface with:

1. **Split-View Layout**:

   - Left sidebar with note list and search
   - Right panel with the note editor

2. **Note List**:

   - Displays note title, preview, and last modified date
   - Highlights the currently selected note
   - Shows "No notes found" when appropriate

3. **Note Editor**:
   - Clean, distraction-free editing experience
   - Title and content fields
   - Last modified date display

## Future Enhancements

Potential improvements to consider:

1. **Rich Text Editing**: Add formatting options (bold, italic, lists, etc.)
2. **Note Categories/Tags**: Allow users to organize notes with tags or folders
3. **Note Sharing**: Enable collaborative editing or sharing notes with other users
4. **Attachments**: Support for images or file attachments in notes
5. **Export Options**: Export notes to common formats (PDF, Markdown, etc.)
6. **Offline Support**: Enable offline editing with sync when connection is restored
7. **Templates**: Predefined templates for common note types

## Troubleshooting

Common issues and solutions:

1. **Notes Not Saving**: Ensure network connectivity and check browser console for errors
2. **Search Not Working**: Verify the search term is present in note titles or content
3. **Notes Not Loading**: Check browser console for API errors and ensure user is authenticated
