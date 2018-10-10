import _ from 'lodash'

export const OrderStatus = Object.freeze({
	UNKNOWN: 'unknown',

	WAITING: 'waiting',
	COOKING: 'cooking',
	WAITING_FOR_DRIVER: 'waiting_for_driver',
	INROAD: 'inroad',
	DONE: 'done',
})

// export const OrderStatusBack = Object.freeze(_.invert(OrderStatus))

export const OrderStatusNames = Object.freeze({
	[OrderStatus.UNKNOWN]: 'Невідомо',
	
	[OrderStatus.WAITING]: 'На кухні',
	[OrderStatus.COOKING]: 'На кухні',
	[OrderStatus.WAITING_FOR_DRIVER]: 'На кухні',
	[OrderStatus.INROAD]: 'У дорозі',
	[OrderStatus.DONE]: 'Доставлено',
})

export const getOrderStatusName =
	status => OrderStatusNames[status] || OrderStatusNames[OrderStatus.UNKNOWN]
