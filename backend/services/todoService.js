import crypto from 'crypto';

// In-memory store for demo purposes
// In a real app, use MongoDB (Mongoose) here
let todos = [];

export const addTodo = (task) => {
  const newTodo = {
    id: crypto.randomUUID(),
    task,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  return newTodo;
};

export const updateTodo = (id, newTaskText) => {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.task = newTaskText;
    todo.updatedAt = new Date().toISOString();
    return todo;
  }
  return null;
};

export const deleteTodo = (id) => {
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);
  return todos.length < initialLength;
};

export const listTodos = () => {
  return todos;
};
