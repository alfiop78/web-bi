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

/* function drawTest() {
  const prepareData = Dashboard.prepareData();
  let DataTable = new google.visualization.DataTable(prepareData);
  var wrapper = new google.visualization.ChartWrapper({
    chartType: 'Table',
    containerId: 'preview-datamart',
    dataTable: DataTable,
    options: {
      page: "enabled",
      pageSize: 500
    }
  });
  wrapper.draw();
} */

function drawDatamart() {
  // Il dato iniziale non è raggruppato, la query sul datamart è eseguita con SELECT *...
  // La preview deve consentire la personalizzazione del report, quindi la possibilità
  // di nascondere/visualizzare una colonna e decidere anche il raggruppamento per i
  // livelli dimensionali
  const prepareData = Dashboard.prepareData();
  // ciclo il prepareData.cols per aggiungere l'elenco delle colonne in #ul-columns-handler.
  // Da questo elenco si potranno nascondere/visualizzare le colonne e le metreehe
  prepareData.cols.forEach((col, index) => {
    const ulColumnsHandler = document.getElementById('ul-columns-handler');
    const tmplContent = tmplList.content.cloneNode(true);
    const li = tmplContent.querySelector('li');
    // const span = li.querySelector('span');
    const regex = new RegExp('_id$');
    // in questo elenco non aggiungo le colonne _id e le metriche con 'dependencies':true.
    // Le colonne _id sono automaticamente nascoste dalla DataTable, anche se sono
    // presenti nel func group() (json.data.group.key)
    // se è una metrica con 'dependencies' : true non devo aggiungerla alla ul
    const metric = Dashboard.json.data.group.columns.find(metric => (metric.alias === col.id && metric.dependencies === false));
    if (!regex.test(col.id) || metric) {
      // se la colonna è nascosta, imposto il dataset.hidden = true
      const column = Dashboard.json.data.view.find(column => (column.id === col.id));
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
  Dashboard.dataTable = new google.visualization.DataTable(prepareData);
  var tableRef = new google.visualization.Table(document.getElementById(Dashboard.ref));
  // effettuando il calcolo del margine ((ricavo-costo)/ricavo*100) qui, cioè prima della
  // funzione di group(), il risultato non è corretto, questi calcoli vanno effettuati con una
  // DataView DOPO la function group()
  // imposto le opzioni per la dataTable
  Dashboard.options = {
    title: 'titolo report',
    showRowNumber: true,
    allowHTML: true,
    frozenColumns: 0,
    page: 'enabled',
    pageSize: 50,
    alternatingRowStyle: true,
    sort: 'event',
    width: '100%',
    height: 'auto'
  };
  // NOTE: prova impostazione CSS su una colonna
  // Dashboard.dataTable.setColumnProperty(1, 'className', 'cssc1')
  // Dashboard.dataTable.setColumnProperty(2, 'className', 'cssc1')
  // Dashboard.dataTable.setColumnProperty(3, 'className', 'cssc1')
  // console.log(Dashboard.dataTable.getColumnProperty(1, 'className'));
  // console.log(Dashboard.dataTable.getColumnProperties(1));
  // END NOTE: prova impostazione CSS su una colonna

  // L'evento 'ready' genera un'ulteriore visualizzazione della dataTable.
  // In questa funzione andrò a creare la DataView, necessaria per poter
  // aggiungere/rimuovere colonne. Prima di creare la DataView viene effettuata
  // una group(), questa consente di raggruppare la visualizzazione in base ai livelli
  // dimensionali scelti (aggiunta/rimozione di livelli dimensionali)
  // tableRef.clearChart();
  google.visualization.events.addListener(tableRef, 'ready', previewReady);

  tableRef.draw(Dashboard.dataTable, Dashboard.options);
}

function previewReady() {
  // Imposto un altro riferimento a tableRef altrimenti l'evento ready si attiva ricorsivamente (errore)
  Dashboard.tableRefGroup = new google.visualization.Table(document.getElementById(Dashboard.ref));
  // console.log('group.key:', Dashboard.json.data.group.key);
  // trasformo il data.group.key in un array di indici di colonne (anche se potrebbe funzionare
  // anche con un object, da rivedere su Google Chart)
  // Questo è il secondo param della funzione group() e, in questo array sono incluse
  // anche le colonne _id
  let keyColumns = [];
  // keyColumns conterrà gli index delle colonne (recuperandoli da
  // json.data.group.key) per le quali il report viene raggruppato.
  // Questo consente di fare i calcoli per le metriche composte sui dati raggruppati
  Dashboard.json.data.group.key.forEach(column => {
    // if (column.properties.grouped) keyColumns.push(Dashboard.dataTable.getColumnIndex(column.id));
    // imposto il key con un object anzichè con gli indici, questo perchè voglio impostare la label
    // che viene modificata dall'utente a runtime
    if (column.properties.grouped) {
      keyColumns.push({ id: column.id, column: Dashboard.dataTable.getColumnIndex(column.id), label: column.label, type: column.type });
    }
  });
  // console.log(keyColumns);
  // creo l'object che verrà messo nel terzo param di group()
  // Es.: { column: 16, aggregation: google.visualization.data.sum, type: 'number' },
  // le metriche che hanno la proprietà dependencies: true, sono quelle NON aggiunte DIRETTAMENTE
  // al report ma "dipendono" da quelle composite, quindi creo l'array con le sole colonne
  // da visualizzare nel report, prendendo i dati da 'data.group.columns'
  let groupColumnsIndex = [];
  Dashboard.json.data.group.columns.forEach(metric => {
    // salvo in groupColumnsIndex TUTTE le metriche, deciderò nella DataView
    // quali dovranno essere visibili (quelle con dependencies:false)
    // recupero l'indice della colonna in base al suo nome
    const index = Dashboard.dataTable.getColumnIndex(metric.alias);
    // TODO modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
    const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
    let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', label: metric.label };
    groupColumnsIndex.push(object);
  });
  // console.log(groupColumnsIndex);
  // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
  Dashboard.dataGroup = new google.visualization.data.group(
    Dashboard.dataTable, keyColumns, groupColumnsIndex
  );
  // console.log('group():', Dashboard.dataGroup);
  // console.log(Dashboard.dataGroup.getColumnIndex())
  // Imposto le label memorizzate in group.key. In questo caso potrei utilizzare gli object da passare
  // a group(), invece degli indici, per le colonne, è la stessa logica utilizzata per le metriche.
  // Utilizzando un object al posto degli indici potrei impostare la prop 'label' direttamente nell'object
  // invece di fare questo ciclo...
  // Dashboard.json.data.group.key.forEach(column => {
  //   Dashboard.dataGroup.setColumnLabel(Dashboard.dataTable.getColumnIndex(column.id), column.label);
  // });
  // console.log(Dashboard.dataGroup);
  // Formattazione colonne
  for (const [columnId, properties] of Object.entries(Dashboard.json.data.formatter)) {
    console.log('Formattazione ', Dashboard.dataGroup.getColumnIndex(columnId));
    let formatter = null;
    // debugger;
    switch (properties.type) {
      case 'number':
        formatter = app[properties.type](properties.prop);
        break;
      // case 'date':
      // TODO Da implementare
      // let formatter = app[properties.format](properties.numberDecimal);
      // formatter.format(Dashboard.dataGroup, Dashboard.dataGroup.getColumnIndex(columnId));
      // break;
      default:
        // debugger;
        break;
    }
    if (formatter) formatter.format(Dashboard.dataGroup, Dashboard.dataGroup.getColumnIndex(columnId));
  }

  // TEST: aggiunta di una CSS class a una colonna, nella dataGroup
  // Dashboard.dataGroup.setColumnProperty(1, 'className', 'cssc1')
  // console.log(Dashboard.dataGroup.getColumnProperty(1, 'className'));

  // DataView, mi consente di visualizzare SOLO le colonne definite nel report ed
  // effettuare eventuali calcoli per le metriche composite ('calc')
  Dashboard.dataViewGrouped = new google.visualization.DataView(Dashboard.dataGroup);

  // TEST: recupero gli indici delle colonne area_ds, zona_ds (colonna da visualizzare)
  // console.log('costo_rapporto_6 (index):', Dashboard.dataGroup.getColumnIndex('costo_rapporto_6'));
  // console.log('costo_rapporto_2 (index):', Dashboard.dataGroup.getColumnIndex('costo_rapporto_2'));
  // console.log('ricavo_rapporto_2 (index):', Dashboard.dataGroup.getColumnIndex('ricavo_rapporto_2'));
  // console.log('area_ds index : ', Dashboard.dataTable.getColumnIndex('area_ds'));
  // console.log('zona_ds index : ', Dashboard.dataTable.getColumnIndex('zona_ds'));
  // per le colonne dimensionali, potrei recuperare gli indici, da mettere in DataView.setColumns()
  // con il getColumnId() sulla dataGroup
  // console.log(Dashboard.dataGroup.getColumnId(3));
  // console.log(Dashboard.dataGroup.getColumnIndex('zona'));
  // END TEST:

  // recupero le colonne presenti nel report, tramite le impostazioni di
  // json.data.view (contiene i nomi delle colonne "_ds", da visualizzare)
  // e json.data.group.columns (contiene le metriche, con dependencies:false)
  // che saranno visualizzate nella preview.
  let viewColumns = [], viewMetrics = [];
  // In .data.view sono presenti tutte le colonne del report, tramite la
  // prop 'visible' (bool) posso decidere di visualizzarla/nascondere a seconda della scelta
  // dell'utente.
  // Dalla dataGroup, recupero gli indici delle colonne impostato con 'visible:true'
  // Dashboard.json.data.view.forEach(column => {
  //   if (column.properties.visible) viewColumns.push(Dashboard.dataGroup.getColumnIndex(column.id));
  // });
  Dashboard.json.data.view.forEach(column => {
    if (column.properties.visible) viewColumns.push(Dashboard.dataGroup.getColumnIndex(column.id));
  });
  // dalla dataGroup, recupero gli indici di colonna delle metriche
  Dashboard.json.data.group.columns.forEach(metric => {
    if (!metric.dependencies && metric.properties.visible) {
      const index = Dashboard.dataGroup.getColumnIndex(metric.alias);
      // NOTE: si potrebbe utilizzare un nuovo oggetto new Function in questo
      // modo come alternativa a eval() (non l'ho testato)
      // function evil(fn) {
      //   return new Function('return ' + fn)();
      // }
      // console.log(evil('12/5*9+9.4*2')); // => 40.4     const index = Dashboard.dataGroup.getColumnIndex(metric.alias);

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
          if (Dashboard.json.data.formatter[metric.alias]) {
            const metricFormat = Dashboard.json.data.formatter[metric.alias];
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
        Dashboard.dataGroup.setColumnProperty(index, 'className', 'col-metrics');
        // console.log(Dashboard.dataGroup.getColumnProperty(index, 'className'));
      }
    }
  });
  // concateno i due array che popoleranno la DataView.setColumns()
  let viewDefined = viewColumns.concat(viewMetrics)
  // Dashboard.dataGroup.setColumnProperty(0, 'className', 'cssc1')
  // console.log(Dashboard.dataGroup.getColumnProperty(0, 'className'));
  // console.log(Dashboard.dataGroup.getColumnProperties(0));
  Dashboard.dataViewGrouped.setColumns(viewDefined);
  // console.info('DataView', Dashboard.dataViewGrouped);

  google.visualization.events.addListener(Dashboard.tableRefGroup, 'sort', sort);
  // con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
  // senza effettuare l'ordinamento.
  Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped, Dashboard.options);
}

function sort(e) {
  const labelRef = document.getElementById('field-label');
  const selectDataType = document.getElementById('field-datatype');
  const selectFormat = document.getElementById('field-format');
  const checkboxFilter = document.getElementById('filter-column');
  // l'indice della colonna nella DataView
  Dashboard.colIndex = e['column'];
  console.log('index della dataView', Dashboard.colIndex);
  // Indice della colonna nella DataTable sottostante in base alla selezione
  // di una colonna nella DataView
  Dashboard.dataTableIndex = Dashboard.dataViewGrouped.getTableColumnIndex(Dashboard.colIndex);
  // NOTE: getViewColumnIndex() resituisce l'indice della DataView impostata
  // con setColumns(), il valore passato è l'indice della dataTable
  // se setColumns([1,3,5,7]) getViewColumnIndex(7) restituisce 4
  // Dashboard.dataViewIndex = Dashboard.dataViewGrouped.getViewColumnIndex(7);
  console.log('index della dataTable', Dashboard.dataTableIndex);
  // recupero il nome della colonna in base al suo indice
  Dashboard.columnId = Dashboard.dataViewGrouped.getColumnId(Dashboard.colIndex);
  // etichetta colonna, questa viene impostata nella dlg-sheet-config
  Dashboard.columnLabel = Dashboard.dataViewGrouped.getColumnLabel(Dashboard.colIndex);
  labelRef.value = Dashboard.columnLabel;
  // recupero il dataType della colonna selezionata dall'object Dashboard.json.data.columns[columnId]
  // selectDataType.selectedIndex = 2;
  // console.log(selectDataType.options);
  [...selectDataType.options].forEach((option, index) => {
    console.log(Dashboard.dataViewGrouped.getColumnType(Dashboard.colIndex));
    // console.log(Dashboard.dataViewGrouped.getColumnProperties(Dashboard.colIndex));
    if (option.value === Dashboard.dataViewGrouped.getColumnType(Dashboard.colIndex)) {
      selectDataType.selectedIndex = index;
    }
  });
  // recupero la formattazione impostata per la colonna
  selectFormat.selectedIndex = 0; // default
  [...selectFormat.options].forEach((option, index) => {
    // console.log(index, option);
    if (Dashboard.json.data.formatter[Dashboard.columnId]) {
      if (option.value === Dashboard.json.data.formatter[Dashboard.columnId].format) {
        selectFormat.selectedIndex = index;
      }
    }
  });
  // recupero l'informazione .json.filter (colonna impostata come filtro)
  if (Dashboard.json.filters.find(name => name.filterColumnLabel === Dashboard.columnLabel)) {
    // colonna impostata come filtro
    checkboxFilter.checked = true;
  } else {
    checkboxFilter.checked = false;
  }
  dlgConfig.show();
}

// Salvataggio della configurazione colonna dalla dialog dlg-config
saveColumnConfig.onclick = () => {
  // console.log(Dashboard.dataTable);
  console.log({
    "dataTable (index)": Dashboard.dataTableIndex,
    "dataView (index)": Dashboard.colIndex,
    "id": Dashboard.columnId, "label": Dashboard.columnLabel
  });
  // input label
  const label = document.getElementById('field-label').value;
  // dataType
  const typeRef = document.getElementById('field-datatype');
  // formattazione colonna
  const formatterRef = document.getElementById('field-format');
  const filterColumn = document.getElementById('filter-column');
  const type = typeRef.options.item(typeRef.selectedIndex).value.toLowerCase();
  // const columnIndex = Dashboard.json.data.view.findIndex(col => col.id === Dashboard.columnId);
  // if (columnIndex !== -1) Dashboard.dataGroup.setColumnLabel(7, 'test');
  // if (columnIndex !== -1) Dashboard.dataGroup.setColumnLabel(3, 'test-3');
  // if (columnIndex !== -1) Dashboard.dataGroup.setColumnLabel(Dashboard.dataTableIndex, 'test-2');
  // cerco la colonna sia in data.group.key (colonne dimensionali) che in data.group.columns (metriche)
  const column = Dashboard.json.data.group.key.find(col => col.id === Dashboard.columnId);
  if (column) {
    column.label = label;
  }
  const metric = Dashboard.json.data.group.columns.find(metric => metric.alias === Dashboard.columnId);
  if (metric) metric.label = label;

  const format = formatterRef.options.item(formatterRef.selectedIndex).value;
  let formatterProperties = {};
  switch (format) {
    case 'default':
      formatterProperties = { negativeParens: false, fractionDigits: 0, groupingSymbol: '' };
      break;
    case 'currency':
      formatterProperties = { suffix: ' €', negativeColor: 'brown', negativeParens: true, fractionDigits: 2 };
      break;
    case 'percent':
      formatterProperties = { suffix: ' %', negativeColor: 'brown', negativeParens: true, fractionDigits: 2 };
      break;
    case 'date':
      // TODO da implementare
      // Dashboard.json.data.formatter[Dashboard.columnId] = { format: 'date' };
      break;
    default:
      break;
  }
  Dashboard.json.data.formatter[Dashboard.columnId] = { type, format, prop: formatterProperties };
  // filtri definiti per il report
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
    }
  } else {
    // rimozione del filtro, se presente
    const index = Dashboard.json.filters.findIndex(filter => filter.containerId === `flt-${label}`);
    if (index !== -1) {
      Dashboard.json.filters.splice(index, 1);
      // lo rimuovo anche dal DOM
      /* const filterRef = document.getElementById(`flt-${label}`);
      filterRef.parentElement.remove();
      app.setDashboardBind(); */
    }
  }

  // TODO Il containerId deve essere deciso in init-dashboard-create.js
  Dashboard.json.wrapper.containerId = 'chart_div';
  console.log(Dashboard.json);
  window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
  dlgConfig.close();
  previewReady();
}

function columnHander(e) {
  // Stessa logica della Func 'previewReady()'
  console.log(Dashboard.dataViewGrouped.getColumnIndex(e.target.dataset.columnId));
  console.log(Dashboard.dataTable.getColumnIndex(e.target.dataset.columnId));
  const dataTableIndex = Dashboard.dataTable.getColumnIndex(e.target.dataset.columnId);
  // Recupero l'index della colonna da nascondere/visualizzare
  const columnIndex = Dashboard.json.data.view.findIndex(col => col.id === e.target.dataset.columnId);
  const metricIndex = Dashboard.json.data.group.columns.findIndex(metric => metric.alias === e.target.dataset.columnId);
  if (e.target.dataset.visible === 'false') {
    // la colonna è nascosta, la visualizzo e raggruppo.
    e.target.dataset.visible = true;
    // La logica è descritta nell'else (quando si nasconde una colonna)
    if (columnIndex !== -1) {
      Dashboard.json.data.group.key[dataTableIndex - 1].properties.grouped = true;
      Dashboard.json.data.group.key[dataTableIndex].properties.grouped = true;
      Dashboard.json.data.view[columnIndex].properties.visible = true;
    } else {
      Dashboard.json.data.group.columns[metricIndex].properties.visible = true;
    }
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
    if (columnIndex !== -1) {
      Dashboard.json.data.group.key[dataTableIndex - 1].properties.grouped = false;
      Dashboard.json.data.group.key[dataTableIndex].properties.grouped = false;
      Dashboard.json.data.view[columnIndex].properties.visible = false;
    } else {
      Dashboard.json.data.group.columns[metricIndex].properties.visible = false;
    }
  }
  window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
  previewReady();
}
