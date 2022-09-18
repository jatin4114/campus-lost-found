import * as ratingService from '../services/ratingService.js'

export async function submit(req, res) {
  const rating = await ratingService.submitRating(req.params.id, req.user, req.body)
  res.status(201).json({ success: true, data: { rating } })
}

export async function listForClaim(req, res) {
  const ratings = await ratingService.getRatingsForClaim(req.params.id, req.user)
  res.json({ success: true, data: { ratings } })
}

export async function summaryForUser(req, res) {
  const summary = await ratingService.getRatingSummary(req.params.id)
  res.json({ success: true, data: summary })
}
