var App = new Application();
var Template = new Templates();
var Dashboard = new Dashboards(); // istanza della Classe Dashboards, da inizializzare quando ricevuti i dati dal datamart
var Storage = new SheetStorages();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    // dialogs
    dlgTemplateLayout: document.getElementById('dlg-template-layout'),
    dlgSheets: document.getElementById('dlg-sheets'),
    dlgChartSection: document.getElementById('dlg-chart'),
    dlgConfig: document.getElementById('dlg-config'),
  }

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
  // TODO: utilizzare questa logica anche sulle altre pagine
  App.init();

  // onclick events
  app.save = (e) => {
    console.log(e.target);
    const title = document.getElementById('title').value;
    const note = document.getElementById('note').value;
    debugger;
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
    console.log(template);

    // creo l'anteprima nel DOM, questa anteprima è interattive, quindi da
    // qui si può "creare" il json template report
    Template.create();
    // aggiungo il tasto + nel #filter_div
    // TODO: valutare se aggiungere questi elementi nel template (che però è lo stesso template utilizzato
    // per il dashboard reale)
    const chartSection = document.querySelector('.preview #chart_div');
    const btnAddChart = document.createElement('button');
    btnAddChart.innerText = 'Add Chart';
    btnAddChart.addEventListener('click', app.addChart);
    chartSection.appendChild(btnAddChart);
    const btnGrouping = document.createElement('button');
    btnGrouping.innerText = 'Raggruppamento';
    btnGrouping.addEventListener('click', app.addGroup);
    chartSection.appendChild(btnGrouping);
  }

  // apertura dialog per l'aggiunta del chart o DataTable
  app.addChart = () => {
    const ul = document.getElementById('ul-sheets');
    // carico elenco sheets del localStorage
    for (const [token, sheet] of Object.entries(Storage.getSheets())) {
      // console.log(token, sheet);
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.token = sheet.token;
      li.dataset.label = sheet.name;
      li.addEventListener('click', app.sheetSelected);
      li.dataset.elementSearch = 'sheets';
      span.innerText = sheet.name;
      ul.appendChild(li);
    }
    app.dlgChartSection.showModal();
  }

  app.dashboardExample = async () => {
    // recupero l'id dello Sheet stock veicoli nuovi
    // const sheet = JSON.parse(window.localStorage.getItem('hdkglro')); // stock
    const sheet = JSON.parse(window.localStorage.getItem('59yblqr')); // cb
    if (!sheet.id) return false;
    await fetch(`/fetch_api/${sheet.id}/preview`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        console.log(data);
        // debugger;
        Dashboard.data = data;
        google.charts.setOnLoadCallback(app.drawTable(sheet.token));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // Selezione del report che alimenta il chart_div
  app.sheetSelected = () => {
    app.dashboardExample();
    app.dlgChartSection.close();
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

  app.drawTable = (sheetToken) => {
    console.log(sheetToken);
    // se il json, in localStorage non esiste, verrà inizializzato in base alla proprietà #json della Classe Dashboards
    // if (localStorage.getItem('tmpl_stock')) Dashboard.json = localStorage.getItem('tmpl_stock');
    (localStorage.getItem(`template-${sheetToken}`)) ?
      Dashboard.json = localStorage.getItem(`template-${sheetToken}`) : Dashboard.json.name = `template-${sheetToken}`;
    // aggiungo i filtri se sono presenti nel json
    // Dashboard.name = `template-${sheetToken}`;
    Dashboard.json.filters.forEach(filter => app.createTemplateFilter(filter));

    Dashboard.dataTable = new google.visualization.DataTable(Dashboard.prepareDataPreview());
    // var tableRef = new google.visualization.Table(document.getElementById('chart_div'));
    Dashboard.DOMref = new google.visualization.Table(document.getElementById('chart_div'));
    // Set chart options
    const options = {
      'title': 'Stock veicoli',
      'showRowNumber': true,
      'allowHTML': true,
      'alternatingRowStyle': true,
      'width': '80vw',
      'height': 'auto',
      'page': 'enabled',
      'pageSize': 5,
      "cssClassNames": {
        "headerRow": "g-table-header",
        "tableRow": "g-table-row",
        "oddTableRow": "",
        "selectedTableRow": "",
        "hoverTableRow": "",
        "headerCell": "g-header-cell",
        "tableCell": "g-table-cell",
        "rowNumberCell": ""
      }
    };

    // La prop data.columns dovrei averla già definita nella preview dello sheet, al momento
    // commento questo 'for'
    /* for (const [key, values] of Object.entries(JSON.parse(Dashboard.dataTable.toJSON()))) {
      // key : (rows/cols)
      // values : array di object
      // creo la proprietà json.data.column del report template (file .json)
      if (key === 'cols') {
        values.forEach((value, index) => {
          // console.log(key, value);
          // value : {id: nome_colonna, label: nome_label, type: datatype}
          // Verifico se questa colonna è già presente nel template report (in localStorage)
          // Dashboard.defineColumns(value);
          if (Dashboard.json.data.columns[value.id]) {
            Dashboard.defineColumns(Dashboard.json.data.columns[value.id], index);
          } else {
            // Definisco le colonne
            Dashboard.defineColumns(value, index);
          }
        });
      }
    } */
    // window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
    // console.log(Dashboard.json);
    // console.log(Dashboard.json.data.view);
    // debugger;
    // console.log(JSON.parse(Dashboard.dataTable.toJSON()));

    Dashboard.defineGroup();
    debugger;
    Dashboard.defineMetrics();
    // Dashboard.view = new google.visualization.DataView(Dashboard.dataTable);
    // Dashboard.view.setColumns(Dashboard.json.data.view);
    // console.log(Dashboard.json);
    // debugger;
    window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));

    // nascondo la prima colonna
    // view.hideColumns([0]);
    // visualizzo le colonne _ds, come appena impostato in defineColumns()
    // Dashboard.view.setColumns(Dashboard.json.wrapper.view.columns);

    // gestione eventi
    google.visualization.events.addListener(Dashboard.DOMref, 'ready', ready);
    // la selezione della riga la imposto DOPO aver configurato la DataView.
    // Quando l'ho impostata prima l'index della riga non corrispondeva alla riga selezionata
    google.visualization.events.addListener(Dashboard.DOMref, 'select', selectRow);
    google.visualization.events.addListener(Dashboard.DOMref, 'sort', app.sort);
    // end gestione eventi

    // utilizzo della DataView
    // Dashboard.DOMref.draw(Dashboard.view, options);
    // utilizzo della DataView

    // utilizzo della DataTable
    Dashboard.DOMref.draw(Dashboard.dataTable, options);
    // utilizzo della DataTable
    function ready() {
      console.log('ready');
      // Creo la prop 'view' in json.data.view
      // Qui inserisco le colonne incluse in data.group.key/columns
      /* if (Dashboard.json.data.view.length !== 0) {
        Dashboard.json.data.view = Dashboard.json.data.view;
      } else {
        Dashboard.json.data.view = Dashboard.json.data.group.key.concat(Dashboard.json.data.group.columns);
      } */
    }

    function selectRow() {
      // WARN: ottengo la selezione corretta solo dopo che l'evento ready si è verificato, da rivedere
      console.log(Dashboard.DOMref.getSelection());
    }
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
    Dashboard.json.bind = bind;
  }

  app.btnRemoveFilter = (e) => {
    const filterId = e.target.dataset.id;
    // const f = Dashboard.json.filters.find(filter => filter.containerId === filterId);
    // Cerco, con findIndex(), l'indice corrispondente all'elemento da rimuovere
    const index = Dashboard.json.filters.findIndex(filter => filter.containerId === filterId);
    Dashboard.json.filters.splice(index, 1);
    // lo rimuovo anche dal DOM
    const filterRef = document.getElementById(filterId);
    filterRef.parentElement.remove();
    app.setDashboardBind();
    window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
  }

  // event proveniente dalla Dashboard
  app.sort = (e) => {
    // console.log(e);
    Dashboard.columnIndex = e['column'];
    // TODO: potrei inserire tutto il resto della funzione in onopen della dialog

    // const columnName = Dashboard.view.getColumnId(Dashboard.columnIndex);
    // const columnLabel = Dashboard.view.getColumnLabel(Dashboard.columnIndex);
    const columnName = Dashboard.dataTable.getColumnId(Dashboard.columnIndex);
    const columnLabel = Dashboard.dataTable.getColumnLabel(Dashboard.columnIndex);
    // imposto, nella 'select #field-datatype' il dataType della colonna selezionata
    const selectDataType = document.getElementById('field-datatype');
    const chkboxFilter = document.getElementById('filter-column');
    const chkboxHide = document.getElementById('hide-column');
    const groupColumn = document.getElementById('group-column');
    const selectFormatter = document.getElementById('field-format');
    console.log(Dashboard.columnIndex, columnName);
    // console.log(Dashboard.view.getColumnProperties(Dashboard.columnIndex));
    // console.log(data.getColumnProperty(1));
    // TODO: Popolo la dialog in base ai valori, per questa colonna, trovati in Dashboard.json
    console.log(Dashboard.json.data.columns[columnName]);
    // document.getElementById('field-label').value = columnName;
    document.getElementById('field-label').value = Dashboard.json.data.columns[columnName].label;
    // dataType
    // recupero il dataType della colonna selezionata dall'object Dashboard.json.data.columns[columnIndex]
    // selectDataType.selectedIndex = 2;
    // console.log(selectDataType.options);
    [...selectDataType.options].forEach((option, index) => {
      // console.log(index, option);
      if (option.value === Dashboard.json.data.columns[columnName].type) {
        selectDataType.selectedIndex = index;
      }
    });
    // NOTE: utilizzo di selectedIndex

    // selectDataType.selectedIndex = 2;
    // console.log(selectDataType.options);
    /* [...selectDataType.options].forEach((option, index) => {
      // console.log(index, option);
      if (option.value === Dashboard.view.getColumnType(Dashboard.columnIndex)) {
        selectDataType.selectedIndex = index;
      }
    }); */

    // se la colonna è stata nascosta, il columnName non è presente nell'array json.wrapper.view.columns
    // if (!Dashboard.json.wrapper.view.columns.includes(columnName)) hideCheckbox.checked = true;
    // TODO: recupero la formattazione della colonna
    if (Dashboard.json.data.formatter[Dashboard.columnIndex]) {
      // formattazione presente su questa colonna
      [...selectFormatter.options].forEach((option, index) => {
        // console.log(index, option);
        if (option.value === Dashboard.json.data.formatter[Dashboard.columnIndex].format) {
          selectFormatter.selectedIndex = index;
        }
      });
    }

    console.log(Dashboard.json.data.group.columns);
    // Verifico se la colonna selezionata è presente in .json.data.group.key/columns
    // Se presente in 'key' è stata "contrassegnata" come colonna da raggruppare, se
    // presente in 'columns' è "contrassegnata" come metrica.
    let metricIndex = Dashboard.json.data.group.columns.findIndex(el => el.column === Dashboard.columnIndex);
    let columnIndex = Dashboard.json.data.group.key.indexOf(Dashboard.columnIndex);
    // se la colonna selezionata è presente in uno dei due array la chkbox è false (non selezionata)
    // altrimenti risulta selezionata, quindi come "colonna nascosta".
    chkboxHide.checked = (metricIndex !== -1 || columnIndex !== -1) ? false : true;

    // group checkbox
    groupColumn.checked = (Dashboard.json.data.group.key.includes(Dashboard.columnIndex)) ? true : false;

    // recupero la proprietà della checkbox #filter-column se questa colonna è stata impostata come filtro
    // find restituisce il primo elemento trovato in base al test della funzione fornita
    // NOTE: utilizzo di find() su un array
    const filterCheckbox = Dashboard.json.filters.find(filterProperty => filterProperty.filterColumnLabel === columnLabel);
    if (filterCheckbox) chkboxFilter.checked = true;
    app.dlgConfig.showModal();
  }

  app.chartSettings = () => app.dlgConfig.showModal();

  // Salvataggio della configurazione colonna dalla dialog dlg-config
  app.btnSaveColumn = () => {
    // console.log(Dashboard.dataTable);
    // const column = Dashboard.view.getColumnId(Dashboard.columnIndex); // nome colonna
    const column = Dashboard.dataTable.getColumnId(Dashboard.columnIndex); // nome colonna
    // input label
    const label = document.getElementById('field-label').value;
    // dataType
    const typeRef = document.getElementById('field-datatype');
    // formattazione colonna
    const formatterRef = document.getElementById('field-format');
    const hideColumn = document.getElementById('hide-column');
    const groupColumn = document.getElementById('group-column');
    const filterColumn = document.getElementById('filter-column');
    // console.log(typeRef.selectedIndex);
    // console.log(typeRef.options.item(typeRef.selectedIndex).value);
    const type = typeRef.options.item(typeRef.selectedIndex).value.toLowerCase();
    // aggiorno Dashboard.json con i valori inseriti nella #dlg-config
    Dashboard.json.data.columns[column].label = label;
    Dashboard.json.data.columns[column].type = type;
    if (formatterRef.selectedIndex !== 0) {
      const format = formatterRef.options.item(formatterRef.selectedIndex).value;
      Dashboard.json.data.formatter[Dashboard.columnIndex] = { format, numberDecimal: 2 };
    }
    // raggruppameneto e visualizzazione (funzione group() di Google Chart)
    // Le colonne impostate nel raggruppamento determinano anche la visualizzazione
    // sulla dashboard, per cui, vengono visualizzate solo le colonne raggruppate
    function compareNumbers(a, b) { return a - b; }
    debugger;
    const groupIndex = Dashboard.json.data.group.key.indexOf(Dashboard.columnIndex);
    if (groupColumn.checked === true) {
      // aggiungo questa colonna al raggruppamento, se già non è presente
      if (groupIndex === -1) {
        // group per questa colonna non presente, lo aggiungo
        // console.log(Dashboard.columnIndex);
        Dashboard.json.data.group.key.push(Dashboard.columnIndex);
        Dashboard.json.data.group.key.sort(compareNumbers);
      }
    } else {
      // elimina il raggruppamento per questa colonna
      // cerco l'indice con il valore = columnIndex
      // const index = Dashboard.json.data.group.key.indexOf(Dashboard.columnIndex);
      if (groupIndex !== -1) Dashboard.json.data.group.key.splice(groupIndex, 1);
    }

    // Colonne da nascondere
    // const hideIndex = Dashboard.json.data.view.indexOf(Dashboard.columnIndex);
    debugger;
    if (hideColumn.checked === true) {
      // TODO: da implementare
      // se la colonna selezionata è una metrica la contrassegno come hide: true, aggiungendo una
      // prop all'interno dell'object
      let metricIndex = Dashboard.json.data.group.columns.findIndex(el => el.column === Dashboard.columnIndex);
      if (metricIndex !== -1) {
        // si sta nascondendo una metrica
        Dashboard.json.data.group.columns[metricIndex].hidden = true;
      }
      /* Dashboard.json.data.view.splice(hideIndex, 1);
      Dashboard.json.data.view.sort(compareNumbers); */
    } else {
      /* // Colonna da visualizzare, aggiungo l'indice della colonna a json.data.view
      if (hideIndex === -1) {
        Dashboard.json.data.view.push(Dashboard.columnIndex);
        Dashboard.json.data.view.sort(compareNumbers);
      } */
    }
    // aggiungo, a view, solo le colonne che NON hanno la prop hidden: true
    let view = [];
    Dashboard.json.data.group.key.forEach(col => view.push(col));
    Dashboard.json.data.group.columns.forEach(col => { if (!col.hidden) view.push(col); });
    console.log(view);

    if (filterColumn.checked === true) {
      // Proprietà Dashboard.json.filters
      // Inserisco il filtro solo se non è ancora presente in Dashboard.json.filters
      const index = Dashboard.json.filters.findIndex(filter => filter.containerId === `flt-${label}`);
      if (index === -1) {
        // non è presente, lo aggiungo
        Dashboard.json.filters.push({
          containerId: `flt-${label}`,
          filterColumnLabel: label,
          caption: label
        });
        // Aggiungo al DOM, nella sezione #filter_div, il template 'template-filter'.
        // L'elemento aggiunto potrà essere spostato (drag&drop) per consentire l'ordinamento dei
        // vari filtri creati nella pagina di dashboard
        app.createTemplateFilter({
          containerId: `flt-${label}`,
          filterColumnLabel: label,
          caption: label
        });
        // stabilisco il bind per i filtri, ogni filtro segue quello successivo
        app.setDashboardBind();
      }
    } else {
      // rimozione del filtro, se presente
      const index = Dashboard.json.filters.findIndex(filter => filter.containerId === `flt-${label}`);
      if (index !== -1) {
        Dashboard.json.filters.splice(index, 1);
        // lo rimuovo anche dal DOM
        const filterRef = document.getElementById(`flt-${label}`);
        filterRef.parentElement.remove();
        app.setDashboardBind();
      }
    }

    Dashboard.json.wrapper.chartType = 'Table';
    Dashboard.json.wrapper.containerId = 'chart_div';
    // metto in un array "temporaneo" tutte le colonne, quelle impostate come nascoste, con
    // la prop 'hidden': true non verranno messe in questo array perchè è l'array che userò nel merge
    // per creare .json.data.view
    Dashboard.json.data.view = view;
    console.log(Dashboard.json);
    debugger;
    window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
    app.dlgConfig.close();
  }

  // end onclick events

  // onclose dialogs
  // reset dei layout già presenti, verrano ricreati all'apertura della dialog
  app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

  // reset sheets
  app.dlgChartSection.onclose = () => document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());

  app.dlgConfig.onclose = () => {
    document.getElementById('hide-column').checked = false;
    document.getElementById('filter-column').checked = false;
  }
  // end onclose dialogs
  //
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
    Dashboard.json.filters = [];
    parentDiv.querySelectorAll('.filter-container').forEach(filter => {
      const filterDiv = filter.querySelector('.preview-filter');
      Dashboard.json.filters.push({
        containerId: filterDiv.id,
        filterColumnLabel: filterDiv.innerText,
        caption: filterDiv.innerText
      });
    });
    console.log(Dashboard.json);
    // debugger;
    window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
  }

  // End Drag events

})();
