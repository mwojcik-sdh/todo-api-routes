export type CreateTodoPayload = {
  title: string;
  description: string;
  isDone?: boolean;
};

export type Todo = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  isDone: boolean;
};
