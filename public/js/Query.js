class Queries {
	#select;
	#table;
	#columnToken;
	#tableAlias;
	#schema;
	#column;
	#firstTable = {}; // la prima tabella della gerarchia, da qui posso ottenere la from e la join
	#joinId;
	#where = {};
	#compositeMetrics = new Map();
	#compositeBaseMetric;
	#filters = new Map();
	#metrics = new Map();
	#filteredMetrics = new Map();
	#columns = new Map();
	#elementReport = new Map();
	#elementCube = new Map();
	#elementDimension = new Map();
	#elementHierarchies = new Set();
	#elementFilters = new Map();
	#elementMetrics = new Map();
	#reportProcess = {};
	#processId = 0;
	#token = 0;
	constructor() {
		this._fromSet = new Set();
		this._where = {};
		this._factRelation = {};
	}

	set processId(value) {
		this.#processId = value;
	}

	get processId() {return this.#processId;}

	set token(value) {
		this.#token = value;
	}

	get token() {return this.#token;}

	set table(value) {this.#table = value;}

	get table() {return this.#table;}

	set tableAlias(value) {this.#tableAlias = value;}

	get tableAlias() {return this.#tableAlias;}

	set schema(value) {this.#schema = value;}

	get schema() {return this.#schema;}

	set tableId(value) {this._tableId = +value;}

	get tableId() {return this._tableId;}

	set field(value) {this._field = value;}

	get field() {return this._field;}

	set columnToken(value) {this.#columnToken = value;}

	get columnToken() {return this.#columnToken;}

	set fieldType(value) {this._fieldType = value;}

	get fieldType() {return this._fieldType;}

	set from(value) {
		// this._fromArray.push(value); // TODO: probabilmente questo non viene mai utilizzato (da verificare)
		this._fromSet.add(value);
		console.log('from : ', this._fromSet);
	}

	get from() {return this._fromSet;}

	addTables(hier) {
		// è necessario creare la proprietà firstTable per poterla utilizzare in checkRelations e stabilire quali tabelle e join devono essere considerate nella query finale
		/*
			Se firstTable non esiste la devo creare, in base, alla selezione della colonna che si sta aggiungendo.
			Oppure, se la colonna che si sta aggiungendo è relativa ad un'altra gerarchia, reimposto firstTable per poter 'lavorare' su quella gerarchia
			Se si ha una colonna con azienda-sede-intestazione e viene selezionata una colonna della tabella sede, la firstTable sarà id: 0, name : sede.
			A questo punto la tabella Azienda è inutile metterla in Query perchè non c'è nessun campo (oppure filtro) che la utilizza
		*/
		if ( !this.#firstTable.hasOwnProperty('tableId') || this.#firstTable.hier !== hier) {
			// non è presente nessuna firstTable per questa gerarchia, la creo
			this.#firstTable = {tableId : this._tableId, table : this.table, hier};
		}
		// se la tabella presente attualmente in firstTable ha un id > di quella selezionata dovrò riscrivere il firstTable per includere anche la nuova tabella.
		/*es.:
			La prima colonna aggiunta a Query è sede.codice, la tabella sede ha un id:1, successivamente viene aggiunta una colonna appartenente alla tabella Azienda (id: 0).
			A questo punto il valore di firstTable deve cambiare da sede a azienda, includendo, nella query finale, anche la tabella azienda e le sue relative join
		*/
		if ( this.#firstTable.tableId > this._tableId) {
			this.#firstTable = {tableId : this._tableId, table : this.table, hier};
		}
		console.log('#firstTable : ', this.#firstTable);
	}

	get tables() {return this.#firstTable;}

	deleteFrom(tableName) {
		this._fromSet.delete(tableName);
		console.log('_from : ', this._fromSet);
	}

	set columnName(value) {this.#column = value;}

	get columnName() {return this.#column;}

	set select(value) {
		if (this.#columns.has(value.token)) {
			this.#columns.delete(value.token);
		} else {
			this.#columns.set(value.token, value);
		}
		console.log('select : ', this.#columns);
	}

	get select() {return this.#columns;}

	getAliasColumn() {
		return this.#select[this.#table][this._field]['alias'];
	}

	set joinId(value) {this.#joinId = value;}

	get joinId() {return this.#joinId;}

	set where(join) {
		// console.log('join : ', join);
		// debugger;
		if (Object.keys(join).length > 1) {
			for (const [key, value] of Object.entries(join)) {
				this.#where[key] = value;	
			}
		} else {
			// console.log('key : ', Object.keys(join));
			// let test = Object.keys(this._where).length;
			// this._where[test] = join;
			this.#where[Object.keys(join)] = join[Object.keys(join)];
			// this.#where.set(Object.keys(join), join);
			// this.#whereSet.add(join);
			// this._where[this.#joinId] = join;
			// console.log('where : ', this._where);
		}
		// console.log('#where : ', this.#where);
	}

	deleteWhere() {
		debugger;
		delete this._where[this.#joinId];
		console.log('where : ', this._where);	
	}

	get where() {return this.#where;}

	set factRelation(dimension) {
		// console.log('dimName : ', dimension.name);
		// TODO: utilizzare oggetto Map()
		this._factRelation[dimension.token] = dimension.cubes;
		// this._fatcRelation viene salvato nel processo in save()
		// console.log('_factRelation : ', this._factRelation);
	}

	get factRelation() {this._factRelation;}

	deleteFactRelation(dimName) {
		debugger;
		delete this._factRelation[dimName];
		console.log('_factRelation : ', this._factRelation);
	}

	set filters(value) {
		if (this.#filters.has(value.token)) {
			// debugger;
			if (value.SQL === this.#filters.get(value.token)) {
				// se anche il contenuto del filtro è uguale a quello già presente allora è stato deselzionato e quindi posso eliminarlo dal Map
				this.#filters.delete(value.token);
			}			
		} else {
			// debugger;
			this.#filters.set(value.token, value.SQL);
		}
		console.log('this.#filters : ', this.#filters);
	}

	get filters() {return this.#filters};

	set addMetric(value) {
		// value = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
		if (!this.#metrics.has(value.token)) this.#metrics.set(value.token, value);
		console.log('metrics : ', this.#metrics);
	}

	get metrics() {return this.#metrics;}

	set removeMetric(token) {
		if (this.#metrics.has(token)) this.#metrics.delete(token);
		console.log('metrics : ', this.#metrics);
	}

	set addFilteredMetric(value) {
		if (!this.#filteredMetrics.has(value.token)) this.#filteredMetrics.set(value.token, value);
		console.log(this.#filteredMetrics);
	}

	get filteredMetrics() {return this.#filteredMetrics;}

	set removeFilteredMetric(token) {
		if (this.#filteredMetrics.has(token)) this.#filteredMetrics.delete(token);
	}

	deleteFilteredMetric() {
		debugger;
		delete this._filteredMetrics[this._metricName];
		console.log('_filteredMetrics : ', this._filteredMetrics);
	}

	set addCompositeMetric(value) {
		if (!this.#compositeMetrics.has(value.token)) this.#compositeMetrics.set(value.token, value);
		console.log('this.#compositeMetrics : ', this.#compositeMetrics);
	}

	set removeCompositeMetric(token) {
		if (this.#compositeMetrics.has(token)) this.#compositeMetrics.delete(token);
		console.log('this.#compositeMetrics : ', this.#compositeMetrics);
	}

	get compositeMetrics() {return this.#compositeMetrics;}

	set elementCube(value) {
		// se l'elemento esiste lo elimino altrimenti lo aggiungo al Map
		(this.#elementCube.has(value.token)) ? this.#elementCube.delete(value.token) : this.#elementCube.set(value.token, {tableAlias : value.tableAlias, from : [...value.from]});
		// console.log('this.#elementCube : ', this.#elementCube);
	}

	get elementCube() {return this.#elementCube;}

	set elementHierarchy(value) {
		(this.#elementHierarchies.has(value.hier)) ? this.#elementHierarchies.delete(value.hier) : this.#elementHierarchies.add(value.hier);
		this.#elementDimension.set(value.token, [...this.#elementHierarchies]);
		// (this.#elementHierarchies.has(value.name)) ? this.#elementHierarchies.delete(value.name) : this.#elementHierarchies.add(value.name);
		// console.log('this.#elementDimension : ', this.#elementDimension);
		// console.log('this.#elementHierarchies : ', this.#elementHierarchies);
	}

	get elementHierarchy() {return this.#elementDimension;}

	set elementColumn(value) {

	}

	get elementColumn() {}

	set elementFilter(value) {
		(this.#elementFilters.has(value.token)) ?
			this.#elementFilters.delete(value.token) : this.#elementFilters.set(value.token, value);
		// console.log('this.#elementFilters : ', this.#elementFilters);
	}

	get elementFilter() {return this.#elementFilters;}

	get elementReport() {
		this.#elementReport.set('cubes', Object.fromEntries(this.elementCube));
		this.#elementReport.set('dimensions', Object.fromEntries(this.elementHierarchy));
		this.#elementReport.set('filters', Object.fromEntries(this.elementFilter));
		console.log('this.#elementReport : ', this.#elementReport);
		return this.#elementReport;
	}

	save(name) {
		this.reportElements = {};
		this.editElements = {};
		const rand = () => Math.random(0).toString(36).substr(2);
		// se il token non è definito sto salvando un nuovo report e quindi lo definisco qui, altrimenti sto editando un report che ha già un proprio token e processId
		if (this.#token === 0) {
			this.#token = rand().substr(0, 21);
			this.#processId = Date.now();
		}
		this.#reportProcess.token = this.#token;
		this.reportElements.processId = this.#processId; // questo creerà il datamart FX[processId]
		this.#reportProcess.name = name;
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		// TODO: l'update del report non deve aggiornare updated_at
		this.#reportProcess.created_at = date.toLocaleDateString('it-IT', options);
		this.#reportProcess.updated_at = date.toLocaleDateString('it-IT', options);

		this.reportElements.select = Object.fromEntries(this.select);
		this.#elementReport.set('columns', Object.fromEntries(this.select));
		this.reportElements.from = Array.from(this._fromSet); // converto il set in un array
		this.reportElements.where = this.#where;
		this.reportElements.factJoin = this._factRelation;
		if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
		if (this.metrics.size > 0) {
			this.#elementReport.set('metrics', Object.fromEntries(this.metrics));
			this.reportElements.metrics = Object.fromEntries(this.#metrics);
		}
		if (this.compositeMetrics.size > 0) {
			this.#elementReport.set('compositeMetrics', Object.fromEntries(this.compositeMetrics));
			this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
		}
		// if (Object.keys(this._filteredMetrics).length > 0) this.reportElements.filteredMetrics = this._filteredMetrics;
		// if (Object.keys(this.#compositeMetrics).length > 0) this.reportElements.compositeMetrics = this.#compositeMetrics;
		
		// this.#reportProcess['name'] = name;
		this.#reportProcess.type = 'PROCESS';
		this.editElements = Object.fromEntries(this.elementReport);
		this.#reportProcess.report = this.reportElements;
		this.#reportProcess.edit = this.editElements;
		console.info(this.#reportProcess);
		debugger;
		window.localStorage.setItem(this.#token, JSON.stringify(this.#reportProcess));
        console.info(`${name} salvato nello storage con token : ${this.token}`);
	}

    get reportProcessStringify() {return this.#reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
