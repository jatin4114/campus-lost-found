const EARTH_RADIUS_METERS = 6371000

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

// Haversine great-circle distance, in meters.
export function distanceMeters(a, b) {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLon = toRadians(b.longitude - a.longitude)
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)))
}

// Bands distance into a 0-1 score: same location > close > moderate > far.
export function locationSimilarity(locationA, locationB) {
  if (locationA.id === locationB.id) return 1

  if (
    locationA.latitude == null || locationA.longitude == null ||
    locationB.latitude == null || locationB.longitude == null
  ) {
    return locationA.campusId === locationB.campusId ? 0.3 : 0
  }

  const meters = distanceMeters(locationA, locationB)
  if (meters <= 100) return 1
  if (meters <= 300) return 0.75
  if (meters <= 500) return 0.5
  return 0.15
}
