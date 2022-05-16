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
	constructor() {
		this.#select = {};
		this.#obj = {}; // object generico
		this._fromSet = new Set();
		this._where = {};
		this._factRelation = {};
		this._filter = {}
		this._metrics = {};
		this._filteredMetrics = {};
		// this.#firstTable = {};
	}

	set table(value) {this.#table = value;}

	get table() {return this.#table;}

	set tableAlias(value) {this.#tableAlias = value;}

	get tableAlias() {return this.#tableAlias;}

	set schema(value) {this.#schema = value;}

	get schema() {return this.#schema;}

	set tableId(value) {this._tableId = value;}

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

	set filterName(value) {this._filterName = value};

	get filterName() {return this._filterName;}

	set columnName(value) {this.#column = value;}

	get columnName() {return this.#column;}

	set select(object) {
		// es.: this.#select[nometabella] = {field: nomecolonna, SQLFormat: (es.: date_format), 'alias': "Cod.Sede"}
		this.#obj = {};
		debugger;
		if (this.#select.hasOwnProperty(this.#columnToken)) {
			// tabella già presente nell'object #select
			if (!this.#select[this.#columnToken].hasOwnProperty(this._field)) {
				// field NON presente in #select[#table], lo aggiungo
				this.#select[this.#columnToken][this._field] = object;
			}
		} else {
			// this.#obj[this._field] = object;
			this.#select[this.#columnToken] = object;
		}
		console.log('select : ', this.#select);
	}

	get select() {return this.#select;}

	deleteSelect() {
		debugger;
		// TODO: da completare dopo la modifica della select
		delete this.#select[this.#columnToken];
		// if (Object.keys(this.#select).length === 0) delete this.#select;
		// if (Object.keys(this.#select).length === 0) unset this.#select;

		console.log('select : ', this.#select);
	}

	getAliasColumn() {
		return this.#select[this.#table][this._field]['alias'];
	}

	set joinId(value) {this.#joinId = value;}

	get joinId() {return this.#joinId;}

	set where(join) {
		console.log('join : ', join);
		// debugger;
		if (Object.keys(join).length > 1) {
			for (const [key, value] of Object.entries(join)) {
				this.#where[key] = value;	
			}
		} else {
			console.log('key : ', Object.keys(join));
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
		this._factRelation[dimension.name] = dimension.cubes;
		console.log('_factRelation : ', this._factRelation);
	}

	get factRelation() {this._factRelation;}

	deleteFactRelation(dimName) {
		debugger;
		delete this._factRelation[dimName];
		console.log('_factRelation : ', this._factRelation);
	}

	set filters(object) {
		this.#obj = {};
		if (this._filter.hasOwnProperty(this.#table)) {
			// tabella già presente nell'object #select
			if (!this._filter[this.#table].hasOwnProperty(this._filterName)) {
				this._filter[this.#table][this._filterName] = object;
			}
		} else {
			this.#obj[this._filterName] = object;
			this._filter[this.#table] = this.#obj;
		}
		// *********************
		// this._filter[this._filterName] = {table : object.table, formula : object.formula};
		console.log('filter : ', this._filter);
	}

	get filters() {return this._filter};

	deleteFilter() {
		delete this._filter[this.#table][this.filterName];
		// se, per questa tabella non ci sono altri filtri, elimino anche la property this.#table
		if (Object.keys(this._filter[this.#table]).length === 0) delete this._filter[this.#table];
		console.log('filter : ', this._filter);
	}

	set metricName(value) {this._metricName = value;}

	get metricName() {return this._metricName;}

	set metrics(object) {
		// object = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
		this._metrics[this._metricName] = object;
		console.log('metrics : ', this._metrics);
	}

	get metrics() {return this._metrics;}

	deleteMetric() {
		debugger;
		delete this._metrics[this._metricName];
		console.log('_metrics : ', this._metrics);
	}

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

	save(processId, name) {
		this._reportProcess = {};
		this._reportProcess['select'] = this.#select;
		this._reportProcess['from'] = Array.from(this._fromSet); // converto il set in un array
		this._reportProcess['where'] = this.#where;
		this._reportProcess['factJoin'] = this._factRelation;
		this._reportProcess['filters'] = this._filter;
		if (Object.keys(this._metrics).length > 0) this._reportProcess['metrics'] = this._metrics;
		if (Object.keys(this._filteredMetrics).length > 0) this._reportProcess['filteredMetrics'] = this._filteredMetrics;
		if (Object.keys(this.#compositeMetrics).length > 0) this._reportProcess['compositeMetrics'] = this.#compositeMetrics;
		// this._reportProcess['filteredMetrics'] = this._filteredMetrics;
		// this._reportProcess['compositeMetrics'] = this.#compositeMetrics;
		this._reportProcess['processId'] = processId; // questo creerà il datamart FX[processId]
		//  al posto del processId voglio utilizzare il nome del report legato alla FX_
		this._reportProcess['name'] = name;
		this._reportProcess['type'] = 'PROCESS';
		console.info(this._reportProcess);
		debugger;

		window.localStorage.setItem(name, JSON.stringify(this._reportProcess));
        console.log(name+' salvato nello storage');

	}

    get reportProcessStringify() {return this._reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
