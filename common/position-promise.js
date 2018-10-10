/**
 * @param {PositionOptions | null} options
 * @returns {Promise<Position>} 
 */
export const getCurrentPosition = options => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
