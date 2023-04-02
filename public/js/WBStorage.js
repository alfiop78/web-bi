/*
La classe recupera il local storage ad ogni accesso alla pagina e contiene Metodi per recuperare ad esempio solo i CUBE o solo le DIMENSION, ecc...
*/
class Storages {
  #selected; // l'elemento selezionato in un determinato momento
  #workbook;
  #workSheet;
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

  set workSheet(value) {
    this.#workSheet = value;
  }

  get workSheet() {
    return JSON.parse(window.localStorage.getItem(this.#workSheet));
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
  workBooks() {
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'WorkBook') {
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


}

class SheetStorages extends Storages {
  #sheets = {};
  #sheet;
  constructor() { super(); }

  set sheet(value) {
    // current sheet
    this.#sheet = value;
  }

  get sheet() {
    // return window.localStorage.getItem(this.#workbook);
    return JSON.parse(window.localStorage.getItem(this.#sheet));
  }

  sheets(workBookToken) {
    for (const [token, object] of Object.entries(this.storage)) {
      if (JSON.parse(object).type === 'Sheet' && JSON.parse(object).workBook_ref === workBookToken) {
        this.#sheets[token] = JSON.parse(object);
      }
    }
    return this.#sheets;
  }

}
