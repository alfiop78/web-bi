var App = new Application();
const popover__progressBar = document.getElementById('popover__progressBar');
const progressBar = document.getElementById('progressBar');
const progressTo = document.getElementById('progressTo');
const progressTotal = document.getElementById('progressTotal');
const progressLabel = document.querySelector("label[for='progressBar']");
let dashboardToken, intervalId, messageIntervalId;
(() => {
	App.init();
	// Load the Visualization API and the corechart package.
	google.charts.load('current', { 'packages': ['corechart', 'controls'], 'language': 'it' });

	/* const config = { attributes: true, childList: true, subtree: true };

	const callback = (mutationList, observer) => {
		console.log(mutationList, observer);
		for (const mutation of mutationList) {
			if (mutation.type === 'childList') {
				console.info('A child node has been added or removed.');
				Array.from(mutation.addedNodes).forEach(node => {
					console.log(node);
					// console.log(node.classList);
					// console.log(node.nodeName);
					// se classList contiene .collapse__title imposto la funzione handleCollapseElement()
					if (node.classList.contains('collapse__element')) {
						// l'evento, in components.js, consente di aprire/chiudere gli elementi collapse..
						// node.querySelectorAll('.collapse__title').forEach(li => li.addEventListener('click', handleCollapseElement));
						node.querySelectorAll('.collapse__title').forEach(li => li.addEventListener('click', handleCollapseElement));
					}
				});
			} else if (mutation.type === 'attributes') {
				console.log(`The ${mutation.attributeName} attribute was modified.`);
				// console.log(mutation.target);
				// if (mutation.target.hasChildNodes()) {
				// 	mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
				// }
			}
		}
	};

	// Create an observer instance linked to the callback function
	const observerList = new MutationObserver(callback);
	// Start observing the target node for configured mutations
	// observerList.observe(targetNode, config);
	observerList.observe(document.getElementById('template-layout'), config); */

	// scarico il json dal DB, lo salvo in sessionStorage
	// const template__layout = document.getElementById('template-layout');
	// {method: 'GET', headers: {'Authorization': 'Basic ' + btoa('lynxuser:password')}}
	// fetch(`/fetch_api/name/${template__layout.dataset.token}/dashboard_show`)
	// 	.then((response) => {
	// 		// console.log(response);
	// 		if (!response.ok) { throw Error(response.statusText); }
	// 		return response;
	// 	})
	// 	.then((response) => response.json())
	// 	.then(async data => {
	// 		Resource = new Resources();
	// 		// console.log(data);
	// 		Resource.json = JSON.parse(data.json_value);
	// 		document.getElementsByTagName('title')[0].innerText = Resource.json.title;
	// 		getLayout();
	// 	})
	// 	.catch(err => {
	// 		App.showConsole(err, 'error');
	// 		console.error(err);
	// 	});

	init = async () => {
		const template__layout = document.getElementById('template-layout');
		dashboardToken = template__layout.dataset.token;
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

	}

	init();

})();

