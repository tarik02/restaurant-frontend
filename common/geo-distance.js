export const distanceBetweenTwoPoints = (p1, p2) => {
  const p1lat = typeof p1.lat === 'function' ? p1.lat() : p1.lat
  const p1lng = typeof p1.lng === 'function' ? p1.lng() : p1.lng
  const p2lat = typeof p2.lat === 'function' ? p2.lat() : p2.lat
  const p2lng = typeof p2.lng === 'function' ? p2.lng() : p2.lng

  const rad = x => x * Math.PI / 180
  const R = 6378137 // Earth’s mean radius in meter

  const dLat = rad(p2lat - p1lat)
  const dLng = rad(p2lng - p1lng)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1lat)) * Math.cos(rad(p2lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d // returns the distance in meter
}
