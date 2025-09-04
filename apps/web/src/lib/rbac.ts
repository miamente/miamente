export type Role = "user" | "pro" | "admin";

export function hasRole(roles: readonly Role[] | undefined, required: Role | Role[]): boolean {
  if (!roles) return false;
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((r) => roles.includes(r));
}
