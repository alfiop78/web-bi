// TODO: queste funzioni di supporto dovrei scriverle senza arrow function ma con la normale definizione di function,
// in questo modo potranno essere invocate anche da init-responsice.js (da verificare)
(() => {
  var app = {
    contextMenuTableRef: document.getElementById('context-menu-table'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
  }

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
        // console.log(mutation.target);
        if (mutation.target.hasChildNodes()) {
          mutation.target.querySelectorAll('*[data-fn]').forEach(element => element.addEventListener('click', app[element.dataset.fn]));
        }
      }
    }
  };
  // Create an observer instance linked to the callback function
  const observerList = new MutationObserver(callback);
  // Start observing the target node for configured mutations
  // observerList.observe(targetNode, config);
  observerList.observe(document.getElementById('body'), config);
  // observerList.observe(Draw.svg, config);
  // aggiunta di una nuova metrica

  app.addCustomMetric = () => {
    app.dialogCustomMetric.show();
    app.contextMenuTableRef.toggleAttribute('open');
  }

  app.closeDialogMetric = () => {
    const input = document.getElementById('adv-metric-name');
    const textarea = document.getElementById('textarea-metric');
    const timingFunctions = document.getElementById('dl-timing-functions');
    const btnMetricSave = document.getElementById('btn-metric-save');
    input.value = '';
    textarea.querySelectorAll('*').forEach(element => element.remove());
    textarea.value = '';
    // se è presente una timingFunction selezionata la deseleziono
    if (timingFunctions.querySelector('dt[selected]')) timingFunctions.querySelector('dt[selected]').removeAttribute('selected');
    // reset della lista dei filtri
    document.querySelectorAll('#filter-drop > li').forEach(li => li.remove());
    // se il tasto #btn-metric-save ha l'attributo 'edit' lo rimuovo
    if (btnMetricSave.dataset.edit) delete btnMetricSave.dataset.edit;
  }

  app.closeDialogCompositeMetric = () => {
    const input = document.getElementById('composite-metric-name');
    const textarea = document.getElementById('textarea-composite-metric');
    const btnMetricSave = document.getElementById('btn-composite-metric-save');
    input.value = '';
    textarea.querySelectorAll('*').forEach(element => element.remove());
    textarea.value = '';
    // se il tasto #btn-metric-save ha l'attributo 'edit' lo rimuovo
    if (btnMetricSave.dataset.edit) delete btnMetricSave.dataset.edit;
  }

})();
