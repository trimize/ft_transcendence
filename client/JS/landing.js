const logdiv = document.getElementById('logdiv');

document.addEventListener('DOMContentLoaded', function()
{
	if (localStorage.getItem('refresh'))
	{
		logdiv.textContent = "Profile";
		logdiv.href = '/Profile';
	}
});