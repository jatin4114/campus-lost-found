// Tiny registry so services (notificationService) can emit over the same
// Socket.IO instance sockets/index.js owns, without a circular import
// between the two modules.
let ioInstance = null

export function setIo(io) {
  ioInstance = io
}

export function getIo() {
  return ioInstance
}
