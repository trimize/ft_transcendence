const toggleSwitches = document.querySelectorAll('.toggle-switch');
const accessToken = localStorage.getItem('access');

toggleSwitches.forEach(toggleSwitch =>
{
	toggleSwitch.addEventListener('change', function ()
	{
		console.log("Changed");
		if (this.checked)
		{
			console.log("checked");
			console.log(this.dataset.form)
			switch (this.dataset.form)
			{
				case "1" :
					fetch(`http://localhost:8000/api/update_pong_ball/${this.dataset.switch}`,
					{
						method: 'PUT',
						headers:
						{
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					})
					break ;
				case "2" :
					fetch(`http://localhost:8000/api/update_pong_slider/${this.dataset.switch}`,
					{
						method: 'PUT',
						headers:
						{
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					})
					break ;
				case "3" :
					fetch(`http://localhost:8000/api/update_tic_tac_toe_sign/${this.dataset.switch}`,
					{
						method: 'PUT',
						headers:
						{
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					})
					break ;
				case "4" :
					fetch(`http://localhost:8000/api/update_tic_tac_toe_background/${this.dataset.switch}`,
					{
						method: 'PUT',
						headers:
						{
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					})
					break ;
			}
		}
	});
});
