console.info('workspace_event');

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
  // NOTE: end DOMContentLoaded

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

  // textarea-filter
  textareaFilter.addEventListener('input', inputFilter);
  // textarea-custom-metric
  textareaCustomMetric.addEventListener('input', inputCustomMetric);
  // textarea-composite-metric
  textareaCompositeMetric.addEventListener('input', inputCompositeMetric);
  // apertura dialog #dlg-composite-metric
  btnNewCompositeMeasure.onclick = () => dlgCompositeMetric.showModal();

}); // end DOMContentLoaded

console.info('END workspace_event');
