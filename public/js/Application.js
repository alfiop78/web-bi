/** In questo file ci saranno tutte le funzioni di supporto all'applicazione
 * es.: la funzione logout(che distruggerà le variabili di sessione
 */

// FIX: 19.11.2024 questo file non viene utilizzato come una vera Classe, conviene impostarlo come module ed esportare le funzioni che vengono utilizzate
// un esempio dell'utilizzo dei moduli l'ho creato in example_collection.test

class Application {
	#console = document.getElementById('console');
	#messageConsole = document.querySelector('#console p');
	#iconConsole = document.querySelector('#console i');
	constructor() {
		this.loader = document.querySelector('.loader');
	}

	init() {
		// var main = document.getElementsByTagName("main")[0];
		console.log('init');

		let body = document.getElementById('body');
		// console.log(main);
		var spinner = document.querySelector('.loader');
		if (spinner) spinner.setAttribute('hidden', true);
		body.removeAttribute('hidden');
		// console.log('initLoader');
		// main.removeAttribute('hidden');

		// var i = document.querySelector('i.md-circle');
		// gestore dell'evento scroll
		document.querySelector('main').addEventListener('scroll', this.handlerScroll, true);
		// document.getElementById('container').addEventListener('click', this.containerClick, true);

		/* console.log(window.screen.height);
		console.log(window.screen.availHeight);
		console.log(window.screenTop);
		*/

		// document.getElementById("testTop").innerText = i.offsetTop+" - "+window.screen.availHeight;
		//document.getElementById("testTop").innerText = window.screenTop;
		// console.log(main.offsetHeight);
	}

	showLoader() {
		// const spinner = document.querySelector('.loader');
		// spinner.hidden = false;
		this.loader.hidden = false;
	}

	closeLoader() { this.loader.hidden = true; }

	loaderStart() {
		const spinner = document.querySelector('.local-loader');
		spinner.hidden = false;
	}

	loaderStop() {
		const spinner = document.querySelector('.local-loader');
		spinner.hidden = true;
	}

	handlerScroll() {
		// console.log('handlerScroll');
		// se ci sono tooltip aperti li chiudo
		let openedTooltips = document.querySelector('.tooltip[open]');
		if (openedTooltips) {
			console.log('tooltip aperti');
			openedTooltips.removeAttribute('open');
		}
	}

	getSessionName() {
		// recupeero il nome dell'utente da inserire nel drawer
		// TODO: fetch API
		var url = '/w/aj/ajUserName.php';

		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status === 200) {
					// console.log(request.response);
					if (request.response) {
						let response = JSON.parse(request.response);
						document.querySelector('.account > h5').innerHTML = response;
					}
				}
			}
		};

		request.open('POST', url);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send();
	}

	loading() {
		// visualizzo lo snipper nei loading di ricerca
		var main = document.getElementsByTagName('main')[0];
		let snipper = document.querySelector('.loader');
		main.setAttribute('hidden', true);
		snipper.removeAttribute('hidden');
	}

	back() {
		window.location.href = '../';
	}

	menu() {
		console.log('open drawer');
		this.drawer = document.getElementById('drawer');
		console.log(this.drawer);
		this.drawer.toggleAttribute('open');
		// document.getElementById('container').addEventListener('click', this.containerClick, true);
	}

	containerClick(e) {
		// console.log('containerClick');
		// console.log(e.target);
		/* this.drawerOpen = document.querySelector('#drawer[open]');
		// se il drawer è aperto lo chiudo
		if (this.drawerOpen) {
		  this.drawerOpen.toggleAttribute('open');
		  document.getElementById('container').removeEventListener('click', this.containerClick, true);
		} */
		let openedTooltips = document.querySelector('.tooltip[open]');
		if (openedTooltips) {
			// console.log('tooltip aperti');
			openedTooltips.removeAttribute('open');
		}
		// chiudo i filtri che non sono multiselezione, per chiudere quelli muiltiselezione c'è il tasto OK
		document.querySelectorAll('div.elements[show]:not([multi])').forEach((el) => {
			el.removeAttribute('show');
		});
	}

	initInput(e) {
		// non valido per le textarea
		if (e.target.hasAttribute('type') && e.target.getAttribute('type') !== 'checkbox') {
			(e.target.value.length > 0) ?
				e.target.parentElement.querySelector('label').classList.add('has-content') :
				e.target.parentElement.querySelector('label').classList.remove('has-content');
		}
	}

	markSearch(item, attr, searchText) {
		if (item.querySelector('mark')) {
			// se è presente un <mark> lo rimuovo altrimenti il childNodes[0] restituisce solo il primo nodo.
			// es. : Azienda verrà così suddiviso sulla ricerca "z". Node 1 : "A", Node 2 : <mark>z</mark>, Node 3 "ienda"
			item.querySelector('mark').remove();
			item.innerText = item.getAttribute(attr);
		}
		let textNode = item.childNodes[0];
		let startOffset = item.getAttribute(attr).toLowerCase().indexOf(searchText.toLowerCase());
		let endOffset = startOffset + searchText.length;
		const range = document.createRange();
		range.setStart(textNode, startOffset);
		range.setEnd(textNode, endOffset);
		// se trovo qualcosa applico il <mark>
		if (startOffset !== 0 && endOffset !== 0) {
			const mark = document.createElement('mark');
			range.surroundContents(mark);
		}
	}

	genericSearch(e) {
		// verifico che la input ha l'attr type='search', non eseguo la ricerca se il campo non ha l'attr type='search'
		if (!(e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search')) return;
		console.clear();
		const searchAttr = e.target.getAttribute('data-element-search');
		if (e.target.hasAttribute('data-type-search')) {
			// ricerca su elementi nidificati
			let sectionElement = Array.from(document.querySelectorAll("section[data-element-search='" + searchAttr + "'][data-searchable]"));

			sectionElement.forEach((sectionItem) => {
				// livello 2
				let spanElement = Array.from(sectionItem.querySelectorAll("span[data-element-search='" + searchAttr + "'][data-searchable]"));
				// ogni section contiene una sola gerarchia
				// livello 1
				let spanHierarchyElement = sectionItem.querySelector('span[data-hier-name]');
				// cerco prima nel livello più basso (2)
				spanElement.forEach((item) => {
					if (item.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
						// elemento trovato (livello 2), gli applico il <mark>
						this.markSearch(item, 'data-label', e.target.value);
						// verifico se, con lo stesso searchText, trovo anche qualcosa nel livello 1
						if (spanHierarchyElement.getAttribute('data-hier-name').toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
							// trovato, applico il <mark>
							this.markSearch(spanHierarchyElement, 'data-hier-name', e.target.value);
						} else {
							// non trovato, elimino il <mark> per reinserire il testo originale. Il <mark> và eliminato altrimenti childNodes[0] restituisce solo il primo node, il tag <mark>, se presente sarà il secondo node...
							// rimuovo la selezione con il mark perchè, in questo else, non viene trovato nessun elemento tra i nomi delle gerarchie
							spanHierarchyElement.innerText = spanHierarchyElement.getAttribute('data-hier-name');
						}
					} else {
						// rimuovo la selezione con il mark perchè, in questo else, non viene trovato nessun elemento
						// non trovato, elimino il <mark> per reinserire il testo originale. Il <mark> và eliminato altrimenti childNodes[0] restituisce solo il primo node, il tag <mark>, se presente sarà il secondo node...
						item.innerText = item.getAttribute('data-label');
						// verifico se, con lo stesso searchText, trovo anche qualcosa nel livello 1
						if (spanHierarchyElement.getAttribute('data-hier-name').toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) {
							this.markSearch(spanHierarchyElement, 'data-hier-name', e.target.value);
						} else {
							// rimuovo la selezione, con il mark perchè, in questo else, non viene trovato nessun elemento
							spanHierarchyElement.innerText = spanHierarchyElement.getAttribute('data-hier-name');
						}
					}
					// nascondo/visualizzo l'elemento trovato
					item.hidden = (item.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) ? true : false;
				});
				// console.log('section : ', sectionItem);
				// quanti elementi sono stati trovati in questa section
				const foundedElement = sectionItem.querySelectorAll("span[data-element-search='" + searchAttr + "'][data-searchable]:not([hidden])").length;
				// prima di nascondere la section, livello 0, (in caso nessun elemento è stato trovato) verifico se il searchText viene trovato nell'elemento radice della lista nidificata
				if (sectionItem.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
					// non trovato, nascondo tutta la section
					// se nessun elemento trovato nascondo il livello radice della lista nidificata
					sectionItem.hidden = (foundedElement === 0) ? true : false;
				} else {
					sectionItem.hidden = false;
					// ho trovato nel livello 0, a questo punto devo mostrare TUTTO il suo contenuto
					sectionItem.querySelectorAll("span[hidden]").forEach(span => span.hidden = false);
				}
			});
		} else {
			// ricerca classica
			// la input ha un attr "data-element-search" che indica su quali elementi deve cercare, gli elementi su cui cercare avranno un attr "data-search" con lo stesso valore di questo attributo
			// console.log(e.target.value);
			// const searchAttr = e.target.getAttribute('data-element-search');
			let listElement = Array.from(document.querySelectorAll("section[data-element-search='" + searchAttr + "'][data-searchable]"));
			// console.log(listElement);
			listElement.forEach((item) => {
				item.hidden = (item.getAttribute('data-label').indexOf(e.target.value) === -1 && item.getAttribute('data-label').toLowerCase().indexOf(e.target.value) === -1) ? true : false;
			});
		}
	}

	inputSearch(e) {
		const searchAttr = e.target.getAttribute('data-element-search');
		if (searchAttr) {
			const id = e.target.id;
			const value = e.target.value.toLowerCase();
			console.info("search: ", value);
			// se sono presenti <details> li apro tutti
			document.querySelectorAll(`*[data-search-id='${id}'] > details`).forEach(detail => detail.setAttribute('open', 'true'));
			let li = Array.from(document.querySelectorAll(`*[data-search-id='${id}'] li[data-searchable='true'][data-element-search='${searchAttr}']`));
			li.filter(item => item.hidden = (item.dataset.label.toLowerCase().indexOf(value) === -1) ? true : false);
			// chiudo tutti i detail se il testo di ricerca non contiene un valore
			if (value === "") document.querySelectorAll(`*[data-search-id='${id}'] > details`).forEach(detail => detail.removeAttribute('open'));
		}
	}

	showConsole(message, icon, time) {
		// console.log(message+icon);
		// if (!time) time = 2000; // se time non è impostato il message viene visualizzato alla chiamata di closeConsole()
		// type = info, warning, error, done
		this.#messageConsole.innerHTML = message;
		this.#iconConsole.setAttribute('data-icon', icon);
		this.#iconConsole.innerText = icon;
		// console.log(message, this.#console);
		// se non è aperta la apro
		if (!this.#console.hasAttribute('open')) this.#console.toggleAttribute('open');
		if (time) {
			setTimeout(() => {
				// chiudo la console dopo "time" secondi
				this.#console.removeAttribute('open');
			}, time);
		}
	}

	closeConsole() {
		if (this.#console.hasAttribute('open')) this.#console.removeAttribute('open');
	}

	checkTitle(target) {
		if (target.textContent.length === 0) {
			delete target.dataset.tempValue;
			delete target.dataset.value;
		} else {
			target.dataset.tempValue = target.textContent;
		}
	}

} // end Class
