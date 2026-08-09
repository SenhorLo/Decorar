export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Devolvido para repopular o formulário sem perder o que o usuário digitou. */
  values?: Record<string, string>;
};

export const emptyState: ActionState = {};
