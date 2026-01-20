
export interface Todo {
  id: string;
  created_at: string;
  title: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  description: string | null;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
