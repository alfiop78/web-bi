class Queries {
	#select;
	#table;
	#columnToken;
	#tableAlias;
	#schema;
	#column;
	#firstTable = {}; // la prima tabella della gerarchia, da qui posso ottenere la from e la join
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
    #SQLProcess = {};
	#objects = new Map();
	#cubes = new Set();
	#dimensions = new Set();
	// #dims = new Map();
	#processId = 0;
	#token = 0;
	#FROM = new Map();
	#WHERE = new Map();
    #editObjects = {};
	constructor() {
        const rand = () => Math.random(0).toString(36).substr(2);
        this.token = rand().substr(0, 21);
	}

	set objects(object) {
		// debugger;
		( !this.#objects.has(object.token) ) ? this.#objects.set(object.token, object) : this.#objects.delete(object.token);
		console.log('#objects : ', this.#objects);

		document.querySelectorAll("*[data-include-query]").forEach( tableRef => delete tableRef.dataset.includeQuery);
		for ( const [key, value] of Query.objects ) {
			if (value.hasOwnProperty('hierToken')) {
				document.querySelector("#ul-dimensions .selectable[data-dimension-token='"+value.dimension+"']").dataset.includeQuery = 'true';
				const hier = document.querySelector("#ul-hierarchies .selectable[data-hier-token='"+value.hierToken+"']");
				// converto il nodeList in un array e, con filter(), recupero le tabelle con un id superiore a quello in ciclo
				[...hier.querySelectorAll("small")].filter( (table, index) => index >= value.tableId).forEach( tableRef => {
					tableRef.dataset.includeQuery = 'true';
				});
			} else {
				// elementi del cubo
				document.querySelectorAll("#ul-cubes .selectable[data-cube-token='"+value.cubeToken+"']").forEach( tableRef => tableRef.dataset.includeQuery = true);
			}
		}
	}

	get objects() {return this.#objects;}

    save_temp() {
        this.#editObjects.cubes = [...this.cubes];
        this.#editObjects.dimensions = [...this.dimensions];
        this.#editObjects.columns = Object.fromEntries(this.select);
        this.#editObjects.filters = Object.fromEntries(this.filters);
        this.#editObjects.token = this.token;
        this.#editObjects.type = '_temp_';
        console.log(this.#editObjects);
        window.localStorage.setItem(`_temp_${this.token}`, JSON.stringify(this.#editObjects));
    }

	set FROM(object) {
		this.#FROM.set(object.tableAlias, object.SQL);
		console.log('#FROM : ', this.#FROM);
	}

	get FROM() {return Object.fromEntries(this.#FROM);}

	set WHERE(object) {
		this.#WHERE.set(object.token, object.join);
		console.log('#WHERE : ', this.#WHERE);
	}

	get WHERE() {return Object.fromEntries(this.#WHERE);}
	
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

	set processId(value) {
		this.#processId = value;
	}

	get processId() {return this.#processId;}

	set token(value) {
		this.#token = value;
        console.log(this.#token);
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

	get tables() {return this.#firstTable;}

	set select(value) {
		(this.#columns.has(value.token)) ? this.#columns.delete(value.token) : this.#columns.set(value.token, value);
        this.save_temp();
		console.log('select : ', this.#columns);
	}

	get select() {return this.#columns;}

	set filters(value) {
        (!this.#filters.has(value.token)) ? this.#filters.set(value.token, {SQL : `${value.tableAlias}.${value.formula}`}) : this.#filters.delete(value.token);
        this.save_temp();
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

    SQLProcess(name) {
        this.reportElements = {};
		const rand = () => Math.random(0).toString(36).substr(2);
		// se il token non è definito sto salvando un nuovo report e quindi lo definisco qui, altrimenti sto editando un report che ha già un proprio token e processId
		if (this.#token === 0) {
			this.#token = rand().substr(0, 21);
			this.#processId = Date.now();
		}
		this.#SQLProcess.type = 'PROCESS';
		this.#SQLProcess.token = this.#token;
		this.reportElements.processId = this.#processId; // questo creerà il datamart FX[processId]
		this.#SQLProcess.name = name;
        this.reportElements.select = Object.fromEntries(this.select);
		this.#elementReport.set('columns', Object.fromEntries(this.select));
		this.reportElements.from = this.FROM;
		this.reportElements.where = this.WHERE;

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

		// this.editElements = Object.fromEntries(this.elementReport);
		this.#SQLProcess.report = this.reportElements;
		// this.#reportProcess.edit = this.editElements;
		console.info(this.#SQLProcess);
    }

    getSQLProcess() {return this.#SQLProcess;}

	save(name) {
		this.reportElements = {};
		this.editElements = {};
		// const rand = () => Math.random(0).toString(36).substr(2);
		// se il token non è definito sto salvando un nuovo report e quindi lo definisco qui, altrimenti sto editando un report che ha già un proprio token e processId
		/*if (this.#token === 0) {
			this.#token = rand().substr(0, 21);
			this.#processId = Date.now();
		}*/
		this.#reportProcess.type = 'PROCESS';
		this.#reportProcess.token = this.token;
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
		this.reportElements.from = this.FROM;
		this.reportElements.where = this.WHERE;

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
		
		// this.editElements = Object.fromEntries(this.elementReport);
		this.#reportProcess.report = this.reportElements;
		// this.#reportProcess.edit = this.editElements;
		console.info(this.#reportProcess);
		debugger;
		window.localStorage.setItem(this.#token, JSON.stringify(this.#reportProcess));
        console.info(`${name} salvato nello storage con token : ${this.#token}`);
	}

	get process() {return this.#reportProcess;}

    get reportProcessStringify() {return this.#reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
