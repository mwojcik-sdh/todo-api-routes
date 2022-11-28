import ThirdPartyEmailPasswordNode from 'supertokens-node/recipe/thirdpartyemailpassword';
import SessionNode from 'supertokens-node/recipe/session';
import { appInfo } from './appInfo';
import { TypeInput } from 'supertokens-node/types';
import { ProfileService } from '../services/profile';

export const backendConfig = (): TypeInput => {
  return {
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI!,
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordNode.init({
        signUpFeature: {
          formFields: [
            {
              id: 'username',
            },
          ],
        },
        providers: [],
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,
              emailPasswordSignUpPOST: async function (input) {
                if (
                  originalImplementation.emailPasswordSignUpPOST === undefined
                ) {
                  throw Error('Should never come here');
                }

                let response =
                  await originalImplementation.emailPasswordSignUpPOST(input);

                if (response.status === 'OK') {
                  const formFields = input.formFields;
                  const { id } = response.user;

                  const username = formFields.find(
                    (field) => field.id === 'username',
                  )?.value;

                  if (!username) {
                    return {
                      message: 'USERNAME IS REQUIRED',
                      status: 'GENERAL_ERROR',
                    };
                  }

                  await ProfileService.createUserProfile({
                    id,
                    username,
                  });
                }

                return response;
              },
            };
          },
        },
      }),
      SessionNode.init(),
    ],
    isInServerlessEnv: true,
  };
};
