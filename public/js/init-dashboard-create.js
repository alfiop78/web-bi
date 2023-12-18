var App = new Application();
var Template = new Templates();
var Dashboard = new Dashboards(); // istanza della Classe Dashboards, da inizializzare quando ricevuti i dati dal datamart
var Storage = new SheetStorages();
var Resource = new Resources();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    // dialogs
    dlgTemplateLayout: document.getElementById('dlg-template-layout'),
    dlgChartSection: document.getElementById('dlg-chart'),
    number: function(properties) {
      return new google.visualization.NumberFormat(properties);
    },
    titleRef: document.getElementById('dashboardTitle')
  }

  const rand = () => Math.random(0).toString(36).substring(2);

  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });

  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        // console.info('A child node has been added or removed.');
        Array.from(mutation.addedNodes).forEach(node => {
          // console.log(node.nodeName);
          if (node.nodeName !== '#text') {
            if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);
            if (node.hasAttribute('data-context-fn')) node.addEventListener('contextmenu', app[node.dataset.contextFn]);

            if (node.hasChildNodes()) {
              node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
              node.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
              node.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
              node.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
            }
          }
        });
      } else if (mutation.type === 'attributes') {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
          mutation.target.querySelectorAll('*[data-enter-fn]').forEach(element => element.addEventListener('mouseenter', app[element.dataset.enterFn]));
          mutation.target.querySelectorAll('*[data-leave-fn]').forEach(element => element.addEventListener('mouseleave', app[element.dataset.leaveFn]));
          mutation.target.querySelectorAll('*[data-blur-fn]').forEach(element => element.addEventListener('blur', app[element.dataset.blurFn]));
        }
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  observerList.observe(document.getElementById('body'), config);

  // Viene rimosso 'hidden' dal #body. In questo modo la modifica viene
  // intercettata dall'observer e vengono associate le funzioni sugli elementi
  // che hanno l'attributo data-fn
  // TODO utilizzare questa logica anche sulle altre pagine
  App.init();

  // onclick events
  app.save = async (e) => {
    console.log(e.target);
    const token = rand().substring(0, 7);
    const title = document.getElementById('dashboardTitle').dataset.value;
    const note = document.getElementById('note').value;
    // salvo il json 'dashboard-token' in localStorage e su DB
    let json = {
      title, note, token, type: 'dashboard',
      layout: Template.id,
      resources: Object.fromEntries(Resource.resource)
    };
    console.log(json);
    const url = `/fetch_api/json/dashboard_store`;
    const params = JSON.stringify(json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        debugger;
      })
      .catch((err) => console.error(err));
  }

  // TODO: potrei spostarla in Dashboards.js
  app.specsSave = () => {
    const url = `/fetch_api/json/sheet_specs_update`;
    const params = JSON.stringify(Resource.json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        debugger;
        if (data) {
          console.log('elemento salvato con successo');
        } else {
        }
      })
      .catch((err) => console.error(err));
  }

  app.preview = (e) => {
    console.log(e.target);
    debugger;
    // TODO: da valutare, potrei visualizzare una preview del dashboard completo di dati
  }

  app.openDlgTemplateLayout = async () => {
    // TODO: creare le anteprime di tutti i Template Layout
    // TODO: I Template Layout li devo mettere nel DB invece di metterli nei file .json
    // Prima di fare questo TODO, nel frattempo, utilizzo la proomise che chiama il
    // Template Layout come fatto in init-dashboards.js

    // const sheetLayout = 'stock';
    const templateLayout = 'layout-1';
    const urls = [
      `/js/json-templates/${templateLayout}.json`
    ];

    const init = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, method: 'POST' };
    // ottengo tutte le risposte in un array
    await Promise.all(urls.map(url => fetch(url, init)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        console.log(data);
        if (!data) return;
        data.forEach(template => {
          // imposto i dati di questo Template nella classe
          Template.data = template;
          // creo le preview dei template
          Template.thumbnails();
        })
      })
      .catch(err => console.error(err));

    app.dlgTemplateLayout.showModal();
  }

  app.layoutSelected = (e) => {
    // elimino eventuali selezioni precedenti
    document.querySelectorAll('.thumb-layout[data-selected]').forEach(el => delete el.dataset.selected);
    e.currentTarget.dataset.selected = true;
  }

  // Template selezionato e chiusura dialog
  app.btnTemplateDone = () => {
    app.dlgTemplateLayout.close();
    //  recupero il template selezionato
    const template = document.querySelector('.thumb-layout[data-selected]').id;
    debugger;
    Template.id = template;
    // console.log(template);
    Template.dashboardRef = document.getElementById('dashboard-preview');
    // creo l'anteprima nel DOM
    Template.create();
  }

  // apertura dialog per l'aggiunta del chart o DataTable
  app.addResource = (e) => {
    // il ref corrente, appena aggiunto
    Resource.ref = document.getElementById(e.currentTarget.id);
    const ul = document.getElementById('ul-sheets');
    // pulisco <ul>
    ul.querySelectorAll('li').forEach(el => el.remove());
    // carico elenco sheets del localStorage
    for (const [token, sheet] of Object.entries(Storage.getSheets())) {
      // console.log(token, sheet);
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.token = token;
      debugger;
      li.dataset.datamartId = sheet.id;
      li.dataset.label = sheet.name;
      li.addEventListener('click', app.sheetSelected);
      li.dataset.elementSearch = 'sheets';
      span.innerText = sheet.name;
      ul.appendChild(li);
    }
    app.dlgChartSection.showModal();
  }

  app.getData = async (token) => {
    // const sheet = JSON.parse(window.localStorage.getItem(token));
    // if (!sheet.id) return false;
    let partialData = [];
    debugger;
    await fetch(`/fetch_api/${Resource.datamart_id}/preview?page=1`)
      .then((response) => {
        // console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        console.log(paginateData);
        console.log(paginateData.data);
        // debugger;
        // Resource.data = paginateData.data;
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          // console.log(url);
          await fetch(url).then((response) => {
            // console.log(response);
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          }).then(response => response.json()).then((paginate) => {
            partialData = partialData.concat(paginate.data);
            if (paginate.next_page_url) {
              recursivePaginate(paginate.next_page_url);
              console.log(partialData);
            } else {
              // Non sono presenti altre pagine, visualizzo il dashboard
              console.log('tutte le paginate completate :', partialData);
              Resource.data = partialData;
              google.charts.setOnLoadCallback(app.drawTable(sheet.token));
            }
          }).catch((err) => {
            App.showConsole(err, 'error');
            console.error(err);
          });
        }
        partialData = paginateData.data;
        if (paginateData.next_page_url) {
          recursivePaginate(paginateData.next_page_url);
        } else {
          // Non sono presenti altre pagine, visualizzo il dashboard
          Resource.data = partialData;
          google.charts.setOnLoadCallback(app.drawTable(Resource.resource.token));
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // Selezione del report che alimenta il chart_div
  app.sheetSelected = (e) => {
    // recupero le specifiche per questo report (resource)
    // successivamente recupero i dati del datamart
    const token = e.currentTarget.dataset.token;
    Resource.datamart_id = e.currentTarget.dataset.datamartId;
    Resource.token = e.currentTarget.dataset.token;
    fetch(`/fetch_api/name/${token}/sheet_specs_show`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        Resource.json = data.json_value;
        console.log('save sheet_specs : ', Resource.json);
        app.getData(token);
        // un Map() di ref aggiunti alla pagina, questo verrà salvato nel json 'dashboard-token'
        // Resource.resource = {sheet : e.currentTarget.dataset.token, template : `template-${e.currentTarget.dataset.token}`};
        Resource.resource = token;
        app.dlgChartSection.close();
        // aggiungo la class 'defined' nel div che contiene il grafico/tabella
        Resource.ref.classList.add('defined');
      })
      .catch((err) => console.error(err));
  }

  app.createTemplateFilter = (filter) => {
    const filterRef = document.getElementById('filter_div');
    const tmplFilter = document.getElementById('template-filter');
    const tmplFilterContent = tmplFilter.content.cloneNode(true);
    const containerDiv = tmplFilterContent.querySelector('.filter-container.dropzone');
    const filterDiv = containerDiv.querySelector('.preview-filter');
    const btnRemove = containerDiv.querySelector('button');
    // debugger;
    filterDiv.id = filter.containerId;
    // TODO: potrei impostarle con data-fn in MutationObserver
    filterDiv.addEventListener('dragstart', app.filterDragStart);
    containerDiv.addEventListener('dragover', app.filterDragOver);
    containerDiv.addEventListener('dragenter', app.filterDragEnter);
    containerDiv.addEventListener('dragleave', app.filterDragLeave);
    containerDiv.addEventListener('drop', app.filterDrop);
    containerDiv.addEventListener('dragend', app.filterDragEnd);
    btnRemove.dataset.id = filter.containerId;
    btnRemove.dataset.label = filter.filterColumnLabel;
    filterDiv.innerText = filter.caption;
    filterRef.appendChild(containerDiv);
  }

  app.drawTable = () => {
    // aggiungo i filtri se sono stati impostati nel preview sheet
    Resource.json.filters.forEach(filter => app.createTemplateFilter(filter));
    // impostazione del legame tra i filtri (bind)
    // WARN: probabilmente qui, se non ci sono filtri, può verificarsi un errore
    app.setDashboardBind();

    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // Resource.DOMref = new google.visualization.Table(document.getElementById('chart_div'));
    Resource.DOMref = new google.visualization.Table(Resource.ref);
    // NOTE: utilizzo della stessa logica utilizzata in init-sheet.js
    let keyColumns = [];
    Resource.json.data.group.key.forEach(column => {
      if (column.properties.grouped) {
        keyColumns.push({ id: column.id, column: Resource.dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
      }
    });
    let groupColumnsIndex = [];
    Resource.json.data.group.columns.forEach(metric => {
      const index = Resource.dataTable.getColumnIndex(metric.alias);
      const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
      let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', label: metric.label };
      groupColumnsIndex.push(object);
    });

    // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
    Resource.dataGroup = new google.visualization.data.group(
      Resource.dataTable, keyColumns, groupColumnsIndex
    );

    /* for (const [columnId, properties] of Object.entries(Resource.json.data.formatter)) {
      let formatter = null;
      switch (properties.type) {
        case 'number':
          formatter = app[properties.type](properties.prop);
          break;
        // case 'date':
        // TODO Da implementare
        // let formatter = app[properties.format](properties.numberDecimal);
        // formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(columnId));
        // break;
        default:
          // debugger;
          break;
      }
      if (formatter) formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(columnId));
    } */

    Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);

    let viewColumns = [], viewMetrics = [];
    Resource.json.data.view.forEach(column => {
      if (column.properties.visible) viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
    });
    // dalla dataGroup, recupero gli indici di colonna delle metriche
    Resource.json.data.group.columns.forEach(metric => {
      if (!metric.dependencies && metric.properties.visible) {
        const index = Resource.dataGroup.getColumnIndex(metric.alias);

        // Implementazione della func 'calc' per le metriche composite.
        if (metric.type === 'composite') {
          // è una metrica composta, creo la funzione calc, sostituendo i nomi
          // delle metriche contenute nella formula, con gli indici corrispondenti.
          // Es.: margine = ((ricavo - costo) / ricavo) * 100, recuperare gli indici
          // delle colonne ricavo e costo per creare la metrica margine :
          // recupero la formula della metrica composta
          const formula = JSON.parse(localStorage.getItem(metric.token)).formula;
          // Creo una Func "dinamica"
          let calcFunction = function(dt, row) {
            let formulaJoined = [];
            // in formulaJoined ciclo tutti gli elementi della Formula, imposto i
            // valori della DataTable, con getValue(), recuperandoli con getColumnIndex(nome_colonna)
            formula.forEach(formulaEl => {
              if (formulaEl.alias) {
                formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl.alias)));
              } else {
                formulaJoined.push(formulaEl);
              }
            });
            // La funzione eval() è in grado di eseguire operazioni con valori 'string' es. eval('2 + 2') = 4.
            // Quindi inserisco tutto il contenuto della stringa formulaJoined in eval(), inoltre
            // effettuo un controllo sul risultato in caso fosse NaN
            const result = (isNaN(eval(formulaJoined.join('')))) ? 0 : eval(formulaJoined.join(''));
            let total = (result) ? { v: result } : { v: result, f: '-' };
            // console.log(result);
            // const result = (isNaN(eval(formulaJoined.join('')))) ? null : eval(formulaJoined.join(''));
            let resultFormatted;
            // formattazione della cella con formatValue()
            if (Resource.json.data.formatter[metric.alias]) {
              const metricFormat = Resource.json.data.formatter[metric.alias];
              let formatter;
              formatter = app[metricFormat.type](metricFormat.prop);
              resultFormatted = (result) ? formatter.formatValue(result) : '-';
              total = { v: result, f: resultFormatted };
            } else {
              resultFormatted = (result) ? result : '-';
              total = (result) ? { v: result } : { v: result, f: '-' };
            }
            return total;
          }
          viewMetrics.push({ id: metric.alias, calc: calcFunction, type: 'number', label: metric.label, properties: { className: 'col-metrics' } });
        } else {
          viewMetrics.push(index);
          Resource.dataGroup.setColumnProperty(index, 'className', 'col-metrics');
          // console.log(Resource.dataGroup.getColumnProperty(index, 'className'));
        }
      }
    });
    // concateno i due array che popoleranno la DataView.setColumns()
    let viewDefined = viewColumns.concat(viewMetrics)
    // Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
    // console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
    // console.log(Resource.dataGroup.getColumnProperties(0));
    Resource.dataViewGrouped.setColumns(viewDefined);
    // console.info('DataView', Resource.dataViewGrouped);
    Resource.DOMref.draw(Resource.dataViewGrouped, Resource.json.wrapper.options);
    // Resource.DOMref.draw(Resource.dataViewGrouped, options);
  }

  app.setDashboardBind = () => {
    let bind = [];
    document.querySelectorAll('#filter_div .filter-container').forEach((container, index) => {
      let subBind = [];
      subBind.push(index);
      const nextFilter = container.nextElementSibling;
      if (nextFilter) {
        subBind.push(index + 1);
        bind.push(subBind);
      }
    });
    Resource.json.bind = bind;
    app.specsSave();
  }

  app.btnRemoveFilter = (e) => {
    const filterId = e.target.dataset.id;
    // const f = Resource.json.filters.find(filter => filter.containerId === filterId);
    // Cerco, con findIndex(), l'indice corrispondente all'elemento da rimuovere
    const index = Resource.json.filters.findIndex(filter => filter.containerId === filterId);
    Resource.json.filters.splice(index, 1);
    // lo rimuovo anche dal DOM
    const filterRef = document.getElementById(filterId);
    filterRef.parentElement.remove();
    app.setDashboardBind();
    app.specsSave();
  }

  // end onclick events

  // onclose dialogs
  // reset dei layout già presenti, verrano ricreati all'apertura della dialog
  app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

  // reset sheets
  app.dlgChartSection.onclose = () => document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());

  // Drag events
  app.filterDragStart = (e) => {
    // console.log('dragStart');
    console.log(e.target.id);
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.filterDragEnter = (e) => {
    // console.log('dragEnter');
    e.preventDefault();
    if (e.target.classList.contains('dropzone')) {
      e.target.classList.add('dropping');
    } else {
      console.log('non in dropzone');
      e.dataTransfer.dropEffect = 'none';
    }
  }

  app.filterDragOver = (e) => {
    // console.log('dragOver');
    e.preventDefault();
    // console.log(e.target);
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  app.filterDragLeave = (e) => {
    // console.log('dragLeave');
    e.preventDefault();
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  app.filterDragEnd = (e) => {
    console.log('dragEnd');
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'move') { }
  }

  app.filterDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.replace('dropping', 'dropped');
    // target corrisponde all'elemento .preview-filter, mentre currentTarget corrisponde al
    // contenitore del filtro
    // console.log(e.target);
    // console.log(e.currentTarget);
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const parentDiv = document.getElementById('filter_div');
    // id filtro che sto draggando (flt-0, flt-1, ecc...)
    const elementId = e.dataTransfer.getData('text/plain');
    // elementRef è l'elemento che sto spostando "newFilter"...
    const elementRef = document.getElementById(elementId);
    // ...questo elemento lo devo inserire in e.currentTarget
    // sostituendo quello già presente in e.currentTarget
    const oldFilter = e.currentTarget.querySelector('.preview-filter');
    // ... oldFilter lo inserisco nel .filter-container di provenienza
    parentDiv.insertBefore(elementRef.parentElement, oldFilter.parentElement);
    // Salvo tutti i filtri nell'ordine in cui sono stati spostati con drag&drop
    Resource.json.filters = [];
    parentDiv.querySelectorAll('.filter-container').forEach(filter => {
      const filterDiv = filter.querySelector('.preview-filter');
      Resource.json.filters.push({
        containerId: filterDiv.id,
        filterColumnLabel: filterDiv.innerText,
        caption: filterDiv.innerText
      });
    });
    console.log(Resource.json);
    // debugger;
    app.specsSave();
  }

  // End Drag events

  app.titleRef.addEventListener('blur', (e) => {
    e.target.dataset.value = e.target.innerHTML;
  });

})();
