
import { Todo } from './types';

const SUPABASE_URL = 'https://jpdpdqjretkcagjttxfl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Js9IxfH4oM49zYMSTanycQ_tKIk27u3';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export const fetchTodos = async (): Promise<Todo[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/todos?order=created_at.desc`, {
      headers,
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Fetch Error Details:', errorText);
      throw new Error(`Failed to fetch todos: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Network or API Error:', error);
    throw error;
  }
};

export const createTodo = async (todo: Partial<Todo>): Promise<Todo> => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/todos`, {
    method: 'POST',
    headers,
    body: JSON.stringify(todo)
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create Error:', errorText);
    throw new Error('Failed to create todo');
  }
  const data = await response.json();
  return data[0];
};

export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/todos?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update todo');
  const data = await response.json();
  return data[0];
};

export const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/todos?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete Error details:', errorText, 'Status:', response.status);
    throw new Error('Failed to delete todo');
  }
};
