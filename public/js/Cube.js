class Cube {
	#schema;
	#comment;
	#alias;
	#columns;
	#metrics = {};
	#metricsMap = new Map();
	#token;
	constructor() {
		this._cube = {};
		// this._metrics = {}; // contiene gli oggetti metriche
		this.arrMetrics = []; // accessibile dall'esterno
		this.relationId = 0;
		this._join = {};
		this._dimensions = []; // dimensioni selezionate da associare al cube
		this._associatedDimension = [];
	}

	set id(value) {this._id = value;}

	get id() {return this._id;}

	set token(value) {
		this.#token = value;
	}

	get token() {return this.#token;}

	set title(value) {this._title = value;}

	get title() {return this._title;}

	set comment(value) {this.#comment = value;}

	get comment() {return this.#comment;}

	set columnsDefined(value) {this.#columns = value;}

	get columnsDefined() {return this.#columns;}

	set metricDefined(value) {
		// NOTE: converto un oggetto Object in Map()
		this.#metricsMap = new Map(Object.entries(value));
	}

	get metricDefined() {return this.#metricsMap;}

	set relations(value) {
		this._join['hier_'+this.relationId] = value;
	}

	get relations() {return this._join;}

	saveRelation(value) {
		// value : colSelected
		value.forEach((el) => {
			el.setAttribute('data-rel-'+this.relationId, this.relationId);
			// el.setAttribute('data-relation-id', 'rel_'+this.relationId);
			el.dataset.relationId = true;
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('data-selected');
		});
	}

	// set activeCard(id) {
	// 	// la card è un obj contenente il riferimento nel DOM e il nome della tabella
	// 	// console.log(card);
	// 	// debugger;
	// 	this.card = document.querySelector(".card.table[data-id='" + id +"']"); // contiene {'ref': riferimento della card nel DOM (.card.table), schema: 'schema', tableName: 'nometabella'}
	// 	this.schema = this.card.dataset.schema;
	// }

	// get activeCard() {return this.card;}

	set fieldSelected(value) {this._field = value;}

	get fieldSelected() {return this._field;}

	set metrics(value) {
		// value : { name, metric_type : 0, formula: arr_sql, alias }
		// se value è un object (metrica composta) lo salvo come object altrimenti come stringa nel Map()
		if (value.metric_type === 0) {
			this.#metricsMap.set(value.name, {alias : value.alias, metric_type : value.metric_type});
		} else {
			// metrica di base composta (es.: przmedio * quantita) impostata sul cubo
			this.#metricsMap.set(value.name, {alias : value.alias, formula : value.formula, metric_type : value.metric_type, fields : value.fields});
		}
		console.log(this.#metricsMap);
	}

	get metrics() {return this.#metricsMap;}

	set FACT(value) {this._fact = value;}

	get FACT() {return this._fact;}

	set alias(value) {this.#alias = value;}

	get alias() {return this.#alias;}

	set schema(value) {this.#schema = value;}

	get schema() {return this.#schema;}

	save() {
		this._cube.token = this.token;
		// imposto la data last_created e last_edit
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		this._cube.type = 'CUBE';
		this._cube.created_at = date.toLocaleDateString('it-IT', options);
		this._cube.updated_at = date.toLocaleDateString('it-IT', options);
		this._cube.name = this._title;
		this._cube.comment = this.#comment;
		// this._cube.metrics = this.#metrics;
		// console.log(Object.fromEntries(this.#metricsMap));
		// NOTE: conversione di un oggetto Map in Object
		this._cube.metrics = Object.fromEntries(this.metrics);
		this._cube.columns = this.#columns;
		this._cube.FACT = this._fact;
		this._cube.schema = this.#schema;
		this._cube.alias = this.#alias;
		this._cube.id = this._id;
		console.log(this.associatedDimensions);
		debugger;
		this._cube.associatedDimensions = this.associatedDimensions;
	}

	get cube() {return this._cube;}

	set dimensionsSelected(value) {this._dimensions.push(value);}

	get dimensionsSelected() {return this._dimensions;}

	set associatedDimensions(token) {
		debugger;
		// TODO: valutare oggetto Map()
		this._associatedDimension.push(token);
		// this._associatedDimension = obj;
	}

	get associatedDimensions() {return this._associatedDimension;}

}

class Dimension {
	#comment;
	#lastTableHierarchy;
	#hier = {};
	#dimension = {};
	constructor() {
		this.schema;
		// this._dimension = {};
	}

	set hier(value) {
		this.#hier[Object.keys(value)] = value[Object.keys(value)];
		console.log('Dim #hier : ', this.#hier);
	}

	get hier() {return this.#hier;}

	set lastTableHierarchy(value) {this.#lastTableHierarchy = value;}

	get lastTableHierarchy() {return this.#lastTableHierarchy;}

	set id(value) {this._id = value;}

	get id() {return this._id;}

	set title(value) {this._title = value;}

	get title() {return this._title;}

	set comment(value) {this.#comment = value;}

	get comment() {return this.#comment;}

	save() {
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 21);
		// imposto la data last_created e last_edit
		const date = new Date();
		// const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };
		// console.log(date.toLocaleDateString('it-IT', options));
		this.#dimension.token = token;
		// TODO: quando sarà implementata la modifica di una dimensione dovrò utilizzare solo updated_at
		this.#dimension.created_at = date.toLocaleDateString('it-IT', options);
		this.#dimension.updated_at = date.toLocaleDateString('it-IT', options);
		this.#dimension.type = 'DIMENSION';
		this.#dimension.name = this._title;
		this.#dimension.comment = this.comment;
		this.#dimension.cubes = {}; // object con i nomi dei cubi che hanno associazione con questa dimensione. Questa viene popolata quando si associa la dimensione al cubo
		this.#dimension.lastTableInHierarchy = this.lastTableHierarchy;
		this.#dimension.hierarchies = this.hier;
		console.log(this.#dimension);
		debugger;
	}

	get dimension() {return this.#dimension;}

}

class Hierarchy {
	#schema;
	#columns = new Map();
	#join = {};
	#relationId = 0;
	#field; // TODO: da modificare in fieldDs
	#fieldId;
	#fieldRef; // riferimento, nel DOM, della colonna selezionata
	#comment;
	#hier = {};
	#from;
	#table;
	#lastTableHierarchy;
	#alias; // alias per la tabella
	constructor() {}

	set table(value) {this.#table = value;}
	
	get table() {return this.#table;}

	set from(value) {this.#from = value;}

	get from() {return this.#from;}

	set activeCard(id) {
		// la card su cui si sta operando
		this.card = document.querySelector(".card.table[data-id='" + id +"']"); // contiene {'ref': riferimento della card nel DOM (.card.table), schema: 'schema', tableName: 'nometabella'}
		this.schema = this.card.dataset.schema;
	}

	get activeCard() {return this.card;}

	set mode(value) {
		// imposto la modalità della card (relations, columns, filters, groupby,metrics)
		// console.log(this.activeCardRef);
		this.card.dataset.mode = value;
		let info = this.card.querySelector('.info');
		info.removeAttribute('hidden');
		let msg;
		switch (value) {
			case 'columns':
				msg = 'Seleziona le colonne da mettere nel corpo della tabella';
				break;
			case 'relations':
				msg = 'Selezionare le colonne che saranno messe in relazione';
				break;
			case 'hier-order':
				msg = 'Selezionare le tabelle nell\'ordine gerarchico';
				break;
			default:
				break;
		}
		info.innerHTML = msg;
	}

	get mode() {return this.card.dataset.mode;}

	set field(object) {this.#field = object;}

	get field() {return this.#field;}

	set fieldRef(value) {this.#fieldRef = value;}

	get fieldRef() {return this.#fieldRef;}

	set alias(value) {this.#alias = value;}

	get alias() {return this.#alias;}

	set join(value) {
		// genero un token per questa relazione
		const alias = value[0].split('.')[0];
		const rand = () => Math.random(0).toString(36).substr(2);
		const token = rand().substr(0, 7);
		if (!this.#join.hasOwnProperty(alias)) {
			// questa tabella non ha ancora nessuna relazione
			this.#join[alias] = { [token] : value };
		} else {
			this.#join[alias][token] = value;
		}
		console.log('this.#join : ', this.#join);		
	}

	get join() {return this.#join;}
	
	set comment(value) {this.#comment = value;}

	get comment() {return this.#comment;}

	set hier(object) {
		console.log('object : ', object);
		this.#hier[object.token] = {order : object.hierarchyOrder};
		this.#hier[object.token]['name'] = object.name;
		this.#hier[object.token]['columns'] = Object.fromEntries(this.columns);
		this.#hier[object.token]['joins'] = this.#join; // TODO: this.join
		this.#hier[object.token]['from'] = object.from;
		// this.#hier[object.token]['tablesFrom'] = object.tablesForm;
		this.#hier[object.token]['comment'] = object.comment;
		console.log('this._hierarchies : ', this.#hier);
	}

	get hier() {return this.#hier;}

	// aggiungo/elimino una colonna
	set columns(token) {
		this.obj = {};
		if (!this.#columns.has(this.#alias)) {
			// alias di tabella ancora non mappata come columns
			this.obj[token] = { id : this.field.id, ds : this.field.ds};
			this.#columns.set(this.#alias, this.obj);
		} else {			
			// tabella già presente, verifico se il token è già presente, se non lo è lo aggiungo altrimenti lo elimino
			if (!this.#columns.get(this.#alias).hasOwnProperty(token)) {
				// field non esistente per questa tabella, lo aggiungo
				this.#columns.get(this.#alias)[token] = {id : this.field.id, ds : this.field.ds};
			} else {
				// field già esiste per questa tabella, lo elimino
				delete this.#columns.get(this.#alias)[token];
				// elimino anche l'attr "schema.table" se, al suo interno, non sono presenti altri field
				if (this.#columns.get(this.#alias).size === 0) this.#columns.delete(this.#alias);
			}
		}
		console.log('this.#columns : ', this.#columns);
	}

	get columns() {return this.#columns;}

	showRelationIcons(value) {
		// value : colSelected
		value.forEach((el) => {
			el.setAttribute('data-rel-'+this.#relationId, this.#relationId);
			el.dataset.relationId = true;
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('data-selected');
		});
		// this.#relationId++;
	}
}