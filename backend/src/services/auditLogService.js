import * as auditLogRepo from '../repositories/auditLogRepository.js'

// Never pass secrets/passwords in metadata — this is a durable, readable log.
export async function record(actorId, action, entityType, entityId, { metadata, ipAddress } = {}) {
  return auditLogRepo.create({ actorId, action, entityType, entityId, metadata, ipAddress })
}

export async function list({ page = 1, limit = 20 } = {}) {
  const [logs, total] = await auditLogRepo.findAll({ page, limit })
  return { logs, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
}
