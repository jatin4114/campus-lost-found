// Mock email service for development. Swap the implementation for a real
// provider (Postmark/SES/etc.) behind this same interface when going to
// production — nothing calling this module needs to change.

export async function sendVerificationEmail(user, token) {
  const link = `http://localhost:5173/verify-email?token=${token}`
  console.log(`[mock-email] Verification link for ${user.email}: ${link}`)
  return { delivered: true, link }
}

export async function sendPasswordResetEmail(user, token) {
  const link = `http://localhost:5173/reset-password?token=${token}`
  console.log(`[mock-email] Password reset link for ${user.email}: ${link}`)
  return { delivered: true, link }
}
