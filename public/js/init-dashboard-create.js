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
  }

  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.info('A child node has been added or removed.');
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
        console.log(`The ${mutation.attributeName} attribute was modified.`);
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
    const btnOptions = document.createElement('button');
    btnOptions.innerText = 'Opzioni';
    btnOptions.disabled = true;
    btnOptions.addEventListener('click', app.settingOptions);
    chartSection.appendChild(btnOptions);
  }

  // apertura dialog per l'aggiunta del chart o DataTable
  app.addChart = () => {
    console.log('addChart');
    app.dlgChartSection.showModal();
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
  }

  // Selezione del report che alimenta il chart_div
  app.sheetSelected = (e) => {
    console.log('sheetSelected');
    const token = e.currentTarget.dataset.token;
  }

  app.btnSheetDone = () => {
    console.log('sheetDone');
    // TODO: Sheet selezionato, abilito il tasto Opzioni
  }
  // end onclick events

  // onclose dialogs
  app.dlgTemplateLayout.onclose = () => {
    // reset dei layout già presenti, verrano ricreati all'apertura della dialog
    document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());
  }

  app.dlgChartSection.onclose = () => { }
  // end onclose dialogs

})();
