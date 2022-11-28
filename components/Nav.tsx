import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';

type Props = {
  username?: string;
};

export const Nav = ({ username }: Props) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <nav className="nav">
      <ul className="nav-list">
        <li className="nav-list-item">
          <Link href="/" className="nav-link">
            All todos
          </Link>
        </li>

        <li className="nav-list-item">
          <Link href="/todo/create" className="nav-link">
            Create todo
          </Link>
        </li>
      </ul>

      <div className="nav-actions">
        {username ? <p className="nav-username">Hello {username}</p> : null}
        <button onClick={handleSignOut} className="nav-button">
          Sign out
        </button>
      </div>
    </nav>
  );
};
