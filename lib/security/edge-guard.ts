const publicMutationPaths = new Set(["/api/contact", "/api/newsletter"]);

export type EdgeGuardDecision =
  | { allowed: true }
  | { allowed: false; status: 403 | 405 | 413; message: string };

export function evaluateEdgeRequest(input: {
  pathname: string;
  method: string;
  contentLength: number;
  fetchSite: string | null;
}): EdgeGuardDecision {
  if (!publicMutationPaths.has(input.pathname)) return { allowed: true };
  if (input.method !== "POST")
    return { allowed: false, status: 405, message: "Method not allowed." };
  if (input.contentLength > 25_000)
    return { allowed: false, status: 413, message: "Request is too large." };
  if (
    input.fetchSite &&
    input.fetchSite !== "same-origin" &&
    input.fetchSite !== "same-site"
  )
    return { allowed: false, status: 403, message: "Request rejected." };
  return { allowed: true };
}
