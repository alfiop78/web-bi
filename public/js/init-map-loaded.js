var textareaFilter = document.getElementById('textarea-filter');
var popupSuggestions = document.getElementById('popup');
const sel = document.getSelection();
// var suggestionsTables = ['Azienda', 'DocVenditaDettaglio', 'CodMarcaVeicolo', 'CodMarcaRicambi', 'TipoMovimento'];
// var suggestionsColumns = ['id', 'codice', 'Descrizione', 'id_casaMadre', 'zonaVenditaCM'];

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  // TODO: 04.10.2024 qui potrei nascondere il loader della pagina


});

textareaFilter.addEventListener('keyup', (e) => {
  // const sel = document.getSelection();
  // console.log(sel);
  const caretPosition = sel.anchorOffset;
  // console.log(`caretPosition : ${caretPosition}`);
  if (e.code === 'Space') {
    if (e.target.querySelector('span')) {
      e.target.querySelector('span').textContent = '';
      popup.classList.remove('open');
      delete e.target.querySelector('span').dataset.text;
    }
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
  if (!['Tab'].includes(e.key)) return;
  e.preventDefault();
  switch (e.key) {
    case 'Tab':
      e.target.firstChild.textContent += e.target.querySelector('span').textContent;
      e.target.querySelector('span').textContent = '';
      popup.classList.remove('open');
      delete e.target.querySelector('span').dataset.text;
      // posiziono il cursore alla fine della stringa
      sel.setPosition(e.target.firstChild, e.target.firstChild.length);
      break;
    default:
      break;
  }
});

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

textareaFilter.addEventListener('input', (e) => {
  // console.log(sel);
  // console.log(sel.baseNode.textContent);
  if (!e.target.firstChild) return;
  const suggestionsTables = [...document.querySelectorAll('#wbFilters>details')];
  const suggestionsColumns = [...document.querySelectorAll('#wbFilters>details>li')];
  const caretPosition = sel.anchorOffset;
  const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
  let currentWord = e.target.firstChild.textContent.substring(startIndex + 1);
  console.info(`current word : ${currentWord}`);
  if (currentWord.length > 0) {
    // se il carattere che interrompe la parola (trovato dal egex) è un punto allora devo cercare nell'array delle Colonne, altrimenti in quello delle Tabelle
    const chartAt = e.target.firstChild.textContent.at(startIndex);
    console.log(`chartAt : ${chartAt}`);
    // console.info(`current word : ${currentWord}`);
    let regex = new RegExp(`^${currentWord}.*`, 'i');
    // TODO: recupero la tabella (prima del punto) in modo da cercare le colonne SOLO di quella tabella
    // console.log()
    const match = (chartAt === '.') ? suggestionsColumns.find(value => value.dataset.label.match(regex)) : suggestionsTables.find(value => value.dataset.table.match(regex));
    // console.log(`match ${match}`);
    if (match) {
      const span = document.createElement('span');
      span.textContent = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
      span.dataset.text = match.dataset.label.slice(currentWord.length, match.dataset.label.length);
      (e.target.querySelector('span')) ? e.target.replaceChild(span, e.target.querySelector('span')) : e.target.appendChild(span);
      // console.log(e.target.querySelector('span'));
      popup.classList.add('open');
      popup.style.left = `${e.target.querySelector('span').offsetLeft}px`;
      popup.style.top = `${e.target.querySelector('span').offsetTop + 30}px`;
    } else {
      if (e.target.querySelector('span')) {
        e.target.querySelector('span').textContent = '';
        popup.classList.remove('open');
        delete e.target.querySelector('span').dataset.text;
      }
    }
  }
});
