import { CreateTodoPayload, Todo } from '../types/Todo';
import { httpClient } from '../lib/httpClient';

export const TodoApi = {
  async createTodo(payload: CreateTodoPayload) {
    const res = await httpClient.post('/api/todo/create', payload);

    return res.data;
  },
  async getTodos() {
    const res = await httpClient.get<Todo[]>('/api/todo');
    return res.data;
  },
  async getTodo(todoId: string) {
    const res = await httpClient.get(`/api/todo/${todoId}`);
    return res.data;
  },
  async updateTodo(todoId: string, payload: Partial<CreateTodoPayload>) {
    const res = await httpClient.patch(`/api/todo/${todoId}`, payload);
    return res.data;
  },
  async deleteTodo(todoId: string) {
    const res = await httpClient.delete(`/api/todo/${todoId}`);
    return res.data;
  },
};
