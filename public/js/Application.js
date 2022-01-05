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

	searchInList(e) {
		// console.log(e.path);
		// console.log(e.target.value);

		// Ricerca in una lista
		(this.value.length > 0) ?
		  this.parentElement.querySelector('label').classList.add('has-content') :
		  this.parentElement.querySelector('label').classList.remove('has-content');

		// let listElement = Array.from(e.path[2].querySelectorAll('.element[name="'+name+'"] > .elementSearch'));
		let listElement = Array.from(e.path[2].querySelectorAll('.elementSearch'));
		// console.log(listElement);
		// TODO: foreach
		listElement.forEach((item) => {
			(item.getAttribute('label').indexOf(e.target.value) === -1 && item.getAttribute('label').toLowerCase().indexOf(e.target.value) === -1) ?
			item.parentElement.setAttribute('hide', true) : item.parentElement.removeAttribute('hide');
		});
	}

	// Ricerca in una lista, il tag section ha l'attributo data-label-search
	searchInSectionList(e) {
		console.clear();
		// console.log(e.path);
		// console.log(e.target.value);
		const ul = e.path[2].querySelector('ul');
		const elements = ul.querySelectorAll("section[data-searchable]");
		elements.forEach( (item) => {
		  	(item.getAttribute('data-label-search').indexOf(e.target.value) === -1 && item.getAttribute('data-label-search').toLowerCase().indexOf(e.target.value) === -1) ?
		  	item.hidden = true : item.hidden = false;
		});
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
