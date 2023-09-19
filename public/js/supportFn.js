/* const contextMenuRef = document.getElementById('context-menu');
const tmplContextMenu = document.getElementById('tmpl-context-menu-content');
// console.log(WorkBook.metrics);

function openContextMenu(e) {
  e.preventDefault();
  // console.log(e.target.id);
  console.log(e.currentTarget.id);
  // reset #context-menu
  if (contextMenuRef.hasChildNodes()) contextMenuRef.querySelector('*').remove();
  const tmpl = tmplContextMenu.content.cloneNode(true);
  const content = tmpl.querySelector(`#${e.currentTarget.dataset.contextmenu}`);
  // aggiungo, a tutti gli elementi del context-menu, il token dell'elemento selezionato
  content.querySelectorAll('button').forEach(li => li.dataset.token = e.currentTarget.id);
  contextMenuRef.appendChild(content);

  const { clientX: mouseX, clientY: mouseY } = e;
  contextMenuRef.style.top = `${mouseY}px`;
  contextMenuRef.style.left = `${mouseX}px`;
  contextMenuRef.toggleAttribute('open');
} */

/* fetch aPI functions */

async function getDatabaseTable(schema) {
  const url = '/fetch_api/schema/' + schema + '/tables';
  return await fetch(url)
    .then((response) => {
      console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.json())
    .then(data => data)
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    });
}

async function getTables(urls) {
  if (urls) {
    return await Promise.all(urls.map(url => fetch(url)))
      .then(responses => {
        return Promise.all(responses.map(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        }))
      })
      .then(data => data)
      .catch(err => console.error(err));

    // ottengo le risposte separatamente
    /* return await Promise.all(urls.map(url => {
      fetch(url)
        .then(response => {
          if (!response.ok) { throw Error(response.statusText); }
          return response;
        })
        .then(response => response.json())
        .then(data => data)
        .catch(err => {
          App.showConsole(err, 'error');
          console.error(err);
        })
    })); */

  }

}

/* end fetch API functions */

// TODO: queste funzioni di supporto dovrei scriverle senza arrow function ma con la normale definizione di function,
// in questo modo potranno essere invocate anche da init-responsice.js (da verificare)
(() => {
  var app = {
    dialogCompositeMetric: document.getElementById('dlg-composite-metric'),
    dialogFilter: document.getElementById('dlg-filters'),
    dialogAdvMetric: document.getElementById('dlg-metric'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
    dialogColumns: document.getElementById('dlg-columns'),
    btnSchema: document.getElementById('btn-schema'),
    dialogSchema: document.getElementById('dlg-schema')
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

  /* mouse event */

  document.querySelectorAll('dialog.moveable').forEach(dialog => {
    dialog.onmousedown = (e) => {
      app.coords = { x: +e.currentTarget.dataset.x, y: +e.currentTarget.dataset.y };
      if (e.target.classList.contains('title')) app.el = e.target;
    }

    dialog.onmousemove = (e) => {
      if (app.el) {
        app.coords.x += e.movementX;
        app.coords.y += e.movementY;
        e.currentTarget.style.transform = "translate(" + app.coords.x + "px, " + app.coords.y + "px)";
        e.currentTarget.dataset.x = app.coords.x;
        e.currentTarget.dataset.y = app.coords.y;
      }
    }

    dialog.onmouseup = () => delete app.el;
  });

  /* end mouse event */

  app.btnSchema.onclick = () => app.dialogSchema.showModal();

  app.dialogCustomMetric.addEventListener('close', () => {
    const textArea = document.getElementById('textarea-custom-metric');
    const ul = document.getElementById('ul-custom-metrics');
    document.getElementById('custom-metric-name').value = '';
    document.getElementById('custom-metric-note').value = '';
    textArea.querySelectorAll('*').forEach(element => element.remove());
    ul.querySelectorAll('li').forEach(metric => metric.remove());
    delete document.querySelector('#btn-custom-metric-save').dataset.token;
  });

  app.dialogFilter.addEventListener('close', (e) => {
    e.target.querySelectorAll('nav > details').forEach(element => element.remove());
    document.getElementById('input-filter-name').value = '';
    document.querySelectorAll('#textarea-filter *').forEach(element => element.remove());
    delete document.querySelector('#btn-filter-save').dataset.token;
    document.getElementById('filter-note').value = '';
  });

  app.dialogAdvMetric.addEventListener('close', () => {
    document.getElementById('adv-metric-name').value = '';
    const formula = document.getElementById('input-metric');
    const timingFunctions = document.getElementById('dl-timing-functions');
    const btnMetricSave = document.getElementById('btn-metric-save');
    formula.querySelectorAll('*').forEach(element => element.remove());
    // se è presente una timingFunction selezionata la deseleziono
    if (timingFunctions.querySelector('dt[selected]')) timingFunctions.querySelector('dt[selected]').removeAttribute('selected');
    // reset della lista dei filtri
    document.querySelectorAll('#filter-drop > li').forEach(li => li.remove());
    // se il tasto #btn-metric-save ha l'attributo 'edit' lo rimuovo
    delete btnMetricSave.dataset.token;
    delete btnMetricSave.dataset.originToken;
  });

  app.dialogCompositeMetric.addEventListener('close', () => {
    document.getElementById('composite-metric-name').value = '';
    const textarea = document.getElementById('textarea-composite-metric');
    const btnMetricSave = document.getElementById('btn-composite-metric-save');
    textarea.querySelectorAll('*').forEach(element => element.remove());
    textarea.value = '';
    // se il tasto #btn-metric-save ha l'attributo 'edit' lo rimuovo
    delete btnMetricSave.dataset.token;
  });

})();
