var textareaFilter = document.getElementById('textarea-filter');
var popupSuggestions = document.getElementById('popup');
const sel = document.getSelection();
// var suggestionsTables = ['Azienda', 'DocVenditaDettaglio', 'CodMarcaVeicolo', 'CodMarcaRicambi', 'TipoMovimento'];
// var suggestionsColumns = ['id', 'codice', 'Descrizione', 'id_casaMadre', 'zonaVenditaCM'];

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
  textareaFilter.addEventListener('keyup', (e) => {
    // const sel = document.getSelection();
    // console.log(sel);
    // const caretPosition = sel.anchorOffset;
    // console.log(`caretPosition : ${caretPosition}`);
    // console.log(e.code, e.key);
    // e.preventDefault();
    switch (e.code) {
      case 'Space':
        if (e.target.querySelector('span')) {
          // e.target.querySelector('span').textContent = '';
          // popup.classList.remove('open');
          // delete e.target.querySelector('span').dataset.text;
          e.target.querySelector('span').remove();
        }
        break;
      case 'Backspace':
      case 'Delete':
        // elimino il primo elemento se questo corrisponde a un nodo type = 3 (es. lo <span>)
        if (e.target.firstChild.nodeType === 1) e.target.firstChild.remove();
        break;
      default:
        break;
    }
  });

  textareaFilter.addEventListener('click', (e) => {
    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
    console.log(caretPosition.offset);
  });

  textareaFilter.addEventListener('keydown', function(e) {
    // const sel = document.getSelection();
    // console.log(sel);
    // const caretPosition = sel.anchorOffset;
    if (!['Tab', 'Enter'].includes(e.key)) return;
    e.preventDefault();
    switch (e.key) {
      case 'Tab':
        e.target.firstChild.textContent += e.target.querySelector('span').textContent;
        // e.target.querySelector('span').textContent = '';
        // popup.classList.remove('open');
        // delete e.target.querySelector('span').dataset.text;
        e.target.querySelector('span').remove();
        // posiziono il cursore alla fine della stringa
        sel.setPosition(e.target.firstChild, e.target.firstChild.length);
        break;
      default:
        break;
    }
  });

  textareaFilter.addEventListener('input', (e) => {
    // console.log(sel);
    // console.log(sel.baseNode.textContent);
    // if (!e.target.firstChild || e.target.firstChild.nodeType !== 3) return;
    if (!e.target.firstChild) return;
    // return;
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
        console.log(sel);
        const span = document.createElement('span');
        span.textContent = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
        span.dataset.text = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
        const node = sel.anchorNode;
        console.log(node.parentNode.querySelector('span'));
        // se è presente già un "suggerimento" (span) lo elimino
        if (node.parentNode.querySelector('span')) node.parentNode.querySelector('span').remove();
        // offset indica la posizione del cursore
        const offset = sel.anchorOffset;
        // splitText separa il nodo in due dove, 'node' è la parte prima del cursore e replacement e la parte successiva al cursore
        let replacement = node.splitText(offset);
        // creo un elemento p per poter effettuare il insertBefore dello span contenente il "suggestion"
        let p = document.createElement('p');
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

  // SQL : viene passato alla procedura .php che elabora il report
  // sqlFormula : è la formula scritta nella textarea, verrà utilizzata per ripristinarla nella textarea in case di edit
  // di un filtro
  // TEST: questo codice può validare la formula, cercando le tabelle presenti in #wbFilters ma
  // questo codice andrà spostato nel tasto "Salva" del filtro
  textareaFilter.addEventListener('blur', (e) => {
    if (!e.target.firstChild) return;
    // split in un array (separato da spazi) l'sql
    const sqlFormula = e.target.firstChild.textContent.split(' ');
    let tables = new Set();
    // replico i nomi delle tabelle con i suoi alias di tabella, recuperandoli dalla ul#wbFilters
    const SQL = sqlFormula.map(value => {
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
    // console.log(SQL);
    // console.log(tables);
    // console.log(sqlFormula);
    for (const factId of WorkBook.dataModel.keys()) {
      // WARN: 2024.02.08 questa logica è utilizzata anche in setSheet(). Creare un metodo riutilizzabile.
      let from = {}, joins = {};
      // object.tables : l'alias della tabella
      tables.forEach(alias => {
        const tablesOfModel = WorkBook.dataModel.get(factId);
        // se si tratta di una tabella 'time' la converto in WB_YEARS, questa sarà sempre presente
        // nella relazione con la tabella time
        // WARN: da testare prima di spostare questa funzione nel tasto "Salva"
        // if (alias === 'time') alias = 'WB_YEARS';
        if (tablesOfModel.hasOwnProperty(alias)) {
          tablesOfModel[alias].forEach(table => {
            const data = Draw.tables.get(table.id);
            // 'from' del filtro, questo indica quali tabelle includere quando si utilizza
            // questo filtro nel report
            from[data.alias] = { schema: data.schema, table: data.table };
            // 'join', indica quali join utilizzare quando si utilizza questo filtro in un report
            if (WorkBook.joins.has(data.alias)) {
              // esiste una join per questa tabella
              for (const [token, join] of Object.entries(WorkBook.joins.get(data.alias))) {
                if (join.factId === factId) joins[token] = join;
              }
            }
          });
        }
      });
      // console.log(from);
      // console.log(joins);
      // object.from[factId] = from;
      // object.joins[factId] = joins;
    }
  });

  textareaFilter.addEventListener('drop', (e) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
    const textNode = caretPosition.offsetNode;
    const offset = caretPosition.offset;
    // elementRef : è l'elemento draggato
    WorkBook.activeTable = elementRef.dataset.tableId;
    /* if (e.target.firstChild) {
      e.target.firstChild.textContent += `${WorkBook.activeTable.dataset.table}.${elementRef.dataset.field}`;
    } else {
      e.target.textContent += `${WorkBook.activeTable.dataset.table}.${elementRef.dataset.field}`;
    } */
    console.log(offset);
    const text = document.createTextNode(`${WorkBook.activeTable.dataset.table}.${elementRef.dataset.field}`);
    if (offset !== 0) {
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
  });
});
