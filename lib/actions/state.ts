export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { ok: false, message: "" };

export function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): ActionState {
  const flattened = error.flatten().fieldErrors;
  return {
    ok: false,
    message: "Check the highlighted fields and try again.",
    errors: Object.fromEntries(
      Object.entries(flattened).filter((entry): entry is [string, string[]] =>
        Boolean(entry[1]),
      ),
    ),
  };
}
