/**
 * @param {*} v
 * @returns {(string|null)}
 */
const nullifyString = v => {
	if (v === void 0 || v === null) {
		return null
	}

	v = `${v}`
	if (v.trim().length === 0) {
		return null
	}
	
	return v
}

export default nullifyString
