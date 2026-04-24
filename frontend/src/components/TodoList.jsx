import React from 'react';

const TodoList = ({ todos }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Your Tasks
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2">
        {todos.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No tasks yet. Ask the agent to add one!
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="flex-1">
                  <p className={`text-gray-800 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                    {todo.task}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodoList;
