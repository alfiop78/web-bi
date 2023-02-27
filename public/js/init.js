var App = new Application();
var StorageCube = new CubeStorage();
var StorageDimension = new DimensionStorage();
var Cube = new Cubes();
var Dim = new Dimension();
var Hier = new Hierarchy();
(() => {
  var app = {
    absPopup: document.getElementById('abs-popup-dialog'),
    dialogCubeName: document.getElementById('cube-name'),
    dialogDimensionName: document.getElementById('dimension-name'),
    dialogHierarchyName: document.getElementById('hierarchy-name'),
    dialogVersioning: document.getElementById('versioning'),
    dialogColumnMap: document.getElementById('dialog-column-map'),
    dialogCompositeMetric: document.getElementById('dialog-composite-metric'),
    dialogHierarchiesMap: document.getElementById('dialog-hierarchies-map'),
    // templates
    tmplDimension: document.getElementById('tmpl-dimension-list'),
    tmplCube: document.getElementById('tmpl-cube-list'),
    tmplLists: document.getElementById('templateList'), // include tutte le liste da utilizzare,
    tmplSpan: document.getElementById('tmpl-span'),
    tmplTables: document.getElementById('tmpl-hierarchy-tables'),
    tmplFormula: document.getElementById('tmpl-formula'),

    hierarchyContainer: document.getElementById('hierarchiesContainer'), // struttura gerarchica sulla destra

    btnBack: document.getElementById('mdc-back'),
    btnToggleHierarchyStruct: document.getElementById('toggle-hierarchy-struct'),

    // btn dialog versioning
    btnCubes: document.getElementById('navBtnCubes'),
    btnDimensions: document.getElementById('navBtnDimensions'),
    btnMetrics: document.getElementById('navBtnMetrics'),
    btnFilters: document.getElementById('navBtnFilters'),
    btnProcesses: document.getElementById('navBtnProcesses'),

    // actions button
    btnSaveDimension: document.getElementById('btn-save-dimension'),
    btnHierarchySaveName: document.getElementById('btnHierarchySaveName'),
    btnHierarchyMap: document.getElementById('btnHierarchyMap'),
    btnNewHierarchy: document.getElementById('btnNewHierarchy'),
    btnSaveCube: document.getElementById('btn-save-cube'),
    btnSaveCubeName: document.getElementById('btnCubeSaveName'),
    btnSaveOpenedCube: document.getElementById('btn-save-opened-cube'),
    btnDefinedCube: document.getElementById('btn-defined-cube'),
    btnCompositeMetricSave: document.getElementById('btnCompositeMetricSave'), // tasto salva nella dialog-composite-metric
    btnCompositeMetricDone: document.getElementById('btnCompositeMetricDone'),

    // button dialog-columns-map
    btnEditSqlId: document.getElementById('edit-sql-formula-column-id'),
    btnEditSqlDs: document.getElementById('edit-sql-formula-column-ds'),
    btnEditFieldId: document.getElementById('edit-field-id'),
    btnEditFieldDs: document.getElementById('edit-field-ds'),
    btnColumnMap: document.getElementById('btnColumnsMap'),

    // inputs / textarea
    txtareaColumnId: document.getElementById('textarea-column-id-formula'),
    txtareaColumnDs: document.getElementById('textarea-column-ds-formula'),

    btnSaveHierarchy: document.getElementById('btnSaveHierarchy'),

    // tasto openTableList
    btnTableList: document.getElementById('btn-open-table-list'),
    tableList: document.getElementById('list-tables'),
    // tasto openDimensionList per l'apertura dell'elenco delle dimensioni
    btnDimensionList: document.getElementById('btn-open-dimension-list'),
    dimensionList: document.getElementById('dimensionList'),

    card: null,
    cardTitle: null,
    content: document.getElementById('content'),
    body: document.getElementById('body'),
    dropZone: document.getElementById('drop-zone'),
    currentX: 0,
    currentY: 0,
    initialX: 0,
    initialY: 0,
    active: false,
    xOffset: 0,
    yOffset: 0,
    dragElement: null,
    elementMenu: null,
    /*guideStep : [
      'Seleziona uno Schema sulla sinistra per iniziare',
      'Aggiungi le tabelle da mappare trascinandole da "Lista Tabelle"'
    ],*/
    messageId: 0,
    absWindow: document.querySelector('.abs-window')
  }

  App.init();

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
          if (node.hasChildNodes()) {
            node.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
            node.querySelectorAll('*[data-fn-mousedown]').forEach(element => element.addEventListener('mousedown', app[element.dataset.fnMousedown]));
            node.querySelectorAll('*[data-fn-mouseup]').forEach(element => element.addEventListener('mouseup', app[element.dataset.fnMouseup]));
            node.querySelectorAll('*[data-fn-mousemove]').forEach(element => element.addEventListener('mousemove', app[element.dataset.fnMousemove]));
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
  const dropZone = document.getElementById('drop-zone');
  observerList.observe(dropZone, config);
  observerList.observe(app.dialogHierarchiesMap, config);
  observerList.observe(document.querySelector('#list-schema'), config);
  observerList.observe(document.querySelector('#list-tables'), config);
  observerList.observe(document.getElementById('body'), config);

  // utilizzato per lo spostamento all'interno del drop-zone (card già droppata)
  app.dragStart = (e) => {
    // console.clear();
    // console.log('dragStart : ', e.target);
    // console.log('dragStart : ', e.currentTarget);
    // console.log('dragStart : ', e.target.localName);
    // mousedown da utilizzare per lo spostamento dell'elemento
    // debugger;
    if (e.currentTarget.classList.contains('title-alias')) {
      app.cardTitle = e.currentTarget.querySelector('h6');
      Hier.activeCard = e.currentTarget.dataset.id;
      // recupero la posizione attuale della card tramite l'attributo x-y impostato su .cardTable
      app.xOffset = Hier.activeCard.getAttribute('x');
      app.yOffset = Hier.activeCard.getAttribute('y');
      // console.log('xOffset : ', app.xOffset);
      // console.log('yOffset : ', app.yOffset);
    }
    if (e.type === 'touchstart') {
      app.initialX = e.touches[0].clientX - app.xOffset;
      app.initialY = e.touches[0].clientY - app.yOffset;
    } else {
      app.initialX = e.clientX - app.xOffset;
      app.initialY = e.clientY - app.yOffset;
    }
    app.active = true;
  }

  // spostamento della card già droppata
  app.dragEnd = () => {
    // console.log('dragEnd');
    // console.log(e.target);
    // mouseup, elemento rilasciato dopo lo spostamento
    app.initialX = app.currentX;
    app.initialY = app.currentY;
    app.active = false;
    // imposto sulla .cardTable le posizioni dove è 'stato lasciato'  dopo il drag in modo da "riprendere" lo
    // spostamento da dove era rimasto
    Hier.activeCard.setAttribute('x', app.currentX);
    Hier.activeCard.setAttribute('y', app.currentY);
  }

  // evento attivato quando sposto la card già droppata all'interno della drop-zone
  app.drag = (e) => {
    // console.log('drag');
    // console.log('e.target drag : ', e.target);
    // mousemove elemento si sta spostando
    if (app.active) {
      e.preventDefault();
      // debugger;
      if (e.type === 'touchmove') {
        app.currentX = e.touches[0].clientX - app.initialX;
        app.currentY = e.touches[0].clientY - app.initialY;
      } else {
        app.currentX = e.clientX - app.initialX;
        app.currentY = e.clientY - app.initialY;
      }

      app.xOffset = app.currentX;
      app.yOffset = app.currentY;
      Hier.activeCard.style.transform = 'translate(' + app.currentX + 'px, ' + app.currentY + 'px)';
    }
  }

  /* questi eventi sono già stati messi sulle .card.table con MutationObserve
  app.dropZone.onmousedown = app.dragStart;
  app.dropZone.onmouseup = app.dragEnd;
  app.dropZone.onmousemove = app.drag;*/

  // TODO: aggiungere anhce eventi touch...

  app.handlerDragStart = (e) => {
    console.log('e.target : ', e.target.id);
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  app.handlerDragOver = (e) => {
    // console.log('handlerDragOver');
    e.preventDefault();
    // console.log('dragOver:', e.target);
    if (e.target.classList.contains('dropzone')) {
      e.dataTransfer.dropEffect = "copy";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragEnter = (e) => {
    // console.log('handlerDragEnter');
    e.preventDefault();

    if (e.target.classList.contains('dropzone')) {
      console.info('DROPZONE');
      // e.dataTransfer.dropEffect = "copy";
      // coloro il border differente per la dropzone
      // la class dropping nasconde (display: none) automaticamente lo span che contiene "Trascina qui gli element......"
      e.target.classList.add('dropping');
    } else {
      console.log('non in dropzone');
      // TODO: se non sono in una dropzone modifico l'icona del drag&drop (icona "non consentito")
      // e.dataTransfer.dropEffect = "none";
    }
  }

  app.handlerDragLeave = (e) => {
    // console.log('handlerDragLeave');
    e.preventDefault();
    // console.log('dragLeave');
  }

  app.handlerDragEnd = async (e) => {
    e.preventDefault();
    // faccio il DESCRIBE della tabella
    // controllo lo stato di dropEffect per verificare se il drop è stato completato correttamente, come descritto qui:https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API#drag_end
    // in app.getTable() vengono utilizzate le property della classe Cube (cube.card.schema, cube.card.tableName);
    if (e.dataTransfer.dropEffect === 'copy') {
      // imposto prima la <ul> altrimenti si verifica il bug riportato nella issue#50
      const ul = Hier.activeCard.querySelector("ul[data-id='columns']");
      const data = await app.getTable();
      app.addFields(ul, data);
    }
  }

  // imposto gli attributi della card prima di essere aggiunta al DOM
  app.setCardAttributes = (card) => {
    console.log('card : ', card); // class h-content e attributo draggable="true"
    // la .card draggable diventa .card.table
    card.className = 'card table';
    card.dataset.id = card.id;
    card.dataset.fn = "activeCard";
    card.removeAttribute('draggable');
    // elimino il div .selectable all'interno della card
    card.querySelector('.v-content').remove();
    // elimino l'icon star
    card.querySelector('button[data-star]').remove();
    let tmpl = document.getElementById('cardLayout');
    let content = tmpl.content.cloneNode(true);
    let cardLayout = content.querySelector('.cardLayout');
    const title = cardLayout.querySelector('.title-alias');
    title.dataset.id = card.id;
    // cardLayout.querySelector('.title-alias').dataset.id = card.id;
    // imposto il titolo in h6
    title.querySelector('h6').innerHTML = card.dataset.label;
    // per la tabella WEB_BI_TIME non creo l'alias con la funzione time, l'alias sarà WEB_BI_TIME
    if (card.dataset.label !== 'WEB_BI_TIME') {
      // creo un alias per questa tabella
      const time = Date.now().toString();
      title.querySelector('.subtitle').innerHTML = `AS ${card.dataset.label}_${time.substring(time.length - 3)}`;
      card.dataset.alias = `${card.dataset.label}_${time.substring(time.length - 3)}`;
    } else {
      title.querySelector('.subtitle').innerHTML = `AS ${card.dataset.label}`;
      card.dataset.alias = card.dataset.label;
    }
    card.appendChild(cardLayout);

    if (card.querySelector('button[data-fact]').hasAttribute('data-selected')) {
      // tabella fact viene colorata in modo diverso, imposto attributo fact sia sulla .card.table che sulla .cardTable
      card.dataset.fact = true;
      // con il dataset.mode = 'cube' visualizzo/nascondo alcuni elementi dei button (da CSS)
      card.querySelector('section[options]').dataset.mode = 'cube';
    }
    card.querySelector('section[options] > button[composite-metrics]').dataset.schema = card.dataset.schema;
    card.querySelector('section[options] > button[composite-metrics]').dataset.label = card.dataset.label;
    card.querySelector('button[data-fact]').remove();
    card.querySelectorAll('button').forEach(button => button.dataset.id = card.id);
  }

  app.handlerDrop = (e) => {
    // TODO: ottimizzare
    e.preventDefault();
    e.target.classList.replace('dropping', 'dropped');
    if (e.target.id !== 'drop-zone') return;
    let data = e.dataTransfer.getData('text/plain');
    let card = document.getElementById(data).cloneNode(true);
    console.log('card : ', card); // class h-content e attributo draggable="true"
    app.setCardAttributes(card);
    // imposto il numero in .hierarchy-order, ordine gerarchico, in base alle tabelle già aggiunte alla dropzone e aggiungo la card alla dropZone
    app.checkHierarchyNumber(card);

    // imposto la card draggata nella posizione dove si trova il mouse
    card.style.transform = 'translate(' + e.offsetX + 'px, ' + e.offsetY + 'px)';
    card.setAttribute('x', e.offsetX);
    card.setAttribute('y', e.offsetY);

    // imposto la input search, con questo attributo, l'evento input viene gestito in Application.js
    card.querySelector('input').dataset.elementSearch = card.dataset.label;
    Hier.activeCard = card.id;

    document.getElementById('tableSearch').focus();
    document.getElementById('tableSearch').select();
  }

  app.checkHierarchyNumber = (card) => {
    // se è già presente una card con data-value="0" (caso in cui si creano più gerarchie) aggiungo la card passata come argomento PRIMA della card già presente
    // ...successivamente gli imposto il numero dell'ordine gerarchico
    // console.log(app.dropZone.querySelector(".card.table[data-value='0']"));
    // debugger;
    // console.log('card : ', card);
    if (app.dropZone.dataset.modeInsert === 'before') {
      // caso in cui vengono create più gerarchie, l'ultima tabella della gerarchia è già presente nella dropzone, la tabella aggiunta verrà messa PRIMA di quella già presente
      const lastTable = app.dropZone.querySelector(".card:last-child");
      const hierNumber = app.dropZone.querySelectorAll('.card.table').length;
      app.dropZone.insertBefore(card, lastTable);
      card.dataset.value = hierNumber;
      card.querySelector('.hierarchy-order').dataset.value = hierNumber;
      lastTable.dataset.value = +card.dataset.value + 1;
      lastTable.querySelector('section[options-hier] span').dataset.value = +card.dataset.value + 1;
    } else {
      const hierNumber = app.dropZone.querySelectorAll('.card.table').length + 1;
      card.dataset.value = hierNumber;
      card.querySelector('.hierarchy-order').dataset.value = hierNumber;
      app.dropZone.appendChild(card);
    }
    if (card.hasAttribute('data-fact')) app.dropZone.dataset.modeInsert = 'before';
  }

  app.content.ondragover = app.handlerDragOver;
  app.content.ondragenter = app.handlerDragEnter;
  app.content.ondragleave = app.handlerDragLeave;
  app.content.ondrop = app.handlerDrop;
  //app.content.addEventListener('drop', app.handlerDrop, true);
  // app.content.ondragend = app.handlerDragEnd;
  app.content.addEventListener('dragend', app.handlerDragEnd, true);

  // selezione della colonna nella card table
  app.handlerColumns = (e) => {
    // console.log(e.target);
    // imposto la card attiva
    Hier.activeCard = e.currentTarget.dataset.tableId
    // TODO: utilizzare uno dei due qui, cube.fieldSelected oppure hier.field, da rivedere
    Cube.fieldSelected = e.currentTarget.dataset.label;
    Hier.fieldRef = e.currentTarget;
    // imposto l'alias per la tabella
    Hier.alias = Hier.card.dataset.alias;

    let attrs = Hier.card.dataset.mode;

    switch (attrs) {
      case 'date-time':
        // fact
        const fact = document.querySelector('.card.table[data-fact]');
        // al click sulla colonna comparirà una dialog dove indicare il campo (in WEB_BI_TIME_055) da mettere in relazione con la Fact
        app.dialogHierarchiesMap.querySelector("#composite-field-formula").innerHTML = `${fact.dataset.alias}.${Hier.fieldRef.dataset.label}`;
        app.dialogHierarchiesMap.showModal();
        break;
      case 'relations':
        // se è presente un altro elemento con attributo hierarchy ma NON data-relation-id, "deseleziono" quello con hierarchy per mettere ...
        // ...[hierarchy] a quello appena selezionato. In questo modo posso selezionare solo una colonna per volta ad ogni relazione da creare
        // se però, viene cliccato una colonna con già una relazione impostata (quindi ha [data-relationn-id]) elimino la relazione da
        // ...entrambe le tabelle tramite un identificatifo di relazione
        if (e.currentTarget.hasAttribute('data-relation-id')) {
          /* oltre a fare il toggle dell'attributo, se questa colonna era stata già messa in
          relazione con un altra tabella (quindi attributo [data-relation-id] presente) elimino anche la relazione tra i due campi.
          Bisogna eliminarla sia dal DOM, eliminando [data-relation-id] che da this.#join
          */
          Hier.join = e.currentTarget.dataset.joinToken;
          /* NOTE: utilizzo di getAttributeNames()
            * for (let name of e.currentTarget.getAttributeNames()) {
            * 	// console.log(name);
            * 	let relationId, value;
            * 	if (name.substring(0, 9) === 'data-rel-') {
            * 		relationId = name;
            * 		value = e.currentTarget.getAttribute(name);
            * 		app.removeHierarchy(relationId, value);
            * 	}
            * }
          */
        } else {
          // verifico se, nella stessa tabella, sono presenti altri campi con data-relation (pronti per la join) e, se è presente, lo de-seleziono per selezionare questo del currentTarget
          let liRelationSelected = Hier.card.querySelector('.selectable[data-relation]:not([data-relation-id])');
          // console.log(liRelationSelected);
          e.currentTarget.toggleAttribute('data-relation');
          e.currentTarget.toggleAttribute('data-selected');
          // se ho selezionato una colonna diversa da quella già selezionata, rimuovo la selezione corrente e imposto quella nuova
          if (liRelationSelected && (liRelationSelected.dataset.id !== e.currentTarget.dataset.id)) {
            liRelationSelected.toggleAttribute('data-relation');
            liRelationSelected.toggleAttribute('data-selected');
          }
          app.createHierarchy();
        }
        break;
      case 'metrics':
        console.log('metrics');
        e.currentTarget.toggleAttribute('metrics');

        if (!e.currentTarget.hasAttribute('metrics')) {
          // TODO: utilizzare l'oggetto Map come fatto nella classe Query
          // TODO: delete cube.metrics[tableName][fieldName];
        } else {
          // TODO: nel salvataggio di una metrica di base dovrò aprire una dialog dove impostare l'alias.
          // ...quindi andrò a salvare in cube.metrics così come viene salvata la metrica composta di base, cioè quella legata al cubo
          Cube.metrics = { name: Cube.fieldSelected, metric_type: 0, alias: Cube.fieldSelected };
        }
        break;
      default:
        // columns
        e.currentTarget.toggleAttribute('columns');
        if (e.currentTarget.hasAttribute('columns')) {
          // imposto la colonna selezionata nelle textarea ID - DS
          app.txtareaColumnId.setAttribute('readonly', 'true');
          app.txtareaColumnId.dataset.mode = 'field';
          app.txtareaColumnDs.setAttribute('readonly', 'true');
          app.txtareaColumnDs.dataset.mode = 'field';
          app.txtareaColumnId.value = Cube.fieldSelected;
          app.txtareaColumnDs.value = Cube.fieldSelected;
          app.dialogColumnMap.showModal();
        } else {
          Hier.column = e.currentTarget.dataset.tokenColumn;
        }
    }
  }

  app.btnHierarchyMap.onclick = () => {
    // imposto la relazione tra WEB_BI_TIME e la FACT
    const textarea = document.getElementById('composite-field-formula');
    // recupero la <li> selezionata (date, year, month, ecc...)
    // timeField, al momento, può essere date, month oppure year da scegliere in base al campo della FACT da mettere in join
    const timeField = document.querySelector('li[data-field][data-selected]').dataset.field;
    const columnsRef = [Hier.fieldRef.dataset.label, timeField];
    // alias della tabella WEB_BI_TIME
    // const alias = app.body.querySelector(".card.table[data-label='WEB_BI_TIME']").dataset.alias;
    const join = [`WEB_BI_TIME.${timeField}`, textarea.innerHTML];
    // seleziono la dimensione TIME mkhz4os8tks (TODO: in futuro gli verrà assegnato un nome fisso)
    Cube.timeDimension = 'sisdu1c13f';
    Cube.dateTimeField = textarea.innerHTML;
    Cube.timeJoins = { token: 'time', columnsRef, join };
    Cube.timeJoin = 'time';
    app.dialogHierarchiesMap.close();
  }

  // seleziono il campo della TIME (date, month_id o year) da mettere in join
  app.handlerTimeField = (e) => {
    if (e.target.dataset.selected) return false;
    delete document.querySelector('li[data-field][data-selected]').dataset.selected;
    e.target.dataset.selected = 'true';
  }

  // click sull'icona di destra "columns" per l'associazione delle colonne
  app.handlerAddColumns = (e) => {
    // console.log(e.target);
    // console.log('add columns');
    Hier.activeCard = e.target.dataset.id
    Hier.mode = 'columns';
  }

  app.handlerJoin = (e) => {
    Hier.activeCard = e.target.dataset.id;
    // se ho già due tabelle selezionate per creare la join e la tabella attualmente selezionata non è tra queste 2 non posso creare la join
    if (app.dropZone.querySelectorAll('.card[data-mode="relations"]').length === 2 && Hier.activeCard.dataset.mode !== 'relations') {
      App.showConsole('Sono già presenti due tabelle da mettere in relazione', 'warning', 4000);
      return;
    }
    Hier.mode = 'relations';
  }

  app.handlerMetric = (e) => {
    // imposto il metrics mode
    Hier.activeCard = e.target.dataset.id;
    Hier.mode = 'metrics';
  }

  // aggiunta metrica composta
  app.handlerAddCompositeMetric = async (e) => {
    // recupero dal DB le colonne della tabella
    const cardTable = app.dropZone.querySelector(".cardTable[data-name='" + e.target.dataset.label + "']");
    // NOTE: utilizzo await per aspettare la risposta dal DB
    const data = await app.getTable();
    // popolo la lista #ul-fields	
    const ul = document.getElementById('ul-fields');
    data.forEach(field => {
      const content = app.tmplLists.content.cloneNode(true);
      const section = content.querySelector('section[data-sublist-gen]');
      const div = section.querySelector('div.selectable');
      const span = section.querySelector('span[data-item]');
      section.removeAttribute('hidden');
      section.dataset.label = field.COLUMN_NAME;
      section.dataset.elementSearch = 'search-metrics';
      section.dataset.searchable = true;
      div.dataset.label = field.COLUMN_NAME;
      span.innerText = field.COLUMN_NAME;
      div.onclick = app.handlerMetricSelectedComposite;
      ul.appendChild(section);
    });
    app.dialogCompositeMetric.showModal();
  }

  // salvataggio metrica composta di base
  app.btnCompositeMetricSave.onclick = () => {
    const name = document.getElementById('composite-metric-name').value;
    const alias = document.getElementById('composite-alias-metric').value;
    let arr_sql = [];
    let fields = [];
    // let metricsAlias = {}; // contiene un'elenco di object con nome_metrica : alias che compongono la metrica composta
    document.querySelectorAll('#composite-metric-formula *').forEach(element => {
      if (element.classList.contains('markContent') || element.nodeName === 'SMALL' || element.nodeName === 'I' || element.innerText.length === 0) return;
      // console.log('element : ', element);
      // console.log('element : ', element.nodeName);
      // se l'elemento è un <mark> lo aggiungo all'array arr_sql, questo creerà la formula in formato SQL
      if (element.nodeName === 'MARK') {
        // StorageMetric.metric = element.innerText;
        // metrics[element.innerText] = StorageMetric.metric.formula.alias;
        // metricsAlias[element.innerText] = StorageMetric.metric.formula.alias;
        // TODO: verificare se è presente il distinct : true in ogni metrica
        arr_sql.push(element.innerText);
        fields.push(element.innerText);
      } else {
        arr_sql.push(element.innerText.trim());
      }
    });
    console.log('arr_sql : ', arr_sql);
    Cube.metrics = { name, metric_type: 1, formula: arr_sql, alias, fields };
  }

  app.createHierarchy = () => {
    // debugger;
    console.log('create Relations');
    let join = [], columnsRef = [];
    let table;
    document.querySelectorAll('.card.table[data-mode="relations"]').forEach((card, i) => {
      if (i === 0) table = card.dataset.alias;
      let spanRef = card.querySelector('.selectable[data-relation][data-selected]');
      if (spanRef) {
        // metto in un array gli elementi selezionati per la creazione della gerarchia
        // TODO: non serve memorizzare tutto lo span ma solo la proprietà dataset, questa vienee utilizzata nella Classe Cube
        columnsRef.push(spanRef);
        join.push(`${card.dataset.alias}.${spanRef.dataset.label}`); // questa istruzione crea "Azienda_xxx.id" (alias.field)
      }
      // la join verrà creata quando ci sono due elementi selezionati
      if (join.length === 2) {
        // se, in questa relazione, è presente anche la tabella FACT rinomino hier_n in fact_n in modo da poter separare le gerarchie
        // e capire quali sono quelle con la fact e quali no (posso salvare la Dimensione, senza il legame con il Cubo)
        // debugger;
        const rand = () => Math.random(0).toString(36).substring(2);
        const token = rand().substring(0, 7);
        if (card.hasAttribute('data-fact')) {
          Cube.joins = { token, columnsRef, join };
          Cube.join = token;
        } else {
          Hier.joins = { token, table, columnsRef, join };
          Hier.join = token;
        }
      }
    });
  }

  app.handlerCloseCard = (e) => {
    // elimino la card
    // app.dropZone.querySelector('#' + e.target.dataset.id).remove();
    app.dropZone.querySelector(".card[data-id='" + e.target.dataset.id + "']").remove();
    // TODO: eliminare anche dal flusso delle gerarchie sulla destra

    // TODO: controllo struttura gerarchica
  }

  app.addDimension = (token, value) => {
    let tmplContent = app.tmplDimension.content.cloneNode(true);
    const section = tmplContent.querySelector('section');
    section.setAttribute('data-element-search', 'dimensions');
    section.setAttribute('data-label', value.name);
    const div = tmplContent.querySelector('.dimensions');
    const btnDimensionUse = tmplContent.querySelector('button[data-id="dimension-use"]');
    btnDimensionUse.dataset.token = token;
    div.querySelector('h5').innerHTML = value.name;
    // per ogni gerarchia recupero la prop 'from'
    for (const [hierToken, hierValue] of Object.entries(value.hierarchies)) {
      // console.log(hierName);
      // console.log(hierValue);
      const tmplHierarchyList = document.getElementById('tmpl-hierarchy-list');
      const tmplHierarchyContent = tmplHierarchyList.content.cloneNode(true);
      const divHier = tmplHierarchyContent.querySelector('.hierarchies');
      const h6 = tmplHierarchyContent.querySelector('h6');
      const divTables = tmplHierarchyContent.querySelector('.tables');
      const btnEdit = tmplHierarchyContent.querySelector("button[data-id='dimension-edit']");
      btnEdit.dataset.dimensionToken = value.token;
      btnEdit.dataset.hierToken = hierToken;
      h6.innerText = hierValue.name;
      tmplContent.querySelector('div[data-dimension-tables]').appendChild(divHier);
      for (const [orderKey, orderValue] of Object.entries(hierValue.order)) {
        const tableContent = app.tmplTables.content.cloneNode(true);
        const div = tableContent.querySelector('div');
        const spanSchema = tableContent.querySelector('span[schema]');
        const spanTable = tableContent.querySelector('span[table]');
        spanSchema.innerText = orderValue.schema;
        spanTable.innerText = orderValue.table;
        divTables.appendChild(div);
      }
      btnEdit.onclick = app.handlerDimensionEdit;
    }
    btnDimensionUse.onclick = app.handlerDimensionSelected;
    div.querySelector('h5').setAttribute('label', value.name); // OPTIMIZE: dataset data-label
    document.querySelector('#ul-dimensions').appendChild(section);
  }

  // recupero la lista delle dimensioni
  app.getDimensions = () => {
    // dimensions : è un Object che contiene un array con le tabelle incluse nella dimensione
    for (const [token, value] of StorageDimension.dimensions) {
      app.addDimension(token, value);
    }
  }

  // recupero la lista dei Cubi in localStorage
  app.getCubes = () => {
    const ul = document.getElementById('ul-cubes');
    for (const [token, value] of StorageCube.cubes) {
      const content = app.tmplLists.content.cloneNode(true);
      const section = content.querySelector('section[data-sublist-cubes]');
      const spanHContent = section.querySelector('.h-content');
      const selectable = spanHContent.querySelector('.selectable');
      const span = section.querySelector('span[generic]');
      const spanTable = section.querySelector('span[table]');
      section.dataset.label = value.name;
      section.dataset.elementSearch = 'cubes';
      selectable.dataset.cubeToken = token;
      selectable.dataset.schema = value.schema;
      selectable.id = token;
      selectable.onclick = app.handlerCubeSelected;
      span.dataset.cubeToken = token;
      span.innerText = value.name;
      // span.dataset.fn = 'handlerCubeSelected';
      spanTable.innerText = value.FACT;
      ul.appendChild(section);
    }
  }

  /*var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(10, 145);
    ctx.moveTo(20, 30);
    ctx.lineTo(130, 30);
    ctx.closePath();
    ctx.stroke();
  }*/

  app.closeAbsoluteWindow = (attr) => {
    document.querySelector(".absolute-window[data-window-name*='" + attr + "']").dataset.open = 'false';
    document.querySelector("button[data-window-name='" + attr + "']").toggleAttribute('open');
  }

  app.openAbsoluteWindow = (attr) => {
    // verifico se ci sono altre absolute-window aperte
    document.querySelectorAll(".absolute-window[data-open='true']").forEach(win => app.closeAbsoluteWindow(win.dataset.windowName));
    document.querySelector(".absolute-window[data-window-name*='" + attr + "']").dataset.open = 'true';
    document.querySelector("button[data-window-name='" + attr + "']").toggleAttribute('open');
  }

  // selezione di un cubo già definito, da qui è possibile associare, ad esempio, una nuova dimensione ad un cubo già esistente.
  app.handlerCubeSelected = (e) => {
    // chiudo la lista
    app.closeAbsoluteWindow('list-defined-cubes');
    // apro la tabella definita come Cubo
    // console.log('e.currentTarget : ', e.currentTarget);
    StorageCube.selected = e.currentTarget.dataset.cubeToken;
    // console.log('cube selected : ', StorageCube.selected);
    // ridefinisco le proprietà del cubo, leggendo da quello selezionato, nello storage, per consentirne la modifica o l'aggiunto di dimensioni al cubo
    // lo converto in un oggetto Map perchè #columns è un Map. Questo consentirà di poter fare modifiche, quindi aggiungere/eliminare colonne
    Cube.columns = new Map(Object.entries(StorageCube.selected.columns));
    Cube.metricDefined = StorageCube.selected.metrics;
    Cube.schema = StorageCube.selected.schema;
    StorageCube.selected.associatedDimensions.forEach(dim => {
      Cube.associatedDimensions = dim;
    });
    app.addCard(true);
    app.dropZone.dataset.modeInsert = 'before';
    // visualizzo il tasto saveOpenedCube al posto di SaveCube
    app.btnSaveOpenedCube.hidden = false;
    app.btnSaveOpenedCube.disabled = false;
    // nascondo btnSaveCube
    app.btnSaveCube.hidden = true;
  }

  // recupero le tabelle del database in base allo schema selezionato
  app.getDatabaseTable = async (schema) => {
    const url = '/fetch_api/schema/' + schema + '/tables';
    await fetch(url)
      .then((response) => {
        console.log(response);
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data) {
          let ul = document.getElementById('ul-tables');
          // attivo tutti i tasti presenti in .actions dopo aver caricato l'elenco delle tabelle
          app.btnTableList.disabled = false;
          app.btnDimensionList.disabled = false;
          app.btnSaveCube.disabled = false;
          app.btnSaveCubeName.disabled = false;
          app.btnDefinedCube.disabled = false;

          // popolo l'elenco delle tabelle
          for (const [key, value] of Object.entries(data)) {
            // debugger;
            const content = app.tmplLists.content.cloneNode(true);
            const section = content.querySelector('section[data-sublist-draggable]');
            const element = content.querySelector('div[draggable]');
            const span = section.querySelector('span[table]');

            section.dataset.label = value.TABLE_NAME;
            section.dataset.elementSearch = 'tables';
            element.ondragstart = app.handlerDragStart;
            element.id = 'table-' + key;
            element.dataset.schema = schema;
            element.dataset.label = value.TABLE_NAME;
            span.innerText = value.TABLE_NAME;
            span.dataset.label = value.TABLE_NAME;
            ul.appendChild(section);
          }
        } else {
          // TODO: no data
          debugger;
          console.warning('Non è stato possibile recuperare la lista delle tabelle');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // recupero i field della tabella
  app.getTable = async () => {
    // elemento dove inserire le colonne della tabella
    return await fetch('/fetch_api/' + Hier.activeCard.dataset.schema + '/schema/' + Hier.activeCard.dataset.label + '/table_info')
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then(response => response)
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // WARNING: al momento non utilizzata, il salvataggio di una dimensione viene effettuato nel Versioning
  app.saveDIM = async (json) => {
    const params = JSON.stringify(json);
    const url = "/fetch_api/json/dimension_store";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('DIMENSIONE SALVATA CORRETTAMENTE');
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('dimensione non è stata salvata');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  // viene invocata da btnDimensionSaveName.onclick, quando viene salvata una dimensione, vengono chiuse tutte le card aperte attualmente
  app.closeCards = () => {
    document.querySelectorAll('.card.table').forEach((item) => {
      // console.log(item);
      item.remove();
    });
  }

  app.handlerOpenTableList = (e) => {
    delete app.tableList.dataset.fact;
    // visualizzo la lista delle tabelle
    // apro la absolute-window con data-window-name="list-tables"
    if (e.target.hasAttribute('open')) {
      // lista già aperta
      // chiudo la absolute-window
      app.closeAbsoluteWindow(e.target.dataset.windowName);
    } else {
      app.openAbsoluteWindow(e.target.dataset.windowName);
      document.getElementById('tableSearch').focus();
    }
    document.getElementById('tableSearch').focus();
    document.getElementById('tableSearch').select();
  }

  app.addFields = (ul, response) => {
    ul.hidden = false;
    for (const [key, value] of Object.entries(response)) {
      const content = app.tmplLists.content.cloneNode(true);
      const section = content.querySelector('section[data-sublist-fields]'); // questa lista include le 3 icone per columns, hierarchy, metric
      const div = section.querySelector('div.selectable');
      const span = div.querySelector('span[data-item]');
      section.dataset.label = value.COLUMN_NAME;
      section.dataset.elementSearch = Hier.activeCard.dataset.label;
      div.dataset.tableId = Hier.activeCard.id;
      div.dataset.tableName = Hier.activeCard.dataset.label;
      div.dataset.label = value.COLUMN_NAME;
      div.dataset.key = value.CONSTRAINT_NAME;
      span.innerText = value.COLUMN_NAME;
      // scrivo il tipo di dato senza specificare la lunghezza int(8) voglio che mi scriva solo int
      let pos = value.DATA_TYPE.indexOf('(');
      let type = (pos !== -1) ? value.DATA_TYPE.substring(0, pos) : value.DATA_TYPE;
      span.dataset.type = type;
      // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
      div.dataset.id = key;
      // span.id = key;
      // fn da associare all'evento in 'mutation observe'
      div.dataset.fn = 'handlerColumns';
      ul.appendChild(section);
    }
  }

  app.addCard = async (fact) => {
    // creo la card (label)
    // fact : true/false
    let card = document.createElement('div');
    card.className = 'card table';
    // prendo il template cardLayout e lo inserisco nella .card.table
    let tmpl = document.getElementById('cardLayout');
    let content = tmpl.content.cloneNode(true);
    let cardLayout = content.querySelector('.cardLayout');
    card.appendChild(cardLayout);
    if (fact) {
      card.dataset.fact = true;
      card.dataset.schema = StorageCube.selected.schema;
      card.dataset.label = StorageCube.selected.FACT;
      card.dataset.alias = StorageCube.selected.alias;
      card.querySelector('.subtitle').innerHTML = `AS ${StorageCube.selected.alias}`; // alias
      card.querySelector('h6').innerHTML = StorageCube.selected.FACT;
      card.dataset.id = StorageCube.selected.token;
      card.id = StorageCube.selected.token;
      cardLayout.querySelector('.title-alias').dataset.id = StorageCube.selected.token;
      cardLayout.querySelector('section[options]').dataset.mode = 'cube';
    } else {
      card.dataset.schema = StorageDimension.selected.lastTableInHierarchy.schema; // schema
      card.dataset.label = StorageDimension.selected.lastTableInHierarchy.table; // tabella
      card.querySelector('.subtitle').innerHTML = `AS ${StorageDimension.selected.lastTableInHierarchy.alias}`; // alias
      card.dataset.alias = StorageDimension.selected.lastTableInHierarchy.alias;
      // imposto il titolo in h6
      card.querySelector('h6').innerHTML = StorageDimension.selected.lastTableInHierarchy.table;
      card.dataset.id = StorageDimension.selected.token;
      card.id = StorageDimension.selected.token;
      cardLayout.querySelector('.title-alias').dataset.id = StorageDimension.selected.token;
      // l'attr data-dimension-use fa in modo da nascondere, in section[options]
      cardLayout.querySelector('section[options]').dataset.mode = 'dimension';
    }

    // l'appendChild / insertBefore viene stabilito nel checkHierarchyNumber()
    app.checkHierarchyNumber(card);
    app.dropZone.classList.replace('dropping', 'dropped');
    app.dropZone.classList.add('dropped');
    // evento sulla input di ricerca nella card
    // input di ricerca, imposto l'attr data-element-search
    Hier.activeCard = card.id;
    card.querySelector('input[type="search"]').dataset.elementSearch = card.dataset.label;
    card.querySelectorAll('button').forEach(button => button.dataset.id = card.id);

    // ottengo l'elenco dei field della tabella
    const data = await app.getTable();
    // popolo la ul[data-id="columns"] della card corrente recuperata dalla Classe Cube cube.card.ref
    app.addFields(Hier.activeCard.querySelector("ul[data-id='columns']"), data);
  }

  // button "utilizza" nell'elenco delle dimensioni
  app.handlerDimensionSelected = (e) => {
    // console.log(e.target);
    // chiudo la lista delle dimensioni
    app.closeAbsoluteWindow('list-dimensions');
    // const storage = new DimensionStorage();
    StorageDimension.selected = e.target.dataset.token;
    // memorizzo la dimensione selezionata per recuperarla nel salvataggio del cubo
    Cube.dimensionsSelected = e.target.dataset.token;
    // recupero tutta la dimensione selezionata, dallo storage
    console.log(StorageDimension.selected);
    // aggiungo alla dropzone l'ultima tabella della gerarchia
    // debugger;
    app.addCard(false);
  }

  app.addCards = async (dim, hierToken) => {
    // OPTIMIZE: ottimizzare in base alla app.setCardAttributes()
    // dimStorage.selected.hierarchies[hierName].order
    const tables = dim.hierarchies[hierToken].order;
    const columns = dim.hierarchies[hierToken].columns;
    const joins = dim.hierarchies[hierToken].joins;
    console.log('tables to add: ', tables);
    for (const [key, value] of Object.entries(tables)) {
      let x = 40, y = 40;
      // console.log('key : ', key); // la key la posso utilizzare anche per lo z-index
      // console.log('value : ', value);
      const card = document.createElement('div');
      card.className = 'card table';
      card.id = `table-${key}`;
      card.dataset.alias = value.alias;
      card.dataset.value = +key + 1;
      // NOTE: Impostazione di una variabile css (--zindex)
      card.style.setProperty('--zindex', key);
      card.dataset.schema = value.schema;
      card.dataset.label = value.table;
      x *= +key; y *= +key;
      card.style.transform = "translate(" + x + "px, " + y + "px)";
      card.setAttribute('x', x);
      card.setAttribute('y', y);
      // recupero il template cardLayout e lo inserisco nella .card.table
      const tmplCardLayout = document.getElementById('cardLayout');
      const tmplContent = tmplCardLayout.content.cloneNode(true);
      const cardLayout = tmplContent.querySelector('.cardLayout');
      card.appendChild(cardLayout);
      card.dataset.id = `table-${key}`;
      // card.dataset.id = `${hierToken}-${key}`;
      card.querySelector('section[options-hier] span').dataset.value = +card.dataset.value;
      // imposto tutti i data-id sui button
      card.querySelectorAll('button').forEach(button => button.dataset.id = card.dataset.id);
      // h6 titolo
      cardLayout.querySelector('h6').innerHTML = value.table;
      cardLayout.querySelector('.subtitle').innerHTML = `AS ${value.alias}`;
      cardLayout.querySelector('.title-alias').dataset.id = card.dataset.id;
      // sostituisco dropping con dropped per nascondere lo span con la stringa "Trascina qui..."
      app.dropZone.classList.replace('dropping', 'dropped');
      app.dropZone.appendChild(card);
      app.dropZone.classList.add('dropped');
      // input di ricerca, imposto l'attr data-element-search
      card.querySelector('input[type="search"]').dataset.elementSearch = value.table;
      // await : aspetto che getTable popoli tutta la card con i relativi campi
      // NOTE: utilizzo di await
      Hier.activeCard = card.dataset.id;
      const data = await app.getTable();
      app.addFields(Hier.activeCard.querySelector("ul[data-id='columns']"), data);
      // imposto la card attiva
      // seleziono i campi impostati nella dimensione, nelle proprietà 'hierarchies[hiername]columns[value]'
      // per ogni colonna in questa tabella...
      // ...reimposto le selezioni di origine della gerarchia selezionata
      if (columns.hasOwnProperty(value.alias)) {
        for (const [token, field] of Object.entries(columns[value.alias])) {
          Hier.activeCard.querySelector(".selectable[data-label='" + field.id.origin_field + "']").toggleAttribute('columns');
          Hier.alias = value.alias;
          Hier.fieldRef = Hier.activeCard.querySelector(".selectable[data-label='" + field.id.origin_field + "']");
          Hier.field = field;
          // nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
          Hier.column = token;
          // imposto il token sulla colonna selezionata, mi servirà in fase di deselezione della colonna
          Hier.fieldRef.dataset.tokenColumn = token;
        }
      }
    }
    app.addJoins(joins);
  }

  app.addJoins = (joins) => {
    if (!joins) return false;
    // dopo aver caricato tutte le tabelle appartenenti alla dimensione, imposto le gerarchie definite recuperandole dalla proprietà 'join'
    // a questo punto posso recuperare dim.join per inserire nelle tabelle le relative join
    for (const [tableAlias, tokenJoin] of Object.entries(joins)) {
      for (const [token, join] of Object.entries(tokenJoin)) {
        let columnsRef = [];
        join.forEach(relation => {
          // NOTE: destrutturazione
          const [table, field] = relation.split('.');
          let columnRef = app.dropZone.querySelector(".card[data-alias='" + table + "'] .selectable[data-label='" + field + "']");
          columnRef.dataset.relation = 'true';
          columnsRef.push(columnRef);
        });
        Hier.joins = { token, table: tableAlias, columnsRef, join };
        Hier.join = token;
      }
    }
  }

  // selezione di una dimensione per consentirne le modifica
  app.handlerDimensionEdit = (e) => {
    // Recupero tutto il json della dimensione selezionata
    const dim = new DimensionStorage();
    dim.selected = e.target.dataset.dimensionToken;
    const hierToken = e.target.dataset.hierToken;
    app.addCards(dim.selected, hierToken);
    // imposto lo span all'interno del dropzone con la descrizione della dimensione auutalmente in modifica
    app.dropZone.querySelector('span').innerHTML = "Gerarchia in modifica : " + dim.selected.hierarchies[hierToken].name;
    app.dropZone.setAttribute('edit', dim.selected.name); // OPTIMIZE: dataset data-edit
    // chiudo la lista delle dimensioni
    app.closeAbsoluteWindow('list-dimensions');
  }

  app.schemaSelected = (e) => {
    app.closeAbsoluteWindow('list-schema');
    console.log(e.currentTarget);
    // rimuovo l'attributo selected dalla precedente selezione, se ce ne sono
    if (document.querySelector('#list-schema section[data-selected]')) {
      delete document.querySelector('#list-schema section[data-selected]').dataset.selected;
      // ripulisco la #tableList perchè ci sono tabelle appartenenti allo schema selezionato in precedenza
      document.querySelectorAll('#tables > section').forEach(element => element.remove());
    }
    e.currentTarget.dataset.selected = 'true';
    app.getDatabaseTable(e.currentTarget.dataset.schema);
    // document.getElementById('drawer').removeAttribute('open');
  }

  // ordine gerarchico, livello superiore
  app.handlerHierarchyOrder = (e) => {
    // imposto la attuale card come card attiva
    const cardCount = document.querySelectorAll('.card.table').length;
    Hier.activeCard = e.target.dataset.id;
    // NOTE: Magic Method ??? Da rivedere
    // cube.activeCard = {'ref': cardTable, 'schema' : cardTable.dataset.schema, 'tableName': cardTable.dataset.name};
    let value = +Hier.activeCard.dataset.value;
    // spostare, nel DOM, le card in base al livello gerarchico. Livello gerarchico inferiore le card vanno messe prima nel DOM.
    // questo consentirà di creare correttamente le gerarchie con il nome della tabella di gerarchia inferiore salvata nella prop 'hierarchies'
    if (e.target.hasAttribute('hier-order-plus')) {
      value++;
      // non posso spostare card se supero il numero delle card presenti nella pagina
      if (value > cardCount) return;
      // sostituisco il valore della card successiva con quello della card che sto modificando
      Hier.activeCard.nextElementSibling.dataset.value = Hier.activeCard.dataset.value;
      Hier.activeCard.nextElementSibling.querySelector('.hierarchy-order').dataset.value = Hier.activeCard.dataset.value;
      // identifico la card successiva a quella che sto modificando e la posiziono DOPO
      if (Hier.activeCard.nextElementSibling) Hier.activeCard.nextElementSibling.after(Hier.activeCard);
    } else {
      // se il data-value della card = 1 non posso decrementarla
      if (value === 1) return;
      value--;
      Hier.activeCard.previousElementSibling.dataset.value = Hier.activeCard.dataset.value;
      Hier.activeCard.previousElementSibling.querySelector('.hierarchy-order').dataset.value = Hier.activeCard.dataset.value;
      Hier.activeCard.previousElementSibling.before(Hier.activeCard);
    }
    Hier.activeCard.querySelector('.hierarchy-order').dataset.value = value;
    Hier.activeCard.dataset.value = value;
  }

  app.getDimensions();

  app.getCubes();

  // ***********************events*********************
  document.querySelector('#btn-schema-list').onclick = (e) => {
    if (e.target.hasAttribute('open')) {
      // lista già aperta
      // chiudo la absolute-window
      // document.querySelector(".absolute-window[data-window-name='" + e.target.dataset.windowName + "']").dataset.open = 'false';
      app.closeAbsoluteWindow(e.target.dataset.windowName);
    } else {
      app.openAbsoluteWindow(e.target.dataset.windowName);
    }
  }

  // lista cubi già definiti
  app.btnDefinedCube.onclick = (e) => {
    // visualizzo la lista dei cubi esistenti
    // apro la absolute-window con data-window-name="list-defined-cubes"
    if (e.target.hasAttribute('open')) {
      // lista già aperta
      // chiudo la absolute-window
      app.closeAbsoluteWindow(e.target.dataset.windowName);
    } else {
      app.openAbsoluteWindow(e.target.dataset.windowName);
      document.getElementById('cubeSearch').focus();
    }
  }

  // lista dimensioni già definite
  app.btnDimensionList.onclick = (e) => {
    if (e.target.hasAttribute('open')) {
      // lista già aperta
      // chiudo la absolute-window
      app.closeAbsoluteWindow(e.target.dataset.windowName);
    } else {
      app.openAbsoluteWindow(e.target.dataset.windowName);
      document.getElementById('dimensionSearch').focus();
    }
  }

  // open dialog salva gerarchia
  app.btnSaveHierarchy.onclick = (e) => {
    document.getElementById('hierarchyName').value = '';
    app.dialogHierarchyName.showModal();
    // abilito il tasto save dimension
    app.btnSaveDimension.disabled = false;
  }

  // apro la dialog Salva Cubo
  app.btnSaveCube.onclick = (e) => {
    if (e.target.hasAttribute('disabled')) return;
    app.dialogCubeName.showModal();
  }

  // salvataggio del cubo
  // WARNING: al momento non viene utilizzata perchè il salvataggio del cubo viene effettuato dal Versioning
  app.saveCube = async (json) => {
    const params = JSON.stringify(json);
    const url = "/fetch_api/json/cube_store";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data) {
          console.log('data : ', data);
          console.log('CUBO SALVATO CORRETTAMENTE');
          // app.getDatamart(reportId, jsonDataParsed); // recupero i dati dalla FX appena creata
        } else {
          // TODO: no data
          console.debug('ERRORE NEL SALVATAGGIO DEL CUBO SU BD');
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.btnEditSqlId.onclick = (e) => {
    app.txtareaColumnId.dataset.mode = 'sql';
    app.txtareaColumnId.removeAttribute('readonly');
    app.txtareaColumnId.setAttribute('readwrite', true);
    app.txtareaColumnId.focus();
    app.txtareaColumnId.select();
  }

  app.btnEditFieldId.onclick = (e) => {
    app.txtareaColumnId.dataset.mode = 'field';
    app.txtareaColumnId.removeAttribute('readonly');
    app.txtareaColumnId.setAttribute('readwrite', true);
    app.txtareaColumnId.focus();
    app.txtareaColumnId.select();
  }

  app.btnEditSqlDs.onclick = (e) => {
    app.txtareaColumnDs.dataset.mode = 'sql';
    app.txtareaColumnDs.removeAttribute('readonly');
    app.txtareaColumnDs.setAttribute('readwrite', true);
    app.txtareaColumnDs.focus();
    app.txtareaColumnDs.select();
  }

  app.btnEditFieldDs.onclick = (e) => {
    app.txtareaColumnDs.dataset.mode = 'field';
    app.txtareaColumnDs.removeAttribute('readonly');
    app.txtareaColumnDs.setAttribute('readwrite', true);
    app.txtareaColumnDs.focus();
    app.txtareaColumnDs.select();
  }


  /*app.txtareaColumnId.oninput = (e) => {
    // visualizzo il div absolute-popup
    app.absPopup.hidden = false;
    // left position della textarea
    const left = e.target.offsetLeft + 'px';
    const caretXPos = app.txtareaColumnId.textLength+'ch';
    const x = `calc(${left} + ${caretXPos})`;
    const top = e.target.offsetTop + 'px';
    const caretYPos = '4em';
    const y = `calc(${top} + ${caretYPos})`;
    // app.absPopup.style.setProperty('--left', left + 'px');
    app.absPopup.style.setProperty('--left', x);
    app.absPopup.style.setProperty('--top', y);
    // console.log(app.txtareaColumnId.textLength);
    // app.txtareaColumnId.selectionStart = app.txtareaColumnId.textLength;
    // console.log(app.txtareaColumnId.selectionStart);
  }*/

  // save column
  app.btnColumnMap.onclick = () => {
    let fieldObjectDs = { field: app.txtareaColumnDs.value, type: 'da_completare', origin_field: Hier.fieldRef.dataset.label };
    let fieldObjectId = { field: app.txtareaColumnId.value, type: 'da_completare', origin_field: Hier.fieldRef.dataset.label };
    Hier.field = { id: fieldObjectId, ds: fieldObjectDs };
    if (!app.txtareaColumnDs.dataset.mode === 'sql') {
      Hier.field.ds = { field: app.txtareaColumnDs.value, type: 'da_completare', SQL: app.txtareaColumnDs.value, origin_field: Hier.fieldRef.dataset.label };
    }
    if (!app.txtareaColumnId.dataset.mode === 'sql') {
      Hier.field.id = { field: app.txtareaColumnId.value, type: 'da_completare', SQL: app.txtareaColumnId.value, origin_field: Hier.fieldRef.dataset.label };
    }
    // nel metodo columns c'è la logica per controllare se devo rimuovere/aggiungere la colonna selezionata
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    // TODO: rivedere se utilizzare il metodo con l'oggetto Map(), come fatto in Query.metrics
    Hier.column = token;
    // imposto il token sulla colonna selezionata, mi servirà in fase di deselezione della colonna
    Hier.fieldRef.dataset.tokenColumn = token;
    app.dialogColumnMap.close();
    app.btnSaveHierarchy.disabled = (Hier.column.size !== 0) ? false : true;
  }

  // tasto report nella sezione controls -> fabs
  document.getElementById('mdc-report').onclick = () => window.location.href = '/report';

  // associo l'evento click dello schema
  document.querySelectorAll(".absolute-window[data-window-name='list-schema'] > section").forEach(a => a.addEventListener('click', app.schemaSelected));

  app.btnBack.onclick = () => { window.location.href = '/'; }

  /* ricerca in lista tabelle */
  document.getElementById('tableSearch').oninput = App.searchInList;

  app.btnTableList.onclick = app.handlerOpenTableList;

  // dialog apertura 'salva dimensione'
  app.btnSaveDimension.onclick = () => {
    // se drop-zone ha l'attr edit con il nome della dimensione in modifica, lo inserisco direttamente nella input dimensionName
    if (app.dropZone.hasAttribute('edit')) app.dialogDimensionName.querySelector('#dimensionName').value = app.dropZone.getAttribute('edit'); // OPTIMIZE: dataset data-edit
    app.dialogDimensionName.showModal();
  }

  app.addHierarchy = (name, order) => {
    console.log('name : ', name);
    console.log('order : ', order);
    const divHierarchies = document.querySelector('#hierarchies > .hierarchies');
    const tmpl = document.getElementById('tmpl-hierarchies');
    const content = tmpl.content.cloneNode(true);
    const section = content.querySelector('section');
    const h6 = section.querySelector('h6');
    h6.innerText = name;
    // TODO: per ogni tabella nell'object 'order' creo uno span all'interno di .hierarchy-details
    const hierarchyDetail = section.querySelector('.hierarchy-detail');
    for (const [key, object] of Object.entries(order)) {
      const tmplSpan = app.tmplSpan.content.cloneNode(true);
      const div = tmplSpan.querySelector('div');
      const spanId = div.querySelector('span[data-id]');
      const spanTable = div.querySelector('span[data-table]');
      spanId.innerText = key;
      spanId.dataset.id = key;
      spanTable.innerText = object.table;
      spanTable.dataset.table = object.table;
      hierarchyDetail.appendChild(div);
    }
    divHierarchies.appendChild(section);
  }

  // save hierarchy
  app.btnHierarchySaveName.onclick = () => {
    const hierTitle = document.getElementById('hierarchyName').value;
    // ordine gerarchico (per stabilire quale tabella è da associare al cubo) questo dato viene preso dal valore presente in .hierarchy-order
    let hierarchyOrder = {};
    // contare quante tabelle sono presenti nella gerarchia corrente
    // eseguire un ciclo che inizia da 1 (per la prima tabella della gerarchia)
    // recuperare le tabelle in ordine per aggiungerle all'object hierarchyOrder
    const tableCount = document.querySelectorAll('.card.table').length;
    let from = [];
    let lastTables = {};
    for (let i = 1, index = 0; i <= tableCount; i++, index++) {
      const table = document.querySelector(".card.table[data-value='" + i + "']");
      hierarchyOrder[index] = { schema: table.dataset.schema, table: table.dataset.label, alias: table.dataset.alias };
      from.push(`${table.dataset.schema}.${table.dataset.label} AS ${table.dataset.alias}`);
      lastTables = {
        alias: table.dataset.alias,
        schema: table.dataset.schema,
        table: table.dataset.label
      };
    }
    const comment = document.getElementById('textarea-hierarchies-comment').value;
    const rand = () => Math.random(0).toString(36).substring(2);
    const token = rand().substring(0, 7);
    Hier.hier = { token, name: hierTitle, hierarchyOrder, comment, from };
    // la gerarchia creata la salvo nell'oggetto Dim, della classe Dimension, dove andrò a salvare, alla fine, tutta la dimensione
    Dim.hier = Hier.hier;
    Dim.lastTableHierarchy = lastTables;
    // dimension.hierarchyOrder = {title : hierTitle, hierarchyOrder, comment};
    app.dialogHierarchyName.close();
    // abilito il tasto btnNewHierarchy
    app.btnNewHierarchy.disabled = false;
    // creo, nel div #hierarchies, la gerarchia appena creata
    app.addHierarchy(hierTitle, hierarchyOrder);
    // abilito il tasto #toggle-hierarchy-struct
    document.getElementById('toggle-hierarchy-struct').disabled = false;

    // abilito il tasto 'saveDimension' e disabilito btnSaveHierarchy
    app.btnSaveDimension.disabled = false;
    app.btnSaveHierarchy.disabled = true;
  }

  // hide hierarchy struct
  app.btnToggleHierarchyStruct.onclick = (e) => {
    // console.log(e.target);
    const hierarchyStruct = document.getElementById('hierarchies');
    hierarchyStruct.toggleAttribute('data-open');
    e.target.innerText = (hierarchyStruct.hasAttribute('data-open')) ? 'arrow_circle_right' : 'arrow_circle_left';
  }

  // new hierarchy
  app.btnNewHierarchy.onclick = () => {
    /* se è presente più di una tabella, nella gerarchia, l'ultima non la elimino.
    * In una dimensione con più gerarchie, l'ultima tabella della gerarchia deve essere la stessa per tutte le gerarchie.
    */
    // lista tabelle presenti nella gerarchia
    const cards = app.dropZone.querySelectorAll('.card.table');
    if (cards.length > 1) {
      // sono presenti più tabelle, l'ultima della gerarchia non la elimino
      cards.forEach((card) => {
        if (+card.dataset.value !== cards.length) {
          card.remove();
        } else {
          // ultima e unica tabella presente
          // la card ora viene impostata in mode="last-table". Questo consente di visualizzare/nascondere alcuni tasti 'options'
          card.dataset.mode = 'last-table';
          card.querySelector('.info').hidden = true;
          // rimuovo le precedenti relazioni (appartenenti ad altre gerarchie)
          card.querySelectorAll('ul .selectable[data-relation-id]').forEach(join => {
            delete join.dataset.relation;
            delete join.dataset.joinToken;
            delete join.dataset.relationId;
          });
          // resetto il numero in .cardTable[data-value]
          card.dataset.value = 0;
          /* imposto la drop-zone in modalità data-mode-insert = "before".
          * con 'before' tutte le card aggiunte alla dropzone saranno messe PRIMA dell'ultima card
          */
          app.dropZone.dataset.modeInsert = "before";
        }
      });
    } else {
      // c'è solo una card, la elimino.
      app.dropZone.querySelector('.card.table').remove();
      // se la dropzone ha un solo elemento, cioè lo <span>Trascina....</span>, rimuovo la class dropped per ripristinare lo stato iniziale
      if (app.dropZone.childElementCount === 1) app.dropZone.classList.remove('dropped');
    }
    Hier = new Hierarchy();
  }

  // update cube
  app.btnSaveOpenedCube.onclick = () => {
    console.log('Aggiornamento Cubo');
    // console.log(StorageCube.selected);
    Cube.title = StorageCube.selected.name;
    Cube.comment = StorageCube.selected.comment;
    Cube.alias = StorageCube.selected.alias;
    Cube.schema = StorageCube.selected.schema;
    Cube.FACT = StorageCube.selected.FACT;
    Cube.token = StorageCube.selected.token;
    debugger;

    const storage = new DimensionStorage();
    Cube.dimensionsSelected.forEach(dimensionToken => {
      let dimensionObject = {};
      // console.log(dimensionToken);
      storage.selected = dimensionToken;
      // console.log(storage.selected);
      // il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
      dimensionObject[dimensionToken] = storage.selected;
      // salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
      // dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
      // TODO: impostare cubes come un object e non come un array, in questo modo è più semplice recuperarlo da report/init.js "app.handlerDimensionSelected()"
      // debugger;
      dimensionObject[dimensionToken].cubes[Cube.token] = Object.fromEntries(Cube.join);
      // console.log(dimensionObject[dimensionToken]);
      // salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
      Cube.associatedDimensions = dimensionToken;
      // salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
      // TODO: devo aggiornare le prop 'created_at' e 'updated_at' altrimenti questa dimensione non verrà considerata aggiornata dal versioning
      storage.save(dimensionObject[dimensionToken]);
    });
    // TODO: l'aggiornamento del cubo non deve aggiornare anche la prop created_at ma solo updated_at
    debugger;
    // legame con la dimensione time
    if (Cube.timeDimension) {
      let dimensionObject = {};
      storage.selected = Cube.timeDimension;
      dimensionObject[Cube.timeDimension] = storage.selected;
      console.log(Cube.timeJoin);
      dimensionObject[Cube.timeDimension].cubes[Cube.token] = Object.fromEntries(Cube.timeJoin);
      console.log(dimensionObject[Cube.timeDimension]);
      // salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
      Cube.associatedDimensions = Cube.timeDimension;
      // salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
      storage.save(dimensionObject[Cube.timeDimension]);
    }
    Cube.save();
    // salvo il cubo in localStorage
    StorageCube.save(Cube.cube);
    debugger;
    // TODO: aggiornamento su database, da implementare
    // app.saveCube(cube.cube);

    app.dialogCubeName.close();
  }

  // save cube
  app.btnSaveCubeName.onclick = () => {
    console.log('Save Cube');
    // TODO: devo verificare se il nome del cubo esiste già, sia in locale che sul db.
    Cube.title = document.getElementById('cubeName').value;
    Cube.comment = document.getElementById('textarea-cube-comment').value;
    Cube.alias = document.querySelector('.card.table[data-fact]').dataset.alias;
    Cube.schema = document.querySelector('.card.table[data-fact]').dataset.schema;
    Cube.FACT = document.querySelector('.card.table[data-fact]').dataset.label;
    Cube.columns = Hier.column; // è un oggetto Map
    // recupero l'alias della FACT
    const rand = () => Math.random(0).toString(36).substring(2);
    Cube.token = rand().substring(0, 21);

    const dimension = new DimensionStorage();
    Cube.dimensionsSelected.forEach(dimensionToken => {
      let dimensionObject = {};
      // console.log(dimensionName);
      dimension.selected = dimensionToken;
      // il metodo selected restituisce la dimensione che sto ciclando, la salvo in dimensionObject per modificarla (aggiunta cubi)
      dimensionObject[dimensionToken] = dimension.selected;
      // salvo il cubo all'interno della dimensione, comprese la sua join con questa dimensione
      // dimensionObject[dimensionName].cubes.push({[cube._title] : cube.relations});
      console.log(Cube.join);
      dimensionObject[dimensionToken].cubes[Cube.token] = Object.fromEntries(Cube.join);
      console.log(dimensionObject[dimensionToken]);
      // salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
      Cube.associatedDimensions = dimensionToken;
      // salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
      dimension.save(dimensionObject[dimensionToken]);
    });
    // legame con la dimensione time
    debugger;
    if (Cube.timeDimension) {
      let dimensionObject = {};
      dimension.selected = Cube.timeDimension;
      dimensionObject[Cube.timeDimension] = dimension.selected;
      console.log(Cube.timeJoin);
      dimensionObject[Cube.timeDimension].cubes[Cube.token] = Object.fromEntries(Cube.timeJoin);
      console.log(dimensionObject[Cube.timeDimension]);
      // salvo il nome della dimensione/i associate al cubo. In questo modo, il cubo andrà a leggere la dimensione, tramite nome, se la dimensione viene modificata la modifica si riflette su tutti i cubi che hanno questa dimensione
      Cube.associatedDimensions = Cube.timeDimension;
      // salvo la "nuova" dimensione, la dimensione avrà la proprietà cubes valorizzata
      dimension.save(dimensionObject[Cube.timeDimension]);
    }

    Cube.save();
    // salvo il cubo in localStorage
    StorageCube.save(Cube.cube);
    // salvo il cubo sul DB
    // app.saveCube(cube.cube);
    // TODO: pulisco la dropZone
    app.dialogCubeName.close();
  }

  // save dimension
  document.getElementById('btnDimensionSaveName').onclick = () => {
    /*
      Salvo la dimensione, senza il legame con la FACT.
      Salvo in localStorage la dimensione creata
      // Visualizzo nell'elenco di sinistra la dimensione appena creata
      // creo un contenitorre per le dimensioni salvate, con dentro le tabelle che ne fanno parte.
    */
    Dim.title = document.getElementById('dimensionName').value;
    Dim.comment = document.getElementById('textarea-dimension-comment').value;
    // cube.dimension
    // const storage = new DimensionStorage();		
    Dim.save();
    StorageDimension.save(Dim.dimension);
    app.dialogDimensionName.close();
    // chiudo le card presenti
    app.closeCards();
    // pulisco la sezione #hierarchies
    document.querySelectorAll('#hierarchies > .hierarchies > *').forEach(hier => hier.remove());
    // aggiungo la dimensione appena creata alla #dimensions
    app.addDimension(Dim.dimension.token, Dim.dimension);
    Dim = new Dimension();
    Hier = new Hierarchy();
  }

  app.btnCompositeMetricDone.onclick = () => app.dialogCompositeMetric.close();

  // textarea per creare una metrica composta
  document.getElementById('composite-metric-formula').onclick = (e) => {
    console.log('e : ', e);
    console.log('e.target : ', e.target);
    console.log('e.currentTarget : ', e.currentTarget);
    if (e.target.localName === 'div') {
      const span = document.createElement('span');
      span.setAttribute('contenteditable', true);
      e.target.appendChild(span);
      span.focus();
    }
  }

  app.addSpan = (target, value, check, mode) => {
    /*
    * target : il div che contiene la formula
    * check : filter, metric (filter se sto creando una formula per il filtro, metric per le metriche composte)
    */
    const span = document.createElement('span');
    span.dataset.check = check;
    if (mode) span.dataset.mode = mode;
    span.setAttribute('contenteditable', 'true');
    span.setAttribute('tabindex', 0);
    // let evt = new KeyboardEvent("keydown", {
    //   shiftKey: true,
    //   key: "Tab"
    // });
    // span.addEventListener('input', app.checkSpanFormula);
    // Do nothing if the event was already processed
    span.onkeydown = (e) => {
      if (e.defaultPrevented) return;
      /* verifico prima se questo span è l'ultimo elemento della formula.
      * In caso che lo span è l'ultimo elemento della formula ne aggiungo un'altro, altrimenti il Tab avrà il comportamento di default
      */
      const lastSpan = (e.target === target.querySelector('span[contenteditable]:last-child'));
      switch (e.key) {
        case 'Tab':
          // console.log(e.ctrlKey);
          // se il tasto shift non è premuto e mi trovo sull'ultimo span, aggiungo un altro span. In caso contrario, la combinazione shift+tab oppure tab su un qualsiasi altro
          // ...span che non sia l'ultimo, avrà il comportamento di default
          if (!e.shiftKey && lastSpan) {
            (mode) ? app.addSpan(target, null, check, mode) : app.addSpan(target, null, check);
            e.preventDefault();
          }
          break;
        case 'Backspace':
          // se lo span è vuoto devo eliminarlo, in caso contrario ha il comportamento di default
          if (span.textContent.length === 0) {
            // posiziono il focus sul primo span disponibile andando indietro nel DOM
            /* const event = new Event('build');
            // Listen for the event.
             span.addEventListener('build', function(e) { console.log(e) }, false);
            // Dispatch the event.
            span.dispatchEvent(event);
            */
            // span.dispatchEvent(evt);
            // verifico il primo span[contenteditable] presente andando all'indietro (backspace keydown event)
            let previousContentEditable = (span) => {
              // se viene trovate uno <span> precedente a quello passato come argomento, lo restituisco, altrimenti restituisco quello passato come argomento
              if (span.previousElementSibling) {
                span = (span.previousElementSibling.hasAttribute('contenteditable')) ? span.previousElementSibling : previousContentEditable(span.previousElementSibling);
              }
              return span;
            }
            previousContentEditable(span).focus();
            span.remove();
          }
          break;
        default:
          break;
      }
    }
    if (value) span.innerText = value;
    target.appendChild(span);
    span.focus();
  }

  // selezione di una metrica per la creazione di una metrica composta
  app.handlerMetricSelectedComposite = (e) => {
    // TODO: aggiungo la metrica alla textarea
    const textarea = document.getElementById('composite-metric-formula');
    const templateContent = app.tmplFormula.content.cloneNode(true);
    const span = templateContent.querySelector('span');
    const mark = templateContent.querySelector('mark');
    // mark.dataset.metricToken = e.currentTarget.dataset.metricToken;
    mark.innerText = e.currentTarget.dataset.label;
    textarea.appendChild(span);
    // aggiungo anche uno span per il proseguimento della scrittura della formula
    app.addSpan(textarea, null, 'metric');
  }

  app.checkDialogCompositeMetric = () => {
    const name = document.getElementById('composite-metric-name').value;
    const alias = document.getElementById('composite-alias-metric').value;
    (name.length !== 0 && alias.length !== 0) ? app.btnCompositeMetricSave.disabled = false : app.btnCompositeMetricSave.disabled = true;
  }

  document.getElementById('composite-metric-name').oninput = () => app.checkDialogCompositeMetric();

  document.getElementById('composite-alias-metric').oninput = () => app.checkDialogCompositeMetric();

  app.activeCard = (e) => {
    Hier.activeCard = e.currentTarget.dataset.id;
    console.log('Hier.card : ', Hier.card);
  }

  app.handlerMinimizeCard = (e) => {
    Hier.card.classList.add('minimize');
    e.target.hidden = true;
    console.log('e.target : ', e.target);
    console.log('e.target : ', e.target.nextElementSibling);
    e.target.nextElementSibling.hidden = false;
  }

  app.handlerExpandCard = (e) => {
    Hier.card.classList.remove('minimize');
    e.target.hidden = true;
    e.target.previousElementSibling.hidden = false;
  }

  // popolamento tabella WEB_BI_TIME
  document.querySelector("#btn-time-dimension").onclick = async () => {
    // let jsonDataParsed = JSON.parse(window.localStorage.getItem(processToken));
    // console.dir(jsonDataParsed.report);
    const jsonData = { start: "2022-01-01", end: "2023-01-01" };
    const params = JSON.stringify(jsonData);
    App.showConsole('Elaborazione in corso...', 'info');
    // lo processo in post, come fatto per il salvataggio del process. La richiesta in get potrebbe superare il limite consentito nella url, come già successo per saveReport()
    const url = "/fetch_api/dimension/time";
    const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
    const req = new Request(url, init);
    await fetch(req)
      .then((response) => {
        // TODO: Rivedere la gestione del try...catch per poter creare un proprio oggetto Error visualizzando un errore personalizzato
        if (!response.ok) { throw Error(response.statusText); }
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        if (response) {
          App.closeConsole();
          App.showConsole('result', 'done', 5000);
        } else {
          // TODO: Da testare se il codice arriva qui o viene gestito sempre dal catch()
          debugger;
          App.showConsole('Errori....', 'error', 5000);
        }
      })
      .catch(err => {
        App.showConsole(err, 'error');
        console.error(err);
      });
  }

  app.handlerDateTime = (e) => {
    // imposto il metrics mode
    Hier.activeCard = e.target.dataset.id;
    Hier.mode = 'date-time';
  }

  app.handlerFactTable = (e) => e.target.toggleAttribute('data-selected');

  document.querySelector('#mdc-mapping-custom').onclick = () => window.location.href = '/mapdb';

  /* page init  (impostazioni inziali per la pagina, alcune sono necessarie per essere catturate dal mutationObserve)*/
  document.querySelector('.absolute-window[data-window-name="list-schema"]').dataset.open = 'true';
  /* end page init */
})();
