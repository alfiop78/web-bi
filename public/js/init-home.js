var App = new Application();
(() => {
  var app = {
    // templates
    // dialogs
    dialogNewConnection: document.getElementById('dlg-new-connection'),
    // buttons
    btnNewConnection: document.getElementById("new-connection"),
    // forms
    formNewConnection: document.getElementById('form-new-connection'),
    // drawer
    drawer: document.getElementById('drawer'),
    // body
    body: document.getElementById('body')
  }

  const userId = 2;

  App.init();

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

            if (node.hasChildNodes()) {
              node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
            }
          }
        });
      } else if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
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
  observerList.observe(document.getElementById('body'), config);

  app.btnNewConnection.onclick = (e) => {
    e.preventDefault();
    app.dialogNewConnection.showModal();
  }

  app.formNewConnection.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(app.formNewConnection);
    const url = `/fetch_api/connections/store`;
    // INFO: con l'utilizzo del FormData non è necessario specificare il Content-Type
    const init = { method: 'POST', body: formData };
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
          App.showConsole("Nuova connessione creata!", "done", 3000);
        } else {
          console.error("Errore nell'aggiornamento della risorsa");
        }
      })
      .catch((err) => console.error(err));
  }

  /*
   * seleczione del DB, salvo i dati in sessione e modifico
   * i parametri di connessione nel file database.php
   * */
  app.connectionSelected = async (e) => {
    const id = e.currentTarget.dataset.id;
    const databaseName = document.getElementById('database-name');
    const iconStatus = document.getElementById('db-icon-status');
    const spanConnectionStatus = document.getElementById('db-connection-status');
    const url = `/fetch_api/${id}/show`;
    await fetch(url)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data) {
          // seleziono la connessione impostata
          e.target.dataset.selected = 'true';
          // iconStatus.classList.replace('error', 'done');
          iconStatus.innerText = 'database';
          databaseName.innerHTML = data.name;
          spanConnectionStatus.dataset.connected = data.id;
        } else {
          delete e.target.dataset.selected;
          // iconStatus.classList.replace('done', 'error');
          iconStatus.innerText = 'database_off';
          databaseName.innerHTML = 'Database non impostato';
          spanConnectionStatus.dataset.connected = 0;
        }
      })
      .catch((err) => console.error(err));
  }

  document.querySelectorAll("#ul-connections > li").forEach(li => {
    li.addEventListener("click", app.connectionSelected);
  });

  /* tasto cancel nelle dialog*/
  document.querySelectorAll("button[name='cancel']").forEach(btn => {
    btn.onclick = () => document.querySelector('dialog[open]').close();
  });

})();
