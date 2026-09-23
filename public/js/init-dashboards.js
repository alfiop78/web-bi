var App = new Application();
const popover__progressBar = document.getElementById('popover__progressBar');
const progressBar = document.getElementById('progressBar');
const progressTo = document.getElementById('progressTo');
const progressTotal = document.getElementById('progressTotal');
const progressLabel = document.querySelector("label[for='progressBar']");
let dashboardToken;
let intervalId, messageIntervalId;
(() => {
	App.init();

	// Load the Visualization API and the corechart package.
	google.charts.load('current', { 'packages': ['corechart', 'controls'], 'language': 'it' });

	document.querySelectorAll('a[data-token]').forEach(a => {
		a.addEventListener('click', async (e) => {
			dashboardToken = e.currentTarget.dataset.token;
			if (intervalId) {
				clearInterval(intervalId);
				clearInterval(messageIntervalId);
			}
			console.log('execute start');
			// imposto il token della Dashboard
			Resource = new Resources();
			Resource.dashboard = dashboardToken;
			await executeDashboard();
			// await executeDashboard(dashboardToken);
			console.log('execute end');
			console.log(Resource.refreshTime);
			// se è presente un refreshTime per questa Dashboard aggiungo i setInterval()
			if (Resource.refreshTime !== 0) {
				console.log(Resource.refreshTime);
				messageIntervalId = setInterval(function() {
					console.log('UPDATE');
					App.showConsole('La Dashboard si aggiorna tra 5 secondi', 'info', 4500);
				}, Resource.refreshTime - 5000);
				// setInterval(executeDashboardInterval, Resource.refreshTime, dashboardToken);
				// intervalId = setInterval(getResources, Resource.refreshTime, Resource.dashboard);
				intervalId = setInterval(scheduleResource, Resource.refreshTime, Resource.dashboard);
			}
			// debugger;
			// scarico il json dal DB, lo salvo in sessionStorage
			/* await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/dashboard_show`)
				.then((response) => {
					// console.log(response);
					if (!response.ok) { throw Error(response.statusText); }
					return response;
				})
				.then((response) => response.json())
				.then(data => {
					Resource = new Resources();
					// console.log(data);
					Resource.json = JSON.parse(data.json_value);
					// debugger;
					document.querySelector('h1.title').innerHTML = Resource.json.title;
					getLayout();
				})
				.catch(err => {
					App.showConsole(err, 'error');
					console.error(err);
				}); */
		});
	});


	// Esempio di request in POST
	// WARN: per la chiamata in POST bisogna aggiungere la route in VerifyCrsfToken.php
	/* const params = sheet.id;
	const url = `/fetch_api/datamart`;
	const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
	const req = new Request(url, init);
	await fetch(req)
	  .then((response) => {
		console.log(response);
		if (!response.ok) { throw Error(response.statusText); }
		return response;
	  })
	  .then((response) => response.json())
	  .then(data => {
		console.log(data);
		// debugger;
		Resource.data = data;
		google.charts.setOnLoadCallback(app.drawDashboard(data));
		// google.charts.setOnLoadCallback(app.drawTable(data));
	  })
	  .catch(err => {
		App.showConsole(err, 'error');
		console.error(err);
	  }); */
	// end chiamta in POST

	// popover__progressBar.showPopover();
})();
