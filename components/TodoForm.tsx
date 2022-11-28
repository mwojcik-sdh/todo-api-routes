import { FormEvent } from 'react';

type Props = {
  handleSubmit: (e: FormEvent) => void;
  values: {
    title: string;
    description: string;
  };
  setValue: (field: string, value: string) => void;
  error: null | string;
  isLoading: boolean;
};

export const TodoForm = ({
  handleSubmit,
  values,
  setValue,
  error,
  isLoading,
}: Props) => {
  const { title, description } = values;

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <label htmlFor="title" className="input-label">
          Title
        </label>
        <input
          className="input"
          name="title"
          value={title}
          onChange={(e) => setValue('title', e.target.value)}
        />
      </div>

      <div className="input-wrapper">
        <label htmlFor="description" className="input-label">
          Description
        </label>
        <textarea
          className="input"
          name="title"
          value={description}
          onChange={(e) => setValue('description', e.target.value)}
        />
      </div>

      {error ? <p className="error">{error}</p> : null}

      <button type="submit" className="form-save" disabled={isLoading}>
        Save
      </button>
    </form>
  );
};
