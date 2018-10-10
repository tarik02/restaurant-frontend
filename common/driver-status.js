import _ from 'lodash'

export const DriverStatus = Object.freeze({
	UNKNOWN: 'unknown',

	READY: 'ready',
	DRIVING: 'driving',
})

export const DriverStatusNames = Object.freeze({
	[DriverStatus.UNKNOWN]: 'Невідомо',
	
	[DriverStatus.READY]: 'Готовий',
	[DriverStatus.DRIVING]: 'У дорозі',
})

export const getDriverStatusName =
	status => DriverStatusNames[status] || DriverStatusNames[DriverStatus.UNKNOWN]
