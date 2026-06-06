import type { UserRole } from '@/types'

// Hierarquia: super_admin > admin > user
const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 0,
  admin: 1,
  super_admin: 2,
}

// Verifica se um role tem ao menos o nível requerido
export function hasRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required]
}

export function isAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, 'admin')
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, 'super_admin')
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly userRole: UserRole,
    public readonly requiredRole: UserRole,
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

// Lança SecurityError se o role do usuário não atende o mínimo requerido
export function requireRole(userRole: UserRole, required: UserRole): void {
  if (!hasRole(userRole, required)) {
    throw new SecurityError(
      `Acesso negado: role '${userRole}' não tem permissão (requerido: '${required}')`,
      userRole,
      required,
    )
  }
}

// Extrai role do metadata do usuário Supabase com fallback seguro
export function extractRole(userMetadata: Record<string, unknown> | null | undefined): UserRole {
  const role = userMetadata?.role
  if (role === 'super_admin' || role === 'admin') return role
  return 'user'
}
