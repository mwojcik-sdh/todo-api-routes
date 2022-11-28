import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Session from 'supertokens-node/recipe/session';
import { ProfileService } from '../../../services/profile';
import { Nav } from '../../../components/Nav';
import { SessionService } from '../../../services/session';
import { SessionAuth } from 'supertokens-auth-react/lib/build/recipe/session';
import { TodoForm } from '../../../components/TodoForm';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { TodoApi } from '../../../api/todo';
import { CreateTodoPayload } from '../../../types/Todo';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const session = await SessionService.getUserSession(context);
    const userId = session.getUserId();
    const user = await ProfileService.getUserProfile(userId);
    const todoId = context.params?.id as string;
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['todo', todoId], () =>
      TodoApi.getTodo(todoId),
    );

    return {
      props: {
        username: user?.username,
        dehydratedState: dehydrate(queryClient),
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

const EditTodo = ({ username }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<null | string>(null);

  const router = useRouter();
  const todoId = router.query.id as string;
  const { data } = useQuery({
    queryKey: ['todo', todoId],
    queryFn: () => TodoApi.getTodo(todoId),
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({
      todoId,
      payload,
    }: {
      todoId: string;
      payload: Partial<CreateTodoPayload>;
    }) => TodoApi.updateTodo(todoId, payload),
  });

  useEffect(() => {
    setTitle(data?.data.title);
    setDescription(data?.data.description);
  }, [data]);

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

    if (!todoId) {
      setError(`Can't get todo's ID`);
      return;
    }

    updateTodoMutation.mutate(
      { todoId, payload: { title, description } },
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
        <h1 className="heading">Edit todo</h1>
        <TodoForm
          values={{ title, description }}
          setValue={setValue}
          handleSubmit={handleSubmit}
          isLoading={updateTodoMutation.isLoading}
          error={error || (updateTodoMutation.error as any)?.message}
        />
      </main>
    </div>
  );
};

export default function EditTodoContainer({
  username,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SessionAuth>
      <EditTodo username={username} />
    </SessionAuth>
  );
}
