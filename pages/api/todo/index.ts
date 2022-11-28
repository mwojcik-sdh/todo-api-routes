import type { Response } from 'express';
import type { SessionRequest } from 'supertokens-node/framework/express';
import { superTokensNextWrapper } from 'supertokens-node/nextjs';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import supertokens from 'supertokens-node';
import { backendConfig } from '../../../config/backendConfig';
import { TodoService } from '../../../services/todo';

supertokens.init(backendConfig());

export default async function getTodos(req: SessionRequest, res: Response) {
  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res,
  );

  if (req.method === 'GET') {
    const userId = req.session!.getUserId();

    try {
      const response = await TodoService.getTodos(userId);
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
