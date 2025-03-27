console.log('home_init');
var App = new Application();
const userId = +document.querySelector('h5[data-uid]').dataset.uid;
const databaseName = document.getElementById('database-name');
const iconStatus = document.getElementById('db-icon-status');
const connectionStatus = document.getElementById('db-connection-status');
// dialogs
const dialog__newConnection = document.getElementById('dialog__newConnection');
const form = document.getElementById('form__newConnection');
// buttons
const btn__newConnection = document.getElementById("btn__newConnection");
const btn__removeConnection = document.getElementById("btn__removeConnection");
const btn__editConnection = document.getElementById("btn__editConnection");

(() => {
	var app = {
		// drawer
		drawer: document.getElementById('drawer'),
		// body
		body: document.getElementById('body')
	}


	App.init();

	const config = { attributes: true, childList: true, subtree: true };

	const callback = (mutationList, observer) => {
		// console.log(mutationList, observer);
		for (const mutation of mutationList) {
			if (mutation.type === 'childList') {
				console.info('A child node has been added or removed.');
				Array.from(mutation.addedNodes).forEach(node => {
					// console.log(node.nodeName);
					if (node.nodeName !== '#text') {
						if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);

						if (node.hasChildNodes()) {
							node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
						}
					}
				});
			} else if (mutation.type === 'attributes') {
				console.log(`The ${mutation.attributeName} attribute was modified.`);
				// console.log(mutation.target);
				if (mutation.target.hasChildNodes()) {
					mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
				}
			}
		}
	};
	// Create an observer instance linked to the callback function
	const observerList = new MutationObserver(callback);
	// Start observing the target node for configured mutations
	// observerList.observe(targetNode, config);
	observerList.observe(document.getElementById('body'), config);

	document.querySelectorAll('#drawer .navContent>a:not([title="Dashboards"])').forEach(el => {
		el.onclick = (e) => {
			// verifico se è stata stabilita una connessione al DB
			if (+connectionStatus.dataset.connected === 0) {
				e.preventDefault();
				App.showConsole('Nessun database connesso', 'error', 2000);
				return false;
			}
		}
	});

	console.log('end home_init');
})();
