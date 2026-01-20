
import React from 'react';
import { Todo } from '../types';
import { CheckCircle, Circle, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const priorityColors = {
    low: 'text-blue-500 bg-blue-50',
    medium: 'text-yellow-500 bg-yellow-50',
    high: 'text-red-500 bg-red-50',
  };

  return (
    <div className={`group flex items-start gap-4 p-4 mb-3 bg-white border rounded-xl shadow-sm transition-all hover:shadow-md ${todo.is_completed ? 'opacity-70' : ''}`}>
      <button 
        onClick={() => onToggle(todo.id, !todo.is_completed)}
        className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        {todo.is_completed ? (
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500 text-white">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className={`text-lg font-medium leading-tight truncate ${todo.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {todo.title}
        </h3>
        {todo.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2 italic">
            {todo.description}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 ${priorityColors[todo.priority]}`}>
            <AlertCircle size={12} />
            {todo.priority.toUpperCase()}
          </span>
          {todo.due_date && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1">
              <Calendar size={12} />
              {todo.due_date}
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default TodoItem;
