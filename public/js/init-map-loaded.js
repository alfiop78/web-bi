// var textareaFilter = document.getElementById('textarea-filter');
var popupSuggestions = document.getElementById('popup');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  // TODO: 04.10.2024 qui potrei nascondere il loader della pagina

  /* const mirroredEle = document.querySelector('#textarea-container .container__mirror');

  const textareaStyles = window.getComputedStyle(textareaFilter);
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
    mirroredEle.style.width = `${textareaFilter.clientWidth + 2 * borderWidth}px`;
    mirroredEle.style.height = `${textareaFilter.clientHeight + 2 * borderWidth}px`;
  });
  ro.observe(textareaFilter);

  textareaFilter.addEventListener('scroll', () => mirroredEle.scrollTop = textareaFilter.scrollTop); */
});


const findIndexOfCurrentWord = (textarea) => {
  // ottengo il valore corrente e la posizione del cursore
  const currentValue = textarea.value;
  const cursorPos = textarea.selectionStart;

  // Cerco l'indice di partenza della parola corrente...
  let startIndex = cursorPos - 1;
  // ... il ciclo cerca all'indietro dalla posizione corrente-1 (startIndex) fino a quando trova uno spazio
  // oppure il carattere di "a capo"
  // while (startIndex >= 0 && !/\s/.test(currentValue[startIndex])) {
  while (startIndex >= 0 && !/\W/.test(currentValue[startIndex])) {
    startIndex--;
  }
  // lo startIndex corrisponde all'indice di inizio della parola corrente
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
  // debugger;
  textarea.selectionStart = textarea.selectionEnd = startIndex + 1 + newWord.length;
};

// function utile a verificare i limiti degli indici nella popupSuggestions
const clamp = (min, value, max) => Math.min(Math.max(min, value), max);

// textareaFilter.addEventListener('input', (e) => {
//   // const formula = document.getElementById('filter-formula');
//   // let sql = [];
//   const currentValue = e.target.value;
//   const cursorPos = e.target.selectionStart;
//   const startIndex = findIndexOfCurrentWord(e.target);
//   // console.log(`startIndex : ${startIndex}`);

//   // Estraggo solo la parola corrente
//   const currentWord = currentValue.substring(startIndex + 1, cursorPos);
//   // console.log(`currentWord : ${currentWord}`);
//   if (currentWord === '') {
//     popupSuggestions.classList.remove('open');
//     return;
//   }

//   const textBeforeCursor = currentValue.substring(0, cursorPos);
//   const textAfterCursor = currentValue.substring(cursorPos);
//   const mirroredEle = document.querySelector('#textarea-container .container__mirror');

//   const pre = document.createTextNode(textBeforeCursor);
//   const post = document.createTextNode(textAfterCursor);
//   const caretEle = document.createElement('span');
//   // caretEle.innerHTML = '&nbsp;';

//   mirroredEle.innerHTML = '';
//   mirroredEle.append(pre, caretEle, post);
//   // formula.innerText = e.target.value;

//   /* INFO: otteno la posizione rispetto al viewport
//   * const rect = caretEle.getBoundingClientRect();
//   * console.log(rect);
//   * popup.style.left = `${rect.left}px`;
//   * popup.style.top = `${rect.top}px`;
//   * otteno la posizione rispetto al viewport
//   */
//   if (currentWord.length >= 3) {
//     popupSuggestions.querySelectorAll('ul>li').forEach(el => el.remove());;
//     // cerco tra le tabelle/colonne della nav#wbFilters
//     // console.log(e.target.value);
//     // TODO: implementare anche la ricerca con Regex, potrei ottimizzare questa ricerca
//     const matches = [...document.querySelectorAll('#wbFilters>details>li')]
//       .filter(el => (el.dataset.label.toLowerCase().indexOf(currentWord.toLowerCase()) !== -1) ? true : false);
//     if (matches.length !== 0) {
//       matches.forEach((el, index) => {
//         // visualizzo solo i primi 6 elementi
//         // TODO: utilizzare l'overflow al posto di index < 6 altrimenti non riesco a visualizzare tutti gli elementi trovati
//         if (index < 6) {
//           const li = document.createElement('li');
//           const small = document.createElement('small');
//           li.classList.add('container__suggestion');
//           small.innerText = el.dataset.table;
//           li.dataset.tableAlias = el.dataset.alias;
//           li.innerText = el.dataset.label;
//           li.dataset.table = el.dataset.table;
//           li.addEventListener('click', function() {
//             // replaceCurrentWord(e.target, this.innerText);
//             replaceCurrentWord(e.target, this.firstChild.textContent);
//             // sql.push(`${this.dataset.alias}.${this.firstChild.textContent}`);
//             // replaceCurrentWord(e.target, `${this.dataset.table}.${this.firstChild.textContent}`);
//             popupSuggestions.classList.remove('open');
//           });
//           // li.append(column, table);
//           li.append(small);
//           popupSuggestions.querySelector('ul').appendChild(li);
//         }
//       })
//       popupSuggestions.classList.add('open');
//     } else {
//       popupSuggestions.classList.remove('open');
//     }
//   } else {
//     popupSuggestions.classList.remove('open');
//   }
//   // (e.target.value.length === 0) ? popupSuggestions.classList.remove('open') : popupSuggestions.classList.add('open');
//   popupSuggestions.style.left = `${caretEle.offsetLeft}px`;
//   popupSuggestions.style.top = `${caretEle.offsetTop + caretEle.offsetHeight + 12}px`;
//
// });

let currentSuggestionIndex = -1;
/* textareaFilter.addEventListener('keydown', (e) => {
  if (!['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) return;
  const suggestions = popupSuggestions.querySelectorAll('.container__suggestion');
  const numSuggestions = suggestions.length;
  if (numSuggestions === 0) return;
  e.preventDefault();
  switch (e.key) {
    case 'Tab':
      suggestions[
        clamp(0, currentSuggestionIndex, numSuggestions - 1)
      ].classList.remove('focused');
      currentSuggestionIndex = (e.shiftKey) ? clamp(0, currentSuggestionIndex - 1, numSuggestions - 1) : clamp(0, currentSuggestionIndex + 1, numSuggestions - 1);
      suggestions[currentSuggestionIndex].classList.add('focused');
      break;
    case 'ArrowDown':
      suggestions[
        clamp(0, currentSuggestionIndex, numSuggestions - 1)
      ].classList.remove('focused');
      currentSuggestionIndex = clamp(0, currentSuggestionIndex + 1, numSuggestions - 1);
      suggestions[currentSuggestionIndex].classList.add('focused');
      break;
    case 'ArrowUp':
      suggestions[
        clamp(0, currentSuggestionIndex, numSuggestions - 1)
      ].classList.remove('focused');
      currentSuggestionIndex = clamp(0, currentSuggestionIndex - 1, numSuggestions - 1);
      suggestions[currentSuggestionIndex].classList.add('focused');
      break;
    case 'Enter':
      console.log(suggestions[currentSuggestionIndex]);
      // if (currentSuggestionIndex !== -1) replaceCurrentWord(e.target, suggestions[currentSuggestionIndex].innerText);
      if (currentSuggestionIndex !== -1) replaceCurrentWord(e.target, suggestions[currentSuggestionIndex].firstChild.textContent);
      // if (currentSuggestionIndex !== -1) replaceCurrentWord(e.target, `${suggestions[currentSuggestionIndex].dataset.table}.${suggestions[currentSuggestionIndex].firstChild.textContent}`);
      popupSuggestions.classList.remove('open');
      break;
    case 'Escape':
      popupSuggestions.classList.remove('open');
      break;
    default:
      break;
  }
}); */

/* esempio autocomplete su input text */
/* let words = ['hello', 'baby', 'abracadabra', 'accoutrements']
let autocomplete = document.getElementById('autocomplete');
let search = document.getElementById('search_');
search.addEventListener('keyup', () => {
  if (search.value.length > 0) {
    let input = search.value;
    autocomplete.innerHTML = input;

    let regex = new RegExp('^' + input + '.*', 'i');

    for (let i = 0; i < words.length; i++) {
      if (words[i].match(regex)) {
        autocomplete.innerHTML += words[i].slice(input.length, words[i].length);
        break;
      }
    }
  }
})
search.addEventListener('keydown', (e) => {
  if (search.value.length <= 1 && e.keyCode == 8) {
    autocomplete.innerHTML = '';
  }
}) */

document.getElementById('txt-test').addEventListener('input', function(e) {
  console.log(e);
  let words = ['CodArticoloVarie', 'CodAziendaSId', 'id_Azienda', 'CodMarcaRicambi']
  // let regex = new RegExp('^' + input + '.*', 'i');
  // console.log(e.target);
  // console.log(e.target.textContent);
  console.log(e.target.firstChild.textContent);
  // currentWord += e.data;
  const startIndex = getIndexOfCWord(e.target);
  // console.log(`startIndex : ${startIndex}`);
  const currentWord = e.target.firstChild.textContent.substring(startIndex + 1);
  console.log(currentWord);
  if (currentWord.length > 0) {
    // console.info(`currentWord : ${e.target.firstChild.textContent.substring(startIndex + 1)}`);
    // console.info(`currentWord : ${e.target.firstChild.textContent.substring(0, startIndex + 1)}`);
    // let regex = new RegExp('^' + e.target.firstChild.textContent + '.*', 'i');
    // let regex = new RegExp(`^${e.target.firstChild.textContent}`, 'i');
    let regex = new RegExp(`^${currentWord}`, 'i');
    // console.log('regex : ', regex);
    const span = document.createElement('span');
    for (let i = 0; i < words.length; i++) {
      if (words[i].match(regex)) {
        // span.innerHTML = words[i].slice(e.target.firstChild.textContent.length, words[i].length);
        span.innerHTML = words[i].slice(currentWord.length, words[i].length);
        // sostituisco lo span del suggerimento se è già presente, altrimenti lo creo
        (e.target.querySelector('span')) ? e.target.replaceChild(span, e.target.querySelector('span')) : e.target.appendChild(span);
        break;
      } else {
        if (e.target.querySelector('span')) e.target.querySelector('span').remove();
      }
    }
  }
});

/* document.getElementById('txt-test').addEventListener('keydown', function(e) {
  if (['Shift'].includes(e.key)) return;
  currentWord += e.key;
  if (e.code === 'Space') currentWord = '';
}); */

function getCaret(target) {
  let caretPosition = null;
  const selection = document.getSelection();
  const range = document.createRange();

  if (range.collapsed) {
    const temp = document.createTextNode("\0");
    selection.getRangeAt(0).insertNode(temp);
    caretPosition = target.innerText.indexOf("\0");
    temp.parentNode.removeChild(temp);

    range.setStart(selection.focusNode, selection.focusOffset);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
  }
  // console.log(JSON.stringify({ caretPosition }));
  // console.log(caretPosition);
  return caretPosition;
}

function getIndexOfCWord(target) {
  // Cerco l'indice di partenza della parola corrente...
  let currentValue = target.firstChild.textContent;
  let startIndex = getCaret(target) - 1;
  // ... il ciclo cerca all'indietro dalla posizione corrente-1 (startIndex) fino a quando trova uno spazio
  // oppure il carattere di "a capo"
  // while (startIndex >= 0 && !/\s/.test(currentValue[startIndex])) {
  while (startIndex >= 0 && !/\W/.test(currentValue[startIndex])) {
    startIndex--;
  }
  // lo startIndex corrisponde all'indice di inizio della parola corrente
  return +startIndex;
}

document.getElementById('txt-test').addEventListener('keyup', function(e) {
  if (e.code === 'Space') {
    if (e.target.querySelector('span')) e.target.querySelector('span').innerText = '';
  }
  // getCaret(e.target);
});

document.getElementById('txt-test').addEventListener('keydown', function(e) {
  if (!['Tab', 'ArrowRight'].includes(e.key)) return;
  e.preventDefault();
  switch (e.key) {
    case 'Tab':
    case 'ArrowRight':
      e.target.firstChild.textContent += e.target.querySelector('span').textContent;
      e.target.querySelector('span').innerText = '';
      break;
    default:
      break;
  }


});
