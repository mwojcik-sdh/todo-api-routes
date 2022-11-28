import { Fragment } from 'react';
import Link from 'next/link';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { SessionService } from '../services/session';
import { ProfileService } from '../services/profile';
import Session from 'supertokens-node/recipe/session';
import { SessionAuth } from 'supertokens-auth-react/lib/build/recipe/session';
import { TodoApi } from '../api/todo';
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Todo } from '../types/Todo';
import { Nav } from '../components/Nav';

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  try {
    const session = await SessionService.getUserSession(context);
    const userId = session.getUserId();
    const user = await ProfileService.getUserProfile(userId);
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(['todos'], TodoApi.getTodos);

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

const Home = ({ username }: Props) => {
  const { data } = useQuery({ queryKey: ['todos'], queryFn: TodoApi.getTodos });
  const queryClient = useQueryClient();
  const markTodoDoneMutation = useMutation((id: string) =>
    TodoApi.updateTodo(id, { isDone: true }),
  );
  const deleteTodoMutation = useMutation((id: string) =>
    TodoApi.deleteTodo(id),
  );

  const handleMarkDone = (todoId: string) => {
    markTodoDoneMutation.mutate(todoId, {
      onSuccess() {
        const cachedTodos = queryClient.getQueryData(['todos']) as Todo[];
        const updatedTodos = cachedTodos?.map((todo) => {
          if (todo.id === todoId) {
            return {
              ...todo,
              isDone: true,
            };
          }

          return todo;
        });

        queryClient.setQueryData(['todos'], updatedTodos);
      },
    });
  };

  const handleDelete = (todoId: string) => {
    deleteTodoMutation.mutate(todoId, {
      onSuccess() {
        const cachedTodos = queryClient.getQueryData(['todos']) as Todo[];
        const updatedTodos = cachedTodos.filter((todo) => todo.id !== todoId);
        queryClient.setQueryData(['todos'], updatedTodos);
      },
    });
  };

  return (
    <div>
      <Nav username={username} />
      <main className="wrapper">
        <h1 className="heading">My Todos</h1>

        <ul className="todos">
          {data
            ?.sort((a, b) => Number(a.isDone) - Number(b.isDone))
            .map((todo) => (
              <Fragment key={todo.id}>
                <li className="todo">
                  <div className={`${todo.isDone && 'todo-content--done'}`}>
                    <h2 className="todo-title">{todo.title}</h2>
                    <p className="todo-description">{todo.description}</p>
                  </div>

                  <div className="todo-actions">
                    {!todo.isDone ? (
                      <>
                        <button
                          className="action action-mark"
                          onClick={() => handleMarkDone(todo.id)}
                        >
                          Done
                        </button>
                        <Link
                          className="action action-edit"
                          href={`/todo/edit/${todo.id}`}
                        >
                          Edit
                        </Link>
                      </>
                    ) : null}
                    <button
                      className="action action-delete"
                      onClick={() => handleDelete(todo.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>

                <div className="divider" />
              </Fragment>
            ))}
        </ul>
      </main>
    </div>
  );
};

export default function IndexContainer({
  username,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SessionAuth>
      <Home username={username} />
    </SessionAuth>
  );
}
