console.info('supportFn');
const dialogSQL = document.getElementById('dlg-sql-info');
const tmplSQLInfo = document.getElementById('tmpl-sql-info-element');
const tmplSQLRaw = document.getElementById('tmpl-sql-raw');
const tmplLi = document.getElementById('tmpl-li');
// const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'GROUP BY', 'ORDER BY', ' AS ', 'NVL', 'CREATE TEMPORARY TABLE', 'COMMIT', 'OR'];

dialogSQL.addEventListener('close', () => document.querySelectorAll('.sql-info *').forEach(element => element.remove()));

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

/* end fetch API functions */

// TODO: queste funzioni di supporto dovrei scriverle senza arrow function ma con la normale definizione di function,
// in questo modo potranno essere invocate anche da init-responsice.js (da verificare)
(() => {
  var app = {
    dialogAdvMetric: document.getElementById('dlg-metric'),
    dialogCustomMetric: document.getElementById('dlg-custom-metric'),
    dialogColumns: document.getElementById('dlg-columns'),
    btnSchema: document.getElementById('btnSchemata'),
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

  // switch tra sql-raw e sql-format per la dialog dlg-sql-info
  app.btnSQLInfo = (e) => {
    document.querySelectorAll('button[data-sql]').forEach(button => delete button.dataset.active);
    document.querySelector(`.sql-info:not([data-sql='${e.target.dataset.sql}'])`).hidden = 'true';
    document.querySelector(`.sql-info[data-sql='${e.target.dataset.sql}']`).removeAttribute('hidden');
    e.target.dataset.active = 'true';
  }

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

  app.btnSchema.onclick = (e) => {
    // e.preventDefault();
    app.dialogSchema.showModal();
  }

  app.dialogCustomMetric.addEventListener('close', () => {
    const textArea = document.getElementById('textarea-custom-metric');
    document.getElementById('input-base-custom-metric-name').value = '';
    document.getElementById('custom-metric-note').value = '';
    textArea.querySelectorAll('*').forEach(element => element.remove());
    delete document.querySelector('#btn-custom-metric-save').dataset.token;
  });

  dlg__filters.addEventListener('close', (e) => {
    e.target.querySelectorAll('nav > details').forEach(element => element.remove());
    input__filter_name.value = '';
    document.querySelectorAll('#textarea-filter *').forEach(element => element.remove());
    delete document.querySelector('#btn-filter-save').dataset.token;
    document.getElementById('filter-note').value = '';
  });

  dlg__advancedMetric.addEventListener('close', () => {
    document.getElementById('input-advanced-metric-name').value = '';
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

  dlg__composite_metric.addEventListener('close', () => {
    document.getElementById('composite-metric-name').value = '';
    const btnMetricSave = document.getElementById('btn-composite-metric-save');
    textarea__composite_metric.querySelectorAll('*').forEach(element => element.remove());
    textarea__composite_metric.value = '';
    // se il tasto #btn-metric-save ha l'attributo 'edit' lo rimuovo
    delete btnMetricSave.dataset.token;
  });

  app.copyToClipboard = (e) => {
    // TODO: Questa funzionalità può essere utilizzata anche per copiare il canvas, vedere
    // se si può copiare anche l'svg
    // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write

    // const type = "text/plain";
    const divIcon = document.querySelector(`.absolute-icons[data-id='${e.target.dataset.id}']`);
    const text = document.querySelector(`#${e.target.dataset.id} > .sql-content`).innerText;
    // const blob = new Blob([text], { type });
    // const data = [new ClipboardItem({ [type]: blob })];

    /* navigator.clipboard.write(data).then(
      () => {
        console.log('copiato');
      },
      () => {
        console.log('errore copia');
      },
    ); */
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
        console.log('copiato');
        divIcon.dataset.copied = 'true';
        setTimeout(() => delete divIcon.dataset.copied, 700);
      },
      () => {
        /* clipboard write failed */
        console.error('errore copia');
        delete divIcon.dataset.copied;
      },
    );
  }

})();
