import * as claimService from '../services/claimService.js'

export async function create(req, res) {
  const claim = await claimService.submitClaim(req.params.itemId, req.user, req.body)
  res.status(201).json({ success: true, data: { claim } })
}

export async function getOne(req, res) {
  const claim = await claimService.getClaim(req.params.id)
  res.json({ success: true, data: { claim } })
}

export async function accept(req, res) {
  const result = await claimService.acceptClaim(req.params.id, req.user)
  res.json({ success: true, data: result })
}

export async function reject(req, res) {
  const claim = await claimService.rejectClaim(req.params.id, req.user)
  res.json({ success: true, data: { claim } })
}

export async function cancel(req, res) {
  const claim = await claimService.cancelClaim(req.params.id, req.user)
  res.json({ success: true, data: { claim } })
}

export async function mine(req, res) {
  const claims = await claimService.getMyClaims(req.user.id)
  res.json({ success: true, data: { claims } })
}

export async function onMyItems(req, res) {
  const claims = await claimService.getClaimsOnMyItems(req.user.id)
  res.json({ success: true, data: { claims } })
}
