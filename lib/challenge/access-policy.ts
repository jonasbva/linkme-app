// Private review release. Only these explicitly approved MAHO account IDs may
// view the challenge. No super-admin or participant bypass; expand only after
// Jonas explicitly approves the wider release.
export const CHALLENGE_VIEWER_IDS: readonly string[] = [
  'f0579a4d-dd34-4787-88aa-baa5b0c9ce75', // Max
]

export function isChallengeViewer(userId: string): boolean {
  return CHALLENGE_VIEWER_IDS.includes(userId)
}
