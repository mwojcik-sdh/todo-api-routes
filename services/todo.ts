import { prisma } from '../lib/prisma';
import { CreateTodoPayload, Todo } from '../types/Todo';

export const TodoService = {
  async createTodo(userId: string, todo: CreateTodoPayload): Promise<Todo> {
    return prisma.todo.create({
      data: {
        title: todo.title,
        description: todo.description,
        ownerId: userId,
        isDone: false,
      },
    });
  },
  async getTodos(userId: string): Promise<Todo[]> {
    return prisma.todo.findMany({
      where: {
        ownerId: userId,
      },
    });
  },
  async updateTodo(
    userId: string,
    todoId: string,
    payload: Partial<CreateTodoPayload>,
  ) {
    const selectedTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (selectedTodo?.ownerId !== userId) {
      return { message: 'Unauthorized' };
    }

    return await prisma.todo.update({
      where: {
        id: todoId,
      },
      data: payload,
      select: {
        id: true,
        title: true,
        description: true,
        isDone: true,
      },
    });
  },
  async deleteTodo(userId: string, todoId: string) {
    const selectedTodo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (selectedTodo?.ownerId !== userId) {
      return { message: 'Unauthorized' };
    }

    return await prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  },
  async getTodo(userId: string, todoId: string) {
    const todo = await prisma.todo.findUnique({ where: { id: todoId } });

    if (todo?.ownerId !== userId) {
      return { message: 'Unauthorized' };
    }

    return todo;
  },
};
