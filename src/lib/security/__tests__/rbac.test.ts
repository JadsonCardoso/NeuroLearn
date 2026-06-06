import { describe, it, expect } from 'vitest'
import { hasRole, isAdmin, isSuperAdmin, requireRole, extractRole, SecurityError } from '../rbac'

describe('hasRole', () => {
  it('user tem acesso a user', () => expect(hasRole('user', 'user')).toBe(true))
  it('user NÃO tem acesso a admin', () => expect(hasRole('user', 'admin')).toBe(false))
  it('user NÃO tem acesso a super_admin', () => expect(hasRole('user', 'super_admin')).toBe(false))

  it('admin tem acesso a user', () => expect(hasRole('admin', 'user')).toBe(true))
  it('admin tem acesso a admin', () => expect(hasRole('admin', 'admin')).toBe(true))
  it('admin NÃO tem acesso a super_admin', () => expect(hasRole('admin', 'super_admin')).toBe(false))

  it('super_admin tem acesso a tudo', () => {
    expect(hasRole('super_admin', 'user')).toBe(true)
    expect(hasRole('super_admin', 'admin')).toBe(true)
    expect(hasRole('super_admin', 'super_admin')).toBe(true)
  })
})

describe('isAdmin', () => {
  it('user → false', () => expect(isAdmin('user')).toBe(false))
  it('admin → true', () => expect(isAdmin('admin')).toBe(true))
  it('super_admin → true', () => expect(isAdmin('super_admin')).toBe(true))
})

describe('isSuperAdmin', () => {
  it('user → false', () => expect(isSuperAdmin('user')).toBe(false))
  it('admin → false', () => expect(isSuperAdmin('admin')).toBe(false))
  it('super_admin → true', () => expect(isSuperAdmin('super_admin')).toBe(true))
})

describe('requireRole', () => {
  it('não lança quando role é suficiente', () => {
    expect(() => requireRole('admin', 'user')).not.toThrow()
    expect(() => requireRole('super_admin', 'admin')).not.toThrow()
  })

  it('lança SecurityError quando role é insuficiente', () => {
    expect(() => requireRole('user', 'admin')).toThrow(SecurityError)
    expect(() => requireRole('admin', 'super_admin')).toThrow(SecurityError)
  })

  it('SecurityError contém as roles no erro', () => {
    try {
      requireRole('user', 'admin')
    } catch (e) {
      expect(e).toBeInstanceOf(SecurityError)
      const err = e as SecurityError
      expect(err.userRole).toBe('user')
      expect(err.requiredRole).toBe('admin')
    }
  })
})

describe('extractRole', () => {
  it('extrai super_admin do metadata', () => {
    expect(extractRole({ role: 'super_admin' })).toBe('super_admin')
  })

  it('extrai admin do metadata', () => {
    expect(extractRole({ role: 'admin' })).toBe('admin')
  })

  it('metadata null → user (default seguro)', () => {
    expect(extractRole(null)).toBe('user')
  })

  it('role desconhecido → user (default seguro)', () => {
    expect(extractRole({ role: 'hacker' })).toBe('user')
  })

  it('sem campo role → user (default seguro)', () => {
    expect(extractRole({ name: 'João' })).toBe('user')
  })
})
