console.info('init-sheet');
const dlgConfig = document.getElementById('dlg-sheet-config');
const btnSheetPreview = document.getElementById("btn-sheet-preview");
const btnSQLPreview = document.getElementById("btn-sql-preview");
const saveColumnConfig = document.getElementById('btn-column-save');
const tmplList = document.getElementById('tmpl-li');


const config = { attributes: true, childList: false, subtree: false };
const callback = (mutationList, observer) => {
  // console.log(mutationList);
  for (const mutation of mutationList) {
    if (mutation.type === "attributes") {
      // console.log(`${mutation.attributeName} attributo è stato modificato.`);
      // console.log(mutation.target.dataset.error);
      if (mutation.target.dataset.error === "true") {
        console.error("Error");
        btnSheetPreview.disabled = true;
        btnSQLPreview.disabled = true;
      } else {
        btnSheetPreview.disabled = false;
        btnSQLPreview.disabled = false;
      }
    }
  }
};
const observerList = new MutationObserver(callback);
observerList.observe(document.getElementById('dropzone-columns'), config);
observerList.observe(document.getElementById('dropzone-rows'), config);
observerList.observe(document.getElementById('dropzone-filters'), config);

google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });

function updatedSheet() {
  // la 'updated_at' dello sheet deve essere aggiornata perchè viene modificato lo Sheet
  const sheet = SheetStorage.sheet;
  sheet.updated_at = new Date().toLocaleDateString('it-IT', Sheet.options);
  SheetStorage.save(sheet);
}

let app = {
  number: function(properties) {
    return new google.visualization.NumberFormat(properties);
    // TEST: per provare il colore sui numeri negativi (non funziona, da rivedere 20.09.2024)
    /* const prop = {
      fractionDigits: 0,
      negativeColor: 'red',
      negativeParens: true,
      groupingSymbol: '.',
      // suffix: ' €'
    };
    return new google.visualization.NumberFormat(prop); */

  }
}

function loadColumnsLeftSide(columns) {
  const ulColumnsHandler = document.getElementById('ul-columns-handler');
  ulColumnsHandler.querySelectorAll('li').forEach(el => el.remove());
  columns.forEach((col, index) => {
    const tmplContent = tmplList.content.cloneNode(true);
    const li = tmplContent.querySelector('li');
    // const span = li.querySelector('span');
    const regex = new RegExp('_id$');
    // in questo elenco non aggiungo le colonne _id e le metriche con 'dependencies':true.
    // Le colonne _id sono automaticamente nascoste dalla DataTable, anche se sono
    // presenti nel func group() (json.data.group.key)
    // se è una metrica con 'dependencies' : true non devo aggiungerla alla ul
    const metric = Resource.specs.data.group.columns.find(metric => (metric.alias === col.id && metric.dependencies === false));
    if (!regex.test(col.id) || metric) {
      // se la colonna è nascosta, imposto il dataset.hidden = true
      const column = Resource.specs.data.group.key.find(column => (column.id === col.id));
      if (column) li.dataset.visible = column.properties.visible;
      if (metric) li.dataset.visible = metric.properties.visible;
      if (column || metric) {
        // se è una colonna _ds oppure una metrica 'dependencies':false la aggiungo alla ul
        li.innerText = col.id;
        li.dataset.columnId = col.id;
        li.dataset.index = index;
        li.addEventListener('click', columnHander);
        ulColumnsHandler.appendChild(li);
      }
    }
  });
}


function drawDatamart() {
  // Il dato iniziale non è raggruppato, la query sul datamart è eseguita con SELECT *...
  // La preview deve consentire la personalizzazione del report, quindi la possibilità
  // di nascondere/visualizzare una colonna e decidere anche il raggruppamento per i
  // livelli dimensionali
  const prepareData = Resource.prepareData();
  // ciclo il prpareData.cols per aggiungere l'elenco delle colonne in #ul-columns-handler.
  // Da questo elenco si potranno nascondere/visualizzare le colonne e le metreehe
  const ulColumnsHandler = document.getElementById('ul-columns-handler');
  ulColumnsHandler.querySelectorAll('li').forEach(el => el.remove());
  prepareData.cols.forEach((col, index) => {
    const tmplContent = tmplList.content.cloneNode(true);
    const li = tmplContent.querySelector('li');
    // const span = li.querySelector('span');
    const regex = new RegExp('_id$');
    // in questo elenco non aggiungo le colonne _id e le metriche con 'dependencies':true.
    // Le colonne _id sono automaticamente nascoste dalla DataTable, anche se sono
    // presenti nel func group() (json.data.group.key)
    // se è una metrica con 'dependencies' : true non devo aggiungerla alla ul
    const metric = Resource.specs.data.group.columns.find(metric => (metric.alias === col.id && metric.dependencies === false));
    if (!regex.test(col.id) || metric) {
      // se la colonna è nascosta, imposto il dataset.hidden = true
      const column = Resource.specs.data.group.key.find(column => (column.id === col.id));
      if (column) li.dataset.visible = column.properties.visible;
      if (metric) li.dataset.visible = metric.properties.visible;
      if (column || metric) {
        // se è una colonna _ds oppure una metrica 'dependencies':false la aggiungo alla ul
        li.innerText = col.id;
        li.dataset.columnId = col.id;
        li.dataset.index = index;
        li.addEventListener('click', columnHander);
        ulColumnsHandler.appendChild(li);
      }
    }
  });
  Resource.dataTable = new google.visualization.DataTable(prepareData);
  // var tableRef = new google.visualization.Table(document.getElementById(Resource.ref));
  Resource.tableRef = new google.visualization.Table(Resource.ref);
  // effettuando il calcolo del margine ((ricavo-costo)/ricavo*100) qui, cioè prima della
  // funzione di group(), il risultato non è corretto, questi calcoli vanno effettuati con una
  // DataView DOPO la function group()
  // imposto le opzioni per la dataTable
  Resource.options = {
    title: 'titolo report',
    showRowNumber: false,
    allowHTML: true,
    frozenColumns: 0,
    page: 'enable',
    pageSize: 100,
    // scrollLeftStartPosition: 300,
    alternatingRowStyle: true,
    // sort: 'event',
    width: '100%',
    height: '100%',
    cssClassNames: {
      headerRow: "g-tableHeader",
      tableRow: "g-tableRow",
      oddTableRow: "g-oddRow",
      selectedTableRow: "g-selectedRow",
      hoverTableRow: "g-hoverRow",
      headerCell: "g-headerCell",
      tableCell: "g-tableCell",
      rowNumberCell: "g-rowNumberCell"
    }
  };
  // NOTE: prova impostazione CSS su una colonna
  // Resource.dataTable.setColumnProperty(1, 'className', 'cssc1')
  // Resource.dataTable.setColumnProperty(2, 'className', 'cssc1')
  // Resource.dataTable.setColumnProperty(3, 'className', 'cssc1')
  // console.log(Resource.dataTable.getColumnProperty(1, 'className'));
  // console.log(Resource.dataTable.getColumnProperties(1));
  // END NOTE: prova impostazione CSS su una colonna

  // L'evento 'ready' genera un'ulteriore visualizzazione della dataTable.
  // In questa funzione andrò a creare la DataView, necessaria per poter
  // aggiungere/rimuovere colonne. Prima di creare la DataView viene effettuata
  // una group(), questa consente di raggruppare la visualizzazione in base ai livelli
  // dimensionali scelti (aggiunta/rimozione di livelli dimensionali)
  // tableRef.clearChart();
  google.visualization.events.addListener(Resource.tableRef, 'ready', previewReady);

  Resource.tableRef.draw(Resource.dataTable, Resource.options);
}

function previewReady() {
  // Imposto un altro riferimento a tableRef altrimenti l'evento ready si attiva ricorsivamente (errore)
  // Resource.tableRefGroup = new google.visualization.Table(document.getElementById(Resource.ref));
  Resource.tableRefGroup = new google.visualization.Table(Resource.ref);
  // console.log('group.key:', Resource.specs.data.group.key);
  // trasformo il data.group.key in un array di indici di colonne (anche se potrebbe funzionare
  // anche con un object, da rivedere su Google Chart)
  // Questo è il secondo param della funzione group() e, in questo array sono incluse
  // anche le colonne _id
  // let keyColumns = [];
  // keyColumns conterrà gli index delle colonne (recuperandoli da
  // json.data.group.key) per le quali il report viene raggruppato.
  // Questo consente di fare i calcoli per le metriche composte sui dati raggruppati
  /* Resource.specs.data.group.key.forEach(column => {
    // if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
    // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
    // che viene modificata dall'utente a runtime
    if (column.properties.grouped) {
      keyColumns.push({ id: column.id, column: Resource.dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
    }
  }); */
  Resource.groupFunction();
  // imposto qui il metodo group() perchè per la dashboard è diverso (viene usato il ChartWrapper)
  Resource.dataGroup = new google.visualization.data.group(
    Resource.dataTable, Resource.groupKey, Resource.groupColumn
  );
  console.log('dataGroup : ', Resource.dataGroup);
  // debugger;
  // creo l'object che verrà messo nel terzo param di group()
  // Es.: { column: 16, aggregation: google.visualization.data.sum, type: 'number' },
  // le metriche che hanno la proprietà dependencies: true, sono quelle NON aggiunte DIRETTAMENTE
  // al report ma "dipendono" da quelle composite, quindi creo l'array con le sole colonne
  // da visualizzare nel report, prendendo i dati da 'data.group.columns'
  // let groupColumnsIndex = [];
  /* Resource.specs.data.group.columns.forEach(metric => {
    // salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
    // quali dovranno essere visibili (quelle con dependencies:false)
    // recupero l'indice della colonna in base al suo nome
    const index = Resource.dataTable.getColumnIndex(metric.alias);
    // TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
    const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
    let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', label: metric.label };
    groupColumnsIndex.push(object);
  }); */
  // console.log(groupColumnsIndex);
  // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
  /* Resource.dataGroup = new google.visualization.data.group(
    Resource.dataTable, keyColumns, groupColumnsIndex
  ); */
  // for (const [key, value] of Object.entries(Resource.specs.data.formatter)) {
  //   let formatter = app[value.type](value.prop);
  //   formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(key));
  // }
  Resource.specs.data.group.columns.forEach(metric => {
    let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
    formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
  });
  // console.log('dataGroup():', Resource.dataGroup);
  // console.log(Resource.dataGroup.getColumnIndex())
  // Imposto le label memorizzate in group.key. In questo caso potrei utilizzare gli object da passare
  // a group(), invece degli indici, per le colonne, è la stessa logica utilizzata per le metriche.
  // Utilizzando un object al posto degli indici potrei impostare la prop 'label' direttamente nell'object
  // invece di fare questo ciclo...
  // Resource.specs.data.group.key.forEach(column => {
  //   Resource.dataGroup.setColumnLabel(Resource.dataTable.getColumnIndex(column.id), column.label);
  // });
  // console.log(Resource.dataGroup);
  // Formattazione colonne
  // debugger;

  // TEST: aggiunta di una CSS class a una colonna, nella dataGroup
  // Resource.dataGroup.setColumnProperty(1, 'className', 'cssc1')
  // console.log(Resource.dataGroup.getColumnProperty(1, 'className'));

  // DataView, mi consente di visualizzare SOLO le colonne definite nel report ed
  // effettuare eventuali calcoli per le metriche composite ('calc')
  Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  console.log('DataViewGrouped :', Resource.dataViewGrouped);

  // TEST: recupero gli indici delle colonne area_ds, zona_ds (colonna da visualizzare)
  // console.log('costo_rapporto_6 (index):', Resource.dataGroup.getColumnIndex('costo_rapporto_6'));
  // console.log('costo_rapporto_2 (index):', Resource.dataGroup.getColumnIndex('costo_rapporto_2'));
  // console.log('ricavo_rapporto_2 (index):', Resource.dataGroup.getColumnIndex('ricavo_rapporto_2'));
  // console.log('area_ds index : ', Resource.dataTable.getColumnIndex('area_ds'));
  // console.log('zona_ds index : ', Resource.dataTable.getColumnIndex('zona_ds'));
  // per le colonne dimensionali, potrei recuperare gli indici, da mettere in DataView.setColumns()
  // con il getColumnId() sulla dataGroup
  // console.log(Resource.dataGroup.getColumnId(3));
  // console.log(Resource.dataGroup.getColumnIndex('zona'));
  // END TEST

  // recupero le colonne presenti nel report, tramite le impostazioni di
  // json.data.view (contiene i nomi delle colonne "_ds", da visualizzare)
  // e json.data.group.columns (contiene le metriche, con dependencies:false)
  // che saranno visualizzate nella preview.
  // In .data.view sono presenti tutte le colonne del report, tramite la
  // prop 'visible' (bool) posso decidere di visualizzarla/nascondere a seconda della scelta
  // dell'utente.
  // Dalla dataGroup, recupero gli indici delle colonne impostato con 'visible:true'
  // Resource.specs.data.view.forEach(column => {
  //   if (column.properties.visible) viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
  // });
  let viewColumns = [], viewMetrics = [];
  Resource.specs.data.group.key.forEach(column => {
    if (column.properties.visible) {
      viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
      // imposto la classe per le colonne dimensionali
      Resource.dataGroup.setColumnProperty(Resource.dataGroup.getColumnIndex(column.id), 'className', 'dimensional-column');
    }
  });
  // dalla dataGroup, recupero gli indici di colonna delle metriche
  Resource.specs.data.group.columns.forEach(metric => {
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
        // converto le composeMetrics in array per poterlo facilmente confrontare in formula.forEach...
        // Creo una Func "dinamica"
        let calcFunction = function(dt, row) {
          let formulaJoined = [];
          // in formulaJoined ciclo tutti gli elementi della Formula, imposto i
          // valori della DataTable, con getValue(), recuperandoli con getColumnIndex(nome_colonna)
          formula.forEach(formulaEl => {
            // TEST: logica 2
            // verifico se l'elemento in ciclo, della formula, è una metrica
            // se l'indice della colonna è presente (!== -1) ne recupero il valore
            if (dt.getColumnIndex(formulaEl) !== -1) {
              formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl)));
            } else {
              // altrimenti aggiungo nella formula le altre componenti, come le parentesi ad esempio e gli operatori per il calcolo
              formulaJoined.push(formulaEl);
            }
            // TEST: logica 1
            // Con questa logica la proprietà 'formula' è composta con gli object dove sono presenti metriche:
            // "formula":["((",{"token":"x9atpa7","alias":"ricavo_ve_cb"},"-",{"token":"7eaac8j","alias":"costo_ve_cb"},")","/",{"token":"x9atpa7","alias":"ricavo_ve_cb"},")","*","100"],
            /* if (formulaEl.alias) {
              // if (metric.alias === 'marginalita') {
              //   console.log(dt);
              //   console.log(formulaEl.alias, dt.getValue(row, dt.getColumnIndex(formulaEl.alias)));
              //   console.log('ricavo_rapporto_2', dt.getValue(row, dt.getColumnIndex('ricavo_rapporto_2')));
              // }
              if (metric.alias === 'marginalita_test_2') console.log('getColumnIndex : ', dt.getColumnIndex(formulaEl.alias));
              formulaJoined.push(dt.getValue(row, dt.getColumnIndex(formulaEl.alias)));
            } else {
              formulaJoined.push(formulaEl);
            } */
          });
          // La funzione eval() è in grado di eseguire operazioni con valori 'string' es. eval('2 + 2') = 4.
          // Quindi inserisco tutto il contenuto della stringa formulaJoined in eval(), inoltre
          // effettuo un controllo sul risultato in caso fosse NaN
          const result = (isNaN(eval(formulaJoined.join(' ')))) ? 0 : eval(formulaJoined.join(' '));
          // if (metric.alias === 'marginalita') console.log(formulaJoined, result);
          let total = (result) ? { v: result } : { v: result, f: '-' };
          // console.log(result);
          // const result = (isNaN(eval(formulaJoined.join('')))) ? null : eval(formulaJoined.join(''));
          // formattazione della cella con formatValue()
          const formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
          const resultFormatted = (result) ? formatter.formatValue(result) : '-';
          total = { v: result, f: resultFormatted };
          // resultFormatted = (result) ? result : '-';
          // total = (result) ? { v: result } : { v: result, f: '-' };
          return total;
        }
        viewMetrics.push({ id: metric.alias, calc: calcFunction, type: 'number', label: metric.label, properties: { className: 'col-metrics' } });
      } else {
        viewMetrics.push(index);
      }
      Resource.dataGroup.setColumnProperty(index, 'className', 'col-metrics');
      // let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
      // formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
    }
  });
  // concateno i due array che popoleranno la DataView.setColumns()
  let viewDefined = viewColumns.concat(viewMetrics)
  console.log('DataView defined:', viewDefined);
  // Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
  // console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
  // console.log(Resource.dataGroup.getColumnProperties(0));
  Resource.dataViewGrouped.setColumns(viewDefined);
  console.log('dataViewGrouped : ', Resource.dataViewGrouped);

  google.visualization.events.addListener(Resource.tableRefGroup, 'sort', sort);
  // con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
  // senza effettuare l'ordinamento.
  Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options);
}

function sort(e) {
  const labelRef = document.getElementById('field-label');
  const selectDataType = document.getElementById('field-datatype');
  const selectFormat = document.getElementById('field-format');
  const checkboxFilter = document.getElementById('filter-column');
  // l'indice della colonna nella DataView
  Resource.colIndex = e.column;
  // recupero il nome della colonna in base al suo indice
  Resource.columnId = Resource.dataViewGrouped.getColumnId(Resource.colIndex);
  console.log('index della dataView', Resource.colIndex);
  console.log('column id : ', Resource.columnId);
  // Resource.dataGroupIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
  // Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  // Indice della colonna nella DataTable sottostante in base alla selezione
  // di una colonna nella DataView
  // BUG: non vengono trovati gli indici delle metriche composte (questo è segnalato anche su GoogleChart in getTableColumnIndex che parla di colonne generate)
  Resource.dataTableIndex = Resource.dataViewGrouped.getTableColumnIndex(Resource.colIndex);

  // NOTE: getViewColumnIndex() resituisce l'indice della DataView impostata
  // con setColumns(), il valore passato è l'indice della dataTable
  // se setColumns([1,3,5,7]) getViewColumnIndex(7) restituisce 4
  // Resource.dataViewIndex = Resource.dataViewGrouped.getViewColumnIndex(7);
  console.log('index della dataTable', Resource.dataTableIndex);
  // console.log('index della dataGroup', Resource.dataGroupIndex);

  // etichetta colonna, questa viene impostata nella dlg-sheet-config
  console.log(Resource.dataViewGrouped.getColumnLabel(Resource.colIndex));
  Resource.columnLabel = Resource.dataViewGrouped.getColumnLabel(Resource.colIndex);
  labelRef.value = Resource.columnLabel;
  // recupero il dataType della colonna selezionata dall'object Resource.specs.data.columns[columnId]
  // selectDataType.selectedIndex = 2;
  // console.log(selectDataType.options);
  [...selectDataType.options].forEach((option, index) => {
    // console.log(Resource.dataViewGrouped.getColumnType(Resource.colIndex));
    // console.log(Resource.dataViewGrouped.getColumnProperties(Resource.colIndex));
    if (option.value === Resource.dataViewGrouped.getColumnType(Resource.colIndex)) {
      selectDataType.selectedIndex = index;
    }
  });
  // recupero la formattazione impostata per la colonna
  // al momento la formattazionie è impostata solo sulle metriche
  const metric = Resource.specs.data.group.columns.find(metric => metric.alias === Resource.columnId);
  if (metric) {
    selectFormat.selectedIndex = 0; // default
    [...selectFormat.options].forEach((option, index) => {
      // console.log(index, option);
      if (option.value === metric.properties.formatter.format) {
        selectFormat.selectedIndex = index;
      }
    });
  }
  // recupero l'informazione .json.filter (colonna impostata come filtro)
  if (Resource.specs.filters.find(name => name.filterColumnLabel === Resource.columnLabel)) {
    // colonna impostata come filtro
    checkboxFilter.checked = true;
  } else {
    checkboxFilter.checked = false;
  }
  dlgConfig.show();
}

// Salvataggio della configurazione colonna dalla dialog dlg-config
saveColumnConfig.onclick = () => {
  // console.log(Resource.dataTable);
  console.log({
    "dataTable (index)": Resource.dataTableIndex,
    "dataView (index)": Resource.colIndex,
    "id": Resource.columnId, "label": Resource.columnLabel
  });
  // input label
  const label = document.getElementById('field-label').value;
  // dataType
  const typeRef = document.getElementById('field-datatype');
  // formattazione colonna
  const formatterRef = document.getElementById('field-format');
  const filterColumn = document.getElementById('filter-column');
  const type = typeRef.options.item(typeRef.selectedIndex).value.toLowerCase();
  const format = formatterRef.options.item(formatterRef.selectedIndex).value;
  const fractionDigits = +document.getElementById('frationDigits').value;
  let formatterProperties = {};

  // Resource.dataGroup.setColumnLabel(Resource.dataTableIndex, label);
  console.log(Resource.dataGroup.getColumnIndex(Resource.columnId));
  const dataGroupIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
  Resource.dataGroup.setColumnLabel(dataGroupIndex, label);
  // Resource.dataGroup.setColumnLabel(Resource.colIndex, label);
  debugger;
  // TODO: ipostazione del numero dei decimali
  switch (format) {
    case 'default':
      // numero senza decimali e con separatore migliaia
      formatterProperties = { negativeParens: false, fractionDigits, groupingSymbol: '.' };
      break;
    case 'currency':
      formatterProperties = { suffix: ' €', negativeColor: 'brown', negativeParens: true, fractionDigits };
      break;
    case 'percent':
      formatterProperties = { suffix: ' %', negativeColor: 'brown', negativeParens: true, fractionDigits };
      break;
    case 'date':
      // TODO: da implementare
      // Resource.specs.data.formatter[Resource.columnId] = { format: 'date' };
      break;
    default:
      break;
  }
  // console.log(Resource.dataTable.getColumnProperties(Resource.dataTableIndex));
  const dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  const columnType = Resource.dataTable.getColumnProperty(dataTableIndex, 'data');
  if (columnType === 'column') {
    const column = Resource.specs.data.group.key.find(col => col.id === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (column) column.label = label;
    // column.formatter = { type, format, prop: formatterProperties };
  } else {
    const metric = Resource.specs.data.group.columns.find(metric => metric.alias === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (metric) metric.label = label;
    metric.properties.formatter = { type, format, prop: formatterProperties };
    let formatter = app[type](formatterProperties);
    formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
  }
  console.log('DataGroup:', Resource.dataGroup);
  // console.log('DataGroup:', Resource.dataGroup);

  // filtri definiti per il report
  if (filterColumn.checked === true) {
    // Proprietà Resource.specs.filters
    // Inserisco il filtro solo se non è ancora presente in Resource.specs.filters
    const index = Resource.specs.filters.findIndex(filter => filter.id === Resource.dataGroup.getColumnId(dataGroupIndex));
    if (index === -1) {
      // non è presente, lo aggiungo
      Resource.specs.filters.push({
        id: Resource.dataGroup.getColumnId(dataGroupIndex),
        containerId: `flt-${label}`,
        filterColumnLabel: label,
        caption: label
      });
    }
  } else {
    // rimozione del filtro, se presente
    const index = Resource.specs.filters.findIndex(filter => filter.id === Resource.dataGroup.getColumnId(dataGroupIndex));
    if (index !== -1) Resource.specs.filters.splice(index, 1);
  }
  // definisco il bind in base ai filtri impostati
  Resource.bind();

  // TODO: Il containerId deve essere deciso in init-dashboard-create.js
  Resource.specs.wrapper.containerId = 'chart_div';
  console.log('specifications : ', Resource.specs);
  debugger;
  const sheet = JSON.parse(window.localStorage.getItem(Resource.specs.token));
  sheet.specs = Resource.specs;
  window.localStorage.setItem(Resource.specs.token, JSON.stringify(sheet));
  // window.localStorage.setItem(Resource.specs.token, JSON.stringify(Resource.specs));
  // le metriche calcolate restituisce -1 per getTableColumnIndex, quindi devo ridisegnare il report
  // richiamando previewReady() altrimenti il metodo draw() di GoogleChart aggiorna la visualizzazione correttamente
  (Resource.dataTableIndex === -1) ?
    previewReady() : Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options);
  dlgConfig.close();
  // la 'updated_at' dello sheet deve essere aggiornata perchè viene modificato lo Sheet
  updatedSheet();
}

function columnHander(e) {
  // Stessa logica della Func 'previewReady()'
  const dataTableIndex = Resource.dataTable.getColumnIndex(e.target.dataset.columnId);
  console.log('index colonna DataTable', dataTableIndex);
  // console.log(Resource.dataTable.getColumnProperties(dataTableIndex));
  const columnType = Resource.dataTable.getColumnProperty(dataTableIndex, 'data');
  if (columnType === 'column') {
    // Recupero l'index della colonna da nascondere/visualizzare
    // index = Resource.specs.data.group.key.findIndex(col => col.id === e.target.dataset.columnId);
    if (e.target.dataset.visible === 'false') {
      // la colonna è nascosta, la visualizzo e raggruppo.
      e.target.dataset.visible = true;
      // La logica è descritta nell'else (quando si nasconde una colonna)
      Resource.specs.data.group.key[dataTableIndex - 1].properties.grouped = true;
      Resource.specs.data.group.key[dataTableIndex].properties.grouped = true;
      Resource.specs.data.group.key[dataTableIndex].properties.visible = true;
    } else {
      e.target.dataset.visible = false;
      // la colonna è visibile, la nascondo e la elimino dal group()
      // Il report è raggruppato (dataViewGrouped) in base ai livelli dimensionali
      // presenti, quando viene nascosta una colonna, anzichè eliminarla
      // dalle proprietà .json.data.group... le "contrassegno" con la prop 'grouped:false'
      // In questo modo posso ripristinarla. Insieme alla colonna che sto nascondendo, va
      // nascosta anche la sua relativa colonna _id, quindi dataTableIndex -1
      // Elimino il raggruppamento per la colonna che l'utente ha nascosto
      // se è una colonna dimensionale cerco in .group.key
      // altrimenti cerco in .group.columns
      Resource.specs.data.group.key[dataTableIndex - 1].properties.grouped = false;
      Resource.specs.data.group.key[dataTableIndex].properties.grouped = false;
      Resource.specs.data.group.key[dataTableIndex].properties.visible = false;
      // OPTIMIZE: se, invece di previewReady() provassi ad impostare i metodi hideColumn/showColumn di GoogleChart?
      // TEST: aggiorna tabella con il metodo draw()
      /* Resource.dataViewGrouped.hideColumns([dataTableIndex - 1, dataTableIndex]);
      debugger;
      Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options); */
    }
  } else {
    // metrica
    const metric = Resource.specs.data.group.columns.find(metric => metric.alias === e.target.dataset.columnId);
    if (e.target.dataset.visible === 'false') {
      // la colonna è nascosta, la visualizzo e raggruppo.
      e.target.dataset.visible = true;
      metric.properties.visible = true;
    } else {
      e.target.dataset.visible = false;
      metric.properties.visible = false;
    }
  }
  debugger;
  const sheet = JSON.parse(window.localStorage.getItem(Resource.specs.token));
  sheet.specs = Resource.specs;
  window.localStorage.setItem(Resource.specs.token, JSON.stringify(sheet));
  // window.localStorage.setItem(`specs_${Resource.specs.token}`, JSON.stringify(Resource.specs));
  // Qui dovrò sempre richiamare il previewReady() perchè devono essere ricalcolate le "colonne generate", in base al nuovo
  // raggruppamento definito qui
  previewReady();
  updatedSheet();
}
