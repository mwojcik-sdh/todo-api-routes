import supertokens from 'supertokens-node/lib/build/supertokens';
import { backendConfig } from '../../../config/backendConfig';
import type { Response } from 'express';
import type { SessionRequest } from 'supertokens-node/framework/express';
import { superTokensNextWrapper } from 'supertokens-node/nextjs';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import { CreateTodoPayload } from '../../../types/Todo';

import { TodoService } from '../../../services/todo';

supertokens.init(backendConfig());

export default async function createTodo(req: SessionRequest, res: Response) {
  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res,
  );

  if (req.method === 'POST') {
    const userId = req.session!.getUserId();
    const todoPayload = req.body as CreateTodoPayload;

    try {
      const response = await TodoService.createTodo(userId, todoPayload);
      res.json(response);
    } catch (error: any) {
      res.status(400).json({
        message: error?.message,
      });
    }
  } else {
    // user used unsupported method, let's throw an error
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`,
    );
  }
}
