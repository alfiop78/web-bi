var App = new Application();
var Storage = new SheetStorages();
// var storage = new Storages();
(() => {
  var app = {
    ulWorkBooks: document.getElementById('ul-workbooks'),
    ulSheets: document.getElementById('ul-sheets'),
    ulFilters: document.getElementById('ul-filters'),
    ulMetrics: document.getElementById('ul-metrics'),
    btnWorkBooks: document.getElementById('workbooks'),
    tmpl_li: document.getElementById('tmpl-li'),
  }

  App.init();

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
            if (node.hasChildNodes()) {
              node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
            }
          }
        });
      } else if (mutation.type === 'attributes') {
        // console.log(`The ${mutation.attributeName} attribute was modified.`);
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
        }
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  console.log(document.getElementById('body'));
  observerList.observe(document.getElementById('body'), config);

  app.checkObjects = (data) => {
    for (const [type, elements] of Object.entries(data)) {
      elements.forEach(element => {
        const dbElement = JSON.parse(element.json_value);
        const localElement = JSON.parse(localStorage.getItem(dbElement.token));
        // console.log(element, element.token);
        // verifico lo stato dell'elemento in ciclo rispetto al localStorage 
        // (sincronizzato, non sincronizzato, ecc...)
        const ul = document.querySelector(`ul[data-type='${type}']`);
        let li;
        if (ul.querySelector(`li[id='${dbElement.token}']`)) {
          // l'elemento in ciclo (dal db) è presente anche in locale
          li = ul.querySelector(`li[id='${dbElement.token}']`);
          const statusIcon = li.querySelector('i[data-sync-status]');
          li.dataset.sync = 'true';
          // verifico se l'elemento in ciclo è "identico" all'elemento in storage
          if (dbElement.updated_at && (localElement.updated_at === dbElement.updated_at)) {
            // oggetti identici
            li.dataset.identical = 'true';
            statusIcon.innerText = "done";
          } else {
            // oggetti con updated_at diverse
            // TODO: qui devo scegliere se fare un aggiornamento locale->DB oppure DB->locale
            li.dataset.identical = 'false';
            statusIcon.innerText = "sync_problem";
          }
        } else {
          // l'elemento non è presente in locale
          // aggiungo l'elemento alla <ul> con attributo data-storage="db"
          app.addElement(dbElement.token, dbElement, 'db');
        }
      })
    }
  }

  app.getDB = async () => {
    // promise.all, recupero tutti gli elementi presenti sul DB (dimensioni, cubi, filtri, ecc...)
    const urls = [
      '/fetch_api/versioning/workbooks',
      '/fetch_api/versioning/sheets',
      '/fetch_api/versioning/metrics',
      '/fetch_api/versioning/filters',
    ];
    // ottengo tutte le risposte in un array
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        data.forEach((elementData) => app.checkObjects(elementData));
      })
      .catch(err => console.error(err));
  }

  app.addElement = (token, object, storage) => {
    const content_li = app.tmpl_li.content.cloneNode(true);
    const li = content_li.querySelector('li');
    const statusIcon = li.querySelector('i[data-sync-status]');
    const span = li.querySelector('span[data-value]');
    const workBookRef = li.querySelector('span[data-workbook_ref]');
    const btnDownload = li.querySelector('button[data-download]');
    const btnUpload = li.querySelector('button[data-upload]');
    const btnUpgrade = li.querySelector('button[data-upgrade]');
    const btnDelete = li.querySelector('button[data-delete]');
    if (storage === 'db') statusIcon.innerText = 'sync';
    li.dataset.elementSearch = object.type;
    li.dataset.storage = storage;
    li.id = token;
    btnDownload.dataset.token = token;
    btnUpload.dataset.token = token;
    btnUpgrade.dataset.token = token;
    btnDelete.dataset.token = token;
    switch (object.type) {
      case 'sheet':
      case 'workbook':
      case 'filter':
        li.dataset.label = object.name;
        span.dataset.value = object.name;
        span.innerText = object.name;
        if (object.type === 'filter') workBookRef.innerText = object.workbook_ref;
        break;
      default:
        li.dataset.label = object.alias;
        span.dataset.value = object.alias;
        span.innerText = object.alias;
        workBookRef.innerText = object.workbook_ref;
        break;
    }
    btnUpload.dataset.upload = object.type;
    btnUpgrade.dataset.upgrade = object.type;
    btnDownload.dataset.download = object.type;
    btnDelete.dataset.delete = object.type;
    document.querySelector(`#ul-${object.type}`).appendChild(li);
  }

  app.getLocal = () => {
    // lista di tutti gli sheet del workbook in ciclo
    for (const [token, object] of Object.entries(Storage.getAll())) {
      app.addElement(token, object, 'local');
    }
  }

  app.init = () => {
    // scarico elenco oggetti dal DB (WorkBooks, WorkSheets e Sheets)
    // visualizzo oggetti locali (da qui possono essere salvati su DB)
    // imposto data-fn sugli elementi di ul-objects
    document.querySelector('menu').dataset.init = 'true';
    // recupero tutti gli elementi in localStorage per inserirli nelle rispettive <ul> impostate in hidden
    app.getLocal();
    app.getDB();
  }

  app.selectObject = (e) => {
    document.querySelectorAll('menu button[data-selected]').forEach(button => delete button.dataset.selected);
    e.target.dataset.selected = 'true';
    // nascondo la <ul> attualmente visibile
    document.querySelector('ul.elements:not([hidden])').hidden = true;
    // visualizzo la <ul> corrispondente all'object selezionato
    document.querySelector(`#ul-${e.currentTarget.id}`).hidden = false;
  }

  app.uploadObject = async (e) => {
    // let url = '/fetch_api/json/workbook_store';
    let url = `/fetch_api/json/${e.currentTarget.dataset.upload}_store`;
    const json = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token));
    const params = JSON.stringify(json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    // recupero l'elemento da salvare su db, presente nello storage
    // console.log(JSON.stringify(json));
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
          console.log('data : ', data);
        } else {
          console.error("Errore nell'aggiornamento della risorsa");
        }
      })
      .catch((err) => console.error(err));
  }

  app.upgradeObject = async (e) => {
    // TODO: questa Fn è identica a app.uploadObject(), trovare il modo di utilizzarne solo una
    let url = `/fetch_api/json/${e.currentTarget.dataset.upgrade}_update`;
    const json = JSON.parse(window.localStorage.getItem(e.currentTarget.dataset.token));
    const params = JSON.stringify(json);
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    // recupero l'elemento da salvare su db, presente nello storage
    // console.log(JSON.stringify(json));
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
          console.log('data : ', data);
        } else {
          console.error("Errore nell'aggiornamento della risorsa");
        }
      })
      .catch((err) => console.error(err));
  }

  app.deleteObject = async (e) => {
    await fetch(`/fetch_api/name/${e.currentTarget.dataset.token}/${e.currentTarget.dataset.delete}_destroy`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('ELEMENTO ELIMINATO CON SUCCESSO!');
          // TODO: lo elimino anche dal localStorage se presente
          // window.localStorage.removeItem(e.currentTarget.dataset.token);
          // TODO: elimino anche dal DOM l'elemento
        } else {
          console.error("Errore nella cancellazione della risorsa!");
        }
      })
      .catch((err) => console.error(err));
  }

  app.init();

  // -------------------------

  app.downloadObjectFromDB = async (name, type) => {
    let url;
    switch (type) {
      case 'dimensions':
        url = '/fetch_api/name/' + name + '/dimension_show';
        break;
      case 'cubes':
        url = '/fetch_api/name/' + name + '/cube_show';
        break;
      case 'filters':
        url = '/fetch_api/name/' + name + '/filter_show';
        break;
      case 'metrics':
        url = '/fetch_api/name/' + name + '/metric_show';
        break;
      default:
        url = '/fetch_api/name/' + name + '/process_show';
        break;
    }
    await fetch(url)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('ELEMENTO SCARICATO CON SUCCESSO!');
          storage.save = JSON.parse(data.json_value);
          const sectionElement = app.dialogVersioning.querySelector("section[data-object-name='" + name + "'][data-object-type='" + type + "']");
          console.log('sectionElement : ', sectionElement);
          // modifico l'icona in .vers-status impostando sync con la classe md-status al posto di md-warning
          sectionElement.querySelector('.vers-status > button').innerText = 'sync';
          sectionElement.querySelector('.vers-status > button').classList.replace('md-warning', 'md-status');
          // modifico la descrizione in .vers-status-descr impostando "Sincronizzato"
          sectionElement.querySelector('.vers-status-descr').innerText = 'Sincronizzato';
          // nascondo l'icona btn-download e btn-upgrade-production
          sectionElement.querySelector('.vers-actions button[data-id="btn-download"]').disabled = true;
          sectionElement.querySelector('.vers-actions button[data-id="btn-upgrade-production"]').disabled = true;
        } else {
          // TODO: 
        }
      })
      .catch((err) => console.error(err));
  }

})();
