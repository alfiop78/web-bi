class Queries {
	#columnToken;
	#compositeMetrics = new Map();
	#filters = new Map();
	#metrics = new Map();
	#filteredMetrics = new Map();
	#columns = new Map();
	#reportProcess = {};
    #SQLProcess = {};
	#objects = new Map();
	#cubes = new Set();
	#dimensions = new Set();
	#FROM = new Map();
	#WHERE = new Map();
	constructor() {}

    set objects(object) {
        ( !this.#objects.has(object.token) ) ? this.#objects.set(object.token, object) : this.#objects.delete(object.token);
        console.log('#objects : ', this.#objects);

        document.querySelectorAll("*[data-include-query]").forEach( tableRef => delete tableRef.dataset.includeQuery);
        for ( const [key, value] of Query.objects ) {
            if (!value.cubeToken) {
                // ha la prop hierarchies : {hierToken: tableId}
                // per ogni dimensione presente nell'oggetto (es.: filtri multipli)
                value.dimensions.forEach( token => {
                    document.querySelector("#ul-dimensions .selectable[data-dimension-token='"+token+"']").dataset.includeQuery = 'true';
                });
                for (const [token, tableId] of Object.entries(value.hierarchies)) {
                    // debugger;
                    const hier = document.querySelector("#ul-hierarchies .selectable[data-hier-token='"+token+"']");
                    // converto il nodeList in un array e, con filter(), recupero le tabelle con un id superiore a quello in ciclo
                    [...hier.querySelectorAll("small")].filter( (table, index) => index >= tableId).forEach( tableRef => {
                        tableRef.dataset.includeQuery = 'true';
                    });
                }
            } else {
                // elementi del cubo
                document.querySelectorAll("#ul-cubes .selectable[data-cube-token='"+value.cubeToken+"']").forEach( tableRef => tableRef.dataset.includeQuery = true);
            }
        }
    }

	get objects() {return this.#objects;}

    editObjects() {
        this.object = {};
        this.object.cubes = [...this.cubes];
        this.object.dimensions = [...this.dimensions];
        this.object.columns = Object.fromEntries(this.select);
        this.object.filters = [...this.filters.keys()];
        this.object.metrics = [...this.metrics.keys()].concat([...this.filteredMetrics.keys()]);
        this.object.compositeMetrics = [...this.compositeMetrics.keys()];
        debugger;
        return this.object;
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
	}

	get cubes() {return this.#cubes;}

	set dimensions(token) {
		( !this.#dimensions.has(token) ) ? this.#dimensions.add(token) : this.#dimensions.delete(token);		
		console.log('#dimensions : ', this.#dimensions);
	}

	get dimensions() {return this.#dimensions;}

	set columnToken(value) {this.#columnToken = value;}

	get columnToken() {return this.#columnToken;}

	// set fieldType(value) {this._fieldType = value;}

	// get fieldType() {return this._fieldType;}

	set select(value) {
		(this.#columns.has(value.token)) ? this.#columns.delete(value.token) : this.#columns.set(value.token, value);
		console.log('select : ', this.#columns);
	}

	get select() {return this.#columns;}

	set filters(value) {
        (!this.#filters.has(value.token)) ? this.#filters.set(value.token, {SQL : value.formula}) : this.#filters.delete(value.token);
		console.log('this.#filters : ', this.#filters);
	}

	get filters() {return this.#filters};

	set metrics(value) {
		// value = {sqlFunction: "SUM", field: "NettoRiga", metricName: "netto riga", distinct: false, alias: "Venduto"}
        (!this.#metrics.has(value.token)) ? this.#metrics.set(value.token, value) : this.#metrics.delete(value.token);
		console.log('metrics : ', this.#metrics);
	}

	get metrics() {return this.#metrics;}

	set filteredMetrics(value) {
		(!this.#filteredMetrics.has(value.token)) ? this.#filteredMetrics.set(value.token, value) : this.#filteredMetrics.delete(value.token);
		console.log('this.#filteredMetrics : ', this.#filteredMetrics);
	}

	get filteredMetrics() {return this.#filteredMetrics;}

	set compositeMetric(value) {
        (!this.#compositeMetrics.has(value.token)) ? this.#compositeMetrics.set(value.token, value) : this.#compositeMetrics.delete(value.token);
		console.log('this.#compositeMetrics : ', this.#compositeMetrics);
	}
	get compositeMetrics() {return this.#compositeMetrics;}

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
		this.#SQLProcess.type = 'PROCESS';
		this.#SQLProcess.token = this.token;
		this.reportElements.processId = this.processId; // questo creerà il datamart FX[processId]
		this.#SQLProcess.name = name;
        this.reportElements.select = Object.fromEntries(this.select);
		this.reportElements.from = this.FROM;
		this.reportElements.where = this.WHERE;
		if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
		if (this.metrics.size > 0) this.reportElements.metrics = Object.fromEntries(this.metrics);
		if (this.compositeMetrics.size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
		if (this.filteredMetrics.size > 0) this.reportElements.filteredMetrics = Object.fromEntries(this.filteredMetrics);
		this.#SQLProcess.report = this.reportElements;
		console.info(this.#SQLProcess);
    }

    getSQLProcess() {return this.#SQLProcess;}

	save(name) {
		this.reportElements = {};
		this.#reportProcess.type = 'PROCESS';
		this.#reportProcess.token = this.token;
		this.reportElements.processId = this.processId; // questo creerà il datamart FX[processId]
		this.#reportProcess.name = name;
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		// TODO: l'update del report non deve aggiornare updated_at
		this.#reportProcess.created_at = date.toLocaleDateString('it-IT', options);
		this.#reportProcess.updated_at = date.toLocaleDateString('it-IT', options);

		this.reportElements.select = Object.fromEntries(this.select);
		//this.#elementReport.set('columns', Object.fromEntries(this.select));
		this.reportElements.from = this.FROM;
		this.reportElements.where = this.WHERE;

		if (this.filters.size > 0) this.reportElements.filters = Object.fromEntries(this.filters);
		if (this.metrics.size > 0) this.reportElements.metrics = Object.fromEntries(this.metrics);
		if (this.compositeMetrics.size > 0) this.reportElements.compositeMetrics = Object.fromEntries(this.compositeMetrics);
		if (this.filteredMetrics.size > 0) this.reportElements.filteredMetrics = Object.fromEntries(this.filteredMetrics);
		
		// this.editElements = Object.fromEntries(this.elementReport);
		this.#reportProcess.report = this.reportElements;
		this.#reportProcess.edit = this.editObjects();
		console.info(this.#reportProcess);
		debugger;
		window.localStorage.setItem(this.token, JSON.stringify(this.#reportProcess));
        console.info(`${name} salvato nello storage con token : ${this.token}`);
	}

	get process() {return this.#reportProcess;}

    get reportProcessStringify() {return this.#reportProcess;}

	getJSONProcess(value) {
		return JSON.parse(window.localStorage.getItem(value));
	}
}
