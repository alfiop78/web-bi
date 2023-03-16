/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
  #selected; // l'elemento selezionato in un determinato momento
  #workbook;
  #workBooks = {};

  constructor() {
    this.storage = window.localStorage;
    // this.storageKeys = Object.keys(window.localStorage);
    this.JSONData = null;
    // tutti gli workbook
  }

  set workBook(value) {
    // current workbook
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

  workBooks() {
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'WorkBook') {
        this.#workBooks[token] = JSON.parse(object);
      }
    }
    return this.#workBooks;
  }

  // salvataggio delle colonne delle tabelle
  saveSession(data) {
    data.forEach(tables => {
      for (const [table, columns] of Object.entries(tables)) {
        window.sessionStorage.setItem(table, JSON.stringify(columns));
      }
    });
  }

  getTable(table) {
    return JSON.parse(window.sessionStorage.getItem(table));
  }


}

class SheetStorages extends Storages {
  // #element;
  constructor() { super(); }

  /* set element(object) {
    this.#element = { token: object.token, value: object.value };
  }

  get element() {
    return JSON.parse(this.storage.getItem(this.#element.token));
  } */

  /* save() {
    // console.info('SAVE : ', value);
    debugger;
    window.localStorage.setItem(this.element.token, JSON.stringify(this.element.value));
  } */

  /* save(elements) {
    // elements : oggetto Map()
    // ciclo tutti i field del workbook da salvare
    for (const [token, value] of elements) {
      // console.log(token, value);
      window.sessionStorage.setItem(token, JSON.stringify(value));
    }
  }

  getElement(workBook, tableAlias) {
    let result = {};
    for (const [token, value] of Object.entries(sessionStorage)) {
      let json = JSON.parse(value);
      if (json.tableAlias === tableAlias) result[token] = json;
    }
    return result;
  } */

}
