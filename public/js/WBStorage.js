/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
  #selected; // l'elemento selezionato in un determinato momento
  #workbook;
  #workBooks = {};

  constructor() {
    this.storage = window.localStorage;
    this.wbSheets;
    // this.storageKeys = Object.keys(window.localStorage);
    this.JSONData = null;
    // tutti gli workbook
  }

  set workBook(value) {
    // value : il token del workbook
    this.#workbook = value;
  }

  get workBook() {
    // return window.localStorage.getItem(this.#workbook);
    return JSON.parse(window.localStorage.getItem(this.#workbook));
  }

  save(object) {
    window.localStorage.setItem(object.token, JSON.stringify(object));
  }

  set selected(token) {
    this.#selected = token;
  }

  get selected() {
    return JSON.parse(this.storage.getItem(this.#selected));
  }

  // tutti gli workBooks
  workBooks(databaseId) {
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'workbook' && JSON.parse(object).databaseId === databaseId) {
        this.#workBooks[token] = JSON.parse(object);
      }
    }
    return this.#workBooks;
  }

  // salvataggio delle tabelle nel sessionStorage
  saveTables(data) {
    // salvataggio in sessionStorage da una chiamata promise.all
    data.forEach(tables => {
      for (const [table, columns] of Object.entries(tables)) {
        window.sessionStorage.setItem(table, JSON.stringify(columns));
      }
    });
  }

  // salvataggio delle colonne delle tabelle
  saveSession(data) {
    // salvo in sessionStorage la tabella appena droppata nel canvas
    for (const [table, columns] of Object.entries(data)) {
      window.sessionStorage.setItem(table, JSON.stringify(columns));
    }
  }

  getTable(table) {
    return JSON.parse(window.sessionStorage.getItem(table));
  }

  /* getFilters(workBookToken) {
    let filters = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'filter' && JSON.parse(object).workbook_ref === workBookToken) {
        filters[token] = JSON.parse(object);
      }
    }
    return filters;
  } */

  getFilters() {
    let filters = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'filter') {
        filters[token] = JSON.parse(object);
      }
    }
    return filters;
  }

  /* getMetrics(workBookToken) {
    let metrics = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'metric' && JSON.parse(object).workbook_ref === workBookToken) {
        metrics[token] = JSON.parse(object);
      }
    }
    return metrics;
  } */

  getMetrics() {
    let metrics = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'metric') {
        metrics[token] = JSON.parse(object);
      }
    }
    return metrics;
  }

  getAll(databaseId) {
    // Recupero tutti gli oggetti appartenenti al db connesso e, a cascata, appartenenti al workbook in ciclo
    let all = {};
    for (const [workbookToken, workbook] of Object.entries(this.workBooks(databaseId))) {
      all[workbookToken] = workbook;
      for (const [token, object] of Object.entries(this.storage)) {
        // verifico se l'object appartiene al workbook
        const json = JSON.parse(object);
        if (json.workbook_ref === workbookToken) all[token] = json;
      }
    }
    return all;
  }

  // recupero gli sheet appartenenti al workbook passato come argomento
  static getWorkBookSheets(wbToken) {
    this.wbSheets = {};
    // il metodo statico non invoca il costruttore quindi non posso utilizzare this.storage
    for (const [token, object] of Object.entries(window.localStorage)) {
      const json = JSON.parse(object);
      if (json.type === 'sheet' && json.workbook_ref === wbToken) this.wbSheets[token] = json;
    }
    return this.wbSheets;
  }

  static getMetrics(wbToken) {
    this.metrics = {};
    for (const [token, value] of Object.entries(window.localStorage)) {
      const json = JSON.parse(value);
      if (json.type === 'metric' && json.workbook_ref === wbToken) this.metrics[token] = json;
    }
    return this.metrics;
  }

  // restituisce tutte le metriche che, nella loro formula, contengono la metricha passata come input (token) riferendosi al
  // workbook corrente (wbToken)
  static getMetricsUsage(wbToken, token) {
    this.usageMetrics = {};
    // tra le metriche restituite controllo quelle che hanno il token di input
    for (const [key, value] of Object.entries(this.getMetrics(wbToken))) {
      if (value.metrics.hasOwnProperty(token)) this.usageMetrics[key] = value;
    }
    return this.usageMetrics;
  }
}

class SheetStorages extends Storages {
  #sheets = {};
  #sheet;
  constructor() {
    super();
    this.wbSheets;
  }

  set sheet(value) {
    // value : il token dello sheet
    this.#sheet = value;
  }

  get sheet() {
    // return window.localStorage.getItem(this.#workbook);
    return JSON.parse(window.localStorage.getItem(this.#sheet));
  }

  // restituisce gli sheet con il workbook_ref passato come parametro
  sheets(workBookToken) {
    this.#sheets = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'sheet' && JSON.parse(object).workbook_ref === workBookToken) {
        this.#sheets[token] = JSON.parse(object);
      }
    }
    return this.#sheets;
  }

  // recupero tutti gli sheets
  getSheets() {
    let sheets = {};
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'sheet') {
        sheets[token] = JSON.parse(object);
      }
    }
    return sheets;
  }
}
