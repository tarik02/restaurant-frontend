export const uploaded = file =>
	/^(https?|data):/.test(file)
		? file
		: process.env.UPLOADS_URL + file.replace(/^\/+/, '')
