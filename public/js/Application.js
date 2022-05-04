/** In questo file ci saranno tutte le funzioni di supporto all'applicazione
 * es.: la funzione logout(che distruggerà le variabili di sessione
 */

class Application {
	#console = document.getElementById('console');
	constructor() {}

	init() {
		// var main = document.getElementsByTagName("main")[0];
		console.log('init');

		let body = document.getElementById('body');
		// console.log(main);
		var spinner = document.querySelector('.loader');
		spinner.setAttribute('hidden', true);
		body.removeAttribute('hidden');
		// console.log('initLoader');
		// main.removeAttribute('hidden');

		// var i = document.querySelector('i.md-circle');
		// gestore dell'evento scroll
		document.querySelector('main').addEventListener('scroll', this.handlerScroll, true);
		document.getElementById('container').addEventListener('click', this.containerClick, true);

		/* console.log(window.screen.height);
		console.log(window.screen.availHeight);
		console.log(window.screenTop);
		*/

		// document.getElementById("testTop").innerText = i.offsetTop+" - "+window.screen.availHeight;
		//document.getElementById("testTop").innerText = window.screenTop;
		// console.log(main.offsetHeight);
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
		request.setRequestHeader('Content-Type','application/json');
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
		window.location.href='../';
	}

	menu() {
		console.log('open drawer');
		this.drawer = document.getElementById('drawer');
		console.log(this.drawer);
		this.drawer.toggleAttribute('open');
		document.getElementById('container').addEventListener('click', this.containerClick, true);
	}

	containerClick(e) {
		// console.log('containerClick');
		// console.log(e.target);
		this.drawerOpen = document.querySelector('#drawer[open]');
		// console.log(this.drawerOpen);
		// chiudo il drawer
		// se il drawer è aperto lo chiudo
		if (this.drawerOpen) {
			this.drawerOpen.toggleAttribute('open');
			document.getElementById('container').removeEventListener('click', this.containerClick, true);
		}
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
		(e.target.value.length > 0) ?
			e.target.parentElement.querySelector('label').classList.add('has-content') :
			e.target.parentElement.querySelector('label').classList.remove('has-content');
	}

	genericSearch(e) {
		// verifico che la input ha l'attr type='search', non eseguo la ricerca se il campo non ha l'attr type='search'
		if ( !(e.target.hasAttribute('type') && e.target.getAttribute('type') === 'search') ) return;
		const searchAttr = e.target.getAttribute('data-element-search');
		if (e.target.hasAttribute('data-type-search')) {
			// ricerca su elementi nidificati
			let sectionElement = Array.from(document.querySelectorAll("section[data-element-search='" + searchAttr + "'][data-searchable='true']"));
			// console.log(sectionElement);
			// sectionElement.forEach( (item) => {
			// 	console.log(item);
			// 	console.log(e.target.value);
			// 	item.hidden = (item.getAttribute('data-label').indexOf(e.target.value) === -1 && item.getAttribute('data-label').toLowerCase().indexOf(e.target.value) === -1) ? true : false;
			// });
			// console.log(e.target.value);

			sectionElement.forEach( (sectionItem) => {
				let spanElement = Array.from(sectionItem.querySelectorAll("span[data-element-search='" + searchAttr + "'][data-searchable='true']"));
				spanElement.forEach( (item) => {
					if ( item.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase()) > -1 ) {
						console.log(item.getAttribute('data-label'));
						let textNode = item.childNodes[0];
						// console.log('textNode ', textNode);
						// console.log('textNode.length ', textNode.length);
						// debugger;
						let startOffset = item.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase());
						let endOffset = startOffset+e.target.value.length;
						const range = document.createRange();
						console.log('start : ', startOffset);
						console.log('end : ', endOffset);
						range.setStart(textNode, startOffset);
						range.setEnd(textNode, endOffset);
						const mark = document.createElement('mark');
						range.surroundContents(mark);
						// range.deleteContents();
					}
					item.hidden = (item.getAttribute('data-label').toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) ? true : false;
					// item.hidden = (item.getAttribute('data-label').indexOf(e.target.value) === -1 && item.getAttribute('data-label').toLowerCase().indexOf(e.target.value) === -1) ? true : false;
				});
				// console.log('section : ', sectionItem);
				// quanti elementi sono stati trovati in questa section
				const foundedElement = sectionItem.querySelectorAll("span[data-element-search='" + searchAttr + "'][data-searchable='true']:not([hidden])").length;
				// prima di nascondere la section (in caso nessun elemento è stato trovato) verifico se il testo da cercare viene trovato nell'elemento radice della lista nidificata
				if (sectionItem.getAttribute('data-label').indexOf(e.target.value) === -1 && sectionItem.getAttribute('data-label').toLowerCase().indexOf(e.target.value) === -1) {
					// non trovato, nascondo la section
					// se nessun elemento trovato nascondo il livello radice della lista nidificata
					sectionItem.hidden = (foundedElement === 0) ? true : false;
				} else {
					sectionItem.hidden = false;
					// ho trovato nel livello root, a questo punto devo mostrare il suo contenuto
					sectionItem.querySelectorAll("span[hidden]").forEach( span => span.hidden = false);
				}
			});
		} else {
			// ricerca classica
			/*(e.target.value.length > 0) ?
				e.target.parentElement.querySelector('label').classList.add('has-content') :
				e.target.parentElement.querySelector('label').classList.remove('has-content');*/
			// la input ha un attr "data-element-search" che indica su quali elementi deve cercare, gli elementi su cui cercare avranno un attr "data-search" con lo stesso valore di questo attributo
			// console.log(e.target.value);
			// const searchAttr = e.target.getAttribute('data-element-search');
			let listElement = Array.from(document.querySelectorAll("section[data-element-search='" + searchAttr + "'][data-searchable='true']"));
			// console.log(listElement);
			listElement.forEach( (item) => {
				item.hidden = (item.getAttribute('data-label').indexOf(e.target.value) === -1 && item.getAttribute('data-label').toLowerCase().indexOf(e.target.value) === -1) ? true : false;
			});
		}
	}

	// handlerConsole() {
	// 	this.#console.toggleAttribute('open');
	// }

	handlerConsole(message, icon, time) {
	    // console.log(message+icon);
	    if (!time) time = 2000; // se time non è impostato lo imposto su 2secondi
	    // type = info, warning, error, done
	    document.querySelector('#console p').innerText = message;
	    document.querySelector('#console i').setAttribute('data-icon', icon);
	    document.querySelector('#console i').innerText = icon;
	    document.getElementById("console").toggleAttribute('open');

	    setTimeout(function() {
	    	// chiudo la console dopo "time" secondi
	    	document.getElementById("console").toggleAttribute('open');
	    }, time);
  }

} // end Class
