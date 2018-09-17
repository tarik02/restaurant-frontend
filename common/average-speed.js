// https://stackoverflow.com/a/3841706

export const SPEED_SMOOTHING_FACTOR = 0.005

export const measureAverageSpeed = (averageSpeed, lastSpeed, smoothingFactor = SPEED_SMOOTHING_FACTOR) =>
	averageSpeed = smoothingFactor * lastSpeed + (1 - smoothingFactor) * averageSpeed
