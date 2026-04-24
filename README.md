# Voice-Based AI Agent with Memory & Tools

This is a full-stack project featuring a voice-enabled AI agent capable of managing a To-Do list using function calling (tools) and recalling information using a simple memory system.

## ⚙️ Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Web Speech API
- **Backend**: Node.js + Express
- **AI**: OpenAI API (GPT-4o-mini)
- **Database**: In-memory (for simple demo setup, easily swappable to MongoDB)

## 📁 Project Structure
- `/frontend`: React application that captures voice, synthesizes speech, and displays the UI.
- `/backend`: Express server handling the API requests, interacting with OpenAI, and managing the To-Do list and Memory state.

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- OpenAI API Key

### 2. Backend Setup
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Open `backend/.env` and add your OpenAI API key:
   \`\`\`env
   PORT=5000
   OPENAI_API_KEY=your_actual_api_key_here
   \`\`\`
4. Start the server:
   \`\`\`bash
   npm start
   \`\`\`
   *(Server will run on http://localhost:5000)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`
   *(Frontend will run on http://localhost:5173)*

---

## 🎬 Demo Flow

1. **Add a Task**: Click the microphone icon and say:
   *"Add task to buy milk"*
   - The AI will call `addTodo()` and you will see the task appear on the right side.

2. **List Tasks**: Click the mic and say:
   *"What are my tasks?"*
   - The AI will call `listTodos()` and read your tasks back to you.

3. **Memory System**: Click the mic and say:
   *"My name is Narendra"*
   - The AI will call `saveMemory()` to store this fact.

4. **Memory Recall**: Later, click the mic and say:
   *"What is my name?"*
   - The AI will call `getMemory()` and answer correctly.

---

## 🔧 Moving to MongoDB
Currently, the app uses simple arrays/objects in `backend/services/` to store data so it can run immediately without setup.
To upgrade to MongoDB:
1. Install mongoose: `npm install mongoose` in `/backend`.
2. Update `backend/services/todoService.js` to use a Mongoose model.
3. Update `backend/services/memoryService.js` to use a Mongoose model.
4. Add `MONGO_URI` to `backend/.env` and connect in `server.js`.
