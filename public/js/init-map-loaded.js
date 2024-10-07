var textareaFilter = document.getElementById('textarea-filter');
var popupSuggestions = document.getElementById('popup');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  // TODO: 04.10.2024 qui potrei nascondere il loader della pagina
  // const containerEle = document.getElementById('textarea-container');
  /* const textarea = document.getElementById('textarea-filter');

  const mirroredEle = document.querySelector('#textarea-container .container__mirror');

  const textareaStyles = window.getComputedStyle(textarea);
  [
    'border',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'padding',
    'textDecoration',
    'textIndent',
    'textTransform',
    'whiteSpace',
    'wordSpacing',
    'wordWrap',
  ].forEach((property) => {
    mirroredEle.style[property] = textareaStyles[property];
  });
  mirroredEle.style.borderColor = 'transparent';

  const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;
  const borderWidth = parseValue(textareaStyles.borderWidth);

  const ro = new ResizeObserver(() => {
    mirroredEle.style.width = `${textarea.clientWidth + 2 * borderWidth}px`;
    mirroredEle.style.height = `${textarea.clientHeight + 2 * borderWidth}px`;
  });
  ro.observe(textarea);

  textarea.addEventListener('scroll', () => mirroredEle.scrollTop = textarea.scrollTop); */

});


const findIndexOfCurrentWord = (textarea) => {
  // ottengo il valore corrente e la posizione del cursore
  const currentValue = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Cerco l'indice di partenza della parola corrente...
  let startIndex = cursorPos - 1;
  // ... il ciclo cerca all'indietro dalla posizione corrente-1 (startIndex) fino a quando trova uno spazio
  // oppure il carattere di "a capo"
  while (startIndex >= 0 && !/\s/.test(currentValue[startIndex])) {
    startIndex--;
  }
  // lo startIndex corrisponde all'indice di inizio della parolal corrente
  return startIndex;
};

const replaceCurrentWord = (textarea, newWord) => {
  const currentValue = textarea.value;
  const cursorPos = textarea.selectionStart;
  const startIndex = findIndexOfCurrentWord(textarea);

  const newValue = currentValue.substring(0, startIndex + 1) +
    newWord +
    currentValue.substring(cursorPos);
  textarea.value = newValue;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = startIndex + 1 + newWord.length;
};

// function utile a verificare i limiti degli indici nella popupSuggestions
const clamp = (min, value, max) => Math.min(Math.max(min, value), max);

textareaFilter.addEventListener('input', (e) => {
  const currentValue = e.target.value;
  const cursorPos = e.target.selectionStart;
  const startIndex = findIndexOfCurrentWord(e.target);
  // console.log(`startIndex : ${startIndex}`);

  // Estraggo solo la parola corrente
  const currentWord = currentValue.substring(startIndex + 1, cursorPos);
  // console.log(`currentWord : ${currentWord}`);
  if (currentWord === '') {
    popupSuggestions.classList.remove('open');
    return;
  }

  const textBeforeCursor = currentValue.substring(0, cursorPos);
  const textAfterCursor = currentValue.substring(cursorPos);
  const mirroredEle = document.querySelector('#textarea-container .container__mirror');

  const pre = document.createTextNode(textBeforeCursor);
  const post = document.createTextNode(textAfterCursor);
  const caretEle = document.createElement('span');
  caretEle.innerHTML = '&nbsp;';

  mirroredEle.innerHTML = '';
  mirroredEle.append(pre, caretEle, post);

  /* INFO: otteno la posizione rispetto al viewport
  * const rect = caretEle.getBoundingClientRect();
  * console.log(rect);
  * popup.style.left = `${rect.left}px`;
  * popup.style.top = `${rect.top}px`;
  * otteno la posizione rispetto al viewport
  */
  if (currentWord.length >= 3) {
    popupSuggestions.querySelectorAll('ul>li').forEach(el => el.remove());;
    // cerco tra le tabelle/colonne della nav#wbFilters
    // console.log(e.target.value);
    const matches = [...document.querySelectorAll('#wbFilters>details>li')].filter(el => (el.dataset.label.toLowerCase().indexOf(currentWord.toLowerCase()) !== -1) ? true : false);
    if (matches.length !== 0) {
      matches.forEach((el, index) => {
        // visualizzo solo i primi 6 elementi
        // TODO: utilizzare l'overflow al posto di index < 6 altrimenti non riesco a visualizzare tutti gli elementi trovati
        if (index < 6) {
          const li = document.createElement('li');
          const column = document.createElement('span');
          const table = document.createElement('small');
          li.classList.add('container__suggestion');
          // li.innerText = `(${el.dataset.table}) .${el.dataset.label}`;
          // li.innerText = el.dataset.label;
          column.innerText = el.dataset.label;
          table.innerText = el.dataset.table;
          li.addEventListener('click', function() {
            replaceCurrentWord(e.target, this.innerText);
            popupSuggestions.classList.remove('open');
          });
          li.append(column, table);
          popupSuggestions.querySelector('ul').appendChild(li);
        }
      })
      popupSuggestions.classList.add('open');
    } else {
      popupSuggestions.classList.remove('open');
    }
  } else {
    popupSuggestions.classList.remove('open');
  }
  // (e.target.value.length === 0) ? popupSuggestions.classList.remove('open') : popupSuggestions.classList.add('open');
  popupSuggestions.style.left = `${caretEle.offsetLeft}px`;
  popupSuggestions.style.top = `${caretEle.offsetTop + caretEle.offsetHeight + 12}px`;
});

let currentSuggestionIndex = -1;
textareaFilter.addEventListener('keydown', (e) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;
  const suggestions = popupSuggestions.querySelectorAll('.container__suggestion');
  const numSuggestions = suggestions.length;
  if (numSuggestions === 0) {
    return;
  }
  e.preventDefault();
  switch (e.key) {
    case 'ArrowDown':
      // console.log('down');
      suggestions[
        clamp(0, currentSuggestionIndex, numSuggestions - 1)
      ].classList.remove('focused');
      currentSuggestionIndex = clamp(0, currentSuggestionIndex + 1, numSuggestions - 1);
      suggestions[currentSuggestionIndex].classList.add('focused');
      break;
    case 'ArrowUp':
      // console.log('up');
      suggestions[
        clamp(0, currentSuggestionIndex, numSuggestions - 1)
      ].classList.remove('focused');
      currentSuggestionIndex = clamp(0, currentSuggestionIndex - 1, numSuggestions - 1);
      suggestions[currentSuggestionIndex].classList.add('focused');
      break;
    case 'Enter':
      // console.log('Enter');
      replaceCurrentWord(e.target, suggestions[currentSuggestionIndex].innerText);
      popupSuggestions.classList.remove('open');
      break;
    case 'Escape':
      // console.log('esc')
      popupSuggestions.classList.remove('open');
      break;
    default:
      break;
  }
});
