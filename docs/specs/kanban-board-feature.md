# Kanban Board Feature Specification

## Overview

The Kanban Board feature provides users with a visual project management tool that follows the Kanban methodology. It allows users to track tasks through different stages of completion, visualize workflow, identify bottlenecks, and manage work in progress (WIP) limits. The feature supports multiple boards per user with customizable settings, drag-and-drop functionality, and detailed task management.

## User Interface Components

### 1. Board Management

- **Location**: Main dashboard interface
- **Access**: Via the dashboard navigation
- **Components**:
  - Board selector dropdown
  - Board settings
  - Task search functionality
  - New task creation button
  - Start board button (for new boards)
  - Column layout with task cards

#### 1.1 Board Selector

- Dropdown menu showing all boards belonging to the user
- Quick switching between multiple boards
- Default board created automatically if none exists
- Option to name and describe each board

#### 1.2 Board Columns

- Three standard columns representing task statuses:
  - To-Do: Tasks that need to be completed
  - In-Progress: Tasks currently being worked on
  - Done: Completed tasks
- Each column displays:
  - Column header with status name
  - Task count for the column
  - Scrollable container for task cards
  - Visual indicators for WIP limits

#### 1.3 Backlog View

- Alternative view for unstarted boards
- Collection of tasks that haven't been moved to the kanban flow
- Starting a board transitions from backlog to kanban view

### 2. Task Management

- **Task Card Components**:
  - Title
  - Description (preview)
  - Priority indicator
  - Due date (if set)
  - Assignee
  - Visual indicators for task status
  - Creation and modification dates

#### 2.1 Task Operations

- Create new tasks
- Edit existing tasks
- Move tasks between statuses (drag and drop)
- Delete tasks
- View detailed task information
- Set task priority (1-4 scale)
- Assign tasks to users
- Set due dates

#### 2.2 Task Filtering and Sorting

- Search tasks by title
- Filter by various properties (title, assignee, due date, priority)
- Sort tasks by different properties
- Clear filters option
- Custom sorting rules per column:
  - To-Do & In-Progress: By priority then last modified date
  - Done: By last modified date (newest first)

## Technical Implementation

### Data Models

1. **Board Entity**

```java
@Entity
@Table(name = "board")
public class Board implements Serializable {

  private Long id;
  private String title;
  private String description;
  private boolean started = false;
  private Integer toDoLimit = 5;
  private Integer progressLimit = 2;
  private Instant createdDate;
  private Long ownerId;
  private boolean archived = false;
  private boolean autoPull = false;
}

```

2. **Task Entity**

```java
@Entity
@Table(name = "task")
public class Task implements Serializable {

  private Long id;
  private String title;
  private String description;
  private Instant dueDate;
  private int priority = 1;
  private String status = "to-do";
  private String assignee;
  private Instant createdDate;
  private Instant lastModifiedDate;
  private Long boardId;
  private Integer position;
}

```

### Frontend Components

1. **BoardComponent**

   - Main component for the kanban board UI
   - Manages board selection and display
   - Handles task filtering and sorting
   - Controls board views (backlog vs. kanban)
   - Implements drag-and-drop functionality

2. **BoardColumnsComponent**

   - Renders the columns for the kanban view
   - Manages task cards within columns
   - Implements column-specific drag-and-drop

3. **BacklogBoardComponent**

   - Displays backlog tasks for unstarted boards
   - Allows task creation and management before board start

4. **TaskCardComponent**

   - Displays individual task information
   - Handles task selection for details view

5. **Services**
   - BoardService: Manages board data and operations
   - TaskService: Handles task CRUD operations
   - SidebarService: Controls the task details sidebar

### Backend Components

1. **Board Service**

   - Creating, retrieving, updating, and deleting boards
   - Managing board settings and properties
   - Creating default board for new users
   - Ensuring board ownership and security

2. **Task Service**

   - Task CRUD operations
   - Status validation and transitions
   - Board-specific task retrieval
   - Task position management
   - Security checks for task operations

3. **REST API Endpoints**

   ```
   GET    /api/boards                  # Get all user boards
   POST   /api/boards                  # Create new board
   GET    /api/boards/{id}             # Get specific board
   PUT    /api/boards/{id}             # Update board
   DELETE /api/boards/{id}             # Archive board

   POST   /api/tasks                   # Create task
   PUT    /api/tasks/{id}              # Update task
   GET    /api/tasks/{id}              # Get task
   DELETE /api/tasks/{id}              # Delete task
   GET    /api/boards/{id}/tasks       # Get all tasks for board
   GET    /api/boards/{id}/tasks/{status} # Get tasks by status
   ```

## Advanced Features

### 1. Work-in-Progress (WIP) Limits

- Configurable limits for To-Do and In-Progress columns
- Visual indicators when limits are reached
- Enforced limits to prevent overloading columns
- Default limits: 5 for To-Do, 2 for In-Progress

### 2. Auto-Pull Functionality

- Optional setting to automatically pull tasks from To-Do to In-Progress
- Maintains workflow efficiency when tasks are completed
- Respects WIP limits when pulling tasks

### 3. Task Prioritization

- Four priority levels (1-4)
- Visual indicators for task priority
- Automatic sorting based on priority within columns
- Enables focus on high-priority items

### 4. Task Details Sidebar

- Detailed view of selected task
- Full description display
- Task editing capabilities
- Status change options
- Delete and update functionalities

## Security

### Authentication

- All board operations require authentication
- Boards are user-specific
- Users can only access their own boards and tasks

### Data Validation

- Required fields validation
- Status transition validation
- WIP limit enforcement
- User ID validation on all operations

## User Experience

### Navigation Flow

1. Select or create a board
2. Add tasks to the backlog
3. Start the board to transition to kanban view
4. Move tasks through workflow stages (To-Do → In-Progress → Done)
5. Filter and search tasks as needed
6. View task details by selecting a task card

### Keyboard Support

- Arrow keys for navigation
- Keyboard shortcuts for common operations
- Accessibility support for screen readers

### Drag and Drop

- Intuitive drag-and-drop for task movement
- Visual feedback during drag operations
- Status validation during drops
- Position updates to maintain order

## Performance Considerations

### Frontend

- Efficient rendering with Angular signals
- Optimized drag-and-drop operations
- Debounced search and update operations
- Lazy loading of components

### Backend

- Efficient querying with proper indexing
- Security checks at service level
- Transaction management
- Proper error handling and validation

## Future Enhancements

1. Custom columns and workflow stages
2. Advanced filtering and saved filters
3. Task dependencies and relationships
4. Time tracking and estimates
5. Board templates and presets
6. Task comments and activity logs
7. Team boards with shared access
8. Metrics and analytics dashboard
9. File attachments for tasks
10. Integration with calendar and notifications
11. Swimlanes for categorizing tasks
12. Customizable card colors and labels
