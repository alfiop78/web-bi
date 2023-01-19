var App = new Application();
// var StorageCube = new CubeStorage();
// var StorageDimension = new DimensionStorage();
// var Cube = new Cubes();
// var Dim = new Dimension();
// var Hier = new Hierarchy();
(() => {
  var app = {
    // templates
    tmplList: document.getElementById('tmpl-li'),
    // dialogs
    dialogTables: document.getElementById('dlg-tables'),
    // buttons
    btnCreateDimension: document.getElementById('btn-create-dimension'),
    btnSelectSchema: document.getElementById('btn-select-schema'),
    // body
    body: document.getElementById('body'),
    x: 0

  }

  App.init();

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 0.3;
  ctx.beginPath(); // Start a new path
  ctx.moveTo(0, 30); // Move the pen to (30, 50)
  ctx.lineTo(200, 30); // Draw a line to (150, 100)
  ctx.stroke(); // Render the path

  ctx.beginPath(); // Start a new path
  ctx.moveTo(0, 50); // Move the pen to (30, 50)
  ctx.lineTo(200, 290); // Draw a line to (150, 100)
  ctx.stroke(); // Render the path

  // Callback function to execute when mutations are observed
  // const targetNode = document.querySelectorAll('ul');
  // console.log(targetNode);
  const config = { attributes: true, childList: true, subtree: true };

  const callback = (mutationList, observer) => {
    // console.log(mutationList, observer);
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.info('A child node has been added or removed.');
        Array.from(mutation.addedNodes).forEach(node => {
          if (node.hasAttribute('data-fn')) node.addEventListener('click', app[node.dataset.fn]);
          if (node.hasChildNodes()) {
            node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
          }
        });
      } else if (mutation.type === 'attributes') {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
        if (mutation.target.hasChildNodes()) mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  // observerList.observe(document.getElementById('body'), config);
  document.querySelectorAll('dialog').forEach(dialog => observerList.observe(dialog, config));
  observerList.observe(app.body, config);

  // selezione schema/i dalla dialog "dlg-schemes"
  app.handlerSchema = async (e) => {
    const drawer = document.getElementById('dialog-drawer');
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      const schema = e.currentTarget.dataset.schema;
      // recupero le tabelle dello schema selezionato
      const data = await app.getDatabaseTable(schema);
      console.log(data);
      // TODO: attivo i tasti ("Crea dimensione", "Modifica dimensione", "Crea cubo", ecc...)
      // TODO: popolo elenco tabelle
      let ul = document.getElementById('ul-tables');
      for (const [key, value] of Object.entries(data)) {
        const content = app.tmplList.content.cloneNode(true);
        const li = content.querySelector('li');
        li.dataset.fn = "handlerTable";
        li.dataset.label = value.TABLE_NAME;
        li.dataset.elementSearch = 'tables';
        li.id = 'table-' + key;
        li.dataset.schema = schema;
        li.innerText = value.TABLE_NAME;
        ul.appendChild(li);
      }
      drawer.toggleAttribute('open');
    }
  }

  // selezione schema/i dalla dialog "dlg-schemes" con translate steps
  /* app.handlerSchema = async (e) => {
    const translate = document.getElementById('translate');
    e.currentTarget.toggleAttribute('data-selected');
    if (e.currentTarget.hasAttribute('data-selected')) {
      const schema = e.currentTarget.dataset.schema;
      // recupero le tabelle dello schema selezionato
      const data = await app.getDatabaseTable(schema);
      console.log(data);
      // TODO: attivo i tasti ("Crea dimensione", "Modifica dimensione", "Crea cubo", ecc...)
      // TODO: popolo elenco tabelle
      let ul = document.getElementById('ul-tables');
      for (const [key, value] of Object.entries(data)) {
        // debugger;
        const content = app.tmplList.content.cloneNode(true);
        const section = content.querySelector('section[data-sublist-li]');
        const li = content.querySelector('li');

        section.dataset.fn = "handlerTable";
        section.dataset.label = value.TABLE_NAME;
        section.dataset.elementSearch = 'tables';
        li.id = 'table-' + key;
        li.dataset.schema = schema;
        li.dataset.label = value.TABLE_NAME;
        li.innerText = value.TABLE_NAME;
        // span.dataset.label = value.TABLE_NAME;
        ul.appendChild(section);
      }
      ++translate.dataset.step;
    }
  } */

  /* page init  (impostazioni inziali per la pagina, alcune sono necessarie per essere catturate dal mutationObserve)*/
  // TODO: da implementare
  // app.dialogConnection.showModal();
  /* end page init */

  /*onclick events*/

  app.btnCreateDimension.onclick = () => {
    app.body.dataset.mode = 'create-dimension';

  }

  app.handlerTable = (e) => {
    console.log('select table');
    e.currentTarget.toggleAttribute('data-selected');
  }

  app.handlerAddTables = (e) => {
    console.log('addTables');
    app.dialogTables.showModal();
  }

  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }
  /* end onclick events*/

  /* mouse events */
  document.querySelectorAll('.hierarchy').forEach(el => {
    el.onmousedown = (e) => {
      console.log(app.x);
      app.x = +e.target.dataset.translateX;
      app.el = e.target;
    }

    el.onmousemove = (e) => {
      if (app.el) {
        app.x += e.movementX;
        // if (app.x > 30) return;
        e.target.style.transform = "translateX(" + app.x + "px)";
        e.target.dataset.translateX = app.x;
      }
    }

    el.onmouseup = (e) => {
      // console.log(e);
      // e.target.dataset.translateX = app.x;
      delete app.el;
    }
  });
  /* end mouse events */

  /* fetchAPI */

  // recupero le tabelle del database in base allo schema selezionato
  app.getDatabaseTable = async (schema) => {
    const url = '/fetch_api/schema/' + schema + '/tables';
    return await fetch(url)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(data => data)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  /* end fetchAPI */

})();
