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
	#WHERE = new Set();
	#compositeMetrics = new Map();
	#compositeBaseMetric;
	#filters = new Map();
	#metrics = new Map();
	#filteredMetrics = new Map();
	#columns = new Map();
	#elementReport = new Map();
	#elementCubes = new Map();
	#elementDimensions = new Map();
	#elementHierarchies = new Map();
	#elementFilters = new Map();
	#elementMetrics = new Map();
	#reportProcess = {};
	#objects = new Map();
	#cubes = new Set();
	#dimensions = new Set();
	// #dims = new Map();
	#factJoin = {};
	#processId = 0;
	#token = 0;
	#FROM = new Map();
	#hier = new Map();
	#hierarchiesTableId = new Map();
	constructor() {
		this._fromSet = new Set();
		this._where = {};
	}

	set objects(object) {
		// debugger;
		( !this.#objects.has(object.token) ) ? this.#objects.set(object.token, object) : this.#objects.delete(object.token);
		console.log('#objects : ', this.#objects);
		/*this.mapHier = new Map();
		if (this.#objects.has(object.token)) {
			if (!this.#hier.has(this.#objects.get(object.token).hierToken)) {
				// gerarchia non ancora esistente
				// let t = new Map([
				// 	[object.token, this.#objects.get(object.token).tableId]
				// 	]);
				this.mapHier.set(object.token, {tableId : this.#objects.get(object.token).tableId, hier : this.#objects.get(object.token).hier});
				this.#hier.set(this.#objects.get(object.token).hierToken, this.mapHier);
			} else {
				// gerarchia esistente
				this.#hier.get(this.#objects.get(object.token).hierToken).set(object.token, {tableId : this.#objects.get(object.token).tableId, hier : this.#objects.get(object.token).hier});
			}
		} else {
			// l'elemento è stato deselezionato e non è più presente in #objects
			this.#hier.get(object.hierToken).delete(object.token);
			// se non ci sono più elementi, di questa gerarchia, selezionati, elimino anche la prop object.hiertoken di questa gerarchia
			if ( this.#hier.get(object.hierToken).size === 0 ) this.#hier.delete(object.hierToken);
		}
		console.log('#hier : ', this.#hier);*/
		// TODO: evidenzio, nella struttura gerarchia sulla sinistra, le tabelle che verranno incluse nella from/where
		document.querySelectorAll("#ul-hierarchies .selectable small").forEach( table => delete table.dataset.includeQuery);
		for ( const [key, value] of this.#objects ) {
			const hier = document.querySelector("#ul-hierarchies .selectable[data-hier-token='"+value.hierToken+"']");
			// console.log(Array.from(hier.querySelectorAll("small")));
			// debugger;
			let el = Array.from(hier.querySelectorAll("small")).filter( (small, index) => index >= value.tableId );
			console.log('el : ', el);
			el.forEach(small => small.dataset.includeQuery = true);
			// hier.querySelectorAll("small[data-table-id='"+value.tableId+"']").forEach( table => {
			// 	table.dataset.includeQuery = true;
			// });
		}
		// memorizzo il valore minimo tra i tableId selezionati di questa gerarchia
		debugger;
		// console.log(Math.min(...this.#hier.get(object.hierToken).values()));
		// let minTableId = Math.min(...this.#hier.get(object.hierToken).values());
		
		// this.#hierarchiesTableId.set(object.hierToken, Math.min(...this.#hier.get(object.hierToken).values()));
		// this.defineFrom();
		// console.log(Math.min(...this.#hier.get(object.hierToken).values()));

		// this.setFrom();
		/*if (!this.#FROM.has(object.hierToken)) {
			// questa gerarchia non è ancora inclusa
			// verifico il tableId selezionato. Se è < di quello già presente lo aggiungo altrimenti no
			this.#FROM.set(object.hierToken, { tableId : object.tableId, token : object.token, join : object.hier.from.filter( (from, index) => index >= object.tableId) });
		} else {
			debugger;
			if ( object.tableId <= this.#FROM.get(object.hierToken).tableId ) {
				if (object.token === this.#FROM.get(object.hierToken).token) {
					delete this.#FROM.get(object.hierToken).tableId;
					delete this.#FROM.get(object.hierToken).token;
					delete this.#FROM.get(object.hierToken).join;					
				} else {
					this.#FROM.set(object.hierToken, { tableId : object.tableId, token : object.token, join : object.hier.from.filter( (from, index) => index >= object.tableId) });
				}
			}
		}
		console.log('#FROM : ', this.#FROM);*/
		// this.setFrom();
	}

	defineFrom() {
		for (const [key, tableId] of this.#hierarchiesTableId) {
			// ...per ogni gerarchia (key : token della gerarchia)
			console.log(`${key} - ${tableId}`);
			debugger;
			console.log('this.#objects : ', this.#objects.get(key));

		}
	}

	/*setFrom() {
		for ( const [key, value] of this.#objects) {
			// console.log('key : ', key);
			console.log('value : ', value);
			console.log('value.hierToken : ', value.hierToken);
			console.log(this.#FROM.has(value.hierToken));
			debugger;
			// let tableId = value.tableId;
			// debugger;
			// this.#FROM.set(value.hierToken, value.hier.from.filter( (from, index) => index >= value.tableId));
			if (!this.#FROM.has(value.hierToken)) {
				// questa gerarchia non è ancora inclusa
				// verifico il tableId selezionato. Se è < di quello già presente lo aggiungo altrimenti no
				this.#FROM.set(value.hierToken, { tableId : value.tableId, join : value.hier.from.filter( (from, index) => index >= value.tableId) });
			} else {
				if (value.tableId < this.#FROM.get(value.hierToken).tableId) {
					this.#FROM.set(value.hierToken, { tableId : value.tableId, join : value.hier.from.filter( (from, index) => index >= value.tableId) });
				}
			}
			*/

			/*value.hier.from.forEach( (from, index) => {
				if (index >= value.tableId) {
					// console.log('add FROM : ', from);
					this.#FROM.add(from);
					if (value.hier.joins[value.table]) this.#WHERE.add(value.hier.joins[value.table]);
				}
			});*/
		/*}
		console.log('#FROM : ', this.#FROM);
		// console.log('#WHERE : ', this.#WHERE);
	}*/

	get objects() {return this.#objects;}
	
	set cubes(token) {
		( !this.#cubes.has(token) ) ? this.#cubes.add(token) : this.#cubes.delete(token);		
		console.log('#cubes : ', this.#cubes);
		// this.temp();
	}

	get cubes() {return this.#cubes;}

	set dimensions(token) {
		( !this.#dimensions.has(token) ) ? this.#dimensions.add(token) : this.#dimensions.delete(token);		
		console.log('#dimensions : ', this.#dimensions);
		// this.temp();
	}

	get dimensions() {return this.#dimensions;}

	/*temp() {
		this.#objects.set('cubes', [...this.cubes]);
		this.#objects.set('dimensions', [...this.dimensions]);
		console.log('this.#objects : ', this.#objects);
		const rand = () => Math.random(0).toString(36).substr(2);
		this.#token = rand().substr(0, 21);
		window.localStorage.setItem(`_temp_${this.#token}`, JSON.stringify(Object.fromEntries(this.#objects)));
	}*/

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

	set factJoin(dimension) {
		// console.log('dimName : ', dimension.name);
		// TODO: utilizzare oggetto Map()
		this.#factJoin[dimension.token] = dimension.cubes;
		// this._fatcRelation viene salvato nel processo in save()
		console.log('fact join : ', this.#factJoin);
	}

	get factJoin() {this.#factJoin;}

	deleteFactRelation(token) {
		// debugger;
		delete this.#factJoin[token];
		console.log('_factRelation : ', this.#factJoin);
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
		console.log('this.#filteredMetrics : ', this.#filteredMetrics);
	}

	get filteredMetrics() {return this.#filteredMetrics;}

	set removeFilteredMetric(token) {
		if (this.#filteredMetrics.has(token)) this.#filteredMetrics.delete(token);
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
		(this.#elementCubes.has(value.token)) ? this.#elementCubes.delete(value.token) : this.#elementCubes.set(value.token, value);
		console.log('this.#elementCube : ', this.#elementCubes);
	}

	get elementCube() {return this.#elementCubes;}

	set elementDimension(value) {
		// se l'elemento esiste lo elimino altrimenti lo aggiungo al Map
		(this.#elementDimensions.has(value.token)) ? this.#elementDimensions.delete(value.token) : this.#elementDimensions.set(value.token, value);
		console.log('this.#elementDimension : ', this.#elementDimensions);
	}

	get elementDimension() {return this.#elementDimensions;}

	set elementHierarchy(value) {
		(this.#elementHierarchies.has(value.token)) ? this.#elementHierarchies.delete(value.token) : this.#elementHierarchies.set(value.token, value);
		// this.#elementDimension.set(value.token, [...this.#elementHierarchies]);
		// (this.#elementHierarchies.has(value.name)) ? this.#elementHierarchies.delete(value.name) : this.#elementHierarchies.add(value.name);
		console.log('this.#elementDimension : ', this.#elementHierarchies);
		// console.log('this.#elementHierarchies : ', this.#elementHierarchies);
	}

	get elementHierarchy() {return this.#elementHierarchies;}

	set elementColumn(value) {

	}

	get elementColumn() {}

	set elementFilter(value) {
		(this.#elementFilters.has(value.token)) ?
			this.#elementFilters.delete(value.token) : this.#elementFilters.set(value.token, value);
		console.log('this.#elementFilters : ', this.#elementFilters);
	}

	get elementFilter() {return this.#elementFilters;}

	get elementReport() {
		this.#elementReport.set('cubes', Object.fromEntries(this.elementCube));
		this.#elementReport.set('dimensions', Object.fromEntries(this.elementDimension));
		this.#elementReport.set('hierarchies', Object.fromEntries(this.elementHierarchy));
		this.#elementReport.set('filters', Object.fromEntries(this.elementFilter));
		console.log('this.#elementReport : ', this.#elementReport);
		return this.#elementReport;
	}

	checkColumnAlias(alias) {
		for ( const values of this.select.values() ) {
			return (values.alias.toLowerCase() === alias.toLowerCase()) ? true : false;
		}
	}

	checkMetricAlias(alias) {
		for ( const values of this.metrics.values() ) {
			debugger;
			return (values.alias.toLowerCase() === alias.toLowerCase()) ? true : false;
		}
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
		this.#reportProcess.type = 'PROCESS';
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
		this.reportElements.factJoin = this.factJoin;
		if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
		if (this.metrics.size > 0) {
			this.#elementReport.set('metrics', Object.fromEntries(this.metrics));
			this.reportElements.metrics = Object.fromEntries(this.#metrics);
		}
		if (this.compositeMetrics.size > 0) {
			this.#elementReport.set('compositeMetrics', Object.fromEntries(this.compositeMetrics));
			this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
		}
		if (this.filteredMetrics.size > 0) {
			this.#elementReport.set('filteredMetrics', Object.fromEntries(this.filteredMetrics));
			this.reportElements.filteredMetrics = Object.fromEntries(this.filteredMetrics);
		}
		
		this.editElements = Object.fromEntries(this.elementReport);
		this.#reportProcess.report = this.reportElements;
		this.#reportProcess.edit = this.editElements;
		console.info(this.#reportProcess);
		window.localStorage.setItem(this.#token, JSON.stringify(this.#reportProcess));
        console.info(`${name} salvato nello storage con token : ${this.token}`);
	}

	get process() {return this.#reportProcess;}

    get reportProcessStringify() {return this.#reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
