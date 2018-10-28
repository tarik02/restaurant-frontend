import _ from 'lodash'

export const DriverStatus = Object.freeze({
	UNKNOWN: 'unknown',

	OFF: 'off',
	DRIVING: 'driving',
	IDLE: 'idle',
})

export const DriverStatusNames = Object.freeze({
	[DriverStatus.UNKNOWN]: 'Невідомо',
	
	[DriverStatus.OFF]: 'Відсутній',
	[DriverStatus.DRIVING]: 'У дорозі',
	[DriverStatus.IDLE]: 'Очікує',
})

export const getDriverStatusName =
	status => DriverStatusNames[status] || DriverStatusNames[DriverStatus.UNKNOWN]
