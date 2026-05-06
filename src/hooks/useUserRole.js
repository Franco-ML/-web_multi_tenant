import { useAuthStore } from '../store/useAuthStore'

/**
 * Devuelve información del rol del usuario autenticado.
 * level 1 = L1 Super Admin Sistema
 * level 2 = L2 Admin Sistema
 * level 10 = L10 Super Admin Tenant
 * level 11 = L11 Admin País
 */
export function useUserRole() {
  const user = useAuthStore(s => s.user)
  const level = user?.rol?.level ?? 10  // default: tenant si no hay sesión

  return {
    level,
    isSystem:       level <= 2,           // L1 o L2
    isTenant:       level >= 10,          // L10 o L11
    isSuperTenant:  level === 10,         // L10 — ve config base + todos los países del tenant
    isCountryAdmin: level === 11,         // L11 — solo su(s) país(es)
    // Países asignados al L11 (country_code de sus tenants)
    assignedCountries: (user?.tenants ?? [])
      .map(t => t.country_code)
      .filter(Boolean),
  }
}
