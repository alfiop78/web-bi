class Queries {
	#select;
	#obj;
	#table;
	#columnToken;
	#tableAlias;
	#schema;
	#column;
	#firstTable = {}; // la prima tabella della gerarchia, da qui posso ottenere la from e la join
	#joinId;
	#where = {};
	#compositeMetrics = {};
	#compositeBaseMetric;
	#filters = new Map();
	#metrics = new Map();
	#columns = new Map();
	#elementReport = new Map();
	#elementCube = new Map();
	#elementDimension = new Set();
	#elementHierarchies = new Set();
	#elementFilters = new Map();
	#elementMetrics = new Map();
	#reportProcess = {};
	constructor() {
		this.#obj = {}; // object generico
		this._fromSet = new Set();
		this._where = {};
		this._factRelation = {};
		this._filteredMetrics = {};
	}

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
		if ( +this.#firstTable.tableId > +this._tableId) {
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
		console.log('#where : ', this.#where);
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
		this._factRelation[dimension.name] = dimension.cubes;
		// this._fatcRelation viene salvato nel processo in save()
		console.log('_factRelation : ', this._factRelation);
	}

	get factRelation() {this._factRelation;}

	deleteFactRelation(dimName) {
		debugger;
		delete this._factRelation[dimName];
		console.log('_factRelation : ', this._factRelation);
	}

	set filters(value) {
		// this.#obj = {};
		if (this.#filters.has(value.token)) {
			debugger;
			if (value.SQL === this.#filters.get(value.token)) {
				// se anche il contenuto del filtro è uguale a quello già presente allora è stato deselzionato e quindi posso eliminarlo dal Map
				this.#filters.delete(value.token);
			}			
		} else {
			debugger;
			this.#filters.set(value.token, value.SQL);
		}
		console.log('this.#filters : ', this.#filters);
	}

	get filters() {return this.#filters};

	set metrics(value) {
		// value = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
		// this.#metrics[this._metricName] = object;
		if (this.#metrics.has(value.token)) {
			this.#metrics.delete(value.token);
		} else {
			this.#metrics.set(value.token, value);
			/*
			if (this.flagCompositeBase) {
				// metrica composta sul cubo, non includo table e tableAlias
				this.#metrics.set(value.token, value);
			}*/ /*else {
				this.#metrics.set(value.token, {SQLFunction : value.SQLFunction, alias : value.alias, distinct : value.distinct, field : value.field, table : this.table, tableAlias : this.tableAlias});
			}*/
		}
		console.log('metrics : ', this.#metrics);
	}

	get metrics() {return this.#metrics;}

	set filteredMetrics(object) {
		this._filteredMetrics[this._metricName] = object;
		console.log(this._filteredMetrics);
	}

	get filteredMetrics() {return this._filteredMetrics;}

	deleteFilteredMetric() {
		debugger;
		delete this._filteredMetrics[this._metricName];
		console.log('_filteredMetrics : ', this._filteredMetrics);
	}

	set compositeMetrics(object) {
		this.#compositeMetrics[this._metricName] = object;
		console.log('this.#compositeMetrics : ', this.#compositeMetrics);
	}

	get compositeMetrics() {return this.#compositeMetrics;}

	set elementCube(value) {
		// se l'elemento esiste lo elimino altrimenti lo aggiungo al Map
		(this.#elementCube.has(value.token)) ? this.#elementCube.delete(value.token) : this.#elementCube.set(value.token, {tableAlias : value.tableAlias, from : [...value.from]});
		console.log('this.#elementCube : ', this.#elementCube);
	}

	get elementCube() {return this.#elementCube;}

	set elementDimension(value) {
		(this.#elementDimension.has(value.token)) ? this.#elementDimension.delete(value.token) : this.#elementDimension.add(value.token);
		// (this.#elementDimension.has(value.name)) ? this.#elementDimension.delete(value.name) : this.#elementDimension.set(value.name);
		console.log('this.#elementDimension : ', this.#elementDimension);
	}

	get elementDimension() {return this.#elementDimension;}

	set elementHierarchy(value) {
		(this.#elementHierarchies.has(value.name)) ? this.#elementHierarchies.delete(value.name) : this.#elementHierarchies.add(value.name);
		console.log('this.#elementHierarchies : ', this.#elementHierarchies);
	}

	get elementHierarchy() {return this.#elementHierarchies;}

	set elementColumn(value) {

	}

	get elementColumn() {}

	set elementFilter(value) {
		(this.#elementFilters.has(value.token)) ?
			this.#elementFilters.delete(value.token) : this.#elementFilters.set(value.token, {hier : value.hier, tableAlias : value.tableAlias, formula : value.formula, tableId : value.tableId, table : this.table});
		console.log('this.#elementFilters : ', this.#elementFilters);
	}

	get elementFilter() {return this.#elementFilters;}

	get elementReport() {
		this.#elementReport.set('cubes', Object.fromEntries(this.elementCube));
		this.#elementReport.set('dimensions', [...this.#elementDimension]);
		this.#elementReport.set('hierarchies', [...this.#elementHierarchies]);
		this.#elementReport.set('filters', Object.fromEntries(this.elementFilter));
		
		return this.#elementReport;
	}

	save(token, processId, name) {
		// this._reportProcess = {};
		// TODO: chiamare il metodo this.select
		this.#reportProcess['token'] = token;
		this.#reportProcess['select'] = Object.fromEntries(this.select);
		this.#elementReport.set('columns', Object.fromEntries(this.select));
		this.#reportProcess['from'] = Array.from(this._fromSet); // converto il set in un array
		this.#reportProcess['where'] = this.#where;
		this.#reportProcess['factJoin'] = this._factRelation;
		if (this.filters.size > 0) this.#reportProcess['filters'] = Object.fromEntries(this.filters);
		if (this.metrics.size > 0) {
			this.#elementReport.set('metrics', Object.fromEntries(this.metrics));
			this.#reportProcess['metrics'] = Object.fromEntries(this.#metrics);
		}
		if (Object.keys(this._filteredMetrics).length > 0) this.#reportProcess['filteredMetrics'] = this._filteredMetrics;
		if (Object.keys(this.#compositeMetrics).length > 0) this.#reportProcess['compositeMetrics'] = this.#compositeMetrics;
		this.#reportProcess['processId'] = processId; // questo creerà il datamart FX[processId]
		//  al posto del processId voglio utilizzare il nome del report legato alla FX_
		this.#reportProcess['name'] = name;
		this.#reportProcess['type'] = 'PROCESS';
		this.#reportProcess['elements'] = Object.fromEntries(this.elementReport);
		console.info(this.#reportProcess);

		window.localStorage.setItem(token, JSON.stringify(this.#reportProcess));
        console.log(`${name} salvato nello storage con token : ${token}`);
		debugger;
	}

    get reportProcessStringify() {return this.#reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
