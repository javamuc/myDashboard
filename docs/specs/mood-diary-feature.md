# Mood Diary Feature Specification

## Overview

The Mood Diary feature allows users to track their daily emotions and experiences through a simple, intuitive interface. Users can create diary entries with emoticons, tags, and text content, providing a comprehensive way to record and reflect on their emotional journey.

## User Interface Components

### 1. Diary Editor

- **Location**: Floating overlay on the main interface
- **Access**: Via a "New Entry" button or the 'n' key
- **Components**:
  - Emoticon selector
  - Tag selector
  - Text input area
  - Save/Cancel buttons

#### 1.1 Emoticon Selector

- 9 predefined emoticons representing different moods:
  1. Ecstatic (😇)
  2. Happy (😍)
  3. Content (🙂)
  4. Neutral (🤔)
  5. Displeased (😕)
  6. Frustrated (😑)
  7. Annoyed (😵)
  8. Angry (😠)
  9. Furious (🤬)
- Keyboard shortcuts: Numbers 1-9
- Required for entry creation

#### 1.2 Tag Selector

- Predefined tags for common contexts:
  - work
  - family
  - relationship
  - friends
  - myself
  - school
  - coworkers
  - health
  - college
  - hobby
  - travel
  - fitness
  - entertainment
- Features:
  - Multiple tag selection
  - Custom tag creation
  - Tag filtering/search
  - At least one tag required

#### 1.3 Text Input

- Multi-line text area
- Character limit: 4000
- Required for entry creation

### 2. Entry List

- Chronological display (newest first)
- Pagination support
- Entry display includes:
  - Emoticon
  - Tags
  - Content preview
  - Creation date
  - Edit/Delete options

#### 2.1 Entry List filtering

- A button to filter the entries by emoticon. The button opens a drop down list of the icons, the button open with Enter or Space if it has focus
  - The list that opens can be navigated with up and down arrow keys and an icon can be selected with the Enter or Space key
  - The entries are filtered in the backend by that selected emoticon
- A button to filter the entries by tags. The button opens the tag-selector component below it in an overlay.
  - The user can use the keyboard shortcuts to select tags that the entries should be filtered by in the backend
  - Escape or Enter closes the overlay

## Technical Implementation

### Frontend Components

1. **DiaryEditorComponent**

   - Manages the diary entry creation/editing interface
   - Handles keyboard navigation
   - Manages state transitions between emoticon/tag/text input

2. **DiaryService**
   - Manages application state using signals
   - Handles API communication
   - Maintains emoticon and tag collections

### Backend Components

1. **DiaryEntry Entity**

   ```java
   @Entity
   @Table(name = "diary_entry")
   public class DiaryEntry {
       Long id
       Long userId
       String content
       String emoticon
       Set<String> tags
       Instant createdDate
       Instant lastModifiedDate
   }
   ```

2. **Database Schema**

   - diary_entry table
   - diary_entry_tags table (for tag collection)
   - Indexes on userId and createdDate

3. **REST API Endpoints**
   ```
   POST   /api/diary-entries      # Create entry
   PUT    /api/diary-entries/{id} # Update entry
   GET    /api/diary-entries      # Get all entries (paginated)
   GET    /api/diary-entries/{id} # Get single entry
   DELETE /api/diary-entries/{id} # Delete entry
   ```

## Security

### Authentication

- All diary operations require authentication
- Entries are user-specific
- Users can only access their own entries

### Data Validation

- Content length: 4000 characters max
- Required fields: content, emoticon, at least one tag
- User ID validation on all operations
- XSS protection on content

## User Experience

### Navigation Flow

1. Click "New Entry" or keyboard shortcut
2. Select emoticon (keyboard 1-9 or click)
3. Select tags (keyboard navigation or click)
4. Enter text content
5. Save with Cmd+Enter or click Save

### Keyboard Shortcuts

- 1-9: Select emoticon
- Enter/Right Arrow: Progress to next step
- Escape/Left Arrow: Go back/close
- Cmd+Enter: Save entry
- Tab: Navigate between elements

### Error Handling

- Clear error messages for validation failures
- Graceful handling of network errors
- Auto-save support for content
- Confirmation for destructive actions

## Performance Considerations

### Frontend

- Lazy loading of components
- Efficient state management with signals
- Debounced search/filter operations
- Optimized rendering with change detection

### Backend

- Pagination for entry lists
- Indexed queries for fast retrieval
- Efficient tag storage and querying
- Proper caching headers

## Future Enhancements

1. Entry search and filtering
2. Analytics & Insights
   Mood trends over time
   Activity statistics
   Tag usage analytics
   Writing streak tracking
   Word count statistics
3. Media Support
   Photo attachments
   Voice notes/audio recordings
   Handwritten notes/drawings
   File attachments
4. Rich text formatting
5. Entry sharing capabilities
6. Export functionality
7. Mobile optimization
8. Collaborative journals
9. Sharing of selected entries (social)
10. Custom collections/folders
11. Favorites/bookmarks
