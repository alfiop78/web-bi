var App = new Application();
var Template = new Templates();
var Dashboard = new Dashboards(); // istanza della Classe Dashboards, da inizializzare quando ricevuti i dati dal datamart
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
  }

  App.init();

  // Load the Visualization API and the corechart package.
  google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls', 'charteditor'], 'language': 'it' });

  // Set a callback to run when the Google Visualization API is loaded.
  // google.charts.setOnLoadCallback(drawChart);

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  // esempio base
  /* function drawChart() {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {
      'title': 'How Much Pizza I Ate Last Night',
      'width': 400,
      'height': 300
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  } */

  // Recupero del template-layout e dello sheetSpecs
  app.getLayouts = async () => {
    // const sheetLayout = 'stock';
    // const sheetLayout = 'competitive-bonus';
    const templateLayout = 'layout-1';
    const urls = [
      `/js/json-templates/${templateLayout}.json`
      // `/js/json-sheets/${sheetLayout}.json`
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
        // imposto i dati di questo Template nella classe
        Template.data = data[0];
        // creo il template nel DOM
        Template.create();
        // Dashboard.sheetSpecs = data[1];
        Dashboard.sheetSpecs = JSON.parse(window.localStorage.getItem('template-59yblqr')); // cb
        // Dashboard.sheetSpecs = JSON.parse(window.localStorage.getItem('template-hdkglro')); // stock
        app.dashboardExample();
      })
      .catch(err => console.error(err));
  }

  app.drawTable = (queryData) => {
    // Metodo più veloce
    const prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(queryData[0])) {
      if (key === "TotaleFA") {
        prepareData.cols.push({ id: key, label: key, type: 'number' });
      } else {
        prepareData.cols.push({ id: key, label: key });
      }
    }
    // aggiungo le righe
    queryData.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        if (key === "TotaleFA") {
          v.push({ v: parseFloat(value) });
        } else {
          v.push({ v: value });
        }
      }
      prepareData.rows.push({ c: v });
    });
    // return;
    /* prepareData.cols.push(
      { id: 'task', label: 'Employee Name', type: 'string' },
      { id: 'startDate', label: 'Start Date', type: 'date' }
    );
    prepareData.rows.push(
      { c: [{ v: 'Mike' }, { v: new Date(2008, 1, 28), f: 'February 28, 2008' }] },
      { c: [{ v: 'Bob' }, { v: new Date(2007, 5, 1) }] },
      { c: [{ v: 'Alice' }, { v: new Date(2006, 7, 16) }] },
      { c: [{ v: 'Frank' }, { v: new Date(2007, 11, 28) }] },
      { c: [{ v: 'Floyd' }, { v: new Date(2005, 3, 13) }] },
      { c: [{ v: 'Alfio' }, { v: new Date(2011, 6, 1) }] }
    );
    console.log(prepareData); */
    // console.log(prepareData2);
    // return;
    // Fine metodo più veloce

    var data = new google.visualization.DataTable(prepareData);
    // Metodo più leggibile
    /* data.addColumn('string', 'Name');
    data.addColumn('number', 'Salary');
    data.addColumn('boolean', 'Full Time Employee');
    data.addRows([
      ['Mike', { v: 10000, f: '$10,000' }, true],
      ['Jim', { v: 8000, f: '$8,000' }, false],
      ['Alice', { v: 12500, f: '$12,500' }, true],
      ['Bob', { v: 7000, f: '$7,000' }, true]
    ]); */
    // Fine metodo più leggibile

    var tableRef = new google.visualization.Table(document.getElementById('chart_div'));
    // Set chart options
    const options = {
      'title': 'Stock veicoli',
      'showRowNumber': false,
      "allowHTML": true,
      'frozenColumns': 2,
      'alternatingRowStyle': true,
      'width': '100%',
      'height': 500
    };

    var formatter = new google.visualization.NumberFormat(
      { suffix: ' €', negativeColor: 'brown', negativeParens: true });
    // nella proprietà "formatter" del file stock.json viene indicato quale colonna
    // deve essere formattata  "currency", "date", "color", ecc...
    formatter.format(data, Dashboard.sheetSpecs.data.formatter.currency);

    // utilizzo della DataView
    var view = new google.visualization.DataView(data);
    // nascondo la prima colonna
    view.hideColumns([0]);
    tableRef.draw(view, options);
    // utilizzo della DataView

    // utilizzo della DataTable
    // tableRef.draw(data, options);
    // utilizzo della DataTable
  }

  // esempio per competitive-bonus
  app.drawDashboardCB = () => {
    const prepareData = Dashboard.prepareData();
    // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
    // è consentità con la DataView perchè questa è read-only
    let dataTable = new google.visualization.DataTable(prepareData);
    // definisco la formattazione per le percentuali e per i valori currency
    var percFormatter = new google.visualization.NumberFormat(
      { suffix: ' %', negativeColor: 'red', negativeParens: true, fractionDigits: 1 });
    var currencyFormatter = new google.visualization.NumberFormat(
      { suffix: ' €', negativeColor: 'brown', negativeParens: true });
    // console.log(dataFormatted);
    var gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    // Creo i filtri nella Classe Dashboards
    const controls = Dashboard.drawControls(document.getElementById('filter_div'));
    // imposto le class per i CSS
    // NOTE: Definita nel file stock.json

    // La funzione group() utilizza, come primo parametro, una DataTable, quindi si può anche impostare
    // facendo riferimento al chartWrapper con la funzione getDataTable(), ChartWrapper.getDataTable().
    /* let dataGroup = new google.visualization.data.group(
      dataTable, [0, 1, 2, 3, 4, 5, 6, 7],
      [
        // OFFICINA INTERNA (costo_rapporto_6)
        { 'column': 16, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // RA DIRETTA COSTO (costo_rapporto_2)
        // { 'column': 17, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // RA DIRETTA RICAVO (ricavo_rapporto_2)
        // { 'column': 18, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // % MARG. RA DIRETTA (perc_margine_rapporto_2)
        // { 'column': 25, 'aggregation': google.visualization.data.avg, 'type': 'number' },
        // costo ve_cb
        // { 'column': 26, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // ricavo_ve_cb
        // { 'column': 27, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // marginalità
        // { 'column': 28, 'aggregation': google.visualization.data.avg, 'type': 'number' }
      ]
    ); */
    // console.log(JSON.parse(dataGroup.toJSON()));
    // debugger;
    // Dashboard.view = new google.visualization.DataView(dataGroup);
    // Dashboard.view.setColumns([0, 1, 2, 3, 4, 5, 6, 7, 9]);
    // console.log(JSON.parse(Dashboard.view.toJSON()));
    // debugger;

    // var table1 = new google.visualization.ChartWrapper(Dashboard.sheetSpecs.wrapper);
    var table = new google.visualization.ChartWrapper(Dashboard.sheetSpecs.wrapper);
    // esempio array di View
    // table.setView([{ columns: [1, 3, 5, 7, 16] }, { columns: [0, 1, 2, 3] }]);
    table.setView({ columns: [1, 3, 5, 7, 9, 16] });
    // table.draw(document.getElementById('chart_div'));
    // console.log(table.getView());
    // var table2 = new google.visualization.ChartWrapper(Dashboard.sheetSpecs.wrapper);
    // table
    google.visualization.events.addListener(table, 'ready', function() {
      console.log('ready');
      let tableRef = new google.visualization.Table(document.getElementById('chart_div'));
      let tableCloned = table.clone();
      console.log(table.getDataTable());
      tableCloned.setView({ columns: [0, 1, 2, 3, 4] });
      console.log(tableCloned.getDataTable());
      let dataGroup = new google.visualization.data.group(
        tableCloned.getDataTable(), [0, 1, 2, 3, 4, 5, 6, 7],
        [
          // OFFICINA INTERNA (costo_rapporto_6)
          { 'column': 16, 'aggregation': google.visualization.data.sum, 'type': 'number' },
          // RA DIRETTA COSTO (costo_rapporto_2)
          // { 'column': 17, 'aggregation': google.visualization.data.sum, 'type': 'number' },
          // RA DIRETTA RICAVO (ricavo_rapporto_2)
          // { 'column': 18, 'aggregation': google.visualization.data.sum, 'type': 'number' },
          // % MARG. RA DIRETTA (perc_margine_rapporto_2)
          // { 'column': 25, 'aggregation': google.visualization.data.avg, 'type': 'number' },
          // costo ve_cb
          // { 'column': 26, 'aggregation': google.visualization.data.sum, 'type': 'number' },
          // ricavo_ve_cb
          // { 'column': 27, 'aggregation': google.visualization.data.sum, 'type': 'number' },
          // marginalità
          // { 'column': 28, 'aggregation': google.visualization.data.avg, 'type': 'number' }
        ]
      );
      // gdashboard.draw(dataGroup);
      tableRef.draw(dataGroup);
      // tableCloned.draw(document.getElementById('chart_div'));

    });

    // "ubicazione_ds" influenza "marca_veicolo_ds" -> "marca_veicolo_ds" influenza "modello_ds"
    // -> "modello_ds" infleunza "settore_ds" e tutti (l'array Dashboard.controlsWrapper) influenzano la table
    // per ogni bind, nel template....
    /* let binds;
    // Questa logica funziona con il bind() di un filtro verso quello successivo ma
    // possono esserci anche situazioni diverse, che sono da implementare
    Dashboard.sheetSpecs.bind.forEach((v, index) => {
      // console.log('index', index);
      if (index === 0) {
        // il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
        binds = gdashboard.bind(controls[v[0]], controls[v[1]]);
      } else {
        binds.bind(controls[v[0]], controls[v[1]]);
      }
    });
    // Tutti i controlli influenzano la table
    binds.bind(controls, table); */

    gdashboard.bind(controls, table);

    // gdashboard.draw(dataFormatted);
    gdashboard.draw(dataTable);
    // gdashboard.draw(dataGroup); // utilizzo della funzione group
    // gdashboard.draw(Dashboard.view); // utilizzo della DataView
  }

  app.drawDashboard = () => {
    const prepareData = Dashboard.prepareData();
    // Utilizzo la DataTable per poter impostare la formattazione. La formattazione NON
    // è consentità con la DataView perchè questa è read-only
    let dataTable = new google.visualization.DataTable(prepareData);
    // definisco la formattazione per le percentuali e per i valori currency
    var percFormatter = new google.visualization.NumberFormat(
      { suffix: ' %', negativeColor: 'red', negativeParens: true, fractionDigits: 1 });
    var currencyFormatter = new google.visualization.NumberFormat(
      { suffix: ' €', negativeColor: 'brown', negativeParens: true });
    // console.log(dataFormatted);
    var gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    // Creo i filtri nella Classe Dashboards
    const controls = Dashboard.drawControls(document.getElementById('filter_div'));
    /* var filter_ubicazione = new google.visualization.ControlWrapper({
      'controlType': 'CategoryFilter',
      'containerId': 'filter-ubicazione',
      'options': {
        'filterColumnLabel': 'ubicazione_ds',
        'ui': {
          'caption': 'Ubicazione',
          'label': '',
          'cssClass': 'g-category-filter',
          'selectedValuesLayout': 'aside'
          // 'labelStacking': 'horizontal'
        }
      }
    }); */
    // Creo un filtro di tipo CategoryFilter
    /* var filter_vin = new google.visualization.ControlWrapper({
      'controlType': 'CategoryFilter',
      'containerId': 'filter-telaio',
      'options': {
        'filterColumnLabel': 'Telaio_ds',
        'ui': {
          'caption': 'Telaio',
          'label': '',
          'cssClass': 'g-category-filter',
          'selectedValuesLayout': 'belowStacked'
          // 'labelStacking': 'vertical'
        }
      }
    }); */
    // imposto le class per i CSS
    // NOTE: Definita nel file stock.json
    //
    // Per aggiungere una DataView, in un ChartWrapper, non è necessario istanziare un nuovo ogetto DataView
    // ...come fatto in app.drawTable(), la 'view' la dichiaro all'interno del ChartWrapper
    /* var table = new google.visualization.ChartWrapper({
      'chartType': 'Table',
      'containerId': 'chart_div',
      'options': {
        'width': '100%',
        'height': 'auto',
        'page': 'enabled',
        'pageSize': 15,
        'allowHTML': true,
        'cssClassNames': cssClasses
      },
      'view': { 'columns': [0] }
    }); */
    // La funzione group() utilizza, come primo parametro, una DataTable, quindi si può anche impostare
    // facendo riferimento al chartWrapper con la funzione getDataTable(), ChartWrapper.getDataTable().
    /* let dataGroup = new google.visualization.data.group(dataTable, [0, 1, 2, 3, 4, 5, 6, 8, 9],
      [
        // OFFICINA INTERNA (costo_rapporto_6)
        { 'column': 16, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // RA DIRETTA COSTO (costo_rapporto_2)
        // { 'column': 17, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // RA DIRETTA RICAVO (ricavo_rapporto_2)
        // { 'column': 18, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // % MARG. RA DIRETTA (perc_margine_rapporto_2)
        // { 'column': 25, 'aggregation': google.visualization.data.avg, 'type': 'number' },
        // costo ve_cb
        // { 'column': 26, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // ricavo_ve_cb
        // { 'column': 27, 'aggregation': google.visualization.data.sum, 'type': 'number' },
        // marginalità
        // { 'column': 28, 'aggregation': google.visualization.data.avg, 'type': 'number' }
      ]); */
    // NOTE: La funzione group() commentata (sopra) la ricreo utilizzando il template-sheet json

    if (Object.keys(Dashboard.sheetSpecs.data.group).length !== 0) {
      let groupColumns = [];
      Dashboard.sheetSpecs.data.group.columns.forEach(col => {
        groupColumns.push({ column: col.column, aggregation: google.visualization.data[col.aggregation], type: col.type });
      });
      dataTable = new google.visualization.data.group(
        dataTable,
        Dashboard.sheetSpecs.data.group.key,
        groupColumns,
      );
    }

    // NOTE: le proprietà definite nel ChartWrapper vengono impostate nel template-sheet .json, proprietà "wrapper"
    var table = new google.visualization.ChartWrapper(Dashboard.sheetSpecs.wrapper);
    // funzioni di formattazione
    for (const [colIndex, properties] of Object.entries(Dashboard.sheetSpecs.data.formatter)) {
      switch (properties.format) {
        case 'currency':
          currencyFormatter.format(dataTable, +colIndex);
          break;
        case 'percent':
          percFormatter.format(dataTable, +colIndex);
          break;
        default:
          break;
      }
    }
    // console.log(dataTable);

    // "ubicazione_ds" influenza "marca_veicolo_ds" -> "marca_veicolo_ds" influenza "modello_ds"
    // -> "modello_ds" infleunza "settore_ds" e tutti (l'array Dashboard.controlsWrapper) influenzano la table
    // per ogni bind, nel template....
    let binds;
    /* NOTE: viene creata questa struttura di gdashboard.bind()
     *
    * let test = gdashboard.bind(controls[0], controls[1]);
    test.bind(controls[1], controls[2]);
    test.bind(controls[2], controls[3]);
    test.bind(controls, table);
    *
    * che corrisponde a:
     gdashboard.bind(controls[0], controls[1])
      .bind(controls[1], controls[2])
      .bind(controls[2], controls[3])
      .bind(controls, table);
    */
    // Questa logica funziona con il bind() di un filtro verso quello successivo ma
    // possono esserci anche situazioni diverse, che sono da implementare
    Dashboard.sheetSpecs.bind.forEach((v, index) => {
      // console.log('index', index);
      if (index === 0) {
        // il primo bind deve essere creato dall'istanza gdashboard, i successivi posso legarli ad una variabile
        binds = gdashboard.bind(controls[v[0]], controls[v[1]]);
      } else {
        binds.bind(controls[v[0]], controls[v[1]]);
      }
    });
    // Tutti i controlli influenzano la table
    binds.bind(controls, table);

    // gdashboard.draw(dataFormatted);
    gdashboard.draw(dataTable);
    // gdashboard.draw(dataGroup); // utilizzo della funzione group
  }

  // Simulazione della selezione del datamart dello stock
  // token : hdkglro
  // id: 1693909302808
  // leggo il datamart e lo inserisco nel Google Table chart
  // esempio riferito alla creazione della DataTable SENZA la logica del Dashboard (quindi senza l'utilizzo di ControlWrapper)
  /* app.stock = async () => {
    // recupero l'id dello Sheet
    const sheet = JSON.parse(window.localStorage.getItem('hdkglro'));
    if (!sheet.id) return false;
    await fetch(`/fetch_api/${sheet.id}/datamart`)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        console.log(data);
        // google.charts.setOnLoadCallback(app.drawTable(data));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  } */

  // recupero il datamrt
  app.dashboardExample = async () => {
    // recupero l'id dello Sheet stock veicoli nuovi
    // const sheet = JSON.parse(window.localStorage.getItem('hdkglro')); // stock
    const sheet = JSON.parse(window.localStorage.getItem('59yblqr')); // cb
    if (!sheet.id) return false;
    // Chiamta in POST
    // WARN: per la chiamata in POST bisogna aggiungere la route in VerifyCrsfToken.php

    /* const params = sheet.id;
    const url = `/fetch_api/datamart`;
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
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
        google.charts.setOnLoadCallback(app.drawDashboard(data));
        // google.charts.setOnLoadCallback(app.drawTable(data));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      }); */
    // end chiamta in POST
    // Chiamata in GET
    await fetch(`/fetch_api/${sheet.id}/datamart`)
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
        // google.charts.setOnLoadCallback(app.drawDashboard());
        google.charts.setOnLoadCallback(app.drawDashboardCB());
        // google.charts.setOnLoadCallback(app.drawTable(data));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
    // end chiamata in GET
  }

  /* Recupero il .json delle specifiche del report dello Stock */
  /* app.getSheetSpecs = async () => {
    console.log('getSheetSpecs()');
    const sheetLayout = 'stock';
    await fetch('/js/json-sheets/' + sheetLayout + '.json', { method: 'POST' })
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        Dashboard.sheetSpecs = data;
        app.dashboardExample();
      })
      .catch(err => console.error(err));
  } */

  app.getLayouts();

})();
