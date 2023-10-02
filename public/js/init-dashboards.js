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
  google.charts.load('current', { 'packages': ['bar', 'table', 'corechart', 'line', 'controls'], 'language': 'it' });

  // Set a callback to run when the Google Visualization API is loaded.
  // google.charts.setOnLoadCallback(drawChart);

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  function drawChart() {
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
  }

  app.getLayout = async () => {
    const templateLayoutName = 'layout-1';
    await fetch('/js/json-templates/' + templateLayoutName + '.json', { method: 'POST' })
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // app.createLayout(data);
        // imposto i dati di questo Template nella classe
        Template.data = data;
        // creo il template nel DOM
        Template.create();
        // recupero i dati del template-reports-*
        app.getSheetSpecs();
        // app.stock();
        // app.dashboardExample();
      })
      .catch(err => console.error(err));
  }


  app.drawTable = (queryData) => {
    // Metodo più veloce
    const prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(queryData[0])) {
      prepareData.cols.push({ id: key, label: key });
    }
    // aggiungo le righe
    queryData.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        v.push({ v: value });
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

    var table = new google.visualization.Table(document.getElementById('position-1-1'));
    // Set chart options
    const options = {
      'title': 'Stock veicoli',
      'showRowNumber': false,
      'frozenColumns': 2,
      'alternatingRowStyle': true,
      'width': '100%',
      'height': 500
    };

    table.draw(data, options);
    // table.draw(data, { showRowNumber: true, width: '100%', height: '100%' });
  }

  app.drawDashboard = (queryData) => {
    const prepareData = { cols: [], rows: [] };
    // aggiungo le colonne
    for (const key of Object.keys(queryData[0])) {
      prepareData.cols.push({ id: key, label: key });
    }
    // aggiungo le righe
    queryData.forEach(row => {
      let v = [];
      for (const [key, value] of Object.entries(row)) {
        v.push({ v: value });
      }
      prepareData.rows.push({ c: v });
    });
    // var gdashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
    var gdashboard = new google.visualization.Dashboard(document.getElementById('template-layout'));
    // TODO: per lo stock creare i filtri (da configurare in un file JSON):
    // SEDE (Ubicazione)
    // MARCA
    // MODELLI
    // STATO
    // SETTORE
    // STATO ORDINE
    // STATO VHC
    // GIACENZA
    // ...poi i tasti "filtri"
    // CONTRATTI, IN TRATTATIVA, LIBERI, ARRIVATI, IN TRANSITO
    // TODO: Creo i filtri nella Classe Dashboards
    Dashboard.drawControls();
    // return;
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
    const cssClasses = {
      'headerRow': 'g-table-header',
      'tableRow': 'g-table-row',
      'oddTableRow': '',
      'selectedTableRow': '',
      'hoverTableRow': '',
      'headerCell': 'g-header-cell',
      'tableCell': 'g-table-cell',
      'rowNumberCell': ''

    };
    // Create a pie chart, passing some options
    var table = new google.visualization.ChartWrapper({
      'chartType': 'Table',
      'containerId': 'chart_div',
      'options': {
        'width': '100%',
        'height': 'auto',
        'page': 'enabled',
        'pageSize': 15,
        'allowHTML': true,
        'cssClassNames': cssClasses
      }
    });
    // 'pieChart' will update whenever you interact with 'donutRangeSlider'
    // to match the selected range.
    // dashboard.bind([categoryFilter, categoryFilterUbicazione], table);
    // Il filter_ubicazione influenza il filter_vin, il quale a sua volta, influenza la tabella
    // gdashboard.bind(filter_ubicazione, filter_vin).bind(filter_vin, table);
    // gdashboard.bind(Dashboard.controlsWrapper[0], Dashboard.controlsWrapper[1], Dashboard.controlsWrapper[2], Dashboard.controlsWrapper[3]).bind(Dashboard.controlsWrapper[3], table);
    // gdashboard.bind([Dashboard.controlsWrapper[0], Dashboard.controlsWrapper[1], Dashboard.controlsWrapper[2], Dashboard.controlsWrapper[3]], table);
    // "ubicazione_ds" influenza "marca_veicolo_ds" -> "marca_veicolo_ds" influenza "modello_ds"
    // -> "modello_ds" infleunza "settore_ds" e tutti (l'array Dashboard.controlsWrapper) influenzano la table
    gdashboard.bind(Dashboard.controlsWrapper[0], Dashboard.controlsWrapper[1])
      .bind(Dashboard.controlsWrapper[1], Dashboard.controlsWrapper[2])
      .bind(Dashboard.controlsWrapper[2], Dashboard.controlsWrapper[3])
      .bind(Dashboard.controlsWrapper, table);

    gdashboard.draw(prepareData);
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
        Dashboard.data = data;
        google.charts.setOnLoadCallback(app.drawDashboard(data));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  /* Recupero il .json delle specifiche del report dello Stock */
  app.getSheetSpecs = async () => {
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
  }

  // TODO: implementare il layoutche ho lasciato in sospeso dopo l'utilizzo di Dashboard e ControlWrapper
  app.getLayout();

})();
