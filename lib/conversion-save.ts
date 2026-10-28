// Keep transport/server failures visible without exposing database internals.
export async function savedRows<T>(res: Response): Promise<T[]> {
  if (!res.ok) {
    if (res.status === 401) throw new Error('Your session has expired. Please sign in again. Your entries have not been saved.')
    if (res.status === 403) throw new Error('You do not have permission to save these entries. Please contact an administrator.')
    throw new Error('Could not save your entries. Please try again. Your inputs are still here.')
  }
  const rows: unknown = await res.json()
  if (!Array.isArray(rows)) throw new Error('Could not confirm the save. Please try again.')
  return rows as T[]
}

