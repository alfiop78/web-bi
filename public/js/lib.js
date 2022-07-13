window.onload = function() {
	var App = new Application();
	console.log('onload');
	// TODO: input search, non tutte le input
	document.addEventListener('input', App.genericSearch.bind(this.App));
	// document.addEventListener('input', App.handlerSearch);
	document.addEventListener('input', App.initInput); // gestione della label con class="has-content"

	// se le input non hanno contenuto non evidenzio le label come :invalid, aggiungendo una class=has-content sulle label
	// var inputs = document.querySelectorAll("input:not([type='checkbox']):not([type='radio'])");
	/*inputs.forEach((input) => {
		// se la input ha l'attributo "search" e l'attr "data-generic-search" gli associo l'evento input per la ricerca genericSearch
		// la genericSearch è utilizzata per la schemata del versionamento, poi si può estendere ad altri casi
		if (input.hasAttribute('type') && input.getAttribute('type') === 'search') {
			const searchType = input.getAttribute('data-search-type');
			switch (searchType) {
				case 'generic-search':
					input.oninput = App.genericSearch;
					break;
				case 'search-list':
					input.onclick = App.searchInList;
					break;
				default:
					break;
			}
			
		}

		input.addEventListener('input', (e) => {
			(e.target.value.length > 0) ?
				e.target.parentElement.querySelector('label').classList.add('has-content') :
				e.target.parentElement.querySelector('label').classList.remove('has-content');
		}, true);

		input.onfocus = function(e) {this.select();}
	});*/

	/* tasto cancel nelle dialog*/
	document.querySelectorAll("button[name='cancel']").forEach( btn => {
		btn.onclick = () => document.querySelector('dialog[open]').close();
	});

    document.querySelectorAll("button[name='cancelAbsoluteWindow']").forEach( btn => {
		btn.onclick = () => delete document.querySelector('#absolute-window').dataset.open;
	});
};
