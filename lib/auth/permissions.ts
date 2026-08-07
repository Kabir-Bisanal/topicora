export type AppRole = "admin" | "editor" | "author";

export function canAccessAdmin(role: AppRole | null | undefined) {
  return role === "admin" || role === "editor";
}

export function canManageSettings(role: AppRole | null | undefined) {
  return role === "admin";
}

export function canDeleteArticle(role: AppRole | null | undefined) {
  return role === "admin";
}

export function canEditArticle(
  role: AppRole | null | undefined,
  userId: string | undefined,
  authorId: string,
) {
  return role === "admin" || role === "editor" || userId === authorId;
}
