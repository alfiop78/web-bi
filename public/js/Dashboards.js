class Dashboards {
	#json = {};
	#dashboard = {};
	constructor() {
		this.dashboardFilters = new Map();
		this.dashboardControls = [];
	}

	set json(value) {
		this.#json = value;
	}

	get json() {
		return this.#json;
	}

	drawDraggableControls(parent) {
		this.controls = [];
		// console.log(this.sheetSpecs);
		if (this.specs.filters) {
			this.specs.filters.forEach(filter => {
				// creo qui il div class="filters" che conterrà il filtro
				// In questo modo non è necessario specificare i filtri nel template layout
				const template = document.getElementById('template__filters').content.cloneNode(true);
				let content = template.querySelector('.filters');
				let i = content.querySelector('i');
				i.dataset.sheet = this.specs.token;
				i.dataset.id = filter.containerId;
				i.dataset.name = filter.filterColumnLabel;
				// i.addEventListener('click', addDashboardFilters);
				let div = content.querySelector('div');
				div.id = filter.containerId;
				parent.appendChild(content);
				this.filter = new google.visualization.ControlWrapper({
					'controlType': 'CategoryFilter',
					'containerId': filter.containerId,
					'options': {
						'filterColumnIndex': filter.filterColumnIndex,
						'filterColumnLabel': filter.filterColumnLabel,
						'ui': {
							'caption': filter.caption,
							'label': '',
							'cssClass': 'g-category-filter',
							'selectedValuesLayout': 'aside'
							// 'labelStacking': 'horizontal'
						}
					}
				});
				this.controls.push(this.filter);
			});
		}
		return this.controls;
	}

	drawControls(filtersRef) {
		this.chartControls = [];
		// console.log(this.sheetSpecs);
		if (this.specs.filters) {
			this.specs.filters.forEach(filter => {
				console.log('filters : ', filter);
				// creo qui il div class="filters" che conterrà il filtro
				// In questo modo non è necessario specificare i filtri nel template layout
				this.filterRef = document.createElement('div');
				this.filterRef.className = 'filters';
				this.filterRef.id = filter.containerId;
				this.filterRef.sheet = this.specs.token;
				// se il controllo è già presente in dashboardControls va nascosto (appratiene ad un secondo datamart)
				this.dashboardControls.forEach(control => {
					if (control.getOption('filterColumnLabel') === filter.filterColumnLabel) {
						this.filterRef.setAttribute('hidden', 'true');
					}
				});

				filtersRef.appendChild(this.filterRef);
				this.filter = new google.visualization.ControlWrapper({
					controlType: 'CategoryFilter',
					containerId: filter.containerId,
					options: {
						filterColumnIndex: filter.filterColumnIndex,
						filterColumnLabel: filter.filterColumnLabel,
						ui: {
							caption: filter.caption,
							label: '',
							cssClass: 'g-category-filter',
							selectedValuesLayout: 'aside'
							// 'labelStacking': 'horizontal'
						}
					}
				});
				google.visualization.events.addListener(this.filter, 'statechange', filterSelected.bind(this.filter));
				console.log(this.filter);
				this.chartControls.push(this.filter);
				this.dashboardControls.push(this.filter);
			});
		}
		return this.chartControls;
	}

	// creazione dei filtri del report, in fase di creazione della preview del report in workspace
	drawSheetControls(ref) {
		this.chartControls = [];
		this.specs.wrapper[this.wrapper].group.key.forEach(filter => {
			// console.log('filters : ', filter);
			// creo qui il div class="filters" che conterrà il filtro
			// In questo modo non è necessario specificare i filtri nel template layout
			// TODO: 12.12.2024 : Creare un template al posto di utilizzare il createElement
			this.filterRef = document.createElement('div');
			this.filterRef.className = 'filters';
			this.filterRef.id = `filter__${filter.id}`;
			ref.appendChild(this.filterRef);
			this.filter = new google.visualization.ControlWrapper({
				'controlType': 'CategoryFilter',
				'containerId': `filter__${filter.id}`,
				'options': {
					// 'filterColumnIndex': filter.filterColumnIndex,
					'filterColumnLabel': filter.label,
					'ui': {
						'caption': filter.label,
						'label': '',
						'cssClass': 'g-category-filter',
						'selectedValuesLayout': 'aside'
						// 'labelStacking': 'horizontal'
					}
				}
			});
			// console.log(this.filter);
			this.chartControls.push(this.filter);
		});

		return this.chartControls;
	}

	drawControls_new(filtersRef) {
		this.controls = [];
		if (this.json.dashboardFilters) {
			for (const [filterId, filter] of Object.entries(this.json.dashboardFilters)) {
				// creo qui il div class="filters" che conterrà il filtro
				// In questo modo non è necessario specificare i filtri nel template layout
				this.filterRef = document.createElement('div');
				this.filterRef.className = 'filters';
				// this.filterRef.id = filterId;
				this.filterRef.id = `fltDashboard-${filterId}`;
				filtersRef.appendChild(this.filterRef);
				this.filter = new google.visualization.ControlWrapper({
					'controlType': 'CategoryFilter',
					'containerId': `fltDashboard-${filterId}`,
					'options': {
						'filterColumnIndex': filter.filterColumnIndex,
						'filterColumnLabel': filter.filterColumnLabel,
						'ui': {
							'caption': filter.caption,
							'label': '',
							'cssClass': 'g-category-filter',
							'selectedValuesLayout': 'aside'
							// 'labelStacking': 'horizontal'
						}
					}
				});
				this.controls.push(this.filter);
			}
		}
		return this.controls;
	}

	set dashboard(value) {
		this.#dashboard.type = 'dashboard';
		this.#dashboard.title = value.title;
		this.#dashboard.token = value.token;
		this.#dashboard.layout = value.layout;
		this.#dashboard.dashboardFilters = Object.fromEntries(this.dashboardFilters);
		this.#dashboard.resources = Object.fromEntries(this.resources);
		console.log(this.#dashboard);
	}

	get dashboard() { return this.#dashboard; }

}

class Resources extends Dashboards {
	#data;
	#resources = new Map();
	#prepareData = { cols: [], rows: [] };
	#specs_columns = {};
	#specs_group = { key: [], columns: [] };
	#specs = {
		token: null,
		name: null,
		data: {
			columns: {},
		},
		filters: [],
		bind: [],
		// il wrapper di default è una Table
		wrapper: {
			Table: {
				group: { key: [], columns: [] },
				chartType: 'Table',
				options: {
					showRowNumber: false,
					allowHTML: true,
					frozenColumns: 0,
					page: 'enable',
					pageSize: 100,
					// scrollLeftStartPosition: 300,
					alternatingRowStyle: true,
					sort: 'event',
					width: '100%',
					height: '100%',
					cssClassNames: {
						headerRow: "g-table-header",
						tableRow: "g-table-row",
						oddTableRow: null,
						// oddTableRow: "g-oddRow",
						// selectedTableRow: "g-selectedRow",
						// hoverTableRow: "g-hoverRow",
						selectedTableRow: null,
						hoverTableRow: null,
						headerCell: "g-header-cell",
						tableCell: "g-table-cell",
						// rowNumberCell: "g-rowNumberCell"
						rowNumberCell: null
					}
				}
			}
		}
	}

	constructor(ref) {
		super();
		this.ref = document.getElementById(ref);
		// chartWrapper default è una Table. indica il wrapper corrente
		this.wrapper = 'Table';
		// utilizzo this.group per ogni wrapper, utilizzato nei Metodi utili alla costruzione del DataGroup e della DataViewGrouped
		this.group = [];
	}

	set data(value) {
		this.#data = value;
	}

	get data() { return this.#data; }

	set resources(object) {
		// object: contiene ref (il riferimento nel DOM), il datamart_id e lo user_id
		this.#resources.set(object.token, object);
		console.log('resources : ', this.#resources);
	}

	get resources() {
		return this.#resources;
	}

	set specs(value) {
		this.#specs = value;
	}

	get specs() { return this.#specs; }

	setSpecifications() {
		this.#specs_columns = {};
		this.#specs_group = { key: [], columns: [] };
		this.specs.name = Sheet.name;
		for (const [token, field] of Sheet.fields) {
			this.#specs_columns[field.name] = {
				id: token,
				label: field.name,
				type: this.getDataType(field.datatype),
				p: { data: 'column' }
			};
			const keyColumn = this.specs.wrapper[this.wrapper].group.key.find(value => value.id === token);
			if (!keyColumn) {
				// colonna non presente in json.data.group.key, la creo
				this.#specs_group.key.push({
					id: token,
					label: field.name,
					type: this.getDataType(field.datatype),
					properties: { grouped: true, visible: true }
				});
			} else {
				// già presente ma potrebbe essere stato modificato la proprietà 'name'
				debugger;
				if (keyColumn.label !== field.name) keyColumn.label = field.name;
				this.#specs_group.key.push(keyColumn);
			}
		}
		console.log(this.#specs_columns);
		console.log(this.#specs_group.key);

		for (const [token, metric] of Sheet.metrics) {
			// debugger;
			this.#specs_columns[metric.alias] = {
				id: token,
				label: metric.alias,
				type: this.getDataType(metric.datatype),
				p: { data: 'measure' }
			};
			// debugger;
			const findMetric = this.specs.wrapper[this.wrapper].group.columns.find(value => value.token === metric.token);
			if (!findMetric) {
				// non presente
				this.#specs_group.columns.push({
					token,
					alias: metric.alias,
					aggregateFn: metric.aggregateFn,
					dependencies: metric.dependencies,
					properties: {
						visible: true,
						formatter: {
							type: 'number', format: 'default', prop: {
								negativeColor: 'red', negativeParens: true, fractionDigits: 0, groupingSymbol: '.'
							}
						}
					},
					label: metric.alias,
					type: metric.type,
					datatype: 'number'
				});
			} else {
				// già presente
				// imposto solo le eproprietà che potrebbero essere state modificate nello Sheet
				findMetric.alias = metric.alias;
				findMetric.aggregateFn = metric.aggregateFn;
				findMetric.dependencies = metric.dependencies;
				findMetric.label = metric.alias;
				this.#specs_group.columns.push(findMetric);
			}
		}
		this.specs.data.columns = this.#specs_columns;
		debugger;
		this.specs.wrapper[this.wrapper].group.key = this.#specs_group.key;
		this.specs.wrapper[this.wrapper].group.columns = this.#specs_group.columns;
		// debugger;
		this.bind();
		const sheet = JSON.parse(window.localStorage.getItem(Sheet.sheet.token));
		sheet.specs = this.specs;
		debugger;
		window.localStorage.setItem(Sheet.sheet.token, JSON.stringify(sheet));
	}

	createWrapperSpecs() {
		this.#specs_group = { key: [], columns: [] };
		for (const field of Sheet.fields.values()) {
			const keyColumn = this.specs.wrapper[this.wrapper].group.key.find(value => value.label === field.name);
			if (!keyColumn) {
				// colonna non presente in json.data.group.key, la creo
				this.#specs_group.key.push({
					id: field.name,
					label: field.name,
					type: this.getDataType(field.datatype),
					properties: { grouped: true, visible: true }
				});
			} else {
				// già presente
				this.#specs_group.key.push(keyColumn);
			}
		}
		for (const [token, metric] of Sheet.metrics) {
			const findMetric = this.specs.wrapper[this.wrapper].group.columns.find(value => value.alias === metric.alias);
			if (!findMetric) {
				// non presente
				this.#specs_group.columns.push({
					token,
					alias: metric.alias,
					aggregateFn: metric.aggregateFn,
					dependencies: metric.dependencies,
					properties: {
						visible: true,
						formatter: {
							type: 'number', format: 'default', prop: {
								negativeColor: 'red', negativeParens: true, fractionDigits: 0, groupingSymbol: '.'
							}
						}
					},
					label: metric.alias,
					type: metric.type,
					datatype: 'number'
				});
			} else {
				// già presente
				// imposto solo le eproprietà che potrebbero essere state modificate nello Sheet
				findMetric.alias = metric.alias;
				findMetric.aggregateFn = metric.aggregateFn;
				findMetric.dependencies = metric.dependencies;
				findMetric.label = metric.alias;
				this.#specs_group.columns.push(findMetric);
			}
		}
		this.specs.wrapper[this.wrapper].group.key = this.#specs_group.key;
		this.specs.wrapper[this.wrapper].group.columns = this.#specs_group.columns;
	}

	bind() {
		let bind = [];
		// se il filtro impostato è uno solo salvo il bind con un solo elemento nell'array
		if (this.specs.filters.length === 1) {
			bind = [0];
		} else {
			const iter = this.specs.filters.entries();
			let result = iter.next();
			while (!result.done) {
				let subBind = [];
				// console.log(result.value[0]); // 1 3 5 7 9
				subBind.push(result.value[0]);
				result = iter.next();
				if (!result.done) {
					subBind.push(result.value[0]);
					bind.push(subBind);
				}
			}
		}
		console.info('bind : ', bind);
		this.specs.bind = bind;
	}

	prepareData() {
		this.#prepareData = { cols: [], rows: [] };
		// aggiungo le colonne
		for (const [index, row] of Object.entries(this.data)) {
			// prima riga, aggiungo anche le intestazioni
			if (+index === 0) {
				Object.keys(row).forEach(key => {
					this.#prepareData.cols.push({
						id: this.specs.data.columns[key].id,
						label: this.specs.data.columns[key].label,
						// label: key,
						type: this.specs.data.columns[key].type,
						p: this.specs.data.columns[key].p
					});
				});
				// debugger;
			}
			let rowValue = [];
			for (const [key, value] of Object.entries(row)) {
				switch (this.specs.data.columns[key].type) {
					case 'date':
						rowValue.push({ v: new Date(value), f: new Date(value), p: { className: 'myClass' } });
						break;
					case 'number':
						// TODO: valutare se formattare qui i valori (come sopra per le date) oppure con le funzioni Formatter (sotto)
						// di GoogleChart
						(isNaN(parseFloat(value))) ? rowValue.push({ v: null }) : rowValue.push({ v: parseFloat(value) });
						// (isNaN(parseFloat(value))) ? v.push({ v: 0 }) : v.push({ v: parseFloat(value) });
						break;
					default:
						// (!this.specs.data.columns[key].p) ? v.push({ v: value }) : v.push({ v: value, p: { className: this.specs.data.columns[key].p } });
						rowValue.push({ v: value });
						break;
				}
			}
			this.#prepareData.rows.push({ c: rowValue });
		}

		// --------------------------------
		/* for (const key of Object.keys(this.data[0])) {
		  // prepareData.cols.push({ id: key, label: key });
		  // console.log('prepareData : ', key);
		  this.#prepareData.cols.push({
			id: key,
			label: key,
			type: this.specs.data.columns[key].type,
			p: this.specs.data.columns[key].p
		  });
		  // debugger;
		}

		aggiungo le righe
		this.data.forEach(row => {
		  let v = [];
		  for (const [key, value] of Object.entries(row)) {
			switch (this.specs.data.columns[key].type) {
			  case 'date':
				if (value.length === 8) {
				  // console.log('Data di 8 cifre (YYYYMMDD)', value);
				  const date = new Date(`${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`);
				  // console.log(new Intl.DateTimeFormat("it-IT", dateOptions).format(date));
				  v.push({ v: date, f: new Intl.DateTimeFormat("it-IT", dateOptions).format(date), p: { className: 'myClass' } });
				} else {
				  v.push({ v: null });
				}
				break;
			  case 'number':
				// TODO: valutare se formattare qui i valori (come sopra per le date) oppure con le funzioni Formatter (sotto)
				// di GoogleChart
				(isNaN(parseFloat(value))) ? v.push({ v: null }) : v.push({ v: parseFloat(value) });
				// (isNaN(parseFloat(value))) ? v.push({ v: 0 }) : v.push({ v: parseFloat(value) });
				break;
			  default:
				// (!this.specs.data.columns[key].p) ? v.push({ v: value }) : v.push({ v: value, p: { className: this.specs.data.columns[key].p } });
				v.push({ v: value });
				break;
			}
			// v.push({ v: value });
		  }
		  this.#prepareData.rows.push({ c: v });
		});
		console.log(this.#prepareData); */
		// --------------------------------
		return this.#prepareData;
	}


	getDataType(datatype) {
		this.datatype;
		switch (datatype) {
			case 'varchar':
			case 'char':
			case 'binary':
			case 'varbinary':
			case 'blob':
			case 'text':
			case 'long varchar':
				this.datatype = 'string';
				break;
			case 'date':
			case 'datetime':
				this.datatype = 'date';
				break;
			case 'time':
			case 'timestamp':
				this.datatype = 'datetime';
				break;
			default:
				this.datatype = 'number';
				break;
		}
		return this.datatype;
	}

	// questo Metodo funziona sia in fase di creazione report che nella dashboard
	// perchè gli viene passata la proprietà 'group' che si trova all'interno della proprietà 'wrapper' o 'wrappers' per le dashboards
	// In alcuni casi, questo raggruppamento, necessità di una DataTAble diversa da quella istanziata negli script (this.dataTable)
	// quindi, se non viene passato il secondo argomento al Metodo, si utilizza this.dataTable, altrimenti la dataTAble passata come argomento
	// Quando viene passata la dataTable istanziata con :
	// - Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
	// non c'è bisogno di passare alcun argomento a questo Metodo perchè non vi si può applicare il Metodo getDataTable()
	// Quando invece deve essere raggruppato, ad esempio, un ChartWRapper, bisogna passare l'argomento a questo Metodo
	// già convertito in DataTable, cioè ChartWrapper.getDataTable()
	createDataTableGrouped(dataTable = this.dataTable) {
		let keys = [], columns = [];
		this.group.key.forEach(key => {
			// if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
			// imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
			// che viene modificata dall'utente a runtime
			if (key.properties.grouped) {
				keys.push({
					id: key.id,
					column: dataTable.getColumnIndex(key.id),
					label: key.label,
					type: key.type
				});
			}
		});
		this.group.columns.forEach(column => {
			// salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
			// quali dovranno essere visibili (quelle con dependencies:false)
			// recupero l'indice della colonna in base al suo nome
			// const index = this.dataTable.getColumnIndex(metric.alias);
			// TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
			let aggregation;
			switch (column.aggregateFn) {
				case 'COUNT':
				case 'MIN':
				case 'MAX':
					aggregation = 'sum';
					break;
				default:
					aggregation = (column.aggregateFn) ? column.aggregateFn.toLowerCase() : 'sum';
					break;
			}
			columns.push({
				id: column.token,
				column: dataTable.getColumnIndex(column.token),
				// column: metric.alias,
				aggregation: google.visualization.data[aggregation],
				type: 'number',
				label: column.label
			});
		});
		return new google.visualization.data.group(
			dataTable, keys, columns
		);
	}

	createDataViewGrouped(dataGroup) {
		this.dataViewGrouped = new google.visualization.DataView(dataGroup);
		let columns = [], metrics = [];
		this.group.key.forEach(column => {
			if (column.properties.visible) {
				// this.viewColumns.push(this.dataGroup.getColumnIndex(column.id));
				// console.log(this.dataGroup.getColumnId(this.dataGroup.getColumnIndex(column.id)));
				columns.push(column.id);
				// imposto la classe per le colonne dimensionali
				dataGroup.setColumnProperty(dataGroup.getColumnIndex(column.id), 'className', 'dimensional-column');
			}
		});
		// dalla dataGroup, recupero gli indici di colonna delle metriche
		this.group.columns.forEach(metric => {
			if (!metric.dependencies && metric.properties.visible) {
				const index = dataGroup.getColumnIndex(metric.token);
				// NOTE: si potrebbe utilizzare un nuovo oggetto new Function in questo
				// modo come alternativa a eval() (non l'ho testato)
				// function evil(fn) {
				//   return new Function('return ' + fn)();
				// }
				// console.log(evil('12/5*9+9.4*2')); // => 40.4     const index = Resource.dataGroup.getColumnIndex(metric.alias);

				// Implementazione della func 'calc' per le metriche composite.
				if (metric.type === 'composite') {
					// è una metrica composta, creo la funzione calc, sostituendo i nomi
					// delle metriche contenute nella formula, con gli indici corrispondenti.
					// Es.: margine = ((ricavo - costo) / ricavo) * 100, recuperare gli indici
					// delle colonne ricavo e costo per creare la metrica margine :
					// recupero la formula della metrica composta
					// const formula = JSON.parse(localStorage.getItem(metric.token)).formula;
					const SQL = JSON.parse(localStorage.getItem(metric.token)).SQL;
					// Creo una Func "dinamica"
					let calcFunction = function(dt, row) {
						const app = {
							number: function(properties) {
								return new google.visualization.NumberFormat(properties);
							}
						}
						let formulaJoined = [];
						// in formulaJoined ciclo tutti gli elementi della Formula, imposto i
						// valori della DataTable, con getValue(), recuperandoli con getColumnIndex(nome_colonna)
						SQL.forEach(formulaEl => {
							if (dt.getColumnIndex(formulaEl) !== -1) {
								formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl)));
							} else {
								// altrimenti aggiungo nella formula le altre componenti, come le parentesi ad esempio e gli operatori per il calcolo
								formulaJoined.push(formulaEl);
							}
						});
						// La funzione eval() è in grado di eseguire operazioni con valori 'string' es. eval('2 + 2') = 4.
						// Quindi inserisco tutto il contenuto della stringa formulaJoined in eval(), inoltre
						// effettuo un controllo sul risultato in caso fosse NaN
						const result = (isNaN(eval(formulaJoined.join(' ')))) ? 0 : eval(formulaJoined.join(' '));
						let total = (result) ? { v: result } : { v: result, f: '-' };
						console.log(result);
						// debugger;
						// const result = (isNaN(eval(formulaJoined.join('')))) ? null : eval(formulaJoined.join(''));
						// formattazione della cella con formatValue()
						const formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
						const resultFormatted = (result) ? formatter.formatValue(result) : '-';
						total = { v: result, f: resultFormatted };
						// resultFormatted = (result) ? result : '-';
						// total = (result) ? { v: result } : { v: result, f: '-' };
						return total;
					}
					metrics.push({ id: metric.token, calc: calcFunction, type: 'number', label: metric.label, properties: { className: 'col-metrics' } });
				} else {
					// this.viewMetrics.push(index);
					metrics.push(metric.token);
				}
				dataGroup.setColumnProperty(index, 'className', 'col-metrics');
				// let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
				// formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
			}
		});
		// concateno i due array che popoleranno la DataView.setColumns()
		this.viewDefined = columns.concat(metrics)
		console.log('DataView defined:', this.viewDefined);
		// debugger;
		// Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
		// console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
		// console.log(Resource.dataGroup.getColumnProperties(0));
		this.dataViewGrouped.setColumns(this.viewDefined);
		console.log('dataViewGrouped : ', this.dataViewGrouped);
	}

}
