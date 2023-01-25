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
    tmplCard: document.getElementById('tmpl-card'),
    // dialogs
    dialogTables: document.getElementById('dlg-tables'),
    // buttons
    btnCreateDimension: document.getElementById('btn-create-dimension'),
    btnSelectSchema: document.getElementById('btn-select-schema'),
    // body
    body: document.getElementById('body'),
    canvasArea: document.getElementById('canvas-area'),
    translate: document.getElementById('translate'),
    svg: document.getElementById('svg'),
    hierarchy: document.getElementById('h')

  }

  App.init();

  /* const canvas1 = document.getElementById('canvas-1');
  canvas1.width = app.translate.offsetWidth;
  canvas1.height = app.translate.offsetHeight;
  var canvasOffsetTop = canvas1.offsetTop;
  var canvasOffsetLeft = canvas1.offsetLeft;
  // const canvas2 = document.getElementById('canvas-2');
  const ctx1 = canvas1.getContext('2d'); */
  // const ctx2 = canvas2.getContext('2d');
  /* ctx1.lineWidth = 2.5;
  ctx1.strokeStyle = "orangered";
  ctx1.beginPath(); // Start a new path
  ctx1.moveTo(0, 54); // Move the pen to (0, 50)
  ctx1.lineTo(200, 54); // Draw a line to (200, 50)
  ctx1.stroke(); // Render the path

  ctx1.beginPath(); // Start a new path
  ctx1.moveTo(100, 54); // Move the pen to (30, 50)
  ctx1.lineTo(100, 200); // Draw a line to (150, 100)
  ctx1.stroke(); // Render the path */

  /* ctx2.lineWidth = 2.5;
  ctx2.strokeStyle = "orangered";
  ctx2.beginPath(); // Start a new path
  ctx2.moveTo(100, 54); // Move the pen to (30, 50)
  ctx2.lineTo(200, 54); // Draw a line to (150, 100)
  ctx2.stroke(); // Render the path

  ctx2.beginPath(); // Start a new path
  ctx2.moveTo(100, 54); // Move the pen to (30, 50)
  ctx2.lineTo(100, 0); // Draw a line to (150, 100)
  ctx2.stroke(); // Render the path */

  // Callback function to execute when mutations are observed
  // const targetNode = document.querySelectorAll('ul');
  // console.log(targetNode);
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

  /* drag events */

  app.handlerDragStart = (e) => {
    console.log('e.target : ', e.target.id);
    e.target.classList.add('dragging');
    app.dragElementPosition = { x: e.offsetX, y: e.offsetY };
    // console.log(app.dragElementPosition);
    e.dataTransfer.setData('text/plain', e.target.id);
    // creo la linea
    if (app.hierarchy.childElementCount > 0) {
      app.l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      app.l.dataset.id = app.svg.childElementCount;
      app.l.setAttribute('fill', 'transparent');
      app.l.setAttribute('stroke', 'red');
      app.l.setAttribute('stroke-linecap', 'round');
      app.l.setAttribute('stroke-width', 3);
      app.svg.appendChild(app.l);
      app.letsdraw = {
        x: 0,
        y: 0
      }
    }
    // e.dataTransfer.setData('application/x-moz-node', e.target.innerHTML);
    /* const span = document.createElement('span');
    span.innerText = e.target.dataset.label;
    span.style.backgroundColor = '#494949';
    span.style.color = 'white';
    e.target.appendChild(span);
    e.dataTransfer.setDragImage(span, 10, 10); */
    console.log(e.dataTransfer);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.handlerDragOverH = (e) => {
    e.preventDefault();
    // console.log('dragOver:', e.target);
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
      // console.log(e.currentTarget, e.target);
      // recupero l'offsetLeft della card a sinistra del mouse
      let lastCard = h.querySelector('div[data-id]:last-child');
      // console.log(lastCard);
      // console.log(e.target);
      if (app.l) app.l.setAttribute('d', 'M ' + app.letsdraw.x + ' ' + app.letsdraw.y + ' L ' + (e.offsetX + e.target.offsetLeft - app.dragElementPosition.x - 10) + ' ' + (e.offsetY - app.dragElementPosition.y + 13.5));
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragEnterCard = (e) => {
    // console.log('dragEnter Card');
    // console.log(e.target, e.currentTarget);
    /* if (app.l.dataset.id !== app.svg.childElementCount) {
      app.l = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      app.l.dataset.id = app.svg.childElementCount;
      app.l.setAttribute('fill', 'transparent');
      app.l.setAttribute('stroke', 'blue');
      app.l.setAttribute('stroke-linecap', 'round');
      app.l.setAttribute('stroke-width', 4);
      app.svg.appendChild(app.l);
      app.letsdraw = {
        x: e.target.offsetLeft + e.target.offsetWidth,
        y: e.target.offsetTop + (e.target.offsetHeight / 2)
      }
    } */
  }

  app.handlerDragEnterH = (e) => {
    console.log('handlerDragEnter :', e.target);
    e.preventDefault();
    if (e.target.classList.contains('dropzone')) {
      console.info('DROPZONE');
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      e.target.classList.add('dropping');
      if (app.hierarchy.childElementCount > 0) {
        let table, cardStruct;
        if (e.target.classList.contains('card')) {
          cardStruct = e.target.parentElement;
          table = cardStruct.querySelector('.table');
          if (cardStruct.previousElementSibling) {
            table = cardStruct.previousElementSibling.querySelector('.table');
          }
        } else {
          cardStruct = h.querySelector('div[data-id]:last-child');
          table = h.querySelector('div[data-id]:last-child .table');
          if (cardStruct.previousElementSibling && e.target.classList.contains('card')) {
            table = cardStruct.previousElementSibling.querySelector('.table');
          }
        }
        app.letsdraw = {
          x: table.offsetLeft + table.offsetWidth,
          y: table.offsetTop + (table.offsetHeight / 2)
        }
        // console.log(app.letsdraw);
        // app.line.setAttribute('d', 'M ' + app.letsdraw.x + ' ' + app.letsdraw.y + ' L ' + e.offsetX + ' ' + e.offsetY);
      }
    } else {
      console.warn('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      // e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragLeaveH = (e) => {
    e.preventDefault();
    e.target.classList.remove('dropping');
  }

  app.handlerDragLeaveCard = (e) => {
    e.preventDefault();
    // app.l.remove();
  }

  app.handlerDragEndH = async (e) => {
    e.preventDefault();
    // faccio il DESCRIBE della tabella
    // controllo lo stato di dropEffect per verificare se il drop è stato completato correttamente, come descritto qui:https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_end
    // in app.getTable() vengono utilizzate le property della classe Cube (cube.card.schema, cube.card.tableName);
    if (e.dataTransfer.dropEffect === 'copy') {
      // imposto prima la <ul> altrimenti si verifica il bug riportato nella issue#50
      const ul = Hier.activeCard.querySelector("ul[data-id='columns']");
      const data = await app.getTable();
      // app.addFields(ul, data);
    }
  }

  app.handlerDropH = (e) => {
    // TODO: ottimizzare
    e.preventDefault();
    e.target.classList.replace('dropping', 'dropped');
    if (!e.target.classList.contains('dropzone')) return;
    const data = e.dataTransfer.getData('text/plain');
    console.log(data);
    const liElement = document.getElementById(data);
    console.log(liElement);
    liElement.classList.remove('dragging');
    const content = app.tmplCard.content.cloneNode(true);
    let span;
    let card;
    if (e.target.classList.contains('card')) {
      // sto aggiungendo la tabella alla card (non alla hierarchy)
      card = content.querySelector('.card-area');
      span = card.querySelector('span');
      span.innerHTML = liElement.dataset.label;
      card.dataset.label = liElement.dataset.label;
      card.dataset.schema = liElement.dataset.schema;
      e.target.appendChild(card);
    } else {
      card = content.querySelector("div[data-id='card-struct']");
      // imposto il nome della tabella draggata
      span = card.querySelector('span');
      span.innerHTML = liElement.dataset.label;
      card.querySelector('.card-area').dataset.label = liElement.dataset.label;
      card.querySelector('.card-area').dataset.schema = liElement.dataset.schema;
      app.hierarchy.appendChild(card);
      // TODO : da ottimizzare con mutationObserve
      card.addEventListener('dragenter', app.handlerDragEnterCard, true);
      card.addEventListener('dragover', app.handlerDragOverCard, true);
      card.addEventListener('dragleave', app.handlerDragLeaveCard, true);
      card.addEventListener('drop', app.handlerDropCard, true);
      card.addEventListener('dragend', app.handlerDragEndCard, true);
    }
    span.dataset.level = app.hierarchy.childElementCount;
    if (app.l) {
      span.dataset.lineId = app.l.dataset.id;
      app.l.dataset.level = app.hierarchy.childElementCount;
      // let span = card.querySelector('span');
      app.hierarchy.querySelectorAll("span[data-level='" + app.hierarchy.childElementCount + "']").forEach(span => {
        const line = app.svg.querySelector("path[data-level='" + app.hierarchy.childElementCount + "'][data-id='" + span.dataset.lineId + "']");
        line.setAttribute('stroke', 'orange');
        line.setAttribute('d', 'M ' + app.letsdraw.x + ' ' + app.letsdraw.y + ' L ' + span.offsetParent.offsetLeft + ' ' + (span.offsetParent.offsetTop + (span.offsetParent.offsetHeight / 2)));
      });
    }
  }

  app.hierarchy.addEventListener('dragover', app.handlerDragOverH, true);
  app.hierarchy.addEventListener('dragenter', app.handlerDragEnterH, true);
  app.hierarchy.addEventListener('dragleave', app.handlerDragLeaveH, true);
  app.hierarchy.addEventListener('drop', app.handlerDropH, true);
  app.hierarchy.addEventListener('dragend', app.handlerDragEndH, true);
  /* end drag events */

  // selezione schema/i 
  app.handlerSchema = async (e) => {
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
        const li = content.querySelector('li[draggable]');
        li.dataset.fn = "handlerTable";
        li.dataset.label = value.TABLE_NAME;
        li.dataset.elementSearch = 'tables';
        li.ondragstart = app.handlerDragStart;
        li.id = 'table-' + key;
        li.dataset.schema = schema;
        li.innerText = value.TABLE_NAME;
        ul.appendChild(li);
      }
      drawer.toggleAttribute('open');
    }
  }

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
    // const cardStruct = document.querySelector('*[data-waiting="true"]');
    // cardStruct.querySelector('span').innerHTML = e.currentTarget.dataset.label;
    // delete cardStruct.dataset.waiting;
    // cardStruct.dataset.defined = e.currentTarget.dataset.label;
  }

  app.handlerToggleDrawer = (e) => {
    console.log('toggleDrawer');
    document.querySelector('#' + e.currentTarget.dataset.drawerId).toggleAttribute('open');
  }

  app.handlerTest = () => {
    const c = document.querySelector('div[data-id="card-struct"]');
    let copy = c.cloneNode(true);
    const hier = document.getElementById('h');
    h.appendChild(copy);
  }
  /* end onclick events*/

  /* mouse events */
  /* app.svg.onmousedown = (e) => {
    console.log(e);
    let card = document.querySelector('.card');
    app.line = document.getElementById('line-1');
    console.log(app.line);
    app.letsdraw = {
      x: card.offsetLeft + card.offsetWidth,
      y: 54
    }
    // console.log(app.letsdraw);
  }

  app.svg.onmousemove = (e) => {
    if (app.letsdraw) {
      app.line.setAttribute('stroke', 'lightblue');
      app.line.setAttribute('d', 'M 220 54 L ' + e.offsetX + ' ' + e.offsetY);
    }
  }

  app.svg.onmouseup = (e) => {
    app.letsdraw = null;
    app.line.setAttribute('stroke', 'orangered');
  } */

  document.querySelectorAll('.translate').forEach(el => {
    el.onmousedown = (e) => {
      console.log(app.x);
      app.x = +e.currentTarget.dataset.translateX;
      app.el = e.currentTarget;
    }

    el.onmousemove = (e) => {
      if (app.el) {
        app.x += e.movementX;
        // if (app.x > 30) return;
        e.currentTarget.style.transform = "translateX(" + app.x + "px)";
        e.currentTarget.dataset.translateX = app.x;
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
