export type SandboxResource = "organization" | "client" | "property" | "project" | "task" | "calendar" | "media";
export type SandboxAction = "read" | "create" | "update" | "delete";

const collectionToResource = {
  clients: "client",
  properties: "property",
  projects: "project",
  tasks: "task",
  calendar: "calendar",
  media: "media",
} as const satisfies Record<string, SandboxResource>;

export function parseSandboxPath(path: string[]): {
  resource: SandboxResource;
  action: SandboxAction;
  resourceId?: string;
} | null {
  if (path.length === 1 && path[0] === "me") {
    return { resource: "organization", action: "read" };
  }

  const [collection, resourceId] = path;
  const resource = collectionToResource[collection as keyof typeof collectionToResource];
  if (!resource) return null;

  return { resource, action: "read", resourceId };
}

export function actionForMethod(method: string, hasResourceId: boolean): SandboxAction | null {
  if (method === "GET") return "read";
  if (method === "POST" && !hasResourceId) return "create";
  if ((method === "PATCH" || method === "PUT") && hasResourceId) return "update";
  if (method === "DELETE" && hasResourceId) return "delete";
  return null;
}
