/**
 * Vitest global setup — runs before all tests.
 *
 * Mocks external dependencies (Supabase, fetch) so tests are fast and isolated.
 */
import { vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.ADMIN_PASSWORD = 'test-password-123'

// Note: Individual tests mock Supabase and fetch as needed.
// This file just ensures env vars are set so modules don't crash on import.
