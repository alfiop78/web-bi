console.info('workspace_event');
let currentSuggestionIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded');
  btnFilterSave.addEventListener('click', filterSave);
  // metrica custom di base
  btnCustomMetricSave.addEventListener('click', customBaseMetricSave);
  // metriche avanzate
  btnAdvancedMetricSave.addEventListener('click', advancedMetricSave);
  // metriche composite
  btnCompositeMetricSave.addEventListener('click', compositeMetricSave);
  btnOpenDialogFilter.addEventListener('click', openDialogFilter);
  // TODO: 04.10.2024 qui potrei nascondere il loader della pagina
  // NOTE: textarea-filter
  document.querySelectorAll(".textarea[contenteditable='true']").forEach(textarea => {
    textarea.addEventListener('keyup', (e) => {
      popupSuggestions = e.target.parentElement.querySelector('.popup__suggestions');
      // const sel = document.getSelection();
      // console.log(sel);
      // const caretPosition = sel.anchorOffset;
      // console.log(`caretPosition : ${caretPosition}`);
      // console.log(e.code, e.key);
      // e.preventDefault();
      switch (e.code) {
        case 'Space':
          e.target.querySelector('span')?.remove();
          popupSuggestions.classList.remove('open');
          currentSuggestionIndex = -1;
          break;
        case 'Backspace':
        case 'Delete':
          // elimino il primo elemento se questo corrisponde a un nodo type = 1 (il TextNode è un nodeType 3)
          // (es. lo <span> o <br> che non elimino)
          if (e.target.firstChild.nodeType === 1 && e.target.firstChild.nodeName !== 'BR') {
            e.target.firstChild.remove();
            popupSuggestions.classList.remove('open');
            currentSuggestionIndex = -1;
          }
          break;
        default:
          break;
      }
    });

    textarea.addEventListener('click', (e) => {
      const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
      // console.log(caretPosition.offset);
    });

    // Fn che garantisce che l'indice della popup sia sempre valido.
    // Accetta un valore minimo, il valore che si vuole bloccare e
    // il valore massimo.
    // Quindi, ci restituisce il valore bloccato, che è garantito non essere inferiore al minimo e non maggiore del massimo
    const clamp = (min, value, max) => Math.min(Math.max(min, value), max);

    textarea.addEventListener('keydown', function(e) {
      // se il tasto premuto NON è incluso nell'array return
      if (!['Tab', 'Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      popupSuggestions = e.target.parentElement.querySelector('.popup__suggestions');
      const suggestions = popupSuggestions.querySelectorAll('.container__suggestion');
      const numSuggestions = suggestions.length;
      const caretPosition = sel.anchorOffset;
      const startIndex = findIndexOfCurrentWord(e.target, caretPosition);
      const currentWord = e.target.firstChild.textContent.substring(startIndex + 1, caretPosition);
      const regex = new RegExp(`^${currentWord}.*`);
      let indexMatch, autocomplete;
      e.preventDefault();
      switch (e.key) {
        case 'ArrowDown':
          // se la popup seuggestion non è aperta : return
          if (!popupSuggestions.classList.contains('open')) return;
          suggestions[
            clamp(0, currentSuggestionIndex, numSuggestions - 1)
          ].classList.remove('focused');
          currentSuggestionIndex = clamp(0, currentSuggestionIndex + 1, numSuggestions - 1);
          suggestions[currentSuggestionIndex].classList.add('focused');
          // cerco l'indice dell'occorrenza della parola corrente
          indexMatch = suggestions[currentSuggestionIndex].textContent.search(regex);
          // recupero un pezzo della stringa del suggestions partendo da quello già scritto (currentWord)
          // es.: ric(currentWord) avo_ve_cb(suggerimento da inserire nello span di autocomplete)
          autocomplete = suggestions[currentSuggestionIndex].textContent.substring(indexMatch + currentWord.length);
          if (e.target.querySelector('span')) e.target.querySelector('span').textContent = autocomplete;
          break;
        case 'ArrowUp':
          if (!popupSuggestions.classList.contains('open')) return;
          suggestions[
            clamp(0, currentSuggestionIndex, numSuggestions - 1)
          ].classList.remove('focused');
          currentSuggestionIndex = clamp(0, currentSuggestionIndex - 1, numSuggestions - 1);
          suggestions[currentSuggestionIndex].classList.add('focused');
          indexMatch = suggestions[currentSuggestionIndex].textContent.search(regex);
          autocomplete = suggestions[currentSuggestionIndex].textContent.substring(indexMatch + currentWord.length);
          if (e.target.querySelector('span')) e.target.querySelector('span').textContent = autocomplete;
          break;
        case 'Tab':
          if (e.target.querySelector('span')) {
            e.preventDefault();
            // e.target.firstChild.textContent += e.target.querySelector('span').textContent + ' ';
            // NOTE: per la textarea filter non può essere utilizzato lo spazio dopo il aver premuto Tab perchè il nome tabella va seguito dal punto per
            // poter inserire il nome colonna "Azienda.id"
            e.target.firstChild.textContent += e.target.querySelector('span').textContent;
            popupSuggestions.classList.remove('open');
            // delete e.target.querySelector('span').dataset.text;
            e.target.querySelector('span').remove();
            // posiziono il cursore alla fine della stringa
            sel.setPosition(e.target.firstChild, e.target.firstChild.length);
            currentSuggestionIndex = -1;
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
      // WARN: chiudendo la popup qui non viene più attivato l'evento click sugli elementi della popup
      // popupSuggestions.classList?.remove('open');
    });

    textarea.addEventListener('dragenter', (e) => {
      e.preventDefault();
      console.log('dragEnter');
      // elimino l'elemento <br> altrimenti, nell'evento drop viene preso in considerazione la textarea e non il textnode
      e.target.querySelector('br')?.remove();
    });

    textarea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      console.log('dragLeave');
      e.target.appendChild(document.createElement('br'));
    });
  });
  // NOTE: end DOMContentLoaded

  // NOTE: drag&drop
  textareaFilter.addEventListener('drop', (e) => {
    // impedisco che venga droppato l'id dell'elemento
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/plain');
    const elementRef = document.getElementById(elementId);
    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
    // elementRef : è l'elemento draggato
    WorkBook.activeTable = elementRef.dataset.tableId;
    const text = document.createTextNode(`${WorkBook.activeTable.dataset.table}.${elementRef.dataset.field}`);
    appendDropped(caretPosition, text);
    // INFO: normalize consente di riunificare tutti i nodeText e li mette tutti in un unico nodeText
    e.target.normalize();
    // posiziono il cursore alla fine della stringa
    sel.setPosition(e.target.firstChild, caretPosition.offset + text.textContent.length);
    e.target.appendChild(document.createElement('br'));
  });

  textareaCompositeMetric.addEventListener('drop', (e) => {
    // impedisco che venga droppato l'id dell'elemento
    e.preventDefault();
    const elementId = e.dataTransfer.getData('text/plain');
    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
    const text = document.createTextNode(WorkBook.metrics.get(elementId).alias);
    appendDropped(caretPosition, text)
    e.target.normalize();
    // posiziono il cursore alla fine della stringa
    sel.setPosition(e.target.firstChild, caretPosition.offset + text.textContent.length);
    e.target.appendChild(document.createElement('br'));
  });

  // NOTE: end drag&drop

  // textarea-filter
  textareaFilter.addEventListener('input', inputFilter);
  // textarea-custom-metric
  textareaCustomMetric.addEventListener('input', inputCustomMetric);
  // textarea-composite-metric
  textareaCompositeMetric.addEventListener('input', inputCompositeMetric);
  // apertura dialog #dlg-composite-metric
  btnNewCompositeMeasure.onclick = () => {
    dlgCompositeMetricCheck();
    dlgCompositeMetric.showModal();
  }
  // dropzone sheet rows
  rowsDropzone.addEventListener('dragover', handleDragOver, false);
  rowsDropzone.addEventListener('drop', handleRowDrop, false);
  rowsDropzone.addEventListener('dragleave', handleDropzoneDragLeave, false);
  // dropzone sheet columns
  // columnsDropzone.addEventListener('dragover', handleDragOver, false);
  // columnsDropzone.addEventListener('drop', handleColumnDrop, false);
  // columnsDropzone.addEventListener('dragleave', handleDropzoneDragLeave, false);

  btnOptions.addEventListener('click', () => dlg__chart_options.showModal());
  export__datatable_xls.addEventListener('click', export_datatable_XLS_new);

}); // end DOMContentLoaded

console.info('END workspace_event');
