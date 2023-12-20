const dlgConfig = document.getElementById('dlg-sheet-config');
const saveColumnConfig = document.getElementById('btn-column-save');
const tmplList = document.getElementById('tmpl-li');

function testFn() {
  debugger;
  console.log(WorkBook);
}

let app = {
  number: function(properties) {
    return new google.visualization.NumberFormat(properties);
  }
}

// TODO: spostarla nella Classe Resources
function drawDatamart() {
  // Il dato iniziale non è raggruppato, la query sul datamart è eseguita con SELECT *...
  // La preview deve consentire la personalizzazione del report, quindi la possibilità
  // di nascondere/visualizzare una colonna e decidere anche il raggruppamento per i
  // livelli dimensionali
  const prepareData = Resource.prepareData();
  // ciclo il prepareData.cols per aggiungere l'elenco delle colonne in #ul-columns-handler.
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
    const metric = Resource.json.data.group.columns.find(metric => (metric.alias === col.id && metric.dependencies === false));
    if (!regex.test(col.id) || metric) {
      // se la colonna è nascosta, imposto il dataset.hidden = true
      const column = Resource.json.data.group.key.find(column => (column.id === col.id));
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
  var tableRef = new google.visualization.Table(Resource.ref);
  // effettuando il calcolo del margine ((ricavo-costo)/ricavo*100) qui, cioè prima della
  // funzione di group(), il risultato non è corretto, questi calcoli vanno effettuati con una
  // DataView DOPO la function group()
  // imposto le opzioni per la dataTable
  Resource.options = {
    title: 'titolo report',
    showRowNumber: true,
    allowHTML: true,
    frozenColumns: 0,
    page: 'enabled',
    pageSize: 20,
    alternatingRowStyle: true,
    sort: 'event',
    width: '100%',
    height: '100%'
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
  google.visualization.events.addListener(tableRef, 'ready', previewReady);

  tableRef.draw(Resource.dataTable, Resource.options);
}

function previewReady() {
  // Imposto un altro riferimento a tableRef altrimenti l'evento ready si attiva ricorsivamente (errore)
  // Resource.tableRefGroup = new google.visualization.Table(document.getElementById(Resource.ref));
  Resource.tableRefGroup = new google.visualization.Table(Resource.ref);
  // console.log('group.key:', Resource.json.data.group.key);
  // trasformo il data.group.key in un array di indici di colonne (anche se potrebbe funzionare
  // anche con un object, da rivedere su Google Chart)
  // Questo è il secondo param della funzione group() e, in questo array sono incluse
  // anche le colonne _id
  // let keyColumns = [];
  // keyColumns conterrà gli index delle colonne (recuperandoli da
  // json.data.group.key) per le quali il report viene raggruppato.
  // Questo consente di fare i calcoli per le metriche composte sui dati raggruppati
  /* Resource.json.data.group.key.forEach(column => {
    // if (column.properties.grouped) keyColumns.push(Resource.dataTable.getColumnIndex(column.id));
    // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
    // che viene modificata dall'utente a runtime
    if (column.properties.grouped) {
      keyColumns.push({ id: column.id, column: Resource.dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
    }
  }); */
  Resource.groupFunction();
  // creo l'object che verrà messo nel terzo param di group()
  // Es.: { column: 16, aggregation: google.visualization.data.sum, type: 'number' },
  // le metriche che hanno la proprietà dependencies: true, sono quelle NON aggiunte DIRETTAMENTE
  // al report ma "dipendono" da quelle composite, quindi creo l'array con le sole colonne
  // da visualizzare nel report, prendendo i dati da 'data.group.columns'
  // let groupColumnsIndex = [];
  /* Resource.json.data.group.columns.forEach(metric => {
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
  debugger;
  for (const [key, value] of Object.entries(Resource.json.data.formatter)) {
    debugger;
    let formatter = app[value.type](value.prop);
    formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(key));
  }
  debugger;
  // console.log('group():', Resource.dataGroup);
  // console.log(Resource.dataGroup.getColumnIndex())
  // Imposto le label memorizzate in group.key. In questo caso potrei utilizzare gli object da passare
  // a group(), invece degli indici, per le colonne, è la stessa logica utilizzata per le metriche.
  // Utilizzando un object al posto degli indici potrei impostare la prop 'label' direttamente nell'object
  // invece di fare questo ciclo...
  // Resource.json.data.group.key.forEach(column => {
  //   Resource.dataGroup.setColumnLabel(Resource.dataTable.getColumnIndex(column.id), column.label);
  // });
  // console.log(Resource.dataGroup);
  // Formattazione colonne
  /* for (const [columnId, properties] of Object.entries(Resource.json.data.formatter)) {
    console.log('Formattazione ', Resource.dataGroup.getColumnIndex(columnId));
    let formatter = null;
    // debugger;
    switch (properties.type) {
      case 'number':
        formatter = app[properties.type](properties.prop);
        break;
      // case 'date':
      // TODO: Da implementare
      // let formatter = app[properties.format](properties.numberDecimal);
      // formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(columnId));
      // break;
      default:
        break;
    }
    if (formatter) formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(columnId));
  } */
  // debugger;

  // TEST: aggiunta di una CSS class a una colonna, nella dataGroup
  // Resource.dataGroup.setColumnProperty(1, 'className', 'cssc1')
  // console.log(Resource.dataGroup.getColumnProperty(1, 'className'));

  // DataView, mi consente di visualizzare SOLO le colonne definite nel report ed
  // effettuare eventuali calcoli per le metriche composite ('calc')
  Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  debugger;

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
  let viewColumns = [], viewMetrics = [];
  // In .data.view sono presenti tutte le colonne del report, tramite la
  // prop 'visible' (bool) posso decidere di visualizzarla/nascondere a seconda della scelta
  // dell'utente.
  // Dalla dataGroup, recupero gli indici delle colonne impostato con 'visible:true'
  // Resource.json.data.view.forEach(column => {
  //   if (column.properties.visible) viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
  // });
  Resource.createDataView();

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
  Resource.colIndex = e['column'];
  console.log('index della dataView', Resource.colIndex);
  // Indice della colonna nella DataTable sottostante in base alla selezione
  // di una colonna nella DataView
  Resource.dataTableIndex = Resource.dataViewGrouped.getTableColumnIndex(Resource.colIndex);
  // NOTE: getViewColumnIndex() resituisce l'indice della DataView impostata
  // con setColumns(), il valore passato è l'indice della dataTable
  // se setColumns([1,3,5,7]) getViewColumnIndex(7) restituisce 4
  // Resource.dataViewIndex = Resource.dataViewGrouped.getViewColumnIndex(7);
  console.log('index della dataTable', Resource.dataTableIndex);
  // recupero il nome della colonna in base al suo indice
  Resource.columnId = Resource.dataViewGrouped.getColumnId(Resource.colIndex);
  // etichetta colonna, questa viene impostata nella dlg-sheet-config
  Resource.columnLabel = Resource.dataViewGrouped.getColumnLabel(Resource.colIndex);
  labelRef.value = Resource.columnLabel;
  // recupero il dataType della colonna selezionata dall'object Resource.json.data.columns[columnId]
  // selectDataType.selectedIndex = 2;
  // console.log(selectDataType.options);
  [...selectDataType.options].forEach((option, index) => {
    console.log(Resource.dataViewGrouped.getColumnType(Resource.colIndex));
    // console.log(Resource.dataViewGrouped.getColumnProperties(Resource.colIndex));
    if (option.value === Resource.dataViewGrouped.getColumnType(Resource.colIndex)) {
      selectDataType.selectedIndex = index;
    }
  });
  // recupero la formattazione impostata per la colonna
  selectFormat.selectedIndex = 0; // default
  /* [...selectFormat.options].forEach((option, index) => {
    // console.log(index, option);
    if (Resource.json.data.formatter[Resource.columnId]) {
      if (option.value === Resource.json.data.formatter[Resource.columnId].format) {
        selectFormat.selectedIndex = index;
      }
    }
  }); */
  // recupero l'informazione .json.filter (colonna impostata come filtro)
  if (Resource.json.filters.find(name => name.filterColumnLabel === Resource.columnLabel)) {
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
  let formatterProperties = {};

  // const columnIndex = Resource.json.data.view.findIndex(col => col.id === Resource.columnId);
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(7, 'test');
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(3, 'test-3');
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(Resource.dataTableIndex, 'test-2');
  // cerco la colonna sia in data.group.key (colonne dimensionali) che in data.group.columns (metriche)
  // Resource.json.data.columns[Resource.columnId].label = label;

  Resource.dataGroup.setColumnLabel(Resource.dataTableIndex, label);
  switch (format) {
    case 'default':
      formatterProperties = { negativeParens: false, fractionDigits: 0, groupingSymbol: '.' };
      break;
    case 'currency':
      formatterProperties = { suffix: ' €', negativeColor: 'brown', negativeParens: true, fractionDigits: 2 };
      break;
    case 'percent':
      formatterProperties = { suffix: ' %', negativeColor: 'brown', negativeParens: true, fractionDigits: 2 };
      break;
    case 'date':
      // TODO: da implementare
      // Resource.json.data.formatter[Resource.columnId] = { format: 'date' };
      break;
    default:
      break;
  }
  // console.log(Resource.dataTable.getColumnProperties(Resource.dataTableIndex));
  const columnType = Resource.dataTable.getColumnProperty(Resource.dataTableIndex, 'data');
  if (columnType === 'column') {
    const column = Resource.json.data.group.key.find(col => col.id === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (column) column.label = label;
    column.formatter = { type, format, prop: formatterProperties };
  } else {
    const metric = Resource.json.data.group.columns.find(metric => metric.alias === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (metric) metric.label = label;
    metric.formatter = { type, format, prop: formatterProperties };
    let formatter = app[type](formatterProperties);
    formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
  }
  // filtri definiti per il report
  // TODO: da testare
  /* if (filterColumn.checked === true) {
    // Proprietà Resource.json.filters
    // Inserisco il filtro solo se non è ancora presente in Resource.json.filters
    const index = Resource.json.filters.findIndex(filter => filter.containerId === `flt-${label}`);
    if (index === -1) {
      // non è presente, lo aggiungo
      Resource.json.filters.push({
        containerId: `flt-${label}`,
        filterColumnLabel: label,
        caption: label
      });
    }
  } else {
    // rimozione del filtro, se presente
    const index = Resource.json.filters.findIndex(filter => filter.containerId === `flt-${label}`);
    if (index !== -1) {
      Resource.json.filters.splice(index, 1);
      // lo rimuovo anche dal DOM
      // const filterRef = document.getElementById(`flt-${label}`);
      // filterRef.parentElement.remove();
      // app.setDashboardBind();
    }
  } */

  // TODO: Il containerId deve essere deciso in init-dashboard-create.js
  Resource.json.wrapper.containerId = 'chart_div';
  console.log('specifications : ', Resource.json);
  // window.sessionStorage.setItem(Resource.json.token, JSON.stringify(Resource.json));
  // window.localStorage.setItem(`specs_${Resource.json.token}`, JSON.stringify(Resource.json));
  dlgConfig.close();
  // Resource.saveSpecifications();
  window.localStorage.setItem(`specs_${Resource.json.token}`, JSON.stringify(Resource.json));
  Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options);
  debugger;
  // previewReady();
}

function columnHander(e) {
  // Stessa logica della Func 'previewReady()'
  const dataTableIndex = Resource.dataTable.getColumnIndex(e.target.dataset.columnId);
  console.log('index colonna DataTable', dataTableIndex);
  // console.log(Resource.dataTable.getColumnProperties(dataTableIndex));
  const columnType = Resource.dataTable.getColumnProperty(dataTableIndex, 'data');
  if (columnType === 'column') {
    // Recupero l'index della colonna da nascondere/visualizzare
    // index = Resource.json.data.group.key.findIndex(col => col.id === e.target.dataset.columnId);
    if (e.target.dataset.visible === 'false') {
      // la colonna è nascosta, la visualizzo e raggruppo.
      e.target.dataset.visible = true;
      // La logica è descritta nell'else (quando si nasconde una colonna)
      Resource.json.data.group.key[dataTableIndex - 1].properties.grouped = true;
      Resource.json.data.group.key[dataTableIndex].properties.grouped = true;
      Resource.json.data.group.key[dataTableIndex].properties.visible = true;
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
      Resource.json.data.group.key[dataTableIndex - 1].properties.grouped = false;
      Resource.json.data.group.key[dataTableIndex].properties.grouped = false;
      Resource.json.data.group.key[dataTableIndex].properties.visible = false;
      // OPTIMIZE: se, invece di previewReady() provassi ad impostare i metodi hideColumn/showColumn di GoogleChart?
      // TEST: aggiorna tabella con il metodo draw()
      /* Resource.dataViewGrouped.hideColumns([dataTableIndex - 1, dataTableIndex]);
      debugger;
      Resource.tableRefGroup.draw(Resource.dataViewGrouped, Resource.options); */
    }
  } else {
    // metrica
    const metric = Resource.json.data.group.columns.find(metric => metric.alias === e.target.dataset.columnId);
    if (e.target.dataset.visible === 'false') {
      // la colonna è nascosta, la visualizzo e raggruppo.
      e.target.dataset.visible = true;
      metric.properties.visible = true;
    } else {
      e.target.dataset.visible = false;
      metric.properties.visible = false;
    }
  }
  // debugger;
  window.localStorage.setItem(`specs_${Resource.json.token}`, JSON.stringify(Resource.json));
  previewReady();
}
