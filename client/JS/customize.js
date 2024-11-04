const saveButtonCustom = document.getElementById('saveButtonCustom');
const boxes = document.querySelectorAll('.boxSlider');

boxes.forEach(box =>
{
	box.addEventListener('click', function ()
	{
        saveButtonCustom.style.display = 'block';
        boxes.forEach(box => { box.style.border = "none" })
		box.style.border = "5px solid white";
	});
});

const boxBalls = document.querySelectorAll('.boxBall');

boxBalls.forEach(box =>
{
	box.addEventListener('click', function ()
	{
        saveButtonCustom.style.display = 'block';
        boxBalls.forEach(box => { box.style.border = "none" })
		box.style.border = "5px solid white";
	});
});