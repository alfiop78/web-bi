console.log('init-dashboard-create');
// TODO: 18.09.2024 intercettare le modifiche fatte al report oppure ai filtri, per poter
// abilitare il tasto "Salva"
var App = new Application();
var Template = new Templates();
var Storage = new SheetStorages();
var Resource = new Resources();
let popover__chartWrappers = document.getElementById('popover__chartWrappers');
// dialogs
let dlg__config_filterDashboard = document.getElementById('dlg__config_dashboardFilters');
// templates
const template__li = document.getElementById('template__li');
const dlg__create_url = document.getElementById('dlg__create_url');
const btn__create_url = document.getElementById('btn__create_url');
const btn__url_generate = document.getElementById('btn__url_generate');
const tmpl__url_params = document.getElementById('tmpl__url_params');
const ref__connectionId = document.getElementById('db-connection-status');
const ul__sheets = document.getElementById('ul__sheets');
const ul__workbooks = document.getElementById('ul__workbooks');
const dlg__chartSection = document.getElementById('dlg-chart');
const ul__dashboards = document.getElementById('ul__dashboards');
(() => {
	var app = {
		layoutRef: document.getElementById('template-layout'),
		// dialogs
		dlgTemplateLayout: document.getElementById('dlg-template-layout'),
		number: function(properties) {
			return new google.visualization.NumberFormat(properties);
		},
		dashboardName: document.getElementById('dashboardTitle'),
		// dialogs
		dlgDashboard: document.getElementById('dialog-dashboard-open'),
		// buttons
		btnSave: document.getElementById('btnSave'),
		btnPublish: document.getElementById('btnPublish')
	}

	const rand = () => Math.random(0).toString(36).substring(2);

	// Load the Visualization API and the corechart package.
	// google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });
	google.charts.load('current', { 'packages': ['corechart', 'controls', 'charteditor'], 'language': 'it' });

	const config = { attributes: true, childList: true, subtree: true };

	const callback = (mutationList, observer) => {
		// console.log(mutationList, observer);
		for (const mutation of mutationList) {
			if (mutation.type === 'childList') {
				// console.info('A child node has been added or removed.');
				Array.from(mutation.addedNodes).forEach(node => {
					// console.log(node.nodeName);
					if (node.nodeName !== '#text') {
						if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);
						if (node.hasAttribute('data-context-fn')) node.addEventListener('contextmenu', app[node.dataset.contextFn]);

						if (node.hasChildNodes()) {
							node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
							node.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
							node.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
							node.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
						}
					}
				});
			} else if (mutation.type === 'attributes') {
				// console.log(`The ${mutation.attributeName} attribute was modified.`);
				// console.log(mutation.target);
				if (mutation.target.hasChildNodes()) {
					mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
					mutation.target.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
					mutation.target.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
					mutation.target.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
				}
			}
		}
	};
	// Create an observer instance linked to the callback function
	const observerList = new MutationObserver(callback);
	// Start observing the target node for configured mutations
	// observerList.observe(targetNode, config);
	observerList.observe(document.getElementById('body'), config);

	// observer per gli oggetti con [data-mutation-observer]
	// es. Titolo
	const callbackObservers = (mutationList, observer) => {
		// console.log(mutationList, observer);
		for (const mutation of mutationList) {
			if (mutation.type === 'attributes') {
				console.log(`The ${mutation.attributeName} attribute was modified.`);
				// console.log(mutation.target);
				if (mutation.target.hasChildNodes()) {
					console.log(mutation.target.dataset.mutationObserver);
					// nell'attributo data-mutation-observer è presente il nome della proprietà del json da verificare
					// TEST: 19.09.2024 da completare
					/* const json = JSON.parse(window.sessionStorage.getItem(Resource.json.token));
					if (json) {
					  if (json.title !== mutation.target.dataset.value) {
						console.info("Dato modificato");
						app.btnSave.disabled = false;
					  }
					} */
				}
			}
		}
	};
	// Create an observer instance linked to the callback function
	const observers = new MutationObserver(callbackObservers);
	document.querySelectorAll('*[data-mutation-observer]').forEach(element => {
		observers.observe(element, { attributes: true, childList: false, subtree: false });
	});


	// Viene rimosso 'hidden' dal #body. In questo modo la modifica viene
	// intercettata dall'observer e vengono associate le funzioni sugli elementi
	// che hanno l'attributo data-fn
	// TODO: utilizzare questa logica anche sulle altre pagine
	App.init();

	app.clearDashboard = () => {
		// chiudo eventuali dashboard già aperti
		// elimino il template, anche se non è stato ancora selezionato
		app.layoutRef.querySelectorAll('*').forEach(el => el.remove());
		delete app.btnSave.dataset.token;
		delete app.dashboardName.dataset.value;
		// app.btnSave.disabled = true;
		// app.btnPublish.disabled = true;
		app.dashboardName.textContent = app.dashboardName.dataset.defaultValue;
	}

	// recupero l'elenco delle Dashboard appartenenti al DB corrente
	app.openDashboard = async () => {
		// app.clearDashboard();
		App.showConsole('Recupero elenco Dashboard', 'info');
		await fetch(`/fetch_api/dashboardsByConnectionId`)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then(data => {
				console.log(data);
				data.forEach(dashboard => {
					const content = template__li.content.cloneNode(true);
					const li = content.querySelector('li[data-li]');
					const span = li.querySelector('span');
					li.dataset.token = dashboard.token;
					li.dataset.label = dashboard.name;
					li.addEventListener('click', app.dashboardSelected);
					li.dataset.elementSearch = 'dashboards';
					span.innerText = dashboard.name;
					ul__dashboards.appendChild(li);
				});
				App.closeConsole();
			})
			.catch(err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
		app.dlgDashboard.showModal();
	}

	// selezione della dashboard da aprire
	app.dashboardSelected = async (e) => {
		App.showConsole(`Recupero dati della Dashboard ${e.currentTarget.dataset.label}`, 'info');
		await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/dashboard_show`)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then(data => {
				// imposto il titolo della dashboard
				app.dashboardName.textContent = data.dashboard.name;
				app.dashboardName.dataset.value = data.dashboard.name;
				app.dashboardName.dataset.tempValue = data.dashboard.name;
				// imposto il token sul tasto "Salva" per poter aggiornare la dashboard e non inserirla nel DB
				app.btnSave.dataset.token = data.dashboard.token;

				Resource.json = JSON.parse(data.dashboard.json_value);
				console.log(Resource.json);
				// refresh time, se presente
				if (Resource.json.options) {
					input__refresh_time.value = Resource.json.options.refresh_time;
					// questa if deve essere rimossa dopo aver "ricreato" tutte le dashboard con le nuove opzioni
					// if (Resource.json.options.buttons) input__refresh_button.checked = Resource.json.options.buttons.refresh
					if (Resource.json.options.buttons.hasOwnProperty('refresh')) {
						input__refresh_button.checked = Resource.json.options.buttons.refresh.value;
						input__script_file_name.hidden = !Resource.json.options.buttons.refresh.value;
						input__script_file_name.value = (Resource.json.options.buttons.refresh.script_file_name !== undefined) ?
							Resource.json.options.buttons.refresh.script_file_name :
							null;
					}
				}
				// imposto il template della dashboard selezionata
				Template.id = Resource.json.layout;
				// creo l'anteprima nel DOM
				Template.create(true);
				// salvo la dashboard nel session storage, in questo modo posso tenere conto delle modifiche fatte e
				// abilitare/disabilitare di conseguenza il tasto btnSave in base al MutationObserver
				window.sessionStorage.setItem(Resource.json.token, JSON.stringify(Resource.json));
				// TODO: 19.06.2025 Valutare se scaricare, in sessionStorage, anche le 'resources'
				App.closeConsole();
				app.dlgDashboard.close();
				// abilito il tasto Genera Url
				btn__create_url.dataset.token = data.token;
				btn__create_url.disabled = false;
				// 19.06.2025 Creo la url per il recupero dei dati dai datamart
				// app.createUrlsDatamart();
				createUrlsDatamart(data.resources);
			})
			.catch(err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
	}

	app.resourceSettings = (e) => {
		const popover = document.getElementById(e.currentTarget.dataset.popoverId);
		const { top, right } = e.currentTarget.getBoundingClientRect();
		// aggiungo i wrapper (ChartWrapper) alla popover
		// se esistono più di un chartWrapper li visualizzo nella popover__chartWrappers
		const wrappers = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token)).specs.wrapper;
		if (Object.keys(wrappers).length >= 2) {
			popover.querySelectorAll('nav>button').forEach(button => button.remove());
			Object.keys(wrappers).forEach(chartType => {
				const btn = document.createElement('button');
				btn.value = chartType;
				btn.dataset.token = e.currentTarget.dataset.token;
				btn.dataset.ref = e.currentTarget.dataset.id;
				btn.innerText = chartType;
				btn.addEventListener('click', selectWrapper);
				popover.querySelector('nav').appendChild(btn);
			});
		}
		popover.showPopover();
		popover.style.top = `${top - popover.offsetHeight}px`;
		popover.style.left = `${right}px`;
	}

	app.publish = async (e) => {
		e.target.disabled = true;
		// il tasto "pubblica" deve :
		// - recuperare tutti gli oggetti della pagina (report)
		// - crearne i COPY_TABLE da WEB_BI_timestamp_userId -> WEB_BI_timestamp
		// - salvare le specifiche in bi_sheet_specifications
		Resource.dashboard.published = true;
		console.log(Resource.dashboard);

		let urls = [];
		debugger;
		for (const wrapper of Resource.resources.values()) {
			debugger;
			// urls.push(`/fetch_api/copy_from/${wrapper.datamartId}_${wrapper.userId}/copy_to/${wrapper.datamartId}/copy_table`);
			urls.push(`/fetch_api/publish/token/${wrapper.token}`);
		}
		console.log(urls);
		await Promise.all(urls.map(url => fetch(url)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.text();
				}))
			})
			.then(async data => {
				// if (data) App.showConsole("Dashboard pubblicata", 'done', 2000);
				if (data) {
					console.log(data);
					const params = JSON.stringify(Resource.dashboard);
					const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
					const req = new Request('/fetch_api/json/dashboard_update', init);
					await fetch(req)
						.then((response) => {
							if (!response.ok) { throw Error(response.statusText); }
							return response;
						})
						.then((response) => response.json())
						.then((data) => {
							console.log(data);
							if (data) App.showConsole("Dashboard pubblicata", 'done', 2000);
						})
						.catch((err) => {
							App.showConsole(err, 'error');
							console.error(err);
						});
				}
			})
			.catch(err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
	}

	// Salvataggio della Dashboard
	app.save = async (e) => {
		e.target.disabled = true;
		const input__refresh_time = document.getElementById('input__refresh_time');
		const input__refresh_button = document.getElementById('input__refresh_button');
		console.log(input__script_file_name);
		// se è presente dataset.token sto aggiornando una dashboard esistente
		const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
		if (!app.dashboardName.dataset.value) {
			App.showConsole('Titolo non inserito', 'error', 2000);
			app.dashboardName.focus();
			e.target.disabled = false;
			return false;
		}

		// filtri della Dashboard
		document.querySelectorAll('#filter__dashboard>.filters>i').forEach(filter => {
			Resource.dashboardFilters.set(filter.dataset.id, {
				id: filter.dataset.name,
				containerId: filter.dataset.id,
				filterColumnLabel: filter.dataset.name,
				caption: filter.dataset.name,
				// TODO: 16.12.2024 da valorizzare
				sheet: filter.dataset.sheet
			});
		});

		// 10.12.2024 Recupero le risorse aggiunte alla dashboard
		document.querySelectorAll('.chartContent[data-resource]>.chart-elements').forEach(sheet => {
			const token = sheet.dataset.token;
			// TODO: 19.06.2025 verifico se questa risorsa è già stata inserita in un altro container
			Resource.resources = {
				token,
				// userId: +sheet.dataset.userId,
				datamartId: +sheet.dataset.datamartId,
				wrappers: {
					[sheet.id]: {
						name: sheet.dataset.wrapper,
						containerId: sheet.id,
						chartType: sheet.dataset.chartType,
						// WARN: 19.06.2025 Al momento, in options, non salvo nulla, le options
						// verranno prese dallo Sheet (bi_sheet) però, in futuro, dovrò implementare
						// una dialog per poter configurare le opzioni del grafico (o della DataTable)
						// In questo modo, le opzioni dello sheet impostate sulla dashboard, possono
						// anche essere diverse da quelle impostate sul report. Ad esempio, potrei avere
						// lo stesso report, configurato con colori diversi, per ogni dashboard
						options: {}
					}
				}
			};
		});
		debugger;
		// verifica di validità
		if (Resource.resources.size === 0) {
			App.showConsole('Nessun oggetto aggiunto alla Dashboard', 'error', 2000);
			e.target.disabled = false;
			return false;
		}

		const options = {
			refresh: Number(input__refresh_time.value.split(':')[0]) * 60 * 60 * 1000 + Number(input__refresh_time.value.split(':')[1]) * 60 * 1000,
			refresh_time: input__refresh_time.value,
			buttons: {
				// refresh: { value: input__refresh_button.checked, script_file_name: (input__script_file_name.value) ? input__script_file_name.value : null }
				refresh: { value: input__refresh_button.checked, script_file_name: input__script_file_name.value }
			}
		};
		if (input__refresh_button.checked) {
			if (input__script_file_name.value.length === 0) {
				App.showConsole("Il nome del file non può essere vuoto", 'error', 2000);
				e.target.disabled = false;
				return false;
			}
		}
		console.log(options);
		debugger;

		const note = document.getElementById('note').value;
		// salvo il json 'dashboard-token' in bi_dashboards
		// TODO: aggiungere la prop 'published' (bool). Questa mi consentirà
		// di visualizzare la dashboard, solo le dashboards pubblicate possono
		// essere visualizzate
		// Qui salvo anche le resources di questa dashboard
		Resource.dashboard = {
			title: app.dashboardName.dataset.value,
			type: 'dashboard',
			note,
			token,
			published: false,
			dashboardFilters: Object.fromEntries(Resource.dashboardFilters),
			resources: Object.fromEntries(Resource.resources),
			layout: Template.id,
			options
		}
		console.log(Resource.dashboard);
		// Salvo la Dashboard su database
		const url = (e.target.dataset.token) ? '/fetch_api/json/dashboard_update' : '/fetch_api/json/dashboard_store';
		const params = JSON.stringify(Resource.dashboard);
		console.log(params);
		debugger;
		const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
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
					App.showConsole("Salvataggio completato", 'done', 2000);
					app.btnPublish.disabled = false;
					e.target.disabled = false;
				}
			})
			.catch((err) => {
				App.showConsole(err, 'error');
				console.error(err);
			});
	}

	app.preview = (e) => {
		console.log(e.target);
		debugger;
		// TODO: da valutare, potrei visualizzare una preview del dashboard completo di dati
	}

	app.openDlgTemplateLayout = () => app.dlgTemplateLayout.showModal();

	app.getTemplates = async () => {
		// TODO: I Template Layout li devo mettere nel DB invece di metterli nei file .json
		// carico la lista dei template .json, nella dialog
		const urls = [
			`/js/json-templates/layout-generic.json`,
			`/js/json-templates/layout-horizontalCharts.json`,
			`/js/json-templates/layout-horizontalChartsUnequal.json`,
			`/js/json-templates/layout-threeSection.json`,
		];

		const init = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, method: 'POST' };
		// ottengo tutte le risposte in un array
		await Promise.all(urls.map(url => fetch(url, init)))
			.then(responses => {
				return Promise.all(responses.map(response => {
					if (!response.ok) { throw Error(response.statusText); }
					return response.json();
				}))
			})
			.then((data) => {
				console.log(data);
				if (!data) return;
				// creo le preview dei template
				data.forEach(template => {
					// imposto i dati di questo Template nella classe
					Template.data = template;
					Template.id = template.id;
					Template.thumbnails();
				})
			})
			.catch(err => console.error(err));

		// app.dlgTemplateLayout.showModal();
	}

	app.layoutSelected = (e) => {
		// elimino eventuali selezioni precedenti
		document.querySelectorAll('.thumb-layout[data-selected]').forEach(el => delete el.dataset.selected);
		e.currentTarget.dataset.selected = true;
	}

	// Template selezionato e chiusura dialog
	app.btnTemplateDone = () => {
		app.dlgTemplateLayout.close();
		//  recupero il template selezionato
		const template = document.querySelector('.thumb-layout[data-selected]').id;
		Template.id = template;
		// console.log(template);
		// Template.dashboardRef = document.getElementById('dashboard-preview');
		// creo l'anteprima nel DOM
		Template.create(true);
	}

	// Fn invocata dal tasto + che viene creato dinamicamente dal layout-template
	// apertura dialog per l'aggiunta dell'oggeteto google chart
	app.addResource = async (e) => {
		if (e.currentTarget.classList.contains('defined')) return false;
		// il ref corrente, appena aggiunto
		Resource.ref = document.getElementById(e.currentTarget.id);
		// 16.06.2025 Recupero elenco WorkBook dal DB
		App.showConsole("Recupero elenco WorkBook...", 'info', null);
		await fetch(`/fetch_api/workbooksByConnectionId`)
			.then((response) => {
				if (!response.ok) { throw Error(response.statusText); }
				return response;
			})
			.then((response) => response.json())
			.then(data => {
				console.log(data);
				data.forEach(workbook => {
					const content = template__li.content.cloneNode(true);
					const li = content.querySelector('li[data-li]');
					const span = li.querySelector('span');
					li.dataset.token = workbook.token;
					li.dataset.label = workbook.name;
					li.addEventListener('click', workbookSelected);
					li.dataset.elementSearch = 'workbooks';
					span.innerText = workbook.name;
					ul__workbooks.appendChild(li);
				});
				App.closeConsole();
			})
			.catch(err => {
				App.showConsole(err, 'error');
				console.error(err);
			});
		dlg__chartSection.showModal();
	}

	// Ridisegno il report in base alle specifiche recuperate dal report
	function selectWrapper(e) {
		Resource.wrapper = e.target.getAttribute('value');
		Resource.specs = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token)).specs;
		const chartContent = document.getElementById(e.currentTarget.dataset.ref);
		onReady();
		chartContent.dataset.wrapper = Resource.wrapper;
		popover__chartWrappers.hidePopover();
	}

	app.draw__new = () => {
		Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
		// Create a dashboard.
		console.log(Resource.ref.id);
		let gdashboard = new google.visualization.Dashboard(Resource.dashboardContent);
		// imposto i filtri per questa dashboard
		const controls = Resource.drawControls(document.getElementById(`flt__${Resource.ref.id}`));
		// creo il ChartWrapper Table, anche se questo Sheet ha più ChartWrapper creati, imposterò un tasto per fare lo swicth e cambiare la visualizzazione
		Resource.chartWrapper = new google.visualization.ChartWrapper();
		// imposto sempre Table di default
		Resource.chartWrapper.setChartType('Table');
		Resource.chartWrapper.setContainerId(Resource.ref.id);
		Resource.chartWrapper.setDataTable(Resource.dataTable);
		console.log(Resource.specs.wrapper.Table.options);
		debugger;
		// Resource.chartWrapper.setOptions(Resource.specs.wrapper.Table.options);
		Resource.chartWrapper.setOption('height', 'auto');
		Resource.chartWrapper.setOption('allowHtml', true);
		Resource.chartWrapper.setOption('page', 'enabled');
		Resource.chartWrapper.setOption('pageSize', 15);
		Resource.chartWrapper.setOption('width', '100%');
		Resource.chartWrapper.setOption('cssClassNames', {
			"headerRow": "g-table-header",
			"tableRow": "g-table-row",
			"oddTableRow": null,
			"selectedTableRow": null,
			"hoverTableRow": null,
			"headerCell": "g-header-cell",
			"tableCell": "g-table-cell",
			"rowNumberCell": null
		});
		console.log(Resource.chartWrapper.getOptions());
		debugger;
		gdashboard.bind(controls, Resource.chartWrapper);

		// Draw the dashboard.
		gdashboard.draw(Resource.dataTable);
	}

	app.drawTable = () => {
		// aggiungo i filtri se sono stati impostati nel preview sheet
		// console.log(Template);
		// console.log(Resource);
		// console.log(Resource.ref);
		// debugger;
		// Template.createFilterSection();

		Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
		// Resource.DOMref = new google.visualization.Table(document.getElementById('chart_div'));
		Resource.DOMref = new google.visualization.Table(Resource.ref);
		Resource.groupFunction();

		// imposto qui il metodo group() perchè per la dashboard è diverso (viene usato il ChartWrapper)
		Resource.dataGroup = new google.visualization.data.group(
			Resource.dataTable, Resource.groupKey, Resource.groupColumn
		);
		Resource.specs.data.group.columns.forEach(metric => {
			let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
			formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
		});
		Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);

		Resource.createDataView();
		// console.info('DataView', Resource.dataViewGrouped);
		Resource.DOMref.draw(Resource.dataViewGrouped, Resource.specs.wrapper.options);
	}

	app.btnRemoveFilter = (e) => {
		const filterId = e.target.dataset.id;
		// const f = Resource.specs.filters.find(filter => filter.containerId === filterId);
		// Cerco, con findIndex(), l'indice corrispondente all'elemento da rimuovere
		const index = Resource.specs.filters.findIndex(filter => filter.containerId === filterId);
		Resource.specs.filters.splice(index, 1);
		// lo rimuovo anche dal DOM
		const filterRef = document.getElementById(filterId);
		filterRef.parentElement.remove();
		// ricostruisco il bind
		Resource.bind()
	}

	// end onclick events

	// onclose dialogs
	// reset dei layout già presenti, verrano ricreati all'apertura della dialog
	// app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

	// reset sheets
	dlg__chartSection.onclose = () => {
		// document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());
		// document.querySelectorAll('#ul-workbooks > li').forEach(el => el.remove());
	}

	app.dlgDashboard.onclose = () => ul__dashboards.querySelectorAll('li').forEach(item => item.remove());

	// Drag events
	app.filterDragStart = (e) => {
		// console.log('dragStart');
		console.log(e.target.id);
		e.target.classList.add('dragging');
		e.dataTransfer.setData('text/plain', e.target.id);
		e.dataTransfer.effectAllowed = "copy";
	}

	app.filterDragEnter = (e) => {
		// console.log('dragEnter');
		e.preventDefault();
		if (e.target.classList.contains('dropzone')) {
			e.target.classList.add('dropping');
		} else {
			console.log('non in dropzone');
			e.dataTransfer.dropEffect = 'none';
		}
	}

	app.filterDragOver = (e) => {
		// console.log('dragOver');
		e.preventDefault();
		// console.log(e.target);
		if (e.target.classList.contains('dropzone')) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	app.filterDragLeave = (e) => {
		// console.log('dragLeave');
		e.preventDefault();
		if (e.target.classList.contains('dropzone')) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	app.filterDragEnd = (e) => {
		console.log('dragEnd');
		e.preventDefault();
		if (e.dataTransfer.dropEffect === 'move') { }
	}

	app.filterDrop = (e) => {
		e.preventDefault();
		// TODO: implementare anche il drop inverso.
		// Al momento il drop funziona soltanto se sposto un filtro "verso sinistra"
		e.currentTarget.classList.replace('dropping', 'dropped');
		// target corrisponde all'elemento .preview-filter, mentre currentTarget corrisponde al
		// contenitore del filtro
		if (!e.currentTarget.classList.contains('dropzone')) return;
		const parentDiv = document.getElementById('filter__dashboard');
		// id filtro che sto draggando (flt-0, flt-1, ecc...)
		const elementId = e.dataTransfer.getData('text/plain');
		// elementRef è l'elemento che sto spostando "newFilter"...
		const elementRef = document.getElementById(elementId);
		// ...questo elemento lo devo inserire in e.currentTarget
		// sostituendo quello già presente in e.currentTarget
		const oldFilter = e.currentTarget.querySelector('.preview-filter');
		// ... oldFilter lo inserisco nel .filter-container di provenienza
		parentDiv.insertBefore(elementRef.parentElement, oldFilter.parentElement);
		// Salvo tutti i filtri nell'ordine in cui sono stati spostati con drag&drop
		Resource.specs.filters = [];
		parentDiv.querySelectorAll('.filter-container').forEach(filter => {
			const filterDiv = filter.querySelector('.preview-filter');
			Resource.specs.filters.push({
				id: filterDiv.dataset.name,
				containerId: filterDiv.id,
				filterColumnLabel: filterDiv.innerText,
				caption: filterDiv.innerText
			});
		});
		console.log('filters dopo il drop : ', Resource.specs.filters);
	}

	// End Drag events

	app.dashboardName.onblur = (e) => {
		if (e.target.dataset.tempValue) {
			e.target.dataset.value = e.target.textContent;
		} else {
			e.target.innerText = e.target.dataset.defaultValue;
		}
	}

	app.dashboardName.oninput = (e) => App.checkTitle(e.target);

	app.resourceRemove = () => {
		console.log(Resource.ref);
		Resource.ref.querySelector('div').remove();
		Resource.ref.classList.remove('defined');
		document.querySelectorAll('#filter__dashboard.contentObject>*').forEach(el => el.remove());
	}

	app.getTemplates();

})();

console.log(' ENDinit-dashboard-create');
