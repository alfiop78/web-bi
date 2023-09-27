var App = new Application();
var Storage = new SheetStorages();
(() => {
  var app = {
    tmpl_li: document.getElementById('tmpl-li'),
  }

  App.init();

  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.info('A child node has been added or removed.');
        Array.from(mutation.addedNodes).forEach(node => {
          // console.log(node);
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
  // console.log(document.getElementById('body'));
  observerList.observe(document.getElementById('body'), config);

  app.checkObjects = (data) => {
    for (const [type, elements] of Object.entries(data)) {
      // console.log(elements);
      elements.forEach(element => {
        const dbElement = JSON.parse(element.json_value);
        const localElement = JSON.parse(localStorage.getItem(dbElement.token));
        // console.log(element, element.token);
        // verifico lo stato dell'elemento in ciclo rispetto al localStorage
        // (sincronizzato, non sincronizzato, ecc...)
        const div = document.querySelector(`div[data-type='${type}']`);
        let li;
        if (div.querySelector(`li[id='${dbElement.token}']`)) {
          // l'elemento in ciclo (dal db) è presente anche in locale
          li = div.querySelector(`li[id='${dbElement.token}']`);
          const statusIcon = li.querySelector('i[data-sync-status]');
          li.dataset.sync = 'true';
          // verifico se l'elemento in ciclo è "identico" all'elemento in storage
          if (dbElement.updated_at && (localElement.updated_at === dbElement.updated_at)) {
            // oggetti identici
            li.dataset.identical = 'true';
            statusIcon.classList.add('done');
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
      });
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
    const liContent = li.querySelector('.li-content');
    const inputCheck = li.querySelector('input');
    const statusIcon = li.querySelector('i[data-sync-status]');
    const span = li.querySelector('span[data-value]');
    // const updated_at = li.querySelector('span[data-updated_at]');
    const workBookRef = li.querySelector('span[data-workbook_ref]');
    const btnDownload = li.querySelector('button[data-download]');
    const btnUpload = li.querySelector('button[data-upload]');
    const btnUpgrade = li.querySelector('button[data-upgrade]');
    const btnDelete = li.querySelector('button[data-delete]');
    if (storage === 'db') statusIcon.innerText = 'sync';
    inputCheck.dataset.id = token;
    inputCheck.dataset.type = object.type;
    inputCheck.addEventListener('click', app.checked);
    li.dataset.elementSearch = object.type;
    li.dataset.storage = storage;
    li.id = token;
    liContent.dataset.token = token;
    liContent.dataset.storage = storage;
    liContent.dataset.type = object.type;
    btnDownload.dataset.token = token;
    btnUpload.dataset.token = token;
    btnUpgrade.dataset.token = token;
    btnDelete.dataset.token = token;
    // la proprietà workbook_ref viene impostata come dataset
    if (object.hasOwnProperty('workbook_ref')) {
      li.dataset.workbookRef = object.workbook_ref;
      btnDownload.dataset.workbookRef = object.workbook_ref;
      btnUpload.dataset.workbookRef = object.workbook_ref;
      btnUpgrade.dataset.workbookRef = object.workbook_ref;
      btnDelete.dataset.workbookRef = object.workbook_ref;
      // TODO: recupero il nome del WorkBook a cui è associato questa risorsa
      // Questo deve essere fatto DOPO il caricamento degli oggetti dal DB
      // const workbookName = document.querySelector(`#ul-workbook > li[id='${object.workbook_ref}']`);
      // workBookRef.innerText = workbookName.dataset.label;
    }
    switch (object.type) {
      case 'sheet':
      case 'workbook':
      case 'filter':
        li.dataset.label = object.name;
        span.dataset.value = object.name;
        span.innerText = object.name;
        /* if (object.hasOwnProperty('workbook_ref')) {
          // recupero il nome del workBook a cui si riferisce la risorsa in ciclo
          if (window.localStorage.getItem(object.workbook_ref)) {
            const workBook = JSON.parse(window.localStorage.getItem(object.workbook_ref)).name;
            workBookRef.innerText = workBook;
          }
        } */
        break;
      default:
        li.dataset.label = object.alias;
        span.dataset.value = object.alias;
        span.innerText = object.alias;
        /* if (window.localStorage.getItem(object.workbook_ref)) {
          const workBook = JSON.parse(window.localStorage.getItem(object.workbook_ref)).name;
          workBookRef.innerText = workBook;
        } */
        break;
    }
    btnUpload.dataset.upload = object.type;
    btnUpgrade.dataset.upgrade = object.type;
    btnDownload.dataset.download = object.type;
    btnDelete.dataset.delete = object.type;
    // updated_at.innerText = object.updated_at;
    document.querySelector(`#ul-${object.type}`).appendChild(li);
  }

  app.getLocal = () => {
    // lista di tutti gli sheet del workbook in ciclo
    for (const [token, object] of Object.entries(Storage.getAll())) {
      app.addElement(token, object, 'local');
    }
  }

  // Verifico gli elementi selezionati in modo da abilitare/disabilitare alcuni tasti in
  // .allButtons
  app.checkVersioning = (type) => {
    // Ciclo gli elementi selezionati
    console.clear();
    // se è stato selezionato più di un elemento visualizzo .allButtons
    const countChecked = document.querySelectorAll(`#ul-${type} li input:checked`).length;
    // visualizzo/nascondo .allButtons
    document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = (countChecked > 1) ? false : true;
    if (countChecked > 1) {
      const allButtons = {
        upload: document.querySelector(`button[data-type='${type}'][data-upload]`),
        download: document.querySelector(`button[data-type='${type}'][data-download]`),
        upgrade: document.querySelector(`button[data-type='${type}'][data-upgrade]`),
        delete: document.querySelector(`button[data-type='${type}'][data-delete]`),
      }
      // Not Sync abilita i tasti download, upgrade, delete
      const NotSync = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'false' && el.parentElement.dataset.storage === 'local');
      (NotSync) ? allButtons.upload.disabled = false : allButtons.upload.disabled = true;
      // data-synx=false data-storage=db : Visualizzazione download
      // elementi presenti SOLO su DB
      const NotSyncDB = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'false' && el.parentElement.dataset.storage === 'db');
      (NotSyncDB) ? allButtons.download.disabled = false : allButtons.download.disabled = true;
      if (!NotSyncDB && !NotSync) {
        // data-sync=true e data-identical=false
        const notIdentical = [...document.querySelectorAll(`#ul-${type} input:checked`)].every(el => el.parentElement.dataset.sync === 'true' && el.parentElement.dataset.identical === 'false');
        if (notIdentical) {
          allButtons.download.disabled = false;
          allButtons.upgrade.disabled = false;
        } else {
          allButtons.download.disabled = true;
          allButtons.upgrade.disabled = true;
        }
      }
    }
  }

  app.downloadAll = async (e) => {
    const type = e.target.dataset.type;
    let urls = [];
    document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
      urls.push(`/fetch_api/name/${el.dataset.id}/${type}_show`);
    });
    // ottengo tutte le risposte in un array
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        if (data) {
          data.forEach(json => {
            Storage.save(JSON.parse(json.json_value))
            // aggiorno lo status dell'elemento dopo il download
            const li = document.getElementById(`${json.token}`);
            const statusIcon = li.querySelector('i[data-sync-status]');
            li.dataset.sync = 'true';
            li.dataset.identical = 'true';
            statusIcon.classList.add('done');
            statusIcon.innerText = "done";
          });
          // de-seleziono gli elementi selezionati
          app.unselect(type);
          App.showConsole('Sincronizzazione completata con successo!', 'done', 3000);
        } else {
          App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
        }
      })
      .catch(err => console.error(err));
  }

  app.uploadAll = async (e) => {
    const type = e.target.dataset.type;
    let requests = [], tokens = [];
    document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
      const json = JSON.parse(window.localStorage.getItem(el.dataset.id));
      tokens.push(el.dataset.id);
      const params = JSON.stringify(json);
      const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
      requests.push(new Request(`/fetch_api/json/${type}_store`, init));
    });
    // ottengo tutte le risposte in un array
    await Promise.all(requests.map(req => fetch(req)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        // console.log(data);
        if (data) {
          tokens.forEach(token => {
            // aggiorno lo status dell'elemento dopo l'upload
            const li = document.getElementById(`${token}`);
            const statusIcon = li.querySelector('i[data-sync-status]');
            li.dataset.sync = 'true';
            li.dataset.identical = 'true';
            statusIcon.classList.add('done');
            statusIcon.innerText = "done";
          });
          // de-seleziono gli elementi selezionati
          app.unselect(type);
          App.showConsole('Sincronizzazione completata con successo!', 'done', 3000);
        } else {
          // console.error("Errore nell'aggiornamento della risorsa");
          App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
        }
      })
      .catch(err => console.error(err));
  }

  app.upgradeAll = async (e) => {
    const type = e.target.dataset.type;
    let requests = [], tokens = [];
    document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
      const json = JSON.parse(window.localStorage.getItem(el.dataset.id));
      tokens.push(el.dataset.id);
      const params = JSON.stringify(json);
      const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
      requests.push(new Request(`/fetch_api/json/${type}_update`, init));
    });
    // ottengo tutte le risposte in un array
    await Promise.all(requests.map(req => fetch(req)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        if (data) {
          tokens.forEach(token => {
            // aggiorno lo status dell'elemento dopo l'upload
            const li = document.getElementById(`${token}`);
            const statusIcon = li.querySelector('i[data-sync-status]');
            li.dataset.sync = 'true';
            li.dataset.identical = 'true';
            statusIcon.classList.add('done');
            statusIcon.innerText = "done";
          });
          // de-seleziono gli elementi selezionati
          app.unselect(type);
          App.showConsole('Sincronizzazione completata con successo!', 'done', 3000);
        } else {
          App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
        }
      })
      .catch(err => console.error(err));
  }

  app.deleteAll = async (e) => {
    const type = e.target.dataset.type;
    let urls = [], tokens = [];
    document.querySelectorAll(`#ul-${type} li input:checked`).forEach(el => {
      urls.push(`/fetch_api/name/${el.dataset.id}/${type}_destroy`);
      tokens.push(el.dataset.id);
    });
    // ottengo tutte le risposte in un array
    await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response.json();
        }))
      })
      .then((data) => {
        if (data) {
          // console.log(data);
          tokens.forEach(token => {
            // aggiorno lo status dell'elemento dopo l'upload
            const li = document.getElementById(`${token}`);
            window.localStorage.removeItem(token);
            // elimino anche dal DOM l'elemento
            li.remove();
          });
          App.showConsole('Sincronizzazione completata con successo!', 'done', 3000);
        } else {
          // console.error("Errore nell'aggiornamento della risorsa");
          App.showConsole('Errori nella sincronizzazione degli elementi', 'error', 3000);
        }
        // reimposto l'oggetto dopo la promise, impostando i vari dataset, sync, identical, ecc...
      })
      .catch(err => console.error(err));
  }

  document.querySelectorAll('button[data-select-all]').forEach(button => {
    button.addEventListener('click', (e) => {
      let type = e.currentTarget.dataset.type;
      document.querySelectorAll(`.relative-ul[data-id='${type}'] li:not([hidden]) input`).forEach(input => input.checked = true);
      // visualizzo il menu.allButtons corrispondente
      document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = false;
      app.checkVersioning(type);
    });
  });

  // de-seleziono tutti gli elementi selezionati
  app.unselect = (type) => {
    // type : workbook, sheet, metric, filter
    document.querySelectorAll(`.relative-ul[data-id='${type}'] input:checked`).forEach(input => input.checked = false);
    // nascondo il menu.allButtons corrispondente
    document.querySelector(`menu.allButtons[data-id='${type}']`).hidden = true;
  }

  document.querySelectorAll('button[data-unselect-all]').forEach(button => button.addEventListener('click', (e) => app.unselect(e.currentTarget.dataset.type)));

  app.checked = (e) => app.checkVersioning(e.target.dataset.type);

  app.init = () => {
    // scarico elenco oggetti dal DB (WorkBooks, WorkSheets e Sheets)
    // visualizzo oggetti locali (da qui possono essere salvati su DB)
    // imposto data-fn sugli elementi di ul-objects
    document.querySelectorAll('menu').forEach(menu => menu.dataset.init = 'true');
    // recupero tutti gli elementi in localStorage per inserirli nelle rispettive <ul> impostate in hidden
    app.getLocal();
    app.getDB();
  }

  app.selectObject = (e) => {
    document.querySelectorAll('menu button[data-selected]').forEach(button => delete button.dataset.selected);
    e.target.dataset.selected = 'true';
    // nascondo la <ul> attualmente visibile
    // visualizzo la <ul> corrispondente all'object selezionato
    document.querySelectorAll('.details.menu section[data-id]').forEach(section => {
      section.hidden = (section.dataset.id === e.currentTarget.id) ? false : true;
    });
  }

  app.uploadObject = async (e) => {
    let url = `/fetch_api/json/${e.currentTarget.dataset.upload}_store`;
    const token = e.currentTarget.dataset.token;
    const json = JSON.parse(window.localStorage.getItem(token));
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
          // aggiorno lo status dell'elemento dopo l'upload
          const li = document.getElementById(`${token}`);
          const statusIcon = li.querySelector('i[data-sync-status]');
          li.dataset.sync = 'true';
          li.dataset.identical = 'true';
          statusIcon.classList.add('done');
          statusIcon.innerText = "done";
        } else {
          console.error("Errore nell'aggiornamento della risorsa");
        }
      })
      .catch((err) => console.error(err));
  }

  app.upgradeObject = async (e) => {
    // TODO: questa Fn è identica a app.uploadObject(), trovare il modo di utilizzarne solo una
    let url = `/fetch_api/json/${e.currentTarget.dataset.upgrade}_update`;
    const token = e.currentTarget.dataset.token;
    const json = JSON.parse(window.localStorage.getItem(token));
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
          // aggiorno lo status dell'elemento dopo l'upload
          const li = document.getElementById(`${token}`);
          const statusIcon = li.querySelector('i[data-sync-status]');
          li.dataset.sync = 'true';
          li.dataset.identical = 'true';
          statusIcon.classList.add('done');
          statusIcon.innerText = "done";
        } else {
          console.error("Errore nell'aggiornamento della risorsa");
        }
      })
      .catch((err) => console.error(err));
  }

  app.deleteObject = async (e) => {
    const token = e.currentTarget.dataset.token;
    await fetch(`/fetch_api/name/${token}/${e.currentTarget.dataset.delete}_destroy`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          // console.log('ELEMENTO ELIMINATO CON SUCCESSO!');
          // lo elimino anche dal localStorage se presente
          window.localStorage.removeItem(token);
          const li = document.getElementById(`${token}`);
          // elimino anche dal DOM l'elemento
          li.remove();
        } else {
          console.error("Errore nella cancellazione della risorsa!");
        }
      })
      .catch((err) => console.error(err));
  }

  app.downloadObject = async (e) => {
    const token = e.currentTarget.dataset.token;
    await fetch(`/fetch_api/name/${token}/${e.currentTarget.dataset.download}_show`)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          console.log('data : ', JSON.parse(data.json_value));
          console.log('ELEMENTO SCARICATO CON SUCCESSO!');
          // lo salvo nello storage
          Storage.save(JSON.parse(data.json_value));
          // aggiorno lo status dell'elemento dopo l'upload
          const li = document.getElementById(`${token}`);
          const statusIcon = li.querySelector('i[data-sync-status]');
          li.dataset.sync = 'true';
          li.dataset.identical = 'true';
          statusIcon.classList.add('done');
          statusIcon.innerText = "done";
        } else {
          console.error("Errore nella cancellazione della risorsa!");
        }
      })
      .catch((err) => console.error(err));
  }

  app.showResource = (e) => {
    const refs = {
      "created_at": document.querySelector('#created_at > span[data-value]'),
      "updated_at": document.querySelector('#updated_at > span[data-value]'),
      "note": document.querySelector('#note > span[data-value]')
    };
    if (e.currentTarget.dataset.type === 'workbook') {
      // è stato selezionato un workbook, rivisualizzo eventuali elementi nascosti da precedenti
      // selezioni (un altro workbook) per nascondere
      // reset elementi precedendemente selezionati
      document.querySelectorAll(`#ul-workbook li:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected);
    } else {
      // reset elementi precedendemente selezionati
      document.querySelectorAll(`li[data-workbook-ref]:not([id='${e.currentTarget.dataset.token}']) > div[data-selected]`).forEach(element => delete element.dataset.selected);
    }
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      // visualizzo alcune informazione sull'elemento selezionato
      // e le inserisco nel template corrispondente
      if (e.currentTarget.dataset.storage === 'local') {
        const resource = window.localStorage.getItem(e.currentTarget.dataset.token);
        const json = JSON.parse(resource);
        console.log(json);
        // se l'elemento ha dataset.storage='DB' vuol dire che NON è presente in locale, quindi per
        // visualizzare le sue proprietà dovrò fare una FETCH verso il DB, altrimenti lo recupero dallo storage
        for (const [key, value] of Object.entries(refs)) {
          value.innerText = (json[key]) ? json[key] : null;
        }
      } else {
        // DB
      }
    } else {
      // ripulisco i riferimenti del refs
      refs.created_at.innerText = '';
    }
    if (e.currentTarget.dataset.type === 'workbook') {
      [...document.querySelectorAll('li[data-workbook-ref]')].filter(element => {
        element.hidden = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? false : true;
        element.dataset.searchable = (element.dataset.workbookRef === e.currentTarget.dataset.token || e.currentTarget.dataset.selected === undefined) ? true : false;
      });
    }
  }

  app.init();

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
