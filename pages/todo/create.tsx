import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Session from 'supertokens-node/recipe/session';
import { ProfileService } from '../../services/profile';
import { Nav } from '../../components/Nav';
import { SessionService } from '../../services/session';
import { SessionAuth } from 'supertokens-auth-react/lib/build/recipe/session';
import { TodoForm } from '../../components/TodoForm';
import { CreateTodoPayload } from '../../types/Todo';
import { useMutation } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { TodoApi } from '../../api/todo';
import { useRouter } from 'next/router';

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const session = await SessionService.getUserSession(context);
    const userId = session.getUserId();
    const user = await ProfileService.getUserProfile(userId);

    return {
      props: {
        username: user?.username,
      },
    };
  } catch (err: any) {
    if (err?.type === Session.Error.TRY_REFRESH_TOKEN) {
      return { props: { fromSupertokens: 'needs-refresh' } };
    }
  }
};

type Props = {
  username?: string;
};

const CreateTodo = ({ username }: Props) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<null | string>(null);

  const createTodoMutation = useMutation((payload: CreateTodoPayload) =>
    TodoApi.createTodo(payload),
  );

  const setValue = (field: string, value: string) => {
    if (field === 'title') {
      setTitle(value);
    }

    if (field === 'description') {
      setDescription(value);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!title || !description) {
      setError('All fields are required');
      return;
    }

    createTodoMutation.mutate(
      { title, description },
      {
        onSuccess() {
          router.push('/');
        },
      },
    );
  };

  return (
    <div>
      <Nav username={username} />

      <main className="wrapper">
        <h1 className="heading">Create todo</h1>
        <TodoForm
          values={{ title, description }}
          setValue={setValue}
          handleSubmit={handleSubmit}
          isLoading={createTodoMutation.isLoading}
          error={error || (createTodoMutation.error as any)?.message}
        />
      </main>
    </div>
  );
};

export default function CreateTodoContainer({
  username,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SessionAuth>
      <CreateTodo username={username} />
    </SessionAuth>
  );
}
