var App = new Application();
var Template = new Templates();
var Dashboard = new Dashboards(); // istanza della Classe Dashboards, da inizializzare quando ricevuti i dati dal datamart
var Storage = new SheetStorages();
var Resource = new Resources();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    // dialogs
    dlgTemplateLayout: document.getElementById('dlg-template-layout'),
    dlgChartSection: document.getElementById('dlg-chart'),
    number: function(properties) {
      return new google.visualization.NumberFormat(properties);
    },
    titleRef: document.getElementById('dashboardTitle')
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

  // Viene rimosso 'hidden' dal #body. In questo modo la modifica viene
  // intercettata dall'observer e vengono associate le funzioni sugli elementi
  // che hanno l'attributo data-fn
  // TODO: utilizzare questa logica anche sulle altre pagine
  App.init();

  app.saveSpecifications = async () => {
    let url, params, req = [];
    for (const token of Resource.resource.keys()) {
      url = `/fetch_api/json/sheet_specs_upsert`;
      params = window.localStorage.getItem(`specs_${token}`);
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
        debugger;
        console.log(response);
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.publish = async () => {
    // il tasto "pubblica" deve :
    // - recuperare tutti gli oggetti della pagina (report)
    // - crearne i COPY_TABLE da WEB_BI_timestamp_userId -> WEB_BI_timestamp
    // - salvare le specifiche in bi_sheet_specifications
    console.log(Resource.resource);
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
      .then(response => {
        console.log(response);
        app.saveSpecifications();
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // onclick events
  app.save = async (e) => {
    console.log(e.target);
    const token = rand().substring(0, 7);
    const title = document.getElementById('dashboardTitle').dataset.value;
    const note = document.getElementById('note').value;
    // salvo il json 'dashboard-token' in bi_dashboards
    // TODO: aggiungere la prop 'published' (bool). Questa mi consentirà
    // di visualizzare la dashboard, solo le dashboards pubblicate possono
    // essere visualizzate
    let json = {
      title, note, token, type: 'dashboard',
      layout: Template.id,
      resources: Object.fromEntries(Resource.resource)
    };
    debugger;
    console.log(json);
    // salvo le specifiche solo in locale, quando pubblico la dashboard salvo le specifiche su DB
    window.localStorage.setItem(`specs_${Resource.json.token}`, JSON.stringify(Resource.json));
    const url = `/fetch_api/json/dashboard_store`;
    const params = JSON.stringify(json);
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
        debugger;
      })
      .catch((err) => console.error(err));
  }

  app.preview = (e) => {
    console.log(e.target);
    debugger;
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
    debugger;
    Template.id = template;
    // console.log(template);
    Template.dashboardRef = document.getElementById('dashboard-preview');
    // creo l'anteprima nel DOM
    Template.create();
  }

  // Fn invocata dal tasto + che viene creato dinamicamente dal layout-template
  // apertura dialog per l'aggiunta del chart o DataTable
  app.addResource = (e) => {
    // il ref corrente, appena aggiunto
    Resource.ref = document.getElementById(e.currentTarget.id);
    const ul = document.getElementById('ul-sheets');
    // pulisco <ul>
    ul.querySelectorAll('li').forEach(el => el.remove());
    // carico elenco sheets del localStorage
    for (const [token, sheet] of Object.entries(Storage.getSheets())) {
      // console.log(token, sheet);
      const content = app.tmplList.content.cloneNode(true);
      const li = content.querySelector('li[data-li]');
      const span = li.querySelector('span');
      li.dataset.token = token;
      li.dataset.datamartId = sheet.id;
      li.dataset.userId = sheet.userId;
      li.dataset.label = sheet.name;
      li.addEventListener('click', app.sheetSelected);
      li.dataset.elementSearch = 'sheets';
      span.innerText = sheet.name;
      ul.appendChild(li);
    }
    app.dlgChartSection.showModal();
  }

  app.getData = async () => {
    let partialData = [];
    // TODO: aggiungere la progressBar anche qui
    await fetch(`/fetch_api/${Resource.resource.get(Resource.token).datamart_id}_${Resource.resource.get(Resource.token).user_id}/preview?page=1`)
      .then((response) => {
        // console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(async (paginateData) => {
        console.log(paginateData);
        console.log(paginateData.data);
        // debugger;
        // Resource.data = paginateData.data;
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          // console.log(url);
          await fetch(url).then((response) => {
            // console.log(response);
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          }).then(response => response.json()).then((paginate) => {
            partialData = partialData.concat(paginate.data);
            if (paginate.next_page_url) {
              recursivePaginate(paginate.next_page_url);
              console.log(partialData);
            } else {
              // Non sono presenti altre pagine, visualizzo la dashboard
              console.log('tutte le paginate completate :', partialData);
              Resource.data = partialData;
              google.charts.setOnLoadCallback(app.drawTable(Resource.resource.token));
            }
          }).catch((err) => {
            App.showConsole(err, 'error');
            console.error(err);
          });
        }
        partialData = paginateData.data;
        if (paginateData.next_page_url) {
          recursivePaginate(paginateData.next_page_url);
        } else {
          // Non sono presenti altre pagine, visualizzo il dashboard
          Resource.data = partialData;
          google.charts.setOnLoadCallback(app.drawTable(Resource.resource.token));
        }
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
    Resource.json = window.localStorage.getItem(`specs_${e.currentTarget.dataset.token}`);
    Resource.resource = {
      datamart_id: e.currentTarget.dataset.datamartId,
      userId: e.currentTarget.dataset.userId
    };
    app.getData(e.currentTarget.dataset.token);
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
    Resource.json.filters.forEach(filter => app.createTemplateFilter(filter));

    Resource.dataTable = new google.visualization.DataTable(Resource.prepareData());
    // Resource.DOMref = new google.visualization.Table(document.getElementById('chart_div'));
    Resource.DOMref = new google.visualization.Table(Resource.ref);
    Resource.groupFunction();

    // imposto qui il metodo group() perchè per la dashboard è diverso (viene usato il ChartWrapper)
    Resource.dataGroup = new google.visualization.data.group(
      Resource.dataTable, Resource.groupKey, Resource.groupColumn
    );
    Resource.json.data.group.columns.forEach(metric => {
      let formatter = app[metric.properties.formatter.type](metric.properties.formatter.prop);
      formatter.format(Resource.dataGroup, Resource.dataGroup.getColumnIndex(metric.alias));
    });
    Resource.dataViewGrouped = new google.visualization.DataView(Resource.dataGroup);

    Resource.createDataView();
    // console.info('DataView', Resource.dataViewGrouped);
    Resource.DOMref.draw(Resource.dataViewGrouped, Resource.json.wrapper.options);
  }

  app.btnRemoveFilter = (e) => {
    const filterId = e.target.dataset.id;
    // const f = Resource.json.filters.find(filter => filter.containerId === filterId);
    // Cerco, con findIndex(), l'indice corrispondente all'elemento da rimuovere
    const index = Resource.json.filters.findIndex(filter => filter.containerId === filterId);
    Resource.json.filters.splice(index, 1);
    // lo rimuovo anche dal DOM
    const filterRef = document.getElementById(filterId);
    filterRef.parentElement.remove();
    // ricostruisco il bind
    Resource.bind()
  }

  // end onclick events

  // onclose dialogs
  // reset dei layout già presenti, verrano ricreati all'apertura della dialog
  app.dlgTemplateLayout.onclose = () => document.querySelectorAll('#thumbnails *').forEach(layouts => layouts.remove());

  // reset sheets
  app.dlgChartSection.onclose = () => document.querySelectorAll('#ul-sheets > li').forEach(el => el.remove());

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
    Resource.json.filters = [];
    parentDiv.querySelectorAll('.filter-container').forEach(filter => {
      const filterDiv = filter.querySelector('.preview-filter');
      Resource.json.filters.push({
        id: filterDiv.dataset.name,
        containerId: filterDiv.id,
        filterColumnLabel: filterDiv.innerText,
        caption: filterDiv.innerText
      });
    });
    console.log('filters dopo il drop : ', Resource.json.filters);
  }

  // End Drag events

  app.titleRef.addEventListener('blur', (e) => {
    e.target.dataset.value = e.target.innerHTML;
  });

})();
