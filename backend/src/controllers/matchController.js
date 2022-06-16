import * as matchingService from '../services/matchingService.js'

export async function forItem(req, res) {
  const matches = await matchingService.getMatchesForItem(req.params.id)
  res.json({ success: true, data: { matches } })
}

export async function mine(req, res) {
  const matches = await matchingService.getMatchesForUser(req.user.id)
  res.json({ success: true, data: { matches } })
}

export async function dismiss(req, res) {
  await matchingService.dismissMatch(req.params.id)
  res.json({ success: true, data: null })
}
