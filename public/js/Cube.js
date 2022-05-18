class Cube {
	#schema;
	#comment;
	#alias;
	#columns;
	#metrics = {};
	#metricsMap = new Map();
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

	set title(value) {this._title = value;}

	get title() {return this._title;}

	set comment(value) {this.#comment = value;}

	get comment() {return this.#comment;}

	set columnsDefined(value) {this.#columns = value;}

	get columnsDefined() {return this.#columns;}

	set metricDefined(value) {
		// converto un oggetto Object in Map()
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
			el.setAttribute('data-relation-id', true);
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('selected');
		});
	}

	set activeCard(card) {
		// la card è un obj contenente il riferimento nel DOM e il nome della tabella
		// console.log(card);
		// debugger;
		this.card = card; // contiene {'ref': riferimento della card nel DOM, tableName: 'nometabella'}
		this.card.ref.setAttribute('name', card.tableName);
		this.card.ref.setAttribute('data-schema', card.schema);
		this._tableName = card.tableName;
		this.#schema = card.schema;
	}

	get activeCard() {return this.card;}

	set fieldSelected(value) {this._field = value;}

	get fieldSelected() {return this._field;}

	set metrics(value) {
		// value : { name, metric_type : 0, formula: arr_sql, alias }
		// se value è un object (metrica composta) lo salvo come object altrimenti come stringa nel Map()
		this.#metricsMap.set(value.name, {alias : value.alias, formula : value.formula, metric_type : value.metric_type})		
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
		debugger;
		this._cube.type = 'CUBE';
		this._cube.name = this._title;
		this._cube.comment = this.#comment;
		// this._cube.metrics = this.#metrics;
		// console.log(Object.fromEntries(this.#metricsMap));
		this._cube.metrics = Object.fromEntries(this.metrics);
		this._cube.columns = this.#columns;
		this._cube.FACT = this._fact;
		this._cube.schema = this.#schema;
		this._cube.alias = this.#alias;
		this._cube.id = this._id;
		this._cube.associatedDimensions = this._associatedDimension;
	}

	get cube() {return this._cube;}

	mode(value) {
		// imposto la modalità della card (relations, columns, filters, groupby,metrics)
		// console.log(this.activeCardRef);
		this.card.ref.setAttribute('mode', value);
		let info = this.card.ref.parentElement.querySelector('.info');
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

	set dimensionsSelected(value) {this._dimensions.push(value);}

	get dimensionsSelected() {return this._dimensions;}

	set associatedDimensions(dimensionName) {
		debugger;
		this._associatedDimension.push(dimensionName);
		// this._associatedDimension = obj;
	}

	get associatedDimensions() {return this._associatedDimension;}

}

class Dimension {
	#comment;
	#lastTableHierarchy;
	#hier = {};
	constructor() {
		this.schema;
		this._dimension = {};
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
		debugger;
		this._dimension.type = 'DIMENSION';
		this._dimension.name = this._title;
		this._dimension.comment = this.#comment;
		this._dimension.cubes = {}; // object con i nomi dei cubi che hanno associazione con questa dimensione. Questa viene popolata quando si associa la dimensione al cubo
		this._dimension.lastTableInHierarchy = this.#lastTableHierarchy;
		this._dimension.hierarchies = this.#hier;
		console.log(this._dimension);
		debugger;
	}

	get dimension() {return this._dimension;}

}

class Hierarchy {
	#schema;
	#tableName;
	#col = {};
	#columns = {};
	#join = {};
	#relationId = 0;
	#field; // TODO: da modificare in fieldDs
	#fieldId;
	#fieldRef; // riferimento, nel DOM, della colonna selezionata
	#comment;
	#hier = {};
	#from;
	#table;
	#hierarchies;
	#lastTableHierarchy;
	#alias; // alias per la tabella
	constructor() {}

	set table(value) {
		// debugger;
		this.#table = value;
	}
	
	get table() {return this.#table;}

	set from(value) {this.#from = value;}

	get from() {return this.#from;}

	set activeCard(cardRef) {
		// la card su cui si sta operando
		this.card = cardRef;
		console.log(this.card);
		this.#tableName = this.card.getAttribute('name');
		this.#schema = this.card.getAttribute('data-schema');
	}

	get activeCard() {return this.card;}

	set fieldId(object) {this.#fieldId = object;}

	get fieldId() {return this.#fieldId;}

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
		// const token = (length) => (rand()+rand()+rand()+rand()).substr(0,length);
		const token = rand().substr(0, 7);
		// console.log(token(7));
		// console.log('token : ', token);
		if (!this.#join.hasOwnProperty(alias)) {
			// questa tabella non ha ancora nessuna relazione, azzero il relationId
			// this.#relationId = 0;
			this.#join[alias] = { [token] : value };
			// this.#join[this.table] = {[this.#relationId] : value};
		} else {
			// non incremento più relationId ma lo ricavo dal length in base alle relazioni già presenti per ogni tabella
			// this.#relationId = Object.keys(this.#join[this.table]).length;
			this.#join[alias][token] = value;
			// this.#join[this.table][this.#relationId] = value;
		}
		console.log('this.#join : ', this.#join);		
	}

	get join() {return this.#join;}
	
	set comment(value) {this.#comment = value;}

	get comment() {return this.#comment;}

	// set hierarchies(hier) {this.#hierarchies = hier;}

	// get hierarchies() {return this.#hierarchies;}

	set hier(object) {
		console.log('object : ', object);
		debugger;
		this.#hier[object.title] = {order : object.hierarchyOrder};
		this.#hier[object.title]['columns'] = this.#columns;
		this.#hier[object.title]['joins'] = this.#join;
		this.#hier[object.title]['from'] = object.from;
		this.#hier[object.title]['tablesFrom'] = object.tablesForm;
		this.#hier[object.title]['comment'] = object.comment;
		// TODO: qui effettuo il controllo per vedere se, quando ci sono più gerarchie, viene condivisa l'ultima tabella, che deve essere la stessa per ciascuna delle gerarchie.
		// this.lastTableHierarchy = object.lastTables;
		console.log('this._hierarchies : ', this.#hier);
		// this.hierarchies = this.#hier;
		// console.log(this.hierarchies);
	}

	get hier() {return this.#hier;}

	/*set lastTableHierarchy(value) {this.#lastTableHierarchy = value;}

	get lastTableHierarchy() {return this.#lastTableHierarchy;}*/

	set columns_(value) {
		this.#columns = value;
		console.log('#columns : ', this.#columns);
	}

	get columns_() {return this.#columns;}

	columns(token) {
		this.obj = {};
		this.tokenObj = {};
		if (!this.#col.hasOwnProperty(this.#alias)) {
			debugger;
			// alias di tabella ancora non mappata come columns
			this.tokenObj = {id : this.#fieldId, ds : this.#field};
			this.obj[token] = this.tokenObj;
			this.#col[this.#alias] = this.obj;
		} else {			
			// tabella già presente, verifico se il token è già presente, se non lo è lo aggiungo altrimenti lo elimino
			if (!this.#col[this.#alias].hasOwnProperty(token)) {
				// field non esistente per questa tabella, lo aggiungo
				this.#col[this.#alias][token] = {id : this.#fieldId, ds : this.#field};
			} else {
				// field già esiste per questa tabella, lo elimino
				delete this.#col[this.#alias][token];
				// elimino anche l'attr "schema.table" se, al suo interno, non sono presenti altri field
				if (Object.keys(this.#col[this.#alias]).length === 0) delete this.#col[this.#alias];
			}
		}
		this.columns_ = this.#col;
	}

	// getColumns() {return this.#columns;}

	showRelationIcons(value) {
		// value : colSelected
		value.forEach((el) => {
			el.setAttribute('data-rel-'+this.#relationId, this.#relationId);
			el.setAttribute('data-relation-id', true);
			// la relazione è stata creata, posso eliminare [selected]
			el.removeAttribute('selected');
		});
		// this.#relationId++;
	}
}