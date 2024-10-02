const gridItems = document.querySelectorAll('.grid-item');


gridItems.forEach((item, index) =>
{
	item.addEventListener('click', function()
	{
		if (!item.textContent)
			item.textContent = "X";
		index = Math.floor(Math.random() * 9);
		while (index = )
			index = Math.floor(Math.random() * 9);
		gridItems[index].textContent = "O";
	});
});