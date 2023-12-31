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

function newDraw() {
  const prepareData = Resource.prepareData();
  Resource.dataTable = new google.visualization.DataTable(prepareData);
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
  Resource.tableRef = new google.visualization.Table(Resource.ref);
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
  Resource.groupFunction();
  // imposto qui il metodo group() perchè per la dashboard è diverso (viene usato il ChartWrapper)
  Resource.dataGroup = new google.visualization.data.group(
    Resource.dataTable, Resource.groupKey, Resource.groupColumn
  );
  console.log('dataGroup : ', Resource.dataGroup);
  Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  console.log('DataViewGrouped :', Resource.dataViewGrouped);
  let viewColumns = [], viewMetrics = [];
  Resource.json.data.group.key.forEach(column => {
    if (column.properties.visible) {
      viewColumns.push(Resource.dataGroup.getColumnIndex(column.id));
      // imposto la classe per le colonne dimensionali
      Resource.dataGroup.setColumnProperty(Resource.dataGroup.getColumnIndex(column.id), 'className', 'dimensional-column');
    }
  });
  // dalla dataGroup, recupero gli indici di colonna delle metriche
  Resource.json.data.group.columns.forEach(metric => {
    if (!metric.dependencies && metric.properties.visible) {
      const index = Resource.dataGroup.getColumnIndex(metric.alias);
      // NOTE: si potrebbe utilizzare un nuovo oggetto new Function in questo
      // modo come alternativa a eval() (non l'ho testato)
      // function evil(fn) {
      //   return new Function('return ' + fn)();
      // }
      // console.log(evil('12/5*9+9.4*2')); // => 40.4     const index = Resource.dataGroup.getColumnIndex(metric.alias);

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
    }
  });
  // concateno i due array che popoleranno la DataView.setColumns()
  let viewDefined = viewColumns.concat(viewMetrics)
  console.log('DataView defined:', viewDefined);
  // Resource.dataGroup.setColumnProperty(0, 'className', 'cssc1')
  // console.log(Resource.dataGroup.getColumnProperty(0, 'className'));
  // console.log(Resource.dataGroup.getColumnProperties(0));
  Resource.dataViewGrouped.setColumns(viewDefined);
  // creo una DT prendendo i dati dalla DV, in questo modo, le colonne
  // generate (calcolate) posso gestire, in sort() con getTableColumnIndex()
  // ... inoltre posso applicare la formattazione alla DT ma non alla DV
  Resource.DT = Resource.dataViewGrouped.toDataTable();
  Resource.json.data.group.columns.forEach(metric => {
    if (!metric.dependencies) {
      let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
      formatter.format(Resource.DT, Resource.DT.getColumnIndex(metric.alias));
    }
  });
  google.visualization.events.addListener(Resource.tableRef, 'ready', preview);
  // il draw() lo effettuo sulla DT, successivamente, è il metodo preview() che si occupa di creare la
  // DataView (Resource.DV) che verrà visualizzata
  Resource.tableRef.draw(Resource.DT, Resource.options);
}

function preview() {
  Resource.tableRefGroup = new google.visualization.Table(Resource.ref);
  Resource.DV = new google.visualization.DataView(Resource.DT);
  // con l'opzione sort: 'event' viene comunque processato l'evento 'sort'
  google.visualization.events.addListener(Resource.tableRefGroup, 'sort', sort);
  // senza effettuare l'ordinamento.
  Resource.tableRefGroup.draw(Resource.DV, Resource.options);
}

function sort(e) {
  const labelRef = document.getElementById('field-label');
  const selectDataType = document.getElementById('field-datatype');
  const selectFormat = document.getElementById('field-format');
  const checkboxFilter = document.getElementById('filter-column');
  // l'indice della colonna nella DataView
  Resource.colIndex = e.column;
  Resource.columnId = Resource.DT.getColumnId(Resource.colIndex);
  Resource.DTIndex = Resource.DV.getTableColumnIndex(e.column);
  Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  debugger;
  // recupero il nome della colonna in base al suo indice
  // Resource.dataGroupColumnIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
  // Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  // console.log('test : ', Resource.dataGroup.getColumnIndex(Resource.columnId));
  // console.log('index della dataView', Resource.colIndex);
  // console.log('column id : ', Resource.columnId);
  // Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  // Resource.dataGroupIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
  // Resource.dataGroupIndex = Resource.dataGroup.getColumnIndex(Resource.columnId);
  // Resource.dataTableIndex = Resource.dataTable.getColumnIndex(Resource.columnId);
  // Indice della colonna nella DataTable sottostante in base alla selezione
  // di una colonna nella DataView
  // BUG: non vengono trovati gli indici delle colonne calcolate
  // (questo è segnalato anche su GoogleChart in getTableColumnIndex che parla di colonne generate)
  // Per questo motivo non posso utilizzare il metodo draw() ma devo utilizzare il previewReady()
  // per ridisegnare il report
  // Resource.dataTableIndex = Resource.dataViewGrouped.getTableColumnIndex(Resource.colIndex);

  // NOTE: getViewColumnIndex() resituisce l'indice della DataView impostata
  // con setColumns(), il valore passato è l'indice della dataTable
  // se setColumns([1,3,5,7]) getViewColumnIndex(7) restituisce 4
  // Resource.dataViewIndex = Resource.dataViewGrouped.getViewColumnIndex(7);
  // console.log('index della dataTable', Resource.dataTableIndex);
  // console.log('index della dataGroup', Resource.dataGroupIndex);
  // etichetta colonna, questa viene impostata nella dlg-sheet-config
  Resource.columnLabel = Resource.DT.getColumnLabel(Resource.colIndex);
  // Resource.columnLabel = Resource.dataViewGrouped.getColumnLabel(Resource.dataTableIndex);
  labelRef.value = Resource.columnLabel;
  // recupero il dataType della colonna selezionata dall'object Resource.json.data.columns[columnId]
  // selectDataType.selectedIndex = 2;
  // console.log(selectDataType.options);

  [...selectDataType.options].forEach((option, index) => {
    if (option.value === Resource.DV.getColumnType(Resource.colIndex)) {
      selectDataType.selectedIndex = index;
    }
  });
  // recupero la formattazione impostata per la colonna
  const metric = Resource.json.data.group.columns.find(metric => metric.alias === Resource.columnId);
  selectFormat.selectedIndex = 0; // default
  [...selectFormat.options].forEach((option, index) => {
    // console.log(index, option);
    if (option.value === metric.properties.formatter.format) {
      selectFormat.selectedIndex = index;
    }
  });
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
  const type = typeRef.options.item(typeRef.selectedIndex).value.toLowerCase();
  const format = formatterRef.options.item(formatterRef.selectedIndex).value;
  let formatterProperties = {};

  // const columnIndex = Resource.json.data.view.findIndex(col => col.id === Resource.columnId);
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(7, 'test');
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(3, 'test-3');
  // if (columnIndex !== -1) Resource.dataGroup.setColumnLabel(Resource.dataTableIndex, 'test-2');

  Resource.DT.setColumnLabel(Resource.DTIndex, label);
  switch (format) {
    case 'default':
      // numero senza decimali e con separatore migliaia
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
  debugger;
  // console.log(Resource.dataTable.getColumnProperties(Resource.dataTableIndex));
  const columnType = Resource.dataTable.getColumnProperty(Resource.dataTableIndex, 'data');
  debugger;
  if (columnType === 'column') {
    const column = Resource.json.data.group.key.find(col => col.id === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (column) column.label = label;
    // column.formatter = { type, format, prop: formatterProperties };
  } else {
    const metric = Resource.json.data.group.columns.find(metric => metric.alias === Resource.columnId);
    // TODO: probabilmente devo modificare anche l'id, se è stato modificato nel report
    if (metric) metric.label = label;
    metric.properties.formatter = { type, format, prop: formatterProperties };
    let formatter = app[type](formatterProperties);
    formatter.format(Resource.DT, Resource.DT.getColumnIndex(metric.alias));
  }
  // console.log('DataGroup:', Resource.dataGroup);

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
  window.localStorage.setItem(`specs_${Resource.json.token}`, JSON.stringify(Resource.json));
  // Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);
  // console.log('DataViewGrouped :', Resource.dataViewGrouped);
  // debugger;
  Resource.tableRef.draw(Resource.DT, Resource.options);
  // previewReady();
  dlgConfig.close();
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

  preview();
}
