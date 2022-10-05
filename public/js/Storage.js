/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
  #dimensionsMap = new Map();
  #cubesMap = new Map();
  #filtersMap = new Map();
  #metricsMap = new Map();
  #processesMap = new Map();
  #processesTempMap = new Map();
  #cubes = new Set();
  #metrics = new Set();
  #filters = new Set();
  #processes = new Set();
  #all = new Set();
  #selected; // l'elemento selezionato in un determinato momento

  constructor() {
    this.storage = window.localStorage;
    this.storageKeys = Object.keys(window.localStorage);
    // console.log('storageKeys : ', this.storageKeys);
    // this.cubeId = this._cubeId;
    this.JSONData = null;
  }

  set storageK(value) {
    // value : METRIC, FILTER, DIMENSION, ecc...
    this.st = {}; // TODO: da rinominare in this.storage
    Object.keys(window.localStorage).forEach(key => {
      // if (JSON.parse(window.localStorage.getItem(key)).type === value) {
      //   this.st[key] = JSON.parse(window.localStorage.getItem(key));
      // }
      if (value.includes(JSON.parse(window.localStorage.getItem(key)).type)) {
        this.st[key] = JSON.parse(window.localStorage.getItem(key));
      }
    });
  }

  get storageK() { return this.st; }

  get allLocalElements() {
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      this.#all.add(jsonStorage.name);
    });
    return this.#all;
  }

  get dimensions() {
    // recupero gli oggetti DIMENSION dallo storage
    this.storageK = ['DIMENSION'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#dimensionsMap.set(key, value);
    }
    return this.#dimensionsMap;
  }

  get cubes() {
    this.storageK = ['CUBE'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#cubesMap.set(key, value);
    }
    return this.#cubesMap;
  }

  get filters() {
    this.storageK = ['FILTER'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#filtersMap.set(key, value);
    }
    return this.#filtersMap;
  }

  get processes() {
    this.storageK = ['PROCESS'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#processesMap.set(key, value);
    }
    return this.#processesMap;
  }

  get tempProcesses() {
    this.storageK = '_temp_';
    for (const [key, value] of Object.entries(this.st)) {
      this.#processesTempMap.set(key, value);
    }
    return this.#processesTempMap;
  }

  // viene invocata da init_versioning.js
  get metrics() {
    this.storageK = ['METRIC', 'ADV_METRIC', 'COMP_METRIC'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#metricsMap.set(key, value);
    }
    return this.#metricsMap;
  }

  save(value) {
    // console.info('SAVE : ', value);
    window.localStorage.setItem(value.token, JSON.stringify(value));
  }

  JSONFormat(name) {
    // restituisco un object convertito in json, questo mi servirà per ricostruire la struttura
    return JSON.parse(window.localStorage.getItem(name));
  }

  set selected(token) {
    this.#selected = token;
  }

  get selected() {
    return JSON.parse(this.storage.getItem(this.#selected));
  }

}

class CubeStorage extends Storages {
  #cube;
  constructor() { super(); }

  /*getIdAvailable() {
    // ottengo il primo Id disponibile
    console.log(this.storageKeys);
    this.cubesElement = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);

      if (jsonStorage.type === 'CUBE') {
        // ottengo il numero di elementi CUBE nello storage
        this.cubesElement.push(jsonStorage.id);
      }
    });

    // ordino l'array
    this.cubesElement.sort(function (a, b) {
      // console.log(a);
      // console.log(b);
      return a - b;
    });
    // this.pagesElement.sort((a, b) => a - b);

    for (let i = 0; i < this.cubesElement.length; i++) {
      // indice 0
      // se 0 è presente in pagesElement aggiungo una unità
      // console.log(this.pagesElement.includes(i));

      if (this.cubesElement.includes(i)) {
        this.id++;
        // console.log(this.id);
      } else {
        this.id = i;
      }
    }
    return this.id;
  }*/

  // verifico se il nome inserito è presente nello storage
  checkNames(name) {
    for (const values of super.cubes.values()) {
      if (values.name.toLowerCase() === name.toLowerCase()) return true;
    }
  }

  set stringify(value) { this._stringify = value; }

  get stringify() { return this._stringify; }

  set stringifyObject(value) { this._stringify = JSON.stringify(value); }

  get stringifyObject() { return this._stringify; }

  getMetrics(cubeName) {
    this._cube = JSON.parse(window.localStorage.getItem(cubeName));
    return this._cube.metrics;
  }

  associatedDimensions(name) {
    let jsonStorage = JSON.parse(this.storage.getItem(name));
    // console.log(jsonStorage);
    if (jsonStorage.type === 'CUBE') {
      return jsonStorage.associatedDimensions;
    }
  }
}

class ProcessStorage extends Storages {
  #processes = {}; // lista dei process presenti nello storage
  #process;
  constructor() {
    super();
    // this.processes = {}; // lista dei process presenti nello storage
    this.id = 0; // default
    // imposto la lista dei cubi in this.cubes
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(key);
      if (jsonStorage.type === 'PROCESS') {
        // let reportProperties = {'name' : key, 'processId' : jsonStorage.processId};
        // this.#processes[key] = reportProperties;
        this.#processes[key] = jsonStorage;
      }
    });
  }

  set processId(value) { this.id = value; } // TODO: probabilmente non viene mai utilizzato, da ricontrollare

  get processId() { return this.id; } // TODO: probabilmente non viene mai utilizzato, da ricontrollare

  // verifico se il nome inserito è presente nello storage
  checkNames(name) {
    for (const values of super.processes.values()) {
      if (values.name.toLowerCase() === name.toLowerCase()) return true;
    }
  }

  // TODO: probabilmente non viene mai utilizzato, da ricontrollare
  getIdAvailable() {
    // ottengo il primo Id disponibile
    // console.log(this.storageKeys);
    this.elements = [];
    this.storageKeys.forEach((key) => {
      let jsonStorage = JSON.parse(this.storage.getItem(key));
      // console.log(jsonStorage);

      if (jsonStorage.type === 'PROCESS') {
        // ottengo il numero di elementi PROCESS nello storage
        this.elements.push(jsonStorage.processId);
      }
    });
    // ordino l'array
    this.elements.sort(function(a, b) {
      // console.log(a);
      // console.log(b);
      return a - b;
    });

    // this.pagesElement.sort((a, b) => a - b);
    for (let i = 0; i < this.elements.length; i++) {
      // indice 0
      // se 0 è presente in elements aggiungo una unità
      // console.log(this.pagesElement.includes(i));

      if (this.elements.includes(i)) {
        this.id++;
        // console.log(this.id);
      } else {
        this.id = i;
      }
    }
    return this.id;
  }

  // TODO: probabilmente non viene mai utilizzato, da ricontrollare
  getJSONProcess(value) {
    let processReports = {};
    let report = JSON.parse(this.storage.getItem(value));
    return report.process;
  }

}

// TODO: da rivedere e probabilmente  da eliminare perche non vengono mai utilizzati i suoi metodi
class DimensionStorage extends Storages {
  // #dimensions = new Map();
  #selectedDimensions = new Set();
  // #dimension;
  // #name;
  // Metodi per leggere/scrivere Dimensioni nello Storage
  constructor() {
    super();
  }

  // verifico se il nome inserito è presente nello storage
  checkNames(name) {
    for (const values of super.dimensions.values()) {
      if (values.name.toLowerCase() === name.toLowerCase()) return true;
    }
  }

}

class FilterStorage extends Storages {
  constructor() {
    super();
  }

  // verifico se il nome inserito è presente nello storage
  checkNames(name) {
    for (const values of super.filters.values()) {
      if (values.name.toLowerCase() === name.toLowerCase()) return true;
    }
  }

}

class MetricStorage extends Storages {
  /* NOTE: metric_type
    0 : metriche di base legate al cubo
    1 : metrica composta legata al cubo (es.: prezzo * quantita)
    2 : metrica filtrata
    3 : metrica composta legata al cubo filtrata
    4 : metrica composta
  */
  #metricsObject = {};
  #metric;
  constructor() {
    super();
  }

  get metrics() {
    this.#metricsObject = {};
    super.storageK = ['METRIC', 'ADV_METRIC', 'COMP_METRIC'];
    for (const [key, value] of Object.entries(this.st)) {
      this.#metricsObject[key] = value;
    }
    return this.#metricsObject;
  }

  // verifico se il nome inserito è presente nello storage
  checkNames(name) {
    for (const values of super.metrics.values()) {
      if (values.name.toLowerCase() === name.toLowerCase()) return true;
    }
  }

  // restituisco la lista delle metriche prendendole direttamente dallo stato attuale dello storage
  set cubeMetrics(cubeToken) {
    // recupero gli oggetti METRIC dallo storage
    this.#metricsObject = {};
    super.storageK = ['METRIC', 'ADV_METRIC', 'COMP_METRIC'];
    for (const [key, value] of Object.entries(this.st)) {
      if (value.cube === cubeToken || value.cubes.includes(cubeToken)) this.#metricsObject[key] = value;
      // if (value.cubes.includes(cubeToken)) this.#metricsObject[key] = value;
    }
    /* super.storageK = 'ADV_METRIC';
    for (const [key, value] of Object.entries(this.st)) {
      if (value.cube === cubeToken || value.cubes.includes(cubeToken)) this.#metricsObject[key] = value;
      // if (value.cubes.includes(cubeToken)) this.#metricsObject[key] = value;
    } */
  }

  get cubeMetrics() { return this.#metricsObject; }

  get baseAdvancedMetrics() {
    this.localMetrics = new Set();
    for (const [key, value] of Object.entries(this.#metricsObject)) {
      if (value.metric_type !== 4) this.localMetrics.add(value);
    }
    return this.localMetrics;
  }

  get compositeMetrics() {
    this.localMetrics = new Set();
    for (const [key, value] of Object.entries(this.metrics)) {
      // if (value.metric_type === 4) this.localMetrics.add(value);
      if (value.type === 'COMP_METRIC') this.localMetrics.add(value);
    }
    return this.localMetrics;
  }

}
