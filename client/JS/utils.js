export function getCurrentTime()
{
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

	// Get the timezone offset in hours and minutes
	const offset = -now.getTimezoneOffset();
	const offsetSign = offset >= 0 ? '+' : '-';
	const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
	const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');

	// Format the datetime string
	const currentTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
	return currentTime;
}

