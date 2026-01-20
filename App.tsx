
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Todo } from './types';
import * as db from './supabaseService';
import { refineTaskDescription } from './geminiService';
import TodoItem from './components/TodoItem';
import { Plus, Sparkles, LayoutList, CheckCircle2, ListTodo, Loader2, History } from 'lucide-react';

type FilterType = 'active' | 'completed';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [isRefining, setIsRefining] = useState(false);
  const [filter, setFilter] = useState<FilterType>('active');

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await db.fetchTodos();
      setTodos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1
  };

  // Filter and then Sort
  const filteredAndSortedTodos = useMemo(() => {
    const filtered = todos.filter(t => filter === 'active' ? !t.is_completed : t.is_completed);
    
    return filtered.sort((a, b) => {
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [todos, filter]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let description = '';
    setIsRefining(true);
    try {
      description = await refineTaskDescription(newTitle);
      const newTodo = await db.createTodo({
        title: newTitle,
        priority,
        is_completed: false,
        description: description || null
      });
      setTodos(prev => [newTodo, ...prev]);
      setNewTitle('');
      setFilter('active'); // 새 할 일을 추가하면 진행 중 목록으로 이동
    } catch (error) {
      console.error(error);
      alert('Failed to add task.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleToggle = async (id: string, is_completed: boolean) => {
    try {
      const updated = await db.updateTodo(id, { is_completed });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 할 일을 삭제하시겠습니까?')) return;
    try {
      await db.deleteTodo(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.is_completed).length,
    pending: todos.filter(t => !t.is_completed).length
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <LayoutList size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Gemini Tasks</h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setFilter('active')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListTodo size={16} />
              <span>{stats.pending}</span>
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${filter === 'completed' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CheckCircle2 size={16} />
              <span>{stats.completed}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {/* Input Area - Only show when in Active filter */}
        {filter === 'active' && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="무엇을 해야 하나요?"
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">
                  {isRefining ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        priority === p 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || isRefining}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus size={20} />
                  할 일 추가
                </button>
              </div>
            </form>
          </section>
        )}

        {/* List Area */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              {filter === 'active' ? <ListTodo size={14} /> : <History size={14} />}
              {filter === 'active' ? '진행 중인 할 일' : '완료된 할 일'}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p>목록을 불러오는 중...</p>
            </div>
          ) : filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                {filter === 'active' ? <ListTodo size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {filter === 'active' ? '할 일이 없습니다' : '완료된 할 일이 없습니다'}
              </h3>
              <p className="text-slate-500 mt-1">
                {filter === 'active' ? '새로운 할 일을 추가해보세요!' : '오늘 하루도 힘내세요!'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredAndSortedTodos.map(todo => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={handleToggle} 
                  onDelete={handleDelete} 
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t py-3 text-center text-xs text-slate-400 uppercase tracking-widest font-bold">
        Supabase Cloud & Gemini AI Powered
      </footer>
    </div>
  );
};

export default App;
