import { GetServerSidePropsContext } from 'next';
import supertokensNode from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import { backendConfig } from '../config/backendConfig';

export const SessionService = {
  async getUserSession(context: GetServerSidePropsContext) {
    supertokensNode.init(backendConfig());

    return await Session.getSession(context.req, context.res);
  },
};
