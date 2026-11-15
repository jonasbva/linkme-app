import { AsyncLocalStorage } from 'node:async_hooks'
import type { SessionUser } from './auth'

export interface ApiPrincipal {
  keyId: string
  user: SessionUser
}

// This context exists only during the authenticated /api/v1 request. It never
// issues a cookie and cannot leak a principal into another concurrent request.
const principals = new AsyncLocalStorage<ApiPrincipal>()

export function getApiPrincipal(): ApiPrincipal | undefined {
  return principals.getStore()
}

export function runWithApiPrincipal<T>(principal: ApiPrincipal, fn: () => T): T {
  return principals.run(principal, fn)
}
