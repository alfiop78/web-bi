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

textareaFilter.addEventListener('input', (e) => {
  console.log(e);
  const cursorPos = textareaFilter.selectionStart;
  const textBeforeCursor = textareaFilter.value.substring(0, cursorPos);
  const textAfterCursor = textareaFilter.value.substring(cursorPos);
  const mirroredEle = document.querySelector('#textarea-container .container__mirror');

  const pre = document.createTextNode(textBeforeCursor);
  const post = document.createTextNode(textAfterCursor);
  const caretEle = document.createElement('span');
  caretEle.innerHTML = '&nbsp;';

  mirroredEle.innerHTML = '';
  mirroredEle.append(pre, caretEle, post);

  // console.log(caretEle);
  // const rect = caretEle.getBoundingClientRect();
  // console.log(rect);
  // popup.style.left = `${rect.left}px`;
  // popup.style.top = `${rect.top}px`;
  if (e.target.value.length >= 3) {
    popupSuggestions.querySelectorAll('ul>li').forEach(el => el.remove());;
    // cerco tra le tabelle/colonne della nav#wbFilters
    console.log(e.target.value);
    const founded = [...document.querySelectorAll('#wbFilters>details>li')].filter(el => (el.dataset.label.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1) ? true : false);
    console.log(founded);
    console.log(founded.length);
    if (founded.length !== 0) {
      founded.forEach((el, index) => {
        // visualizzo solo i primi 6 elementi
        if (index < 6) {
          const li = document.createElement('li');
          const column = document.createElement('span');
          const table = document.createElement('small');
          // li.innerText = `(${el.dataset.table}) .${el.dataset.label}`;
          // li.innerText = el.dataset.label;
          column.innerText = el.dataset.label;
          table.innerText = el.dataset.table;
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
