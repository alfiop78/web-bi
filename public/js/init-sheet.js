const dlgConfig = document.getElementById('dlg-sheet-config');
const saveColumnConfig = document.getElementById('btn-column-save');

function test() {
  console.log(WorkBook);
}

function drawDatamart(ref) {
  const prepareData = Dashboard.prepareData();
  let dataTable = new google.visualization.DataTable(prepareData);
  // Dashboard.dataTable = new google.visualization.DataTable(prepareData);
  var tableRef = new google.visualization.Table(document.getElementById(ref));
  // utilizzo della DataView
  /* var view = new google.visualization.DataView(dataTable);
  let dataView = JSON.parse(view.toDataTable().toJSON());
  // console.log(dataView);
  let idsColumns = [];
  // nascondo colonne _id
  dataView.cols.forEach((col, index) => {
    const regex = new RegExp('_id$');
    if (regex.test(col.id)) {
      // verifico prima se esiste per non duplicarlo
      // if (!this.json.data.view.includes(index)) this.json.data.view.push(index);
      idsColumns.push(index);
    }
  });
  // TEST: effettuando il calcolo del margine ((ricavo-costo)/ricavo*100) qui, cioè prima della
  // funzione di group(), il risultato non è corretto, questi calcoli vanno effettuati con una
  // DataView DOPO la function group()
  view.hideColumns(idsColumns); */
  const options = {
    title: 'titolo report',
    showRowNumber: true,
    allowHTML: true,
    frozenColumns: 0,
    alternatingRowStyle: true,
    sort: 'event',
    width: '100%',
    height: 500
  };
  google.visualization.events.addListener(tableRef, 'ready', readyV2);

  function readyV2() {
    debugger;
    // raggruppo le colonne per effettuare i calcoli delle metriche composte
    // Imposto un altro riferimento a tableRef altrimenti l'evento ready si attiva ricorsivamente (errore)
    // const tableRefGroup = new google.visualization.Table(document.getElementById(ref));
    Dashboard.tableRefGroup = new google.visualization.Table(document.getElementById(ref));

    console.log('DataTable', dataTable);
    // Individuo le metriche per inserirle nel 3° parametro di group()
    console.log(dataTable.getColumnIndex('costo_rapporto_6'));
    // potrei recuperare, dal json.data.columns, l'elenco delle metriche da calcolare ed
    // ottenere gli indici da inserire nella Fn group()
    // TODO: aggiungo tutte le colonne nel parametro 'key' della funzione group()
    // Inizialmente il report deve raggruppare tutte le colonne presenti
    // Successivamente, quando avrò impostato il json.data.group.key, raggrupperò solo
    // per le colonne presenti in json.data.group.key

    // le metriche che hanno la proprietà dependencies: true, sono quelle NON aggiunte DIRETTAMENTE
    // al report ma derivano da quelle composite, quindi creo l'array con le sole colonne da visualizzare
    // nel report, prendendo i dati da 'data.group.columns'
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
    console.log(Dashboard.json.data.group.key);
    let dataGroup = new google.visualization.data.group(
      dataTable, Dashboard.json.data.group.key, columns
    );
    console.log(dataGroup);
    // let dataViewGrouped = new google.visualization.DataView(dataGroup);
    Dashboard.dataViewGrouped = new google.visualization.DataView(dataGroup);
    // DataView con le funzioni 'calc' sui dati raggruppati
    // TEST: recupero gli indici delle colonne area_ds, zona_ds (colonna da visualizzare)
    console.log('costo_rapporto_6 (index):', dataGroup.getColumnIndex('costo_rapporto_6'));
    console.log('costo_rapporto_2 (index):', dataGroup.getColumnIndex('costo_rapporto_2'));
    console.log('ricavo_rapporto_2 (index):', dataGroup.getColumnIndex('ricavo_rapporto_2'));
    console.log('area_ds index : ', dataTable.getColumnIndex('area_ds'));
    console.log('zona_ds index : ', dataTable.getColumnIndex('zona_ds'));
    debugger;
    // NOTE: l'array in setColumns() funziona anche con i nomi delle colonne (id) non solo con gli indici
    // dataViewGrouped.setColumns(['area_ds', 3, 5, 7, 9, 11, 13, 15, 16, 17, 18, {
    // esempio con tutte le colonne
    Dashboard.dataViewGrouped.setColumns(
      [1, 3, 5, 7, 9, 11, 13, 15, 16, 17, 18, {
        calc: function(dt, row) {
          return ((dt.getValue(row, 18) - dt.getValue(row, 17)) / dt.getValue(row, 18)) * 100 || 0;
        }, type: 'number', label: 'margine_calc'
      }
      ]
    );
    // esempio con tutte le colonne
    // esempio con 4 colonne (area, zona, cod, dealer)
    /* dataViewGrouped.setColumns(
      [1, 3, 5, 7, 16, 17, 18, 19, {
        calc: function(dt, row) {
          return ((dt.getValue(row, 18) - dt.getValue(row, 17)) / dt.getValue(row, 18)) * 100 || 0;
        }, type: 'number', label: 'margine_calc'
      }
      ]
    ); */
    // esempio con 4 colonne (area, zona, cod, dealer)
    google.visualization.events.addListener(Dashboard.tableRefGroup, 'sort', sort);
    // con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
    // per non viene automaticamente ordinata la colonna. Utilizzo ottimale
    // per poter aprire una dialog, sulla colonna selezionata, senza ordinare la colonna
    function sort(e) {
      // l'indice della colonna nella DataView
      Dashboard.colIndex = e['column'];
      // Indice della colonna nella DataTable sottostante in base alla selezione
      // di una colonna nella DataView
      Dashboard.dataTableIndex = Dashboard.dataViewGrouped.getTableColumnIndex(Dashboard.colIndex);
      console.log('index della dataTable', Dashboard.dataTableIndex);
      console.log('index della dataView', Dashboard.colIndex);
      // nome della colonna ricevuto dall query (es. 'area_ds')
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
    Dashboard.tableRefGroup.draw(Dashboard.dataViewGrouped, options);
  }

  tableRef.draw(dataTable, options);
}

function redraw() {
  debugger;
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
    // nuova logica
    // elimino la colonna da data.group.key, se la colonna è una colonna dimensionale, se
    // è una metrica la elimino da data.group.columns
    console.log(Dashboard.tableRefGroup);
    console.log(Dashboard.dataViewGrouped);
    Dashboard.dataViewGrouped.hideColumns([Dashboard.dataTableIndex]);
    // TODO: Ricreo il group() senza le colonne che ho appena nascosto
    // Dopo aver nascosto una colonna dimensionale, devo eliminare _ds (che è la colonna nascosta) e _id da
    // json.data.group.key per ridisegnare il report senza il raggruppamento per le colonne nascoste
    Dashboard.json.data.group.key.splice(Dashboard.dataTableIndex - 1, 2);
    google.visualization.events.addListener(Dashboard.tableRefGroup, 'ready', redraw);
    debugger;
    window.localStorage.setItem(Dashboard.json.name, JSON.stringify(Dashboard.json));
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
