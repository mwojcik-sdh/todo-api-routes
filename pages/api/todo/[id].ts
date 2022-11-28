import type { Response } from 'express';
import type { SessionRequest } from 'supertokens-node/framework/express';
import { superTokensNextWrapper } from 'supertokens-node/nextjs';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { CreateTodoPayload } from '../../../types/Todo';
import { TodoService } from '../../../services/todo';
import supertokens from 'supertokens-node';
import { backendConfig } from '../../../config/backendConfig';

supertokens.init(backendConfig());

export default async function manageTodo(req: SessionRequest, res: Response) {
  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res,
  );

  if (req.method === 'PATCH') {
    const { session, body, query } = req;
    const userId = session!.getUserId();
    const todoPayload = body as Partial<CreateTodoPayload>;
    const todoId = query.id as string;

    try {
      const response = await TodoService.updateTodo(
        userId,
        todoId,
        todoPayload,
      );
      res.json(response);
    } catch (error: any) {
      res.status(400).json({
        message: error?.message,
      });
    }
  } else if (req.method === 'DELETE') {
    const { session, query } = req;
    const userId = session!.getUserId();
    const todoId = query.id as string;

    try {
      const response = await TodoService.deleteTodo(userId, todoId);
      res.json(response);
    } catch (error: any) {
      res.status(400).json({
        message: error?.message,
      });
    }
  } else if (req.method === 'GET') {
    const { session, query } = req;
    const userId = session!.getUserId();
    const todoId = query.id as string;

    try {
      const response = await TodoService.getTodo(userId, todoId);
      res.json(response);
    } catch (error: any) {
      res.status(400).json({
        message: error?.message,
      });
    }
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}
