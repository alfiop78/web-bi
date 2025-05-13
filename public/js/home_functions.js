console.log('home_functions');
/*
 * seleczione del DB, salvo i dati in sessione e modifico
 * i parametri di connessione nel file database.php
 * */
async function selectConnection(e) {
	const id = e.currentTarget.dataset.id;
	await fetch(`/fetch_api/${id}/show`)
		.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data) {
				// seleziono la connessione impostata
				e.target.dataset.selected = 'true';
				iconStatus.innerText = 'database';
				databaseName.innerHTML = data.name;
				connectionStatus.dataset.databaseId = data.id;
				App.showConsole('Connessione effettuata', 'done', 2000);
			} else {
				delete e.target.dataset.selected;
				iconStatus.innerText = 'database_off';
				databaseName.innerHTML = 'Database non impostato';
				connectionStatus.dataset.databaseId = 0;
				App.showConsole('Connessione non riuscita', 'error', 2000);
			}
		})
		.catch((err) => console.error(err));
}

function removeConnection() {
	// TODO: 09.01.2025 implementazione
}

function editConnection() {
	// TODO: 09.01.2025 implementazione
}

async function createConnection(e) {
	e.preventDefault();
	const formData = new FormData(form);
	const url = `/fetch_api/connections/store`;
	// INFO: con l'utilizzo del FormData non è necessario specificare il Content-Type
	const init = { method: 'POST', body: formData };
	const req = new Request(url, init);
	await fetch(req)
		.then((response) => {
			if (!response.ok) { throw Error(response.statusText); }
			return response;
		})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data) {
				App.showConsole("Nuova connessione creata!", "done", 3000);
			} else {
				console.error("Errore nell'aggiornamento della risorsa");
			}
		})
		.catch((err) => console.error(err));
}

console.log('end home_functions');
