export const nop = () => true

export const integer = v => {
	if (v === void 0 || v === null) {
		return true
	}

	const n = Number(v)
	if (isNaN(n) || !Number.isInteger(n)) {
		return 'Значення повинно бути цілим числом'
	}

	return true
}

export const float = v => {
	if (v === void 0 || v === null) {
		return true
	}

	const n = typeof v === 'number' ? v : Number(v.replace(',', '.'))
	if (isNaN(n) || !Number.isFinite(n)) {
		return 'Значення повинно бути числом'
	}

	return true
}
