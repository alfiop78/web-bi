// TODO: 18.09.2024 intercettare le modifiche fatte al report oppure ai filtri, per poter
// abilitare il tasto "Salva"
var App = new Application();
var Template = new Templates();
var Storage = new SheetStorages();
var Resource = new Resources();
(() => {
  var app = {
    layoutRef: document.getElementById('template-layout'),
    // templates
    tmplList: document.getElementById('tmpl-li'),
    // dialogs
    dlgTemplateLayout: document.getElementById('dlg-template-layout'),
    dlgChartSection: document.getElementById('dlg-chart'),
    number: function(properties) {
      return new google.visualization.NumberFormat(properties);
    },
    dashboardName: document.getElementById('dashboardTitle'),
    // dialogs
    dlgDashboard: document.getElementById('dialog-dashboard-open'),
    // buttons
    btnSave: document.getElementById('btnSave'),
    btnPublish: document.getElementById('btnPublish')
  }

  const rand = () => Math.random(0).toString(36).substring(2);

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

  // observer per gli oggetti con [data-mutation-observer]
  // es. Titolo
  const callbackObservers = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          console.log(mutation.target.dataset.mutationObserver);
          // nell'attributo data-mutation-observer è presente il nome della proprietà del json da verificare
          // TEST: 19.09.2024 da completare
          /* const json = JSON.parse(window.sessionStorage.getItem(Resource.json.token));
          if (json) {
            if (json.title !== mutation.target.dataset.value) {
              console.info("Dato modificato");
              app.btnSave.disabled = false;
            }
          } */
        }
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observers = new MutationObserver(callbackObservers);
  document.querySelectorAll('*[data-mutation-observer]').forEach(element => {
    observers.observe(element, { attributes: true, childList: false, subtree: false });
  });


  // Viene rimosso 'hidden' dal #body. In questo modo la modifica viene
  // intercettata dall'observer e vengono associate le funzioni sugli elementi
  // che hanno l'attributo data-fn
  // TODO: utilizzare questa logica anche sulle altre pagine
  App.init();

  // aggiorno tutti gli oggetti della dashboard
  app.updateSheets = async () => {
    let url, params, req = [];
    for (const token of Resource.resource.keys()) {
      url = '/fetch_api/json/sheet_update';
      params = window.localStorage.getItem(token);
      const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
      req.push(new Request(url, init));
    }

    await Promise.all(req.map(req => fetch(req)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.text();
        }))
      })
      .then(response => {
        console.log(response);
        App.showConsole('Tutti gli oggetti della Dashboard sono stati aggiornati', 'done', 2000);
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.clearDashboard = () => {
    // chiudo eventuali dashboard già aperti
    // elimino il template, anche se non è stato ancora selezionato
    app.layoutRef.querySelectorAll('*').forEach(el => el.remove());
    delete app.btnSave.dataset.token;
    delete app.dashboardName.dataset.value;
    // app.btnSave.disabled = true;
    // app.btnPublish.disabled = true;
    app.dashboardName.textContent = app.dashboardName.dataset.defaultValue;
  }

  // recupero l'elenco delle Dashboard appartenenti al DB corrente
  app.openDashboard = async () => {
    app.clearDashboard();
    App.showConsole('Recupero elenco Dashboard', 'info');
    await fetch(`/fetch_api/dashboardsByConnectionId`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        console.log(data);
        const ul = document.getElementById('ul-dashboards');
        data.forEach(dashboard => {
          const content = app.tmplList.content.cloneNode(true);
          const li = content.querySelector('li[data-li]');
          const span = li.querySelector('span');
          li.dataset.token = dashboard.token;
          li.dataset.label = dashboard.name;
          li.addEventListener('click', app.dashboardSelected);
          li.dataset.elementSearch = 'dashboards';
          span.innerText = dashboard.name;
          ul.appendChild(li);
        });
        App.closeConsole();
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
    app.dlgDashboard.showModal();
  }

  // selezione della dashboard da aprire
  app.dashboardSelected = async (e) => {
    App.showConsole(`Recupero dati della Dashboard ${e.currentTarget.dataset.label}`, 'info');
    await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/dashboard_show`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        // console.log(data);
        // imposto il titolo della dashboard
        app.dashboardName.textContent = data.name;
        app.dashboardName.dataset.value = data.name;
        app.dashboardName.dataset.tempValue = data.name;
        // imposto il token sul tasto "Salva" per poter aggiornare la dashboard e non inserirla nel DB
        app.btnSave.dataset.token = data.token;

        Resource.json = JSON.parse(data.json_value);
        console.log(Resource.json);
        // imposto il template della dashboard selezionata
        Template.id = Resource.json.layout;
        // creo l'anteprima nel DOM
        Template.create();
        app.dlgDashboard.close();
        // salvo la dashboard nel session storage, in questo modo posso tenere conto delle modifiche fatte e
        // abilitare/disabilitare di conseguenza il tasto btnSave in base al MutationObserver
        window.sessionStorage.setItem(Resource.json.token, JSON.stringify(Resource.json));
        App.closeConsole();
        // promise.all per recuperare tutti gli oggetti della dashboard
        // TODO: provare la promise.race per poter recuperare i dati
        app.getResources();
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.getResources = () => {
    console.log(Resource.json);
    let urls = [];
    // ciclo le resources
    for (const [token, value] of Object.entries(Resource.json.resources)) {
      // NOTE: logica utilizzata in app.sheetSelected()
      Resource.token = token;
      // il ref corrente, appena aggiunto
      Resource.ref = document.getElementById(value.ref);
      // aggiungo un token per identificare, in publish(), il report (datamart_id)
      Resource.ref.dataset.token = token;
      // recupero le specifiche dello sheet dallo storage, TODO: da valutare se meglio recuperarlo dal DB
      Resource.specs = JSON.parse(window.localStorage.getItem(token)).specs;
      Resource.resource = {
        datamart_id: value.datamart_id,
        userId: value.user_id
      };
      urls.push(`/fetch_api/${value.datamart_id}_${value.user_id}/preview?page=1`)
      // aggiungo la class 'defined' nel div che contiene il grafico/tabella
      Resource.ref.classList.add('defined');
    }
    app.getAllData(urls);
  }

  app.workbookSelected = async (e) => {
    console.log(e.currentTarget.dataset.token);
    // recupero l'elenco degli sheets del workbook selezionato
    await fetch(`/fetch_api/workbook_token/${e.currentTarget.dataset.token}/sheet_indexByWorkbook`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => {
        // console.log(data);
        const ul = document.getElementById('ul-sheets');
        ul.querySelectorAll('li').forEach(el => el.remove());
        data.forEach(sheet => {
          const content = app.tmplList.content.cloneNode(true);
          const li = content.querySelector('li[data-li]');
          const span = li.querySelector('span');
          li.dataset.token = sheet.token;
          li.dataset.datamartId = sheet.datamartId;
          li.dataset.userId = sheet.userId;
          li.dataset.label = sheet.name;
          li.dataset.workbookId = sheet.workbookId;
          li.addEventListener('click', app.sheetSelected);
          li.dataset.elementSearch = 'sheets';
          span.innerText = sheet.name;
          ul.appendChild(li);
        });
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.publish = async (e) => {
    e.target.disabled = true;
    // il tasto "pubblica" deve :
    // - recuperare tutti gli oggetti della pagina (report)
    // - crearne i COPY_TABLE da WEB_BI_timestamp_userId -> WEB_BI_timestamp
    // - salvare le specifiche in bi_sheet_specifications
    console.log(Resource.resource);
    // debugger;
    let urls = [];
    for (const dashboard of Resource.resource.values()) {
      urls.push(`/fetch_api/copy_from/${dashboard.datamart_id}_${dashboard.user_id}/copy_to/${dashboard.datamart_id}/copy_table`);
    }
    console.log(urls);
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.text();
        }))
      })
      .then(data => {
        console.log(data);
        if (data) App.showConsole("Dashboard pubblicata", 'done', 2000);
        app.updateSheets();
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // Salvataggio della Dashboard
  app.save = async (e) => {
    e.target.disabled = true;
    // se è presente dataset.token sto aggiornando una dashboard esistente
    const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
    if (!app.dashboardName.dataset.value) {
      App.showConsole('Titolo non inserito', 'error', 2000);
      app.dashboardName.focus();
      return false;
    }
    // verifica di validità
    if (Resource.resource.size === 0) {
      App.showConsole('Nessun oggetto aggiunto alla Dashboard', 'error', 2000);
      return false;
    }
    const note = document.getElementById('note').value;
    // salvo il json 'dashboard-token' in bi_dashboards
    // TODO: aggiungere la prop 'published' (bool). Questa mi consentirà
    // di visualizzare la dashboard, solo le dashboards pubblicate possono
    // essere visualizzate
    Resource.json = {
      title: app.dashboardName.dataset.value,
      note,
      token,
      type: 'dashboard',
      layout: Template.id,
      resources: Object.fromEntries(Resource.resource)
    }
    console.log(Resource.json);
    debugger;
    // salvo le specifiche solo in locale, quando pubblico la dashboard salvo le specifiche su DB
    const sheet = JSON.parse(window.localStorage.getItem(Resource.specs.token));
    sheet.specs = Resource.specs;
    window.localStorage.setItem(Resource.specs.token, JSON.stringify(sheet));
    // window.localStorage.setItem(`specs_${Resource.specs.token}`, JSON.stringify(Resource.specs));
    // const url = `/fetch_api/json/dashboard_store`;
    const url = (e.target.dataset.token) ? '/fetch_api/json/dashboard_update' : '/fetch_api/json/dashboard_store';
    const params = JSON.stringify(Resource.json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data) {
          App.showConsole("Salvataggio completato", 'done', 2000);
          app.btnPublish.disabled = false;
          e.target.disabled = false;
        }
      })
      .catch((err) => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.preview = (e) => {
    console.log(e.target);
    debugger;
    // TODO: da valutare, potrei visualizzare una preview del dashboard completo di dati
  }

  app.openDlgTemplateLayout = () => app.dlgTemplateLayout.showModal();

  app.getTemplates = async () => {
    // TODO: I Template Layout li devo mettere nel DB invece di metterli nei file .json
    // carico la lista dei template .json, nella dialog
    const urls = [
      `/js/json-templates/layout-generic.json`,
      `/js/json-templates/layout-horizontalCharts.json`,
      `/js/json-templates/layout-horizontalChartsUnequal.json`,
      `/js/json-templates/layout-threeSection.json`,
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
        // creo le preview dei template
        data.forEach(template => {
          // imposto i dati di questo Template nella classe
          Template.data = template;
          Template.id = template.id;
          Template.thumbnails();
        })
      })
      .catch(err => console.error(err));

    // app.dlgTemplateLayout.showModal();
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
    Template.id = template;
    // console.log(template);
    // Template.dashboardRef = document.getElementById('dashboard-preview');
    // creo l'anteprima nel DOM
    Template.create();
  }

  // Fn invocata dal tasto + che viene creato dinamicamente dal layout-template
  // apertura dialog per l'aggiunta del chart o DataTable
  app.addResource = (e) => {
    if (e.currentTarget.classList.contains('defined')) return false;
    // il ref corrente, appena aggiunto
    Resource.ref = document.getElementById(e.currentTarget.id);
    app.dlgChartSection.showModal();
  }

  app.getAllData = async (urls) => {
    let partialData = [];
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then(async (paginateData) => {
        paginateData.forEach((pagData, index) => {
          console.log(pagData.data);
          let recursivePaginate = async (url, index) => {
            // console.log(url);
            await fetch(url).then((response) => {
              // console.log(response);
              if (!response.ok) { throw Error(response.statusText); }
              return response;
            }).then(response => response.json()).then((paginate) => {
              partialData[index] = partialData[index].concat(paginate.data);
              if (paginate.next_page_url) {
                recursivePaginate(paginate.next_page_url);
                console.log(partialData[index]);
              } else {
                // Non sono presenti altre pagine, visualizzo la dashboard
                console.log('tutte le paginate completate :', partialData[index]);
                Resource.data = partialData[index];
                google.charts.setOnLoadCallback(app.drawTable(Resource.resource.token));
              }
            }).catch((err) => {
              App.showConsole(err, 'error');
              console.error(err);
            });
          }
          partialData[index] = pagData.data;
          if (pagData.next_page_url) {
            recursivePaginate(pagData.next_page_url);
          } else {
            // Non sono presenti altre pagine, visualizzo il dashboard
            Resource.data = partialData[index];
            google.charts.setOnLoadCallback(app.drawTable(Resource.resource.token));
            // abilito alcuni tasti dopo aver aperto la dashboard
          }
        });
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // Selezione del report che alimenta il chart_div
  app.sheetSelected = (e) => {
    // recupero le specifiche per questo report (resource)
    // successivamente recupero i dati del datamart
    Resource.token = e.currentTarget.dataset.token;
    // aggiungo un token per identificare, in publish(), il report (datamart_id)
    Resource.ref.dataset.token = e.currentTarget.dataset.token;
    Resource.specs = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token)).specs;
    Resource.resource = {
      datamart_id: e.currentTarget.dataset.datamartId,
      userId: e.currentTarget.dataset.userId
    };
    const urls = [`/fetch_api/${Resource.resource.get(Resource.token).datamart_id}_${Resource.resource.get(Resource.token).user_id}/preview?page=1`];
    app.getAllData(urls);
    app.dlgChartSection.close();
    // aggiungo la class 'defined' nel div che contiene il grafico/tabella
    Resource.ref.classList.add('defined');
  }

  app.createTemplateFilter = (filter) => {
    const filterRef = document.getElementById('filter_div');
    const tmplFilter = document.getElementById('template-filter');
    const tmplFilterContent = tmplFilter.content.cloneNode(true);
    const containerDiv = tmplFilterContent.querySelector('.filter-container.dropzone');
    const filterDiv = containerDiv.querySelector('.preview-filter');
    const btnRemove = containerDiv.querySelector('button');
    filterDiv.id = filter.containerId;
    filterDiv.dataset.name = filter.id;
    // TODO: potrei impostarle con data-fn in MutationObserver
    filterDiv.addEventListener('dragstart', app.filterDragStart);
    containerDiv.addEventListener('dragover', app.filterDragOver);
    containerDiv.addEventListener('dragenter', app.filterDragEnter);
    containerDiv.addEventListener('dragleave', app.filterDragLeave);
    containerDiv.addEventListener('drop', app.filterDrop);
    containerDiv.addEventListener('dragend', app.filterDragEnd);
    btnRemove.dataset.id = filter.containerId;
    btnRemove.dataset.label = filter.filterColumnLabel;
    filterDiv.innerText = filter.caption;
    filterRef.appendChild(containerDiv);
  }

  app.drawTable = () => {
    // aggiungo i filtri se sono stati impostati nel preview sheet
    Resource.specs.filters.forEach(filter => app.createTemplateFilter(filter));

    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // Resource.DOMref = new google.visualization.Table(document.getElementById('chart_div'));
    Resource.DOMref = new google.visualization.Table(Resource.ref);
    Resource.groupFunction();

    // imposto qui il metodo group() perchè per la dashboard è diverso (viene usato il ChartWrapper)
    Resource.dataGroup = new google.visualization.data.group(
      Resource.dataTable, Resource.groupKey, Resource.groupColumn
    );
    Resource.specs.data.group.columns.forEach(metric => {
      let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
      formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
    });
    Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);

    Resource.createDataView();
    // console.info('DataView', Resource.dataViewGrouped);
    Resource.DOMref.draw(Resource.dataViewGrouped, Resource.specs.wrapper.options);
  }

  app.btnRemoveFilter = (e) => {
    const filterId = e.target.dataset.id;
    // const f = Resource.specs.filters.find(filter => filter.containerId === filterId);
    // Cerco, con findIndex(), l'indice corrispondente all'elemento da rimuovere
    const index = Resource.specs.filters.findIndex(filter => filter.containerId === filterId);
    Resource.specs.filters.splice(index, 1);
    // lo rimuovo anche dal DOM
    const filterRef = document.getElementById(filterId);
    filterRef.parentElement.remove();
    // ricostruisco il bind
    Resource.bind()
  }

  // end onclick events

  // onclose dialogs
  // reset dei layout già presenti, verrano ricreati all'apertura della dialog
  // app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

  // reset sheets
  app.dlgChartSection.onclose = () => {
    // document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());
    // document.querySelectorAll('#ul-workbooks > li').forEach(el => el.remove());
  }

  app.dlgDashboard.onclose = () => document.querySelectorAll('#ul-dashboards li').forEach(el => el.remove());

  // Drag events
  app.filterDragStart = (e) => {
    // console.log('dragStart');
    console.log(e.target.id);
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.filterDragEnter = (e) => {
    // console.log('dragEnter');
    e.preventDefault();
    if (e.target.classList.contains('dropzone')) {
      e.target.classList.add('dropping');
    } else {
      console.log('non in dropzone');
      e.dataTransfer.dropEffect = 'none';
    }
  }

  app.filterDragOver = (e) => {
    // console.log('dragOver');
    e.preventDefault();
    // console.log(e.target);
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  app.filterDragLeave = (e) => {
    // console.log('dragLeave');
    e.preventDefault();
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  app.filterDragEnd = (e) => {
    console.log('dragEnd');
    e.preventDefault();
    if (e.dataTransfer.dropEffect === 'move') { }
  }

  app.filterDrop = (e) => {
    e.preventDefault();
    // TODO: implementare anche il drop inverso.
    // Al momento il drop funziona soltanto se sposto un filtro "verso sinistra"
    e.currentTarget.classList.replace('dropping', 'dropped');
    // target corrisponde all'elemento .preview-filter, mentre currentTarget corrisponde al
    // contenitore del filtro
    if (!e.currentTarget.classList.contains('dropzone')) return;
    const parentDiv = document.getElementById('filter_div');
    // id filtro che sto draggando (flt-0, flt-1, ecc...)
    const elementId = e.dataTransfer.getData('text/plain');
    // elementRef è l'elemento che sto spostando "newFilter"...
    const elementRef = document.getElementById(elementId);
    // ...questo elemento lo devo inserire in e.currentTarget
    // sostituendo quello già presente in e.currentTarget
    const oldFilter = e.currentTarget.querySelector('.preview-filter');
    // ... oldFilter lo inserisco nel .filter-container di provenienza
    parentDiv.insertBefore(elementRef.parentElement, oldFilter.parentElement);
    // Salvo tutti i filtri nell'ordine in cui sono stati spostati con drag&drop
    Resource.specs.filters = [];
    parentDiv.querySelectorAll('.filter-container').forEach(filter => {
      const filterDiv = filter.querySelector('.preview-filter');
      Resource.specs.filters.push({
        id: filterDiv.dataset.name,
        containerId: filterDiv.id,
        filterColumnLabel: filterDiv.innerText,
        caption: filterDiv.innerText
      });
    });
    console.log('filters dopo il drop : ', Resource.specs.filters);
  }

  // End Drag events

  app.dashboardName.onblur = (e) => {
    if (e.target.dataset.tempValue) {
      e.target.dataset.value = e.target.textContent;
    } else {
      e.target.innerText = e.target.dataset.defaultValue;
    }
  }

  app.dashboardName.oninput = (e) => App.checkTitle(e.target);

  app.resourceRemove = () => {
    console.log(Resource.ref);
    Resource.ref.querySelector('div').remove();
    Resource.ref.classList.remove('defined');
    document.querySelectorAll('#filter_div.contentObject>*').forEach(el => el.remove());
  }

  app.getTemplates();

})();
