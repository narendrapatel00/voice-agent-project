// In-memory key-value store for memory
let memoryStore = {};

export const saveMemory = (key, value) => {
  memoryStore[key] = value;
  return { key, value };
};

export const getMemory = (key) => {
  return memoryStore[key] || null;
};

export const getAllMemory = () => {
  return memoryStore;
};
