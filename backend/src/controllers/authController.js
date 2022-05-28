import * as authService from '../services/authService.js'
import * as userRepo from '../repositories/userRepository.js'

export async function register(req, res) {
  const user = await authService.register(req.body)
  res.status(201).json({ success: true, data: { user } })
}

export async function login(req, res) {
  const result = await authService.login(req.body)
  res.json({ success: true, data: result })
}

export async function refresh(req, res) {
  const result = await authService.refresh(req.body)
  res.json({ success: true, data: result })
}

export async function logout(req, res) {
  await authService.logout(req.body)
  res.json({ success: true, data: null })
}

export async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.body)
  res.json({ success: true, data: { user } })
}

export async function me(req, res) {
  const user = await userRepo.findById(req.user.id)
  res.json({ success: true, data: { user: userRepo.toPublicUser(user) } })
}
