import {updateBallSkin, updateSliderSkin, updateSignSkin, updateVictorySkin, fetchUserData} from './fetchFunctions.js'
import { BACKEND_URL } from "./appconfig.js";

let slider = 0;
let ball = 0;
let sign = 0;
let victory = 0;
let user_info;

export const images = [
    { id: 'pongChoice', path: 'pong-customize.png' },
    { id: 'tttChoice', path: 'ttt-customize.png' },
    { id: 'imageSlider1', path: 'slider1.jpg' },
    { id: 'imageSlider2', path: 'slider2.jpg' },
    { id: 'imageSlider3', path: 'slider3.jpg' },
    { id: 'imageSlider4', path: 'slider4.jpg' },
    { id: 'imageSlider5', path: 'slider5.jpg' },
    { id: 'imageSlider6', path: 'slider6.jpg' },
    { id: 'imageSlider7', path: 'slider7.jpg' },
    { id: 'imageSlider8', path: 'slider8.gif' },
    { id: 'imageSlider9', path: 'slider9.webp' },
    { id: 'imageBall1', path: 'ball1.svg' },
    { id: 'imageBall2', path: 'ball2.svg' },
    { id: 'imageBall3', path: 'ball3.svg' },
    { id: 'imageBall4', path: 'ball4.svg' },
    { id: 'imageBall5', path: 'ball5.svg' },
    { id: 'imageBall6', path: 'ball6.svg' },
    { id: 'imageBall7', path: 'ball7.svg' },
    { id: 'imageBall8', path: 'ball8.svg' },
    { id: 'imageBall9', path: 'ball9.svg' },
    { id: 'imageVictory1', path: 'victory1.gif' },
    { id: 'imageVictory2', path: 'victory2.gif' },
    { id: 'imageVictory3', path: 'victory3.webp' },
    { id: 'imageVictory4', path: 'victory4.gif' },
    { id: 'imageVictory5', path: 'victory5.gif' },
    { id: 'imageVictory6', path: 'victory6.gif' },
    { id: 'imageVictory7', path: 'victory7.gif' },
    { id: 'imageVictory8', path: 'victory8.webp' },
    { id: 'imageVictory9', path: 'victory9.gif' },
];

export async function renderCustomize()
{
	document.getElementById('content').innerHTML = customizeHTML();


    images.forEach(image => {
        const element = document.getElementById(image.id);
        if (element) {
            element.style.backgroundImage = `url('${BACKEND_URL}/media/${image.path}')`;
        }
    });
	
	user_info = await fetchUserData();
	if (user_info.pong_ball != 0)
		ball = user_info.pong_ball;
	if (user_info.pong_slider != 0)
		slider = user_info.pong_slider;
	if (user_info.tic_tac_toe_sign != 0)
		sign = user_info.tic_tac_toe_sign;
	if (user_info.tic_tac_toe_background != 0)
		victory = user_info.tic_tac_toe_background;
	const saveButtonCustom = document.getElementById('saveButtonCustom');
	const boxes = document.querySelectorAll('.boxSlider');

	boxes.forEach(box =>
	{
		if (slider != 0)
		{
			if (parseInt(box.id.at(-1), 10) == slider)
				box.style.border = "5px solid white";
		}
		box.addEventListener('click', function ()
		{
			saveButtonCustom.style.display = 'block';
			boxes.forEach(box => { box.style.border = "none" })
			box.style.border = "5px solid white";
			slider = box.id;
			slider = slider.at(-1);
		});
	});
	
	const boxBalls = document.querySelectorAll('.boxBall');
	
	boxBalls.forEach(box =>
	{
		if (ball != 0)
		{
			if (parseInt(box.id.at(-1), 10) == ball)
				box.style.border = "5px solid white";
		}
		box.addEventListener('click', function ()
		{
			saveButtonCustom.style.display = 'block';
			boxBalls.forEach(box => { box.style.border = "none" })
			box.style.border = "5px solid white";
			ball = box.id;
			ball = ball.at(-1);
		});
	});
	
	const boxSigns = document.querySelectorAll('.boxSign');
	
	boxSigns.forEach(box =>
	{
		if (sign != 0)
		{
			if (parseInt(box.id.at(-1), 10) == sign)
				box.style.border = "5px solid white";
		}
		box.addEventListener('click', function ()
		{
			saveButtonCustom.style.display = 'block';
			boxSigns.forEach(box => { box.style.border = "none" })
			box.style.border = "5px solid white";
			sign = box.id;
			sign = sign.at(-1);
		});
	});
	
	const boxVictory = document.querySelectorAll('.boxVictory');
	
	boxVictory.forEach(box =>
	{
		if (victory != 0)
		{
			if (parseInt(box.id.at(-1), 10) == victory)
				box.style.border = "5px solid white";
		}
		box.addEventListener('click', function ()
		{
			saveButtonCustom.style.display = 'block';
			boxVictory.forEach(box => { box.style.border = "none" })
			box.style.border = "5px solid white";
			victory = box.id;
			victory = victory.at(-1);
		});
	});

	const pongChoice = document.getElementById('pongChoice');
	const tttChoice = document.getElementById('tttChoice');
	pongChoice.addEventListener('click', function()
	{
		const customizeContainerPong = document.getElementById('customizeContainerPong');
		pongChoice.style.display = "none";
		tttChoice.style.display = "none";
		customizeContainerPong.classList.remove('d-none');
	});

	tttChoice.addEventListener('click', function()
	{
		const customizeContainerttt = document.getElementById('customizeContainerttt');
		tttChoice.style.display = "none";
		pongChoice.style.display = "none";
		customizeContainerttt.classList.remove('d-none');
	});

	saveButtonCustom.addEventListener('click', async function()
	{
		if (slider != 0)
			await updateSliderSkin(slider);
		if (ball != 0)
			await updateBallSkin(ball);
		if (sign != 0)
			await updateSignSkin(sign);
		if (victory != 0)
			await updateVictorySkin(victory);
		window.location.href = "/profile";
	});
}

function customizeHTML()
{
	return `<a id="backButtonCustom" href="/profile"></a>
        <div id="chooseGameCustom">
            <div class="choiceTitle" id="pongChoice">PONG</div>
            <div class="choiceTitle" id="tttChoice">TIC-TAC-TOE</div>
        </div>
        <div class="d-none" id="customizeContainerPong">
            <div class="customForm" id="sliderCustomForm">
                <div id="boxSlider1" class="boxCustom boxSlider box1">
                    <div class="imageSliderBox" id="imageSlider1"></div>
                </div>
                <div id="boxSlider2" class="boxCustom boxSlider box2">
                    <div class="imageSliderBox" id="imageSlider2"></div>
                </div>
                <div id="boxSlider3" class="boxCustom boxSlider box3">
                    <div class="imageSliderBox" id="imageSlider3"></div>
                </div>
                <div id="boxSlider4" class="boxCustom boxSlider box4">
                    <div class="imageSliderBox" id="imageSlider4"></div>
                </div>
                <div id="boxSlider5" class="boxCustom boxSlider box5">
                    <div class="imageSliderBox" id="imageSlider5"></div>
                </div>
                <div id="boxSlider6" class="boxCustom boxSlider box6">
                    <div class="imageSliderBox" id="imageSlider6"></div>
                </div>
                <div id="boxSlider7" class="boxCustom boxSlider box7">
                    <div class="imageSliderBox" id="imageSlider7"></div>
                </div>
                <div id="boxSlider8" class="boxCustom boxSlider box8">
                    <div class="imageSliderBox" id="imageSlider8"></div>
                </div>
                <div id="boxSlider9" class="boxCustom boxSlider box9">
                    <div class="imageSliderBox" id="imageSlider9"></div>
                </div>
            </div>
            <div class="customForm" id="ballCustomForm">
                <div id="boxball1" class="boxCustom boxBall box1">
                    <div class="imageBallBox" id="imageBall1"></div>
                </div>
                <div id="boxball2" class="boxCustom boxBall box2">
                    <div class="imageBallBox" id="imageBall2"></div>
                </div>
                <div id="boxball3" class="boxCustom boxBall box3">
                    <div class="imageBallBox" id="imageBall3"></div>
                </div>
                <div id="boxball4" class="boxCustom boxBall box4">
                    <div class="imageBallBox" id="imageBall4"></div>
                </div>
                <div id="boxball5" class="boxCustom boxBall box5">
                    <div class="imageBallBox" id="imageBall5"></div>
                </div>
                <div id="boxball6" class="boxCustom boxBall box6">
                    <div class="imageBallBox" id="imageBall6"></div>
                </div>
                <div id="boxball7" class="boxCustom boxBall box7">
                    <div class="imageBallBox" id="imageBall7"></div>
                </div>
                <div id="boxball8" class="boxCustom boxBall box8">
                    <div class="imageBallBox" id="imageBall8"></div>
                </div>
                <div id="boxball9" class="boxCustom boxBall box9">
                    <div class="imageBallBox" id="imageBall9"></div>
                </div>
            </div>
        </div>
        <div class="d-none" id="customizeContainerttt">
            <div class="customForm" id="signCustomForm">
                <div id="boxSign1" class="boxCustom boxSign box1">
                    <div class="imageSignBox" id="imageSign1">€</div>
                </div>
                <div id="boxSign2" class="boxCustom boxSign box2">
                    <div class="imageSignBox" id="imageSign2">$</div>
                </div>
                <div id="boxSign3" class="boxCustom boxSign box3">
                    <div class="imageSignBox" id="imageSign3">#</div>
                </div>
                <div id="boxSign4" class="boxCustom boxSign box4">
                    <div class="imageSignBox" id="imageSign4">💀</div>
                </div>
                <div id="boxSign5" class="boxCustom boxSign box5">
                    <div class="imageSignBox" id="imageSign5">🙈</div>
                </div>
                <div id="boxSign6" class="boxCustom boxSign box6">
                    <div class="imageSignBox" id="imageSign6">💃</div>
                </div>
                <div id="boxSign7" class="boxCustom boxSign box7">
                    <div class="imageSignBox" id="imageSign7">🕺</div>
                </div>
                <div id="boxSign8" class="boxCustom boxSign box8">
                    <div class="imageSignBox" id="imageSign8">💩</div>
                </div>
                <div id="boxSign9" class="boxCustom boxSign box9">
                    <div class="imageSignBox" id="imageSign9">42</div>
                </div>
            </div>
            <form id="victoryCustomForm">
                <div class="customForm" id="victoryCustomForm">
                    <div id="boxVictory1" class="boxCustom boxVictory box1">
                        <div class="imageVictoryBox" id="imageVictory1"></div>
                    </div>
                    <div id="boxVictory2" class="boxCustom boxVictory box2">
                        <div class="imageVictoryBox" id="imageVictory2"></div>
                    </div>
                    <div id="boxVictory3" class="boxCustom boxVictory box3">
                        <div class="imageVictoryBox" id="imageVictory3"></div>
                    </div>
                    <div id="boxVictory4" class="boxCustom boxVictory box4">
                        <div class="imageVictoryBox" id="imageVictory4"></div>
                    </div>
                    <div id="boxVictory5" class="boxCustom boxVictory box5">
                        <div class="imageVictoryBox" id="imageVictory5"></div>
                    </div>
                    <div id="boxVictory6" class="boxCustom boxVictory box6">
                        <div class="imageVictoryBox" id="imageVictory6"></div>
                    </div>
                    <div id="boxVictory7" class="boxCustom boxVictory box7">
                        <div class="imageVictoryBox" id="imageVictory7"></div>
                    </div>
                    <div id="boxVictory8" class="boxCustom boxVictory box8">
                        <div class="imageVictoryBox" id="imageVictory8"></div>
                    </div>
                    <div id="boxVictory9" class="boxCustom boxVictory box9">
                        <div class="imageVictoryBox" id="imageVictory9"></div>
                    </div>
                </div>
            </form>
        </div>
        <div id="saveButtonCustom">Save</div>
		<div id="bg"></div>
		`
}