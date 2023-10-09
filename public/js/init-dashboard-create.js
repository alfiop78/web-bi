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
    const json = {
      title, note
    }
    window.localStorage.setItem('dashboardToken', JSON.stringify(json));
  }

  app.preview = (e) => {
    console.log(e.target);
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
    const chartSection = document.querySelector('.dashboard #chart_div');
    const btnAddChart = document.createElement('button');
    btnAddChart.innerText = 'Add Chart';
    btnAddChart.addEventListener('click', app.addChart);
    chartSection.appendChild(btnAddChart);
    // opzioni
    const btnConfigure = document.createElement('button');
    btnConfigure.innerText = 'Configura';
    // btnConfigure.disabled = true;
    btnConfigure.addEventListener('click', app.chartSettings);
    chartSection.appendChild(btnConfigure);
  }

  // apertura dialog per l'aggiunta del chart o DataTable
  app.addChart = () => {
    console.log('addChart');
    const ul = document.getElementById('ul-sheets');
    // TODO: carico elenco sheets del localStorage
    for (const [token, sheet] of Object.entries(Storage.getSheets())) {
      console.log(token, sheet);
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

  app.createJsonColumns = (token) => {
    console.log(Storage.workBook.fields_new[token]);
    Dashboard.addColumns(Storage.workBook.fields_new[token]);

  }

  app.dashboardExample = async () => {
    // recupero l'id dello Sheet stock veicoli nuovi
    const sheet = JSON.parse(window.localStorage.getItem('hdkglro')); // stock
    // const sheet = JSON.parse(window.localStorage.getItem('59yblqr')); // cb
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
        // debugger;
        Dashboard.data = data;
        google.charts.setOnLoadCallback(app.drawTable(data));
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // Selezione del report che alimenta il chart_div
  app.sheetSelected = (e) => {
    app.dashboardExample();
    app.dlgChartSection.close();
    /* Storage.sheet = e.currentTarget.dataset.token;
    Storage.workBook = Storage.sheet.workbook_ref;
    const ul = document.getElementById('ul-columns');
    // console.log(Storage.sheet);
    // console.log(Storage.workBook);
    for (const [token, field] of Object.entries(Storage.sheet.fields)) {
      console.log(Storage.workBook.fields_new[token]);
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li-detail]');
      const value = li.querySelector('span[data-value]');
      const detail = li.querySelector('small[data-detail]');
      li.dataset.token = token;
      li.dataset.label = Storage.workBook.fields_new[token].name;
      li.addEventListener('click', app.columnSelected);
      li.dataset.elementSearch = 'fields';
      // value.innerText = Storage.workBook.fields_new[token].name;
      value.innerText = field;
      detail.innerText = Storage.workBook.fields_new[token].table;
      app.createJsonColumns(token);
      ul.appendChild(li);
    }
    app.dlgChartSection.close(); */
  }

  app.drawTable = () => {
    var data = new google.visualization.DataTable(Dashboard.prepareDataPreview());

    var tableRef = new google.visualization.Table(document.getElementById('chart_div'));
    // Set chart options
    const options = {
      'title': 'Stock veicoli',
      'showRowNumber': true,
      "allowHTML": true,
      'alternatingRowStyle': true,
      'width': '80vw',
      'height': 'auto',
      'page': 'enabled',
      'pageSize': 5
    };

    // utilizzo della DataView
    // var view = new google.visualization.DataView(data);
    // nascondo la prima colonna
    // view.hideColumns([0]);
    // tableRef.draw(view, options);
    // utilizzo della DataView

    // utilizzo della DataTable
    tableRef.draw(data, options);
    // utilizzo della DataTable
    google.visualization.events.addListener(tableRef, 'ready', () => {
      console.log('ready');
      document.querySelectorAll('table thead').forEach(thead => {
        thead.onclick = (e) => {
          console.log(e.target);
          console.log(data.getColumnId(1));
          console.log(data.getColumnLabel(1));
          debugger;
        }
      });
    });
  }

  // Selezione di una colonna per la configurazione
  app.columnSelected = (e) => {
    console.log(e.currentTarget.dataset.token);
    document.querySelector('#btnSaveField').dataset.token = e.currentTarget.dataset.token;
    const label = document.getElementById('field-label');
    label.value = Storage.sheet.fields[e.currentTarget.dataset.token];
  }

  app.btnSaveField = (e) => {
    /* let json = {};
    let data = { columns: {}, formatter: { currency: [], percent: [] } };
    let filters = [];
    let bind = [];
    let wrapper = {
      chartType: null,
      containerId: null,
      options: {
        width: "100%",
        height: "auto",
        page: "enabled",
        frozenColumns: 0,
        pageSize: 20,
        allowHTML: true,
        cssClassNames: {
          headerRow: "g-table-header",
          tableRow: "g-table-row",
          oddTableRow: "",
          selectedTableRow: "",
          hoverTableRow: "",
          headerCell: "g-header-cell",
          tableCell: "g-table-cell",
          rowNumberCell: ""
        }
      },
      view: {
        columns: []
      }
    }; */
    let columnKey = Storage.workBook.fields_new[e.currentTarget.dataset.token].name;
    // nome della colonna deciso nello sheet
    // const column = Storage.sheet.fields[e.currentTarget.dataset.token];
    const label = document.getElementById('field-label');
    const select = document.getElementById('field-datatype');
    const index = select.selectedIndex;
    const type = select.options[index].value;
    const key = `${columnKey}_ds`;
    // console.log(Dashboard.json.data.columns[key]);
    Dashboard.json.data.columns[key].type = type;
    Dashboard.json.data.columns[key].label = label.value.toUpperCase();
    // Dashboard.addFormatter();
  }

  app.chartSettings = () => app.dlgConfig.showModal();

  app.btnSaveConfig = () => {
    debugger;

  }

  // end onclick events

  // onclose dialogs
  // reset dei layout già presenti, verrano ricreati all'apertura della dialog
  app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

  // reset sheets
  app.dlgChartSection.onclose = () => document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());
  // end onclose dialogs

})();
