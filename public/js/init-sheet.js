const dlgConfig = document.getElementById('dlg-sheet-config');
const saveColumnConfig = document.getElementById('btn-column-save');
const tmplList = document.getElementById('tmpl-li');

function testFn() {
  debugger;
  console.log(WorkBook);
}

function drawDatamart() {
  // Il dato iniziale non è raggruppato, la query sul datamart è eseguita con SELECT *...
  // La preview deve consentire la personalizzazione del report, quindi la possibilità
  // di nascondere/visualizzare una colonna e decidere anche il raggruppamento per i
  // livelli dimensionali
  const prepareData = Dashboard.prepareData();
  // ciclo il prepareData.cols per aggiungere l'elenco delle colonne in #ul-columns-handler.
  // Da questo elenco si potrà interagire con la DataTable, impostare un diverso raggruppamento
  prepareData.cols.forEach((col, index) => {
    const ulColumnsHandler = document.getElementById('ul-columns-handler');
    const tmplContent = tmplList.content.cloneNode(true);
    const li = tmplContent.querySelector('li');
    // const span = li.querySelector('span');
    const regex = new RegExp('_id$');
    // in questo elenco non aggiungo le colonne _id, queste devono essere
    // automaticamente nascoste dalla DataTable, però devono essere incluse nella
    // funzione group()
    if (!regex.test(col.id)) {
      li.innerText = col.id;
      li.dataset.columnId = col.id;
      li.dataset.index = index;
      // se la colonna è nascosta, imposto il dataset.hidden = true
      const column = Dashboard.json.data.group.names.find(column => (column.id === col.id));
      if (column) li.dataset.visible = column.properties.visible;
      // TODO Stesso controllo anche per le metriche in json.data.group.columns
      li.addEventListener('click', columnHander);
      ulColumnsHandler.appendChild(li);
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
    alternatingRowStyle: true,
    sort: 'event',
    width: '100%',
    height: 500
  };
  // NOTE: prova impostazione CSS su una colonna
  // Dashboard.dataTable.setColumnProperty(1, 'className', 'cssc1')
  // console.log(Dashboard.dataTable.getColumnProperty(1, 'className'));
  // console.log(Dashboard.dataTable.getColumnProperties(1));
  // END NOTE: prova impostazione CSS su una colonna

  // L'evento 'ready' genera un'ulteriore visualizzazione della dataTable.
  // In questa funzione andrò a creare la DataView, necessaria per poter
  // aggiungere/rimuovere colonne. Prima di creare la DataView viene effettuata
  // una group(), questa consente di raggruppare la visualizzazione in base ai livelli
  // dimensionali scelti (aggiunta/rimozione di livelli dimensionali)
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
    if (column.properties.grouped) keyColumns.push(Dashboard.dataTable.getColumnIndex(column.id));
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
    // TODO: modificare la prop 'aggregateFn' in 'aggregation' in fase di creazione delle metriche
    const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
    let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', properties: { className: 'metric-col' } };
    groupColumnsIndex.push(object);
  });
  // Funzione group(), raggruppo i dati in base alle key presenti in keyColumns
  Dashboard.dataGroup = new google.visualization.data.group(
    Dashboard.dataTable, keyColumns, groupColumnsIndex
  );
  // console.log('group():', Dashboard.dataGroup);

  // TEST: aggiunta di una CSS class a una colonna, nella dataGroup
  // Dashboard.dataGroup.setColumnProperty(1, 'className', 'cssc1')
  // console.log(Dashboard.dataGroup.getColumnProperty(1, 'className'));
  // TODO: Creo un array con i nomi delle colonne che popoleranno la DataView (qui vanno nascoste le colonne _id)

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
  // json.data.group.names (contiene i nomi delle colonne "_ds", da visualizzare)
  // e json.data.group.columns (contiene le metriche, con dependencies:false)
  // che saranno visualizzate nella preview.
  let viewColumns = [], viewMetrics = [];
  // In .data.group.names sono presenti tutte le colonne del report, tramite la
  // prop 'visible' (bool) posso decidere di visualizzarla/nascondere a seconda della scelta
  // dell'utente.
  // TODO: questa proprietà potrei spostarla da json.data.group a json.data.view
  // Dalla datagroup, recupero gli indici delle colonne impostato con 'visible:true'
  Dashboard.json.data.group.names.forEach(column => {
    if (column.properties.visible) viewColumns.push(Dashboard.dataGroup.getColumnIndex(column.id));
  });
  // dalla datagroup, recupero gli indici di colonna delle metriche
  // TODO: Implementare la funzione 'calc' impostata sulle metriche composite.
  Dashboard.json.data.group.columns.forEach(metric => {
    if (!metric.dependencies) {
      const index = Dashboard.dataGroup.getColumnIndex(metric.alias);
      viewMetrics.push(index);
    }
  });
  // concateno i due array che popoleranno la DataView.setColumns()
  let viewDefined = viewColumns.concat(viewMetrics)
  Dashboard.dataViewGrouped.setColumns(viewDefined);

  // NOTE: l'array in setColumns() funziona anche con i nomi delle colonne (id) non solo con gli indici
  /* dataViewGrouped.setColumns(['area_ds', 3, 5, 7, 9, 11, 13, 15, 16, 17, 18, ... */
  // esempio con tutte le colonne
  /* Dashboard.dataViewGrouped.setColumns(
    [1, 3, 5, 7, 9, 11, 13, 15, 16, 17, 18, {
      calc: function(dt, row) {
        return ((dt.getValue(row, 18) - dt.getValue(row, 17)) / dt.getValue(row, 18)) * 100 || 0;
      }, type: 'number', label: 'margine_calc'
    }
    ]
  ); */

  google.visualization.events.addListener(Dashboard.tableRefGroup, 'sort', sort);
  // con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
  // senza effettuare l'ordinamento.
  Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped, Dashboard.options);
}

function sort(e) {
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
  const labelRef = document.getElementById('field-label');
  const selectDataType = document.getElementById('field-datatype');
  // se la label della colonna è già presente in json.data.columns inserisco quello
  labelRef.value = (Dashboard.json.data.columns[Dashboard.columnId].label) ?
    Dashboard.json.data.columns[Dashboard.columnId].label : Dashboard.columnLabel;
  // recupero il dataType della colonna selezionata dall'object Dashboard.json.data.columns[columnId]
  // selectDataType.selectedIndex = 2;
  // console.log(selectDataType.options);
  [...selectDataType.options].forEach((option, index) => {
    // console.log(index, option);
    if (option.value === Dashboard.json.data.columns[Dashboard.columnId].type) {
      selectDataType.selectedIndex = index;
    }
  });
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
  const hideColumn = document.getElementById('hide-column');
  const type = typeRef.options.item(typeRef.selectedIndex).value.toLowerCase();
  // aggiorno Dashboard.json con i valori inseriti nella #dlg-config
  Dashboard.json.data.columns[Dashboard.columnId].label = label;
  Dashboard.json.data.columns[Dashboard.columnId].type = type;
  if (formatterRef.selectedIndex !== 0) {
    const format = formatterRef.options.item(formatterRef.selectedIndex).value;
    Dashboard.json.data.formatter[Dashboard.columnIndex] = { format, numberDecimal: 2 };
  }

  // Colonne da nascondere. Le colonne nascoste saranno eliminate anche dal data.group.key
  // const hideIndex = Dashboard.json.data.view.indexOf(Dashboard.columnIndex);
  if (hideColumn.checked === true) {
    // TODO: nuova logica.v1
    // contrassegno la colonna da nascondere tramite CSS...
    // ...con la dataGroup è possibile farlo, non con la dataView
    console.log(Dashboard.colIndex);
    console.log(Dashboard.dataTableIndex);
    // NOTE: prova impostazione CSS su una colonna
    Dashboard.dataGroup.setColumnProperty(Dashboard.dataTableIndex, 'className', 'hiddenColumn')
    console.log(Dashboard.dataGroup.getColumnProperty(Dashboard.dataTableIndex, 'className'));
    Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped);

    // nuova logica.v1
    return;

    // nuova logica
    // elimino la colonna da data.group.key, se la colonna è una colonna dimensionale, se
    // è una metrica la elimino da data.group.columns
    console.log(Dashboard.tableRefGroup);
    console.log(Dashboard.dataViewGrouped);
    // Dashboard.dataViewGrouped.hideColumns([Dashboard.dataTableIndex]);
    // TODO: Ricreo il group() senza le colonne che ho appena nascosto
    // Dopo aver nascosto una colonna dimensionale, devo eliminare _ds (che è la colonna nascosta) e _id da
    // json.data.group.key per ridisegnare il report senza il raggruppamento per le colonne nascoste
    Dashboard.json.data.group.key.splice(Dashboard.dataTableIndex - 1, 2);
    // temporaneamente, elimino, da .data.group.key, anche le colonne [13,11,9]
    Dashboard.json.data.group.key.splice(13 - 1, 2);
    Dashboard.json.data.group.key.splice(11 - 1, 2);
    Dashboard.json.data.group.key.splice(9 - 1, 2);
    // window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
    // TODO: da spostare in fondo a questa Fn, in modo da ridisegnare il report con
    // tutte le modifiche fatte nella dialog-sheet-config
    console.log(Dashboard.json.data.group.key);
    let columns = [];
    Dashboard.json.data.group.columns.forEach(col => {
      // prendo in considerazione le metriche che hanno la prop 'dependencies:false' oppure che non
      // hanno la prop 'dependencies' (composite)
      if (col.properties.dependencies === false || !col.properties.hasOwnProperty('dependencies')) {
        if (typeof col.aggregation === 'string') col.aggregation = google.visualization.data[col.aggregation];
        columns.push(col);
      }
    });
    console.log(columns);
    let dataGroup = new google.visualization.data.group(
      Dashboard.dataTable, Dashboard.json.data.group.key, columns
    );
    console.log('dataGroup:', dataGroup);
    debugger;
    console.log('costo_rapporto_6 (index):', dataGroup.getColumnIndex('costo_rapporto_6'));
    console.log('costo_rapporto_2 (index):', dataGroup.getColumnIndex('costo_rapporto_2'));
    console.log('ricavo_rapporto_2 (index):', dataGroup.getColumnIndex('ricavo_rapporto_2'));
    console.log('area_ds dataTable (index) : ', Dashboard.dataTable.getColumnIndex('area_ds'));
    console.log('area_ds dataGroup (index) : ', dataGroup.getColumnIndex('area_ds'));
    console.log('zona_ds dataTable (index) : ', Dashboard.dataTable.getColumnIndex('zona_ds'));
    console.log('zona_ds dataGroup (index) : ', dataGroup.getColumnIndex('zona_ds'));
    Dashboard.dataViewGrouped = new google.visualization.DataView(dataGroup);
    console.log('dataViewGroup:', JSON.parse(Dashboard.dataViewGrouped.toJSON()));
    // TODO: visualizzo tutte le colonne _ds, recupero gli indici dalla dataGroup
    let columnsView = [], colView = [];
    JSON.parse(dataGroup.toJSON()).cols.forEach(col => {
      console.log(col);
      const regex = new RegExp('_ds$');
      if (regex.test(col.id)) columnsView.push(col.id);
    });
    colView = columnsView.concat([8, 9, 10, {
      calc: function(dt, row) {
        // TODO: qui bisogna utilizzare gli indici, che posso recuperare dal nome della colonna
        return ((dt.getValue(row, 10) - dt.getValue(row, 9)) / dt.getValue(row, 10)) * 100 || 0;
      }, type: 'number', label: 'margine_calc'
    }]);
    console.log(colView);
    debugger;
    Dashboard.dataViewGrouped.setColumns(colView);
    /* Dashboard.dataViewGrouped.setColumns(
      [1, 3, 5, 7, 8, 9, 10, {
        calc: function(dt, row) {
          return ((dt.getValue(row, 10) - dt.getValue(row, 9)) / dt.getValue(row, 10)) * 100 || 0;
        }, type: 'number', label: 'margine_calc'
      }
      ]
    ); */
    console.log(Dashboard.dataViewGrouped);
    debugger;

    Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped);
    return;
    // nuova logica

    // da implementare
    // se la colonna selezionata è una metrica la contrassegno come hide: true, aggiungendo una
    // prop all'interno dell'object
    // let metricIndex = Dashboard.json.data.group.columns.findIndex(el => el.column === Dashboard.columnIndex);
    // if (metricIndex !== -1) {
    //   // si sta nascondendo una metrica
    //   // Dashboard.json.data.group.columns[metricIndex].hidden = true;
    //   Dashboard.json.data.group.columns[metricIndex].properties = {
    //     hidden: true
    //   };
    // }
  } else {
    /* TODO:
    // Colonna da visualizzare, aggiungo l'indice della colonna a json.data.view
    if (hideIndex === -1) {
      Dashboard.json.data.view.push(Dashboard.columnIndex);
      Dashboard.json.data.view.sort(compareNumbers);
    } */
  }
  // aggiungo, a view, solo le colonne che NON hanno la prop hidden: true
  // let view = [];
  // Dashboard.json.data.group.key.forEach(col => view.push(col));
  // Dashboard.json.data.group.columns.forEach(col => { if (!col.properties.hidden) view.push(col); });
  // console.log(view);
  return;


  Dashboard.json.wrapper.chartType = 'Table';
  Dashboard.json.wrapper.containerId = 'chart_div';
  // metto in un array "temporaneo" tutte le colonne, quelle impostate come nascoste, con
  // la prop 'hidden': true non verranno messe in questo array perchè è l'array che userò nel merge
  // per creare .json.data.view
  console.log(Dashboard.json);
  debugger;
  window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
  dlgConfig.close();
}

function columnHander(e) {
  // Stessa logica della Func 'previewReady()'
  // WARN: Codice da ottimizzare
  console.log(Dashboard.dataViewGrouped.getColumnIndex(e.target.dataset.columnId));
  console.log(Dashboard.dataTable.getColumnIndex(e.target.dataset.columnId));
  const dataTableIndex = Dashboard.dataTable.getColumnIndex(e.target.dataset.columnId);
  let keyColumns = [], groupColumnsIndex = [];
  if (e.target.dataset.visible === 'false') {
    // la colonna è nascosta, la visualizzo e raggruppo.
    e.target.dataset.visible = true;
    // La logica è descritta nei commenti
    // dell'else (quando si nasconde una colonna)
    Dashboard.json.data.group.key[dataTableIndex - 1].properties.grouped = true;
    Dashboard.json.data.group.key[dataTableIndex].properties.grouped = true;
    const columnIndex = Dashboard.json.data.group.names.findIndex(col => col.id === e.target.dataset.columnId);
    Dashboard.json.data.group.names[columnIndex].properties.visible = true;
    // NOTE: codice ripetuto (readyV2())
    Dashboard.json.data.group.key.forEach(column => {
      if (column.properties.grouped) keyColumns.push(Dashboard.dataTable.getColumnIndex(column.id));
    });
    Dashboard.json.data.group.columns.forEach(metric => {
      const index = Dashboard.dataTable.getColumnIndex(metric.alias);
      const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
      let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', properties: { className: 'metric-col' } };
      groupColumnsIndex.push(object);
    });
    console.log(groupColumnsIndex);
  } else {
    e.target.dataset.visible = false;
    // la colonna è visibile, la nascondo e la elimino dal group()
    // Il report è raggruppato (dataViewGrouped) in base ai livelli dimensionali
    // presenti, quando viene nascosta una colonna, anzichè eliminarla
    // dalle proprietà .json.data.group... le "contrassegno" con la prop 'grouped:false'
    // In questo modo posso ripristinarla. Insieme alla colonna che sto nascondendo, va
    // nascosta anche la sua relativa colonna _id, quindi dataTableIndex -1
    // Elimino il raggruppamento per la colonna che l'utente ha nascosto
    Dashboard.json.data.group.key[dataTableIndex - 1].properties.grouped = false;
    Dashboard.json.data.group.key[dataTableIndex].properties.grouped = false;
    // Per json.data.group.names, utilizzo la stessa logica utilizzata
    // per il raggruppamento, in json.data.group.key, l'unica differenza è la prop
    // 'visible', anzichè 'grouped' per nascondere una colonna, in questo caso, dalla DataView
    // e non dal group()
    // Recupero l'index della colonna da nascondere
    const columnIndex = Dashboard.json.data.group.names.findIndex(col => col.id === e.target.dataset.columnId);
    Dashboard.json.data.group.names[columnIndex].properties.visible = false;
    // NOTE: codice ripetuto (readyV2())
    Dashboard.json.data.group.key.forEach(column => {
      if (column.properties.grouped) keyColumns.push(Dashboard.dataTable.getColumnIndex(column.id));
    });
    Dashboard.json.data.group.columns.forEach(metric => {
      const index = Dashboard.dataTable.getColumnIndex(metric.alias);
      const aggregation = (metric.aggregateFn) ? metric.aggregateFn.toLowerCase() : 'sum';
      let object = { id: metric.alias, column: index, aggregation: google.visualization.data[aggregation], type: 'number', properties: { className: 'metric-col' } };
      groupColumnsIndex.push(object);
    });
    console.log(groupColumnsIndex);
  }

  Dashboard.dataGroup = new google.visualization.data.group(
    Dashboard.dataTable, keyColumns, groupColumnsIndex
  );
  console.log(Dashboard.dataGroup);
  // console.log(Dashboard.dataViewGrouped.getColumnIndex(e.target.dataset.columnId));
  Dashboard.dataViewGrouped = new google.visualization.DataView(Dashboard.dataGroup);
  // Dashboard.dataViewGrouped.hideColumns([7]);
  console.log(Dashboard.dataViewGrouped);
  let viewColumns = [], viewMetrics = [];
  Dashboard.json.data.group.names.forEach(column => {
    if (column.properties.visible) viewColumns.push(Dashboard.dataGroup.getColumnIndex(column.id));
  });
  // dalla datagroup, recupero gli indici di colonna delle metriche
  Dashboard.json.data.group.columns.forEach(metric => {
    if (!metric.dependencies) {
      const index = Dashboard.dataGroup.getColumnIndex(metric.alias);
      viewMetrics.push(index);
    }
  });
  // concateno i due array che popoleranno la DataView.setColumns()
  let viewDefined = viewColumns.concat(viewMetrics)
  Dashboard.dataViewGrouped.setColumns(viewDefined);
  Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped);
  // NOTE: end codice ripetuto (readyV2())
  window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));

  // TEST:
  // recupero le colonne da visualizzare da un array nell'object sheet in localStorage
  // const area = Dashboard.dataGroup.getColumnIndex('area');
  // const zona = Dashboard.dataGroup.getColumnIndex('zona');
  // const dealer = Dashboard.dataGroup.getColumnIndex('dealer');
  // const rapp_6 = Dashboard.dataGroup.getColumnIndex('costo_rapporto_6');
  // const cstRapp_2 = Dashboard.dataGroup.getColumnIndex('costo_rapporto_2');
  // const ricRapp_2 = Dashboard.dataGroup.getColumnIndex('ricavo_rapporto_2');
  // Dashboard.dataViewGrouped.setColumns([area, zona, dealer, rapp_6, cstRapp_2, ricRapp_2]);
  // END TEST:
}
