import OpenAI from 'openai';
import { addTodo, updateTodo, deleteTodo, listTodos } from '../services/todoService.js';
import { saveMemory, getMemory, getAllMemory } from '../services/memoryService.js';
import dotenv from 'dotenv';
dotenv.config();

// We initialize OpenAI. If OPENAI_API_KEY is missing (like on Render without env vars),
// we provide a dummy key so the server starts and falls back to offline mock mode smoothly.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key_to_prevent_crash",
});

// We keep a simple in-memory message history for the demo
const conversationHistory = [];

const SYSTEM_PROMPT = `
You are a smart, concise voice assistant that manages a to-do list.
You can use tools to add, update, delete, and list tasks.
You also remember important user details.
Use tools when required, otherwise respond naturally.
Keep your responses brief as they will be spoken out loud using Text-to-Speech.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "addTodo",
      description: "Add a new task to the user's to-do list.",
      parameters: {
        type: "object",
        properties: {
          task: {
            type: "string",
            description: "The description of the task to add.",
          },
        },
        required: ["task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "updateTodo",
      description: "Update an existing task in the to-do list.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The ID of the task to update.",
          },
          newTaskText: {
            type: "string",
            description: "The new description for the task.",
          },
        },
        required: ["id", "newTaskText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "deleteTodo",
      description: "Delete a task from the to-do list.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "The ID of the task to delete.",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listTodos",
      description: "Get all tasks currently in the to-do list.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "saveMemory",
      description: "Save an important fact or preference about the user to memory.",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "A short, descriptive key for the memory (e.g., 'userName', 'favoriteColor').",
          },
          value: {
            type: "string",
            description: "The value to remember.",
          },
        },
        required: ["key", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getMemory",
      description: "Retrieve a saved fact about the user from memory.",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "The key of the memory to retrieve (e.g., 'userName').",
          },
        },
        required: ["key"],
      },
    },
  }
];

export const chatWithAgent = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Initialize history if empty
  if (conversationHistory.length === 0) {
    conversationHistory.push({ role: "system", content: SYSTEM_PROMPT });
  }

  conversationHistory.push({ role: "user", content: message });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // using a fast and capable model
      messages: conversationHistory,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // Check if model wants to call any tools
    if (responseMessage.tool_calls) {
      conversationHistory.push(responseMessage); // Add assistant's tool call message

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let functionResponse;

        if (functionName === 'addTodo') {
          const result = addTodo(functionArgs.task);
          functionResponse = JSON.stringify({ status: "success", todo: result });
        } else if (functionName === 'updateTodo') {
          const result = updateTodo(functionArgs.id, functionArgs.newTaskText);
          functionResponse = JSON.stringify({ status: result ? "success" : "not found", todo: result });
        } else if (functionName === 'deleteTodo') {
          const result = deleteTodo(functionArgs.id);
          functionResponse = JSON.stringify({ status: result ? "success" : "not found" });
        } else if (functionName === 'listTodos') {
          const result = listTodos();
          functionResponse = JSON.stringify({ status: "success", todos: result });
        } else if (functionName === 'saveMemory') {
          const result = saveMemory(functionArgs.key, functionArgs.value);
          functionResponse = JSON.stringify({ status: "success", memory: result });
        } else if (functionName === 'getMemory') {
          const result = getMemory(functionArgs.key);
          functionResponse = JSON.stringify({ status: result ? "success" : "not found", value: result });
        }

        // Add function response to history
        conversationHistory.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });
      }

      // Second API call to let model summarize the tool execution results
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationHistory,
      });

      const finalMessage = secondResponse.choices[0].message.content;
      conversationHistory.push({ role: "assistant", content: finalMessage });
      
      return res.json({ reply: finalMessage });

    } else {
      // Model responded without calling tools
      conversationHistory.push({ role: "assistant", content: responseMessage.content });
      return res.json({ reply: responseMessage.content });
    }

  } catch (error) {
    console.error("Error communicating with OpenAI:", error.message || error);
    
    // --- DEMO FALLBACK MODE ---
    // If the API key is missing or invalid, fallback to regex matching so the demo still works!
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('add task')) {
      const taskText = message.replace(/add task( to)? /i, '').replace(/\.$/, '').trim();
      if (!taskText) return res.json({ reply: "What task would you like to add?" });
      
      const newTodo = addTodo(taskText);
      return res.json({ reply: `I have added the task: ${newTodo.task}` });
      
    } else if (lowerMessage.includes('delete task') || lowerMessage.includes('delete the task') || lowerMessage.includes('remove task') || lowerMessage.includes('remove the task') || lowerMessage.includes('clear task')) {
      const todos = listTodos();
      if (todos.length > 0) {
        // Just delete the first task for the mock demo
        const deletedTask = todos[0].task;
        deleteTodo(todos[0].id);
        return res.json({ reply: `I have deleted the task: ${deletedTask}` });
      } else {
        return res.json({ reply: "You don't have any tasks to delete." });
      }
      
    } else if (lowerMessage.includes('what are my tasks') || lowerMessage.includes('list tasks') || lowerMessage.includes('read my tasks')) {
      const todos = listTodos();
      if (todos.length === 0) return res.json({ reply: "You have no tasks right now." });
      const taskNames = todos.map(t => t.task).join(', ');
      return res.json({ reply: `You have ${todos.length} tasks. They are: ${taskNames}` });
      
    } else if (lowerMessage.includes('my name is')) {
      const name = message.toLowerCase().split('my name is')[1].replace(/\.$/, '').trim();
      saveMemory('userName', name);
      return res.json({ reply: `Got it. I will remember your name is ${name}.` });
      
    } else if (lowerMessage.includes('what is my name') || lowerMessage.includes('who am i')) {
      const name = getMemory('userName');
      return res.json({ reply: name ? `Your name is ${name}.` : "I don't know your name yet. Tell me by saying 'My name is...'" });
    }
    
    // If we can't parse it in fallback mode
    return res.json({ reply: "I am currently running in offline mock mode because the OpenAI API key is missing. Try saying 'add task to buy milk' or 'what are my tasks?'" });
  }
};

export const getTodos = (req, res) => {
  res.json(listTodos());
};

export const getMemoryInfo = (req, res) => {
  res.json(getAllMemory());
};

// Export getMemory for routes
export const getMemoryEndpoint = getMemoryInfo;
