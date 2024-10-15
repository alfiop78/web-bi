// templates
const template_li = document.getElementById('tmpl-li');
const tmplContextMenu = document.getElementById('tmpl-context-menu-content');
const contextMenuRef = document.getElementById('context-menu');
const tmplDetails = document.getElementById('tmpl-details-element');
// Dialogs
const dlgFilter = document.getElementById('dlg-filters');
const dlgCustomMetric = document.getElementById('dlg-custom-metric');
// Textarea
var textareaFilter = document.getElementById('textarea-filter');
var textareaCustomMetric = document.getElementById('textarea-custom-metric');
// Buttons
const btnFilterSave = document.getElementById('btn-filter-save');
const btnCustomMetricSave = document.getElementById('btn-custom-metric-save');
const btnOpenDialogFilter = document.getElementById('btnOpenDialogFilter');
btnOpenDialogFilter.addEventListener('click', openDialogFilter);
// Other
const popupSuggestions = document.getElementById('popup');
const sel = document.getSelection();

const rand = () => Math.random(0).toString(36).substring(2);
const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric', fractionalSecondDigits: 1 };

const findIndexOfCurrentWord = (textarea, caretPosition) => {
  // ottengo il valore corrente e la posizione del cursore
  const currentValue = textarea.firstChild.textContent;
  // const cursorPos = caretPosition;

  // Cerco l'indice di partenza della parola corrente...
  let startIndex = caretPosition - 1;
  // ... il ciclo cerca all'indietro dalla posizione corrente-1 (startIndex) fino a quando trova uno spazio
  // oppure il carattere di "a capo"
  while (startIndex >= 0 && !/\W/.test(currentValue[startIndex])) {
    startIndex--;
  }
  // lo startIndex corrisponde all'indice di inizio della parola corrente
  return startIndex;
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  // TODO: 04.10.2024 qui potrei nascondere il loader della pagina
  // NOTE: textarea-filter
  document.querySelectorAll(".textarea[contenteditable='true']").forEach(textarea => {
    textarea.addEventListener('keyup', (e) => {
      // const sel = document.getSelection();
      // console.log(sel);
      // const caretPosition = sel.anchorOffset;
      // console.log(`caretPosition : ${caretPosition}`);
      // console.log(e.code, e.key);
      // e.preventDefault();
      switch (e.code) {
        case 'Space':
          e.target.querySelector('span')?.remove();
          // popup.classList.remove('open');
          break;
        case 'Backspace':
        case 'Delete':
          // elimino il primo elemento se questo corrisponde a un nodo type = 1 (il TextNode è un nodeType 3)
          // (es. lo <span> o <br> che non elimino)
          if (e.target.firstChild.nodeType === 1 && e.target.firstChild.nodeName !== 'BR') e.target.firstChild.remove();
          break;
        default:
          break;
      }
    });

    textarea.addEventListener('click', (e) => {
      const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
      // console.log(caretPosition.offset);
    });

    textarea.addEventListener('keydown', function(e) {
      // const sel = document.getSelection();
      // console.log(sel);
      // const caretPosition = sel.anchorOffset;
      if (!['Tab', 'Enter'].includes(e.key)) return;
      // e.preventDefault();
      switch (e.key) {
        case 'Tab':
          if (e.target.querySelector('span')) {
            e.preventDefault();
            e.target.firstChild.textContent += e.target.querySelector('span').textContent;
            // e.target.querySelector('span').textContent = '';
            // popup.classList.remove('open');
            // delete e.target.querySelector('span').dataset.text;
            e.target.querySelector('span').remove();
            // posiziono il cursore alla fine della stringa
            sel.setPosition(e.target.firstChild, e.target.firstChild.length);
          }
          break;
        case 'Enter':
          e.preventDefault();
          break;
        default:
          break;
      }
    });

    textarea.addEventListener('blur', (e) => {
      // TODO: 10.10.2024 Qui potrei effettuare un controllo di validità.
      // Ad esempio se i nomi delle tabelle o i nomi delle colonne sono validi.
      // Se, nelle keyword (AND, OR, BETWEEN, ecc) sono inseriti gli spazi...
      // ...
      // Elimino eventuali elementi <span> "suggestion" rimasti in sospeso
      // INFO: ChainingOperatore: se l'elemento esiste lo rimuovo, se non esiste NON viene generate un errore ma undefined
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
      e.target.querySelector('span')?.remove();
      // e.target.querySelector('span').remove();
    });


  });


  textareaFilter.addEventListener('input', (e) => {
    // console.log(sel);
    // console.log(sel.baseNode.textContent);
    // console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
    // console.log(e.target.firstChild);
    if (e.target.firstChild.nodeType === 1) return;
    const suggestionsTables = [...document.querySelectorAll('#wbFilters>details')];
    const caretPosition = sel.anchorOffset;
    const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
    const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
    // const currentWord = (endIndex > 0) ? e.target.firstChild.textContent.substring(startIndex + 1, caretPosition) : e.target.firstChild.textContent.substring(startIndex + 1);
    // console.info(`current word : ${currentWord}`);
    if (currentWord.length > 0) {
      // se il carattere che interrompe la parola (trovato dal egex) è un punto allora devo cercare nell'array delle Colonne, altrimenti in quello delle Tabelle
      const chartAt = e.target.firstChild.textContent.at(startIndex);
      // console.log(`chartAt : ${chartAt}`);
      let table = null;
      if (chartAt === '.') {
        // recupero la tabella (prima del punto) in modo da cercare le colonne SOLO di quella tabella
        const startIndexTable = findIndexOfCurrentWord(e.target, startIndex);
        table = e.target.firstChild.textContent.substring(startIndexTable + 1, startIndex);
      }
      // console.info(`current word : ${currentWord}`);
      // let regex = new RegExp(`^${currentWord}.*`, 'i');
      const regex = new RegExp(`^${currentWord}.*`);
      const match = (chartAt === '.') ?
        [...document.querySelectorAll(`#wbFilters>details[data-table='${table}']>li`)].find(value => value.dataset.label.match(regex)) :
        suggestionsTables.find(value => value.dataset.table.match(regex));
      // console.log(`match ${match}`);
      if (match) {
        // console.log(sel);
        const span = document.createElement('span');
        span.textContent = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
        span.dataset.text = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
        const node = sel.anchorNode;
        // console.log(node.parentNode.querySelector('span'));
        // se è presente già un "suggerimento" (span) lo elimino
        if (node.parentNode.querySelector('span')) node.parentNode.querySelector('span').remove();
        // offset indica la posizione del cursore
        const offset = sel.anchorOffset;
        // splitText separa il nodo in due dove, 'node' è la parte prima del cursore e replacement e la parte successiva al cursore
        const replacement = node.splitText(offset);
        // creo un elemento p per poter effettuare il insertBefore dello span contenente il "suggestion"
        const p = document.createElement('p');
        // inserisco, in p, la prima parte (prima del cursore in posizione corrente)
        p.innerHTML = node.textContent;
        // inserisco lo span del suggerimento prima della parte DOPO il cursore (replacement)
        node.parentNode.insertBefore(span, replacement);
        // il nodo ora contiene tutto l'elemento <p> che è composto in questo modo :
        // <p>parte PRIMA del testo <span>suggerimento</span> parte DOPO il cursore
        node.textContent = p.textContent;
        // siccome ho riscritto il nodo, la posizione del cursore viene impostata all'inizio del nodo, quindi la reimposto dov'era (offset)
        sel.setPosition(node, offset);
        // normalizzo i nodi
        e.target.normalize();
        /* popup.classList.add('open');
        popup.style.left = `${e.target.querySelector('span').offsetLeft}px`;
        popup.style.top = `${e.target.querySelector('span').offsetTop + 30}px`; */
      } else {
        if (e.target.querySelector('span')) {
          // e.target.querySelector('span').textContent = '';
          // popup.classList.remove('open');
          // delete e.target.querySelector('span').dataset.text;
          e.target.querySelector('span').remove();
        }
      }
    }
  });

  textareaFilter.addEventListener('drop', (e) => {
    // impedisco che venga droppato l'id dell'elemento
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
    const textNode = caretPosition.offsetNode;
    const offset = caretPosition.offset;
    // elementRef : è l'elemento draggato
    WorkBook.activeTable = elementRef.dataset.tableId;
    console.log(textNode);
    console.log(offset);
    const text = document.createTextNode(`${WorkBook.activeTable.dataset.table}.${elementRef.dataset.field}`);
    if (offset !== 0) {
      // BUG: 11.10.2024 Quando si effettua il drop DOPO l'ultimo carattere (spazio)
      // si verifica un errore perchè è presente l'elemento <br> in quella posizione
      // Questo comporta che il textNode non è più un node ma è l'elemento textarea
      let replacement = textNode.splitText(offset);
      let p = document.createElement('p');
      p.innerHTML = textNode.textContent;
      // NOTE: utilizzo di un elemento parent (<p> in questo caso) per poter utilizzare insertBefore
      // ...che non è possibile utilizzare su nodi Text
      textNode.parentNode.insertBefore(text, replacement);
      textNode.textContent = p.textContent;
    } else {
      textNode.textContent = text.textContent;
    }
    e.target.normalize();
    e.target.appendChild(document.createElement('br'));
  });

  textareaFilter.addEventListener('dragenter', (e) => {
    e.preventDefault();
    console.log('dragEnter');
    // elimino l'elemento <br> altrimenti, nell'evento drop viene preso in considerazione la textarea e non il textnode
    e.target.querySelector('br')?.remove();
  });

  textareaFilter.addEventListener('dragleave', (e) => {
    e.preventDefault();
    console.log('dragLeave');
    e.target.appendChild(document.createElement('br'));
  });
  // NOTE: textarea-filter

  // NOTE: textarea-custom-metric
  textareaCustomMetric.addEventListener('input', (e) => {
    // console.log(sel);
    // console.log(sel.baseNode.textContent);
    // console.log(e.target.firstChild.nodeType, e.target.firstChild.nodeName);
    // console.log(e.target.firstChild);
    if (e.target.firstChild.nodeType === 1) return;
    // recupero l'elenco delle colonne dal sessionStorage
    const suggestionsTables = JSON.parse(window.sessionStorage.getItem(WorkBook.activeTable.dataset.table));
    const caretPosition = sel.anchorOffset;
    const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
    const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
    // const currentWord = (endIndex > 0) ? e.target.firstChild.textContent.substring(startIndex + 1, caretPosition) : e.target.firstChild.textContent.substring(startIndex + 1);
    // console.info(`current word : ${currentWord}`);
    if (currentWord.length > 0) {
      // console.info(`current word : ${currentWord}`);
      // let regex = new RegExp(`^${currentWord}.*`, 'i');
      const regex = new RegExp(`^${currentWord}.*`);
      // const match = console.log([...suggestionsTables].find(value => value.column_name.match(regex)));
      const match = [...suggestionsTables].find(value => value.column_name.match(regex));
      // console.log(`match ${match}`);
      if (match) {
        // console.log(sel);
        const span = document.createElement('span');
        span.textContent = match.column_name.slice(currentWord.length, match.column_name.length);
        span.dataset.text = match.column_name.slice(currentWord.length, match.column_name.length);
        const node = sel.anchorNode;
        // console.log(node.parentNode.querySelector('span'));
        // se è presente già un "suggerimento" (span) lo elimino
        if (node.parentNode.querySelector('span')) node.parentNode.querySelector('span').remove();
        // offset indica la posizione del cursore
        const offset = sel.anchorOffset;
        // splitText separa il nodo in due dove, 'node' è la parte prima del cursore e replacement e la parte successiva al cursore
        const replacement = node.splitText(offset);
        // creo un elemento p per poter effettuare il insertBefore dello span contenente il "suggestion"
        const p = document.createElement('p');
        // inserisco, in p, la prima parte (prima del cursore in posizione corrente)
        p.innerHTML = node.textContent;
        // inserisco lo span del suggerimento prima della parte DOPO il cursore (replacement)
        node.parentNode.insertBefore(span, replacement);
        // il nodo ora contiene tutto l'elemento <p> che è composto in questo modo :
        // <p>parte PRIMA del testo <span>suggerimento</span> parte DOPO il cursore
        node.textContent = p.textContent;
        // siccome ho riscritto il nodo, la posizione del cursore viene impostata all'inizio del nodo, quindi la reimposto dov'era (offset)
        sel.setPosition(node, offset);
        // normalizzo i nodi
        e.target.normalize();
        /* popup.classList.add('open');
        popup.style.left = `${e.target.querySelector('span').offsetLeft}px`;
        popup.style.top = `${e.target.querySelector('span').offsetTop + 30}px`; */
      } else {
        if (e.target.querySelector('span')) {
          // e.target.querySelector('span').textContent = '';
          // popup.classList.remove('open');
          // delete e.target.querySelector('span').dataset.text;
          e.target.querySelector('span').remove();
        }
      }
    }
  });

  // NOTE: textarea-custom-metric

}); // end DOMContentLoaded

/*
  * Tasto di salvataggio/aggiornamento filtro
  * sql : viene passato alla procedura .php che elabora il report
  * formula : è la formula scritta nella textarea, verrà utilizzata per ripristinarla nella textarea in case di edit
*/
btnFilterSave.onclick = (e) => {
  if (textareaFilter.firstChild.nodeType !== 3) return;
  const input = document.getElementById('input-filter-name');
  const name = input.value;
  // in edit recupero il token presente sul tasto
  const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
  let tables = new Set();
  const formula = textareaFilter.firstChild.textContent.split(' ');
  const date = new Date().toLocaleDateString('it-IT', options);
  let object = { type: 'filter', name, token, tables: [], from: {}, joins: {}, formula, sql: [], workbook_ref: WorkBook.workBook.token, updated_at: date };
  // replico i nomi delle tabelle con i suoi alias di tabella, recuperandoli dalla ul#wbFilters
  object.sql = formula.map(value => {
    if (value.includes('.')) {
      // nome_tabella.nome_campo
      const table = value.split('.')[0];
      const alias = document.querySelector(`#wbFilters>details[data-table='${table}']`).dataset.alias;
      tables.add(alias);
      const regex = new RegExp(`${table}`, 'i');
      return value.replace(regex, alias);
    }
    return value;
  });
  // converto l'oggetto Set() tables in un array
  object.tables = [...tables];

  for (const factId of WorkBook.dataModel.keys()) {
    // WARN: 2024.02.08 questa logica è utilizzata anche in setSheet(). Creare un metodo riutilizzabile.
    object.from[factId] = {};
    object.joins[factId] = {};
    // object.tables : l'alias della tabella
    object.tables.forEach(alias => {
      const tablesOfModel = WorkBook.dataModel.get(factId);
      if (tablesOfModel.hasOwnProperty(alias)) {
        tablesOfModel[alias].forEach(table => {
          const data = Draw.tables.get(table.id);
          // 'from' del filtro, questo indica quali tabelle includere quando si utilizza
          // questo filtro nel report
          object.from[factId][data.alias] = { schema: data.schema, table: data.table };
          // 'join', indica quali join utilizzare quando si utilizza questo filtro in un report
          if (WorkBook.joins.has(data.alias)) {
            // esiste una join per questa tabella
            for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
              if (join.factId === factId) object.joins[factId][token] = join;
            }
          }
        });
      }
    });
  }

  // la prop 'created_at' va aggiunta solo in fase di nuovo filtro e non quando si aggiorna il filtro
  if (e.target.dataset.token) {
    // aggiornamento del filtro
    // recupero il filtro dallo storage per leggere 'created_at'
    const filter = JSON.parse(window.localStorage.getItem(e.target.dataset.token));
    object.created_at = filter.created_at;
  } else {
    object.created_at = date;
  }
  // Salvataggio del Filtro
  WorkBook.filters = { token, value: object };
  window.localStorage.setItem(token, JSON.stringify(WorkBook.filters.get(token)));
  // completato il salvataggio rimuovo l'attributo data-token da e.target
  if (!e.target.dataset.token) {
    appendFilter(token);
    input.value = '';
    input.focus();
  } else {
    // filtro modificato, aggiorno solo il nome eventualmente modificato
    // NOTE: il querySelector() non gestisce gli id che iniziano con un numero, per questo motivo utilizzo getElementById() in questo caso
    const li = document.querySelector(`li[data-id='${token}']`);
    const dragIcon = li.querySelector('i');
    const span = li.querySelector('span');
    li.dataset.label = name;
    dragIcon.dataset.label = name;
    span.textContent = name;
    dlgFilter.close();
  }
  // ripulisco la textarea eliminando solo il nodo #text, lascio il <br />
  if (textareaFilter.firstChild.nodeType === 3) textareaFilter.firstChild.remove();
  delete e.target.dataset.token;
  document.getElementById('filter-note').value = '';
}

/*
 * Creazione elenco filtri nella #ul-filters
 * Viene invocata quando si Salva un nuovo filtro e
 * quando si costruisce l'elenco #ul-filters
*/
function appendFilter(token) {
  const parent = document.getElementById('ul-filters');
  const tmpl = template_li.content.cloneNode(true);
  const li = tmpl.querySelector('li.drag-list.filters');
  const span = li.querySelector('span');
  const i = li.querySelector('i');
  const filter = WorkBook.filters.get(token);
  li.dataset.id = token;
  i.id = token;
  i.dataset.type = "filter";
  i.dataset.label = filter.name;
  li.classList.add("filters");
  li.dataset.elementSearch = "filters";
  li.dataset.label = filter.name;
  // definisco quale context-menu-template apre questo elemento
  li.dataset.contextmenu = 'ul-context-menu-filter';
  // TEST: 10.10.2024 Sembra non essere utilizzato, è presente nei filtri creati prima di questa data
  // li.dataset.field = filter.field;
  i.addEventListener('dragstart', elementDragStart);
  i.addEventListener('dragend', elementDragEnd);
  li.addEventListener('contextmenu', openContextMenu);
  span.innerHTML = filter.name;
  parent.appendChild(li);
}

// NOTE: funzioni Drag&Drop

function elementDragStart(e) {
  // console.log('column drag start');
  // console.log('e.target : ', e.target.id);
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.id);
  console.log(e.dataTransfer);
  e.dataTransfer.effectAllowed = "copy";
}

function elementDragEnd(e) {
  e.preventDefault();
  // if (e.dataTransfer.dropEffect === 'copy') {}
  e.currentTarget.classList.remove('dropping');
}

// NOTE: funzioni Drag&Drop

function openContextMenu(e) {
  e.preventDefault();
  // console.log(e.target.id);
  console.log(e.currentTarget.id);
  console.log(e.currentTarget.dataset.id);
  // reset #context-menu
  if (contextMenuRef.hasChildNodes()) contextMenuRef.querySelector('*').remove();
  const tmpl = tmplContextMenu.content.cloneNode(true);
  const content = tmpl.querySelector(`#${e.currentTarget.dataset.contextmenu}`);
  // aggiungo, a tutti gli elementi del context-menu, il token dell'elemento selezionato
  content.querySelectorAll('button').forEach(button => {
    // button.dataset.token = e.currentTarget.id;
    button.dataset.token = e.currentTarget.dataset.id;
    // if (button.dataset.button === 'delete' && Sheet.edit) button.disabled = 'true';
  });
  contextMenuRef.appendChild(content);

  const { clientX: mouseX, clientY: mouseY } = e;
  contextMenuRef.style.top = `${mouseY}px`;
  contextMenuRef.style.left = `${mouseX}px`;
  contextMenuRef.toggleAttribute('open');
}

function openDialogFilter() {
  createTableStruct();
  dlgFilter.showModal();
}

dlgFilter.addEventListener('close', () => {
  console.log('close');
  // reset della textarea, input, note
  if (textareaFilter.firstChild.nodeType === 3) textareaFilter.firstChild.remove();
});

function createTableStruct() {
  let parent = document.getElementById('wbFilters');
  // ripulisco la struttura se presente
  parent.querySelectorAll('dl').forEach(element => element.remove());
  for (const [alias, objects] of WorkBook.workbookMap) {
    const tmpl = tmplDetails.content.cloneNode(true);
    const details = tmpl.querySelector("details");
    const summary = details.querySelector('summary');
    WorkBook.activeTable = objects.props.key;
    // recupero le tabelle dal sessionStorage
    const columns = WorkBookStorage.getTable(objects.props.table);
    details.setAttribute("name", "wbFilters");
    details.dataset.schema = WorkBook.activeTable.dataset.schema;
    details.dataset.table = objects.props.name;
    details.dataset.label = objects.props.name;
    details.dataset.alias = alias;
    details.dataset.id = objects.props.key;
    details.dataset.searchId = 'column-search';
    summary.innerHTML = objects.props.name;
    summary.dataset.tableId = objects.props.key;
    parent.appendChild(details);
    columns.forEach(column => {
      const content = template_li.content.cloneNode(true);
      const li = content.querySelector('li.drag-list.default');
      const span = li.querySelector('span');
      const i = li.querySelector('i');
      i.dataset.tableId = objects.props.key;
      i.dataset.field = column.column_name;
      i.id = `${alias}_${column.column_name}`;
      // i.dataset.datatype = column.type_name.toLowerCase();
      i.ondragstart = elementDragStart;
      i.ondragend = elementDragEnd;

      li.dataset.label = column.column_name;
      li.dataset.fn = 'handlerSelectField';
      li.dataset.elementSearch = 'columns';
      li.dataset.tableId = objects.props.key;
      li.dataset.table = objects.props.name;
      li.dataset.alias = alias;
      li.dataset.datatype = column.type_name.toLowerCase();
      // li.dataset.type = objects.props.type;
      li.dataset.field = column.column_name;
      // li.dataset.key = column.CONSTRAINT_NAME;
      span.innerText = column.column_name;
      span.dataset.datatype = column.type_name.toLowerCase();
      // span.dataset.key = value.CONSTRAINT_NAME; // pk : chiave primaria
      // li.dataset.fn = 'addFieldToJoin';
      details.appendChild(li);
    });
  }
}

// salva metrica composta di base
btnCustomMetricSave.onclick = (e) => {
  // se presente il dataset.token sul btn-custom-metric-save sto modificando la metrica, altrimenti
  // è una nuova metrica
  const token = (e.target.dataset.token) ? e.target.dataset.token : rand().substring(0, 7);
  const alias = document.getElementById('input-base-custom-metric-name').value;
  const factId = WorkBook.activeTable.dataset.factId;
  const suggestionsTables = JSON.parse(window.sessionStorage.getItem(WorkBook.activeTable.dataset.table));
  let SQL = [];
  const formula = textareaCustomMetric.firstChild.textContent.split(/\b/);
  // ogni elemento inserito nella formula deve essere verificato, la verifica consiste nel trovare
  // quello che è stato inserito, se è presente (come colonna) nella tabella
  formula.forEach(el => {
    const match = [...suggestionsTables].find(value => el === value.column_name);
    (match) ? SQL.push(`${WorkBook.activeTable.dataset.alias}.${el}`) : SQL.push(el);
  });
  // console.log(sql);
  WorkBook.metrics = {
    token, alias, factId, formula,
    aggregateFn: 'SUM', // default
    SQL,
    distinct: false, // default
    type: 'metric',
    metric_type: 'basic'
  }
  App.showConsole(`Metrica ${alias} aggiunta al WorkBook`, 'done', 2000);
  WorkBook.checkChanges(token);
  dlgCustomMetric.close();
}

// INFO: replace current word (questo script era stato usato per sostituire la parola che si sta digitando con il suggerimento della popup)
// Replace current word with selected suggestion
/* const replaceCurrentWord = (newWord) => {
    const currentValue = textarea.value;
    const cursorPos = textarea.selectionStart;
    const startIndex = findIndexOfCurrentWord();

    const newValue = currentValue.substring(0, startIndex + 1) +
                    newWord +
                    currentValue.substring(cursorPos);
    textarea.value = newValue;
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startIndex + 1 + newWord.length;
}; */
