class Templates extends Application {
  constructor() {
    super();
    // il nome del file json contenente i report da processare
    this.templateReportFileName;
    // tipo di promise da chiamare, (promise.all, singola,  promise.any, .race, ecc) in base al dashboard. Questa funzione da chiamare viene decisa nel file index.html
    this.promise;
    // TODO: da eliminare dopo l'aggiunta di Controls and Dashboard
    this.filterNameChanged; // contiene il nome del filtro che, dopo la selezione, è stato modificato rispetto al valore precedente.
  }

  // invocata alla modifica di un filtro
  set paramsFilter(value) {
    this.filters[Object.keys(value)] = Object.values(value);
  }

  get paramsFilter() {
    // console.log(this.filters);
    return this.filters;
  }

  // qui ci sono i dati json del template-layout-*
  set templateLayoutData(value) { this.layoutData = value; }

  get templateLayoutData() { return this.layoutData; }

  // qui ci sono i dati json del template-reports-*
  set templateReportsData(value) { this.reportsData = value; }

  get templateReportsData() { return this.reportsData; }

  // titolo della pagina
  set templateReportTitle(value) { this.title = value; }

  get templateReportTitle() { return this.title; }

  createLayout() {
    console.log('Create Layout');
    // recupero l'elemento 'parent' a cui aggiungere il template json (presente in data)
    this.parent = document.getElementById(this.layoutData.parentElement_id);
    console.log(this.parent);
    debugger;
    // se esiste un nodo child lo elimino per ricreare il template (è stata attivata un'altra dashboard)
    this.sectionDynamic = this.parent.querySelector('section');
    if (this.sectionDynamic) { this.sectionDynamic.remove(); }
    // inserisco il div per il pageBy dshControls
    if (this.layoutData.hasOwnProperty('dshControls')) {
      this.dshControls = document.createElement(this.layoutData.dshControls.tag);
      this.addClasses(this.layoutData.dshControls, this.dshControls);
      this.addAttributes(this.layoutData.dshControls, this.dshControls);
      this.parent.appendChild(this.dshControls);
    }
    this.name = this.layoutData.name;
    // aggiungo il tag section e i suoi attributi, class e id
    this.el = document.createElement(this.layoutData.tag);
    // aggiungo class e attributi per questo elemento
    this.addClasses(this.layoutData, this.el);
    this.addAttributes(this.layoutData, this.el);
    // lo aggiungo al DOM
    this.parent.appendChild(this.el);
    console.log(this.el);
    // se sono presenti al elementi sono sicuramente sotto il 'rows', che è quello iniziale, su cui si appende tutto il resto
    if (this.layoutData.hasOwnProperty('rows')) {
      this.layoutData.rows.forEach((row) => {
        this.row = document.createElement(row.tag);
        this.addClasses(row, this.row);
        this.addAttributes(row, this.row);
        this.el.appendChild(this.row);
        if (row.hasOwnProperty('cols')) {
          if (Array.isArray(row.cols)) {
            row.cols.forEach((col) => {
              this.col = document.createElement(col.tag);
              this.addClasses(col, this.col);
              this.addAttributes(col, this.col);
              this.row.appendChild(this.col);

              if (col.hasOwnProperty('child')) {
                if (Array.isArray(col.child)) {
                  // è un array di child
                  col.child.forEach((child) => {
                    this.createRecursiveElements(this.col, child);
                  })
                } else {
                  // non è un array
                  // gli elementi e i sub-elementi di cols li aggiungo con una funzione ricorsiva, come fatto per this.createelement()
                  this.createRecursiveElements(this.col, col.child);
                }
              }
            });
          }
        }
      });
    }
  }

  addSpinnerLoader(parent) {
    const spinnerTemplate = document.getElementById('spinnerTemplate').content.cloneNode(true);
    const loader = spinnerTemplate.querySelector('.loader');
    let circle = loader.querySelector('circle');
    // imposto un id diverso per ogni oggetto spinner
    // loader.id = spinnerId;
    if (parent) parent.appendChild(loader);
  }

  addClasses(data, element, example) {
    // data : l'elemento proveniente dal json template
    // element : elemento a cui aggiungere le classi
    // example : se valorizzato, inserisco una class example per differenziare i css dalla pagina normale a quella di esempi dei layout
    if (data.hasOwnProperty('class')) {
      data.class.forEach((classes, i) => {
        if (example) { element.classList.add('example'); }
        element.classList.add(classes);
      });
    }
  }

  addAttributes(data, element) {
    // data : il contenuto del json
    // element : elemento a cui aggiungere gli attributi
    if (!element) return;
    if (data.hasOwnProperty('attributes')) {
      for (const [attr, value] of Object.entries(data.attributes)) {
        // console.log(`${attr}: ${value}`);
        element.setAttribute(attr, value);
        // se l'attributo è data-grid, lo applico alla variabile css --grid
        if (attr === "data-grid") { element.style.setProperty('--grid', value); }
      }
    }
  }

  appendReports() {
    // aggiungo, al template-layout, il template che deve contenere gli oggetti della pagina (templateReport)
    this.pageTitle = document.getElementById('pageTitle');
    this.pageTitle.innerHTML = this.templateReportTitle;

    this.requests = [];
    this.reportsData.forEach((item, index) => {
      this.positionId = document.getElementById(item.position_id);
      if (item.hasOwnProperty('loader')) {
        // creo sempre lo spinner, anche se non deve essere visualizzato subito
        this.addSpinnerLoader(this.positionId);
        // ne imposto la class solo se deve essere visualizzato lo spinner all'avvio della pagina (query all'avvio della pagina)
        if (item.loader === true) { this.positionId.classList.add('waiting'); }
      }
      // aggiungo gli attributi, qui c'è il metric-set, usato per nascondere gli spinner che fanno parte della stessa query, usando la class .loading sul div position
      this.addAttributes(item, this.positionId);
      // array di filters (pageBy), l'elemento dashboardControls contiene i filtri da utilizzare per l'oggetto grafico
      if (item.hasOwnProperty('dashboard')) {
        if (item.dashboard.hasOwnProperty('controls')) {
          item.dashboard.controls.forEach((filter) => {
            this.createElement(this.dshControls, filter);
          });
        }
      }
      // array di objects che contiene gli elementi che conterranno le metriche
      // possono esserci casi dove mi servono solo i dati e quindi non esiste l'elemento object nel json
      if (item.objects) {
        item.objects.forEach((object) => {
          this.createElement(this.positionId, object);
        });
      }

      if (item.hasOwnProperty("request")) {
        // inserisco in un array TUTTI gli url da processare, all'interno di queste request ci sono dei parametri che
        // definiscono se gli url devono essere processati all'avvio o in base ad un evento utente
        // init : true (processare all'avvio)
        // details : true (processare su evento utente)
        // object_id : id dell'elemento che passo alla fn googleChart, dove everrà inserito il grafico
        this.requests.push(
          {
            'url': item.request.url,
            'fn': item.request.function,
            "set": item.request.set,
            "init": item.request.init,
            "details": item.request.details,
            "index": index
          }
        );
      }
    });
  }

  createElement(parent, object) {
    // console.log(element);
    // controllo su quale tipo di elemento viene creato, se si tratta di svg devo fare createElementNS altrimenti se si tratta di HTML dovrò eseguire createElement
    if (object.type === "svgElement") {
      // creo il tag svg (template es : cma-parts-qualifier-2021.json)
      this.element = document.createElementNS('http://www.w3.org/2000/svg', object.tag);
    } else {
      // HTML element
      this.element = document.createElement(object.tag);
    }
    // gli applico le classi e gli attributi
    this.addClasses(object, this.element);
    this.addAttributes(object, this.element);
    // aggiungo il titolo da visualizzare sopra l'oggetto grafico, se presente
    if (object.hasOwnProperty('title')) {
      this.title = document.createElement('h3');
      this.title.innerHTML = object.title;
      parent.appendChild(this.title);
    }
    // se ha un value
    if (object.value) { this.element.innerHTML = object.value; }
    parent.appendChild(this.element);
    if (object.hasOwnProperty('child')) {
      if (Array.isArray(object.child)) {
        parent = this.element;
        object.child.forEach((child) => {
          this.createElement(parent, child);
        });
      } else {
        // non è un array ma un singolo child
        this.createElement(this.element, object.child);
      }
    }
  }

  createRecursiveElements(parent, element) {
    // creo l'elemento all'interno della root 'rows'
    this.element = document.createElement(element.tag);
    this.addClasses(element, this.element);
    this.addAttributes(element, this.element);
    parent.appendChild(this.element);

    if (element.hasOwnProperty('child')) {
      if (Array.isArray(element.child)) {
        parent = this.element;
        element.child.forEach((child) => {
          console.log(child);
          this.createRecursiveElements(parent, child);
        });
      } else {
        // non è un array ma un singolo child
        this.createRecursiveElements(this.element, element.child);
      }
    }

  }

}
