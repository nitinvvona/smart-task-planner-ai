# 🎯 Smart Task Planner AI

An intelligent task management application powered by Google's Gemini AI that transforms your goals into actionable, organized task plans. Built with React, TypeScript, and Express.

Demo Video Link: https://drive.google.com/file/d/12urd01OByKFtvh1tGGmmhOs6O3yQGiNy/view?usp=drive_link
## ✨ Features

### 🤖 AI-Powered Task Generation
- Transform any goal into a structured task plan using **Google Gemini 2.0 Flash**
- Automatically generates tasks with priorities, estimated hours, and phases
- Descriptions written in simple, everyday language for easy understanding

### 📋 Multiple View Modes
- **List View**: Traditional task list organized by phases
- **Kanban Board**: Drag-and-drop task management across status columns
- **Calendar View**: Visual timeline with deadline tracking

### ⚡ Smart Task Management
- Expandable task descriptions with actionable steps
- Priority-based color coding (High, Medium, Low)
- Estimated time tracking for each task
- Optional deadline setting (user-controlled)
- Task dependencies tracking
- Bulk operations (edit, delete, status change)

### 🎨 Modern UI/UX
- Clean, intuitive interface with smooth animations
- Dark/Light theme support
- Responsive design for all screen sizes
- Gradient header with visual appeal
- Hover effects and transitions

### 📊 Progress Tracking
- Real-time progress calculation by phase
- Completion percentage display
- Visual progress bars
- Dashboard with plan overview

### 💾 Export & Share
- Export plans to PDF
- Export to CSV format
- Export to JSON format
- Share plans with others

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Wouter** - Routing
- **React Query** - Data fetching
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Database toolkit
- **Google Gemini AI** - Task generation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static typing

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Google AI API key

### Setup Steps

1. **Clone the repository**
```
git clone https://github.com/yourusername/smart-task-planner-ai.git
cd smart-task-planner-ai
```

2. **Install dependencies**
```
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://user:password@localhost:5432/taskplanner
GOOGLE_API_KEY=your_google_ai_api_key_here
FLASH_MODEL_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

4. **Initialize the database**
```
npm run db:push
```

5. **Start the development server**
```
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

### Creating a New Plan

1. **Navigate to Home page**
2. **Enter your goal** (e.g., "Plan a trip to Goa", "Learn programming")
3. **Add constraints** (optional - budget, time, resources)
4. **Click "Generate Plan"**
5. AI will create a structured task plan with phases

### Managing Tasks

**List View:**
- Click task name to expand/collapse details
- Use checkboxes to mark tasks complete
- Click edit icon to modify task details
- Drag tasks to reorder within phases

**Kanban View:**
- Drag tasks between columns (To Do, In Progress, Done)
- Use 3-dot menu for edit/delete actions
- Status changes automatically on drop

**Calendar View:**
- View tasks by deadline date
- Click on dates to see scheduled tasks
- Add/edit deadlines directly

### Task Properties

Each task includes:
- **Name**: Short, descriptive title
- **Description**: Simple, actionable steps
- **Priority**: High (red), Medium (yellow), Low (blue)
- **Estimated Hours**: Time needed to complete
- **Deadline**: Optional due date
- **Status**: Not Started, In Progress, Completed
- **Phase**: Logical grouping (Planning, Execution, etc.)

## 🏗️ Project Structure

```
smart-task-planner-ai/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── TaskCard.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── PlanDetail.tsx
│   │   ├── lib/          # Utilities
│   │   └── App.tsx
│   └── package.json
├── server/                # Backend Express app
│   ├── routes.ts         # API routes
│   ├── services/
│   │   └── llm.ts       # AI integration
│   └── db/
│       └── schema.ts    # Database schema
├── db/                   # Database files
└── package.json
```

## 🔧 API Endpoints

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create new plan
- `GET /api/plans/:id` - Get plan details
- `DELETE /api/plans/:id` - Delete plan

### Tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI Generation
- `POST /api/generate-plan` - Generate AI task plan

## 🎨 Key Features Explained

### AI Task Generation
The app uses Google Gemini AI to:
- Parse user goals into actionable tasks
- Organize tasks into logical phases
- Assign appropriate priorities
- Estimate completion time
- Write simple, understandable descriptions

### Smart Description Simplification
AI-generated descriptions are automatically:
- Converted to everyday language
- Broken into clear steps
- Free of technical jargon
- Easy to understand and follow

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interfaces
- Optimized for both desktop and mobile

## 🛠️ Development

### Run in development mode
```
npm run dev
```

### Build for production
```
npm run build
```

### Run tests
```
npm test
```

### Database commands
```
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



