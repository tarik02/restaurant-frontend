export const uploaded = file =>
	(typeof file !== 'string' || /^(https?|data):/.test(file))
		? file
		: process.env.UPLOADS_URL + file.replace(/^\/+/, '')
