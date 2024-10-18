console.info('supportFn');
const dialogSQL = document.getElementById('dlg-sql-info');
const tmplSQLInfo = document.getElementById('tmpl-sql-info-element');
const tmplSQLRaw = document.getElementById('tmpl-sql-raw');
const tmplLi = document.getElementById('tmpl-li');
// const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'GROUP BY', 'ORDER BY', ' AS ', 'NVL', 'CREATE TEMPORARY TABLE', 'COMMIT', 'OR'];

function showSQLInfo(data) {
  console.log(data);
  const sqlRaw = document.getElementById('sql-info-raw');
  const sqlFormat = document.getElementById('sql-info-format');
  const tmplRaw = tmplSQLRaw.content.cloneNode(true);
  const div = tmplRaw.querySelector('div.sql-raw');
  const divIcon = div.querySelector('.absolute-icons');
  const btnCopy = divIcon.querySelector('button');
  const divSQL = div.querySelector('div.sql-content');
  // base

  /* let baseRawSQL = data.base.raw_sql;
  keywords.forEach(keyword => {
    const myRe = new RegExp(keyword, 'g');
    // const myRe = /keyword/g;
    baseRawSQL = baseRawSQL.replaceAll(myRe, `<mark class="keyword">${keyword}</mark>`);
  });
  divSQL.innerHTML = baseRawSQL; */
  div.id = 'BASE';
  data.base.forEach(sql => {
    const tmpldiv = document.getElementById('tmpl-content-div');
    const tmplContent = tmpldiv.content.cloneNode(true);
    const div = tmplContent.querySelector('div');
    div.innerHTML = sql.raw_sql;
    divSQL.appendChild(div);
    // divSQL.innerHTML += sql.raw_sql;
  });

  divIcon.dataset.id = 'BASE';
  btnCopy.dataset.id = 'BASE';
  // divSQL.innerHTML = data.base.raw_sql.replace('FROM', "<mark class='keyword'>FROM</mark>");
  sqlRaw.appendChild(div);

  // advanced
  if (data.advanced) {
    data.advanced.forEach((sql, i) => {
      const tmplRaw = tmplSQLRaw.content.cloneNode(true);
      const div = tmplRaw.querySelector('div.sql-raw');
      const divIcon = div.querySelector('.absolute-icons');
      const btnCopy = div.querySelector('button');
      const divSQL = div.querySelector('div.sql-content');
      div.id = `advanced-${i}`;
      divIcon.dataset.id = `advanced-${i}`;
      btnCopy.dataset.id = `advanced-${i}`;
      divSQL.innerHTML = sql.raw_sql;
      sqlRaw.appendChild(div);
    });
  }
  // datamart
  const tmplRawDatamart = tmplSQLRaw.content.cloneNode(true);
  const divDatamart = tmplRawDatamart.querySelector('div.sql-raw');
  const divIconDatamart = divDatamart.querySelector('.absolute-icons');
  const btnCopyDatamart = divDatamart.querySelector('button');
  const divSQLDatamart = divDatamart.querySelector('div.sql-content');
  divDatamart.id = 'DATAMART';
  divIconDatamart.dataset.id = 'DATAMART';
  btnCopyDatamart.dataset.id = 'DATAMART';
  divSQLDatamart.innerHTML = data.datamart;
  sqlRaw.appendChild(divDatamart);

  const tmpl = tmplSQLInfo.content.cloneNode(true);
  const divMain = tmpl.querySelector('.sql-raw');
  sqlFormat.appendChild(divMain);
  // popolo il div sql-info-format
  data.base.forEach(sql => {
    for (const [clause, value] of Object.entries(sql.format_sql)) {
      // console.log(clause, value);
      const tmpl = tmplSQLInfo.content.cloneNode(true);
      const details = tmpl.querySelector('details');
      const summary = tmpl.querySelector('summary');
      summary.innerHTML = clause;
      for (const [key, sql] of Object.entries(value)) {
        const tmpl = tmplSQLInfo.content.cloneNode(true);
        const div = tmpl.querySelector('div.sql-row');
        const dataKey = div.querySelector('span[data-key]');
        const dataSQL = div.querySelector('span[data-sql]');
        dataKey.dataset.clause = clause;
        dataKey.innerHTML = key;
        dataSQL.innerHTML = sql;
        details.appendChild(div);
      }
      divMain.appendChild(details);
    }
  });

  if (data.advanced) {
    data.advanced.forEach(query => {
      const tmpl = tmplSQLInfo.content.cloneNode(true);
      const divMain = tmpl.querySelector('.sql-raw');
      sqlFormat.appendChild(divMain);
      for (const clauses of Object.values(query.format_sql)) {
        for (const [clause, value] of Object.entries(clauses)) {
          // console.log(clause, value);
          const tmpl = tmplSQLInfo.content.cloneNode(true);
          const details = tmpl.querySelector('details');
          const summary = tmpl.querySelector('summary');
          summary.innerHTML = clause;
          for (const [key, sql] of Object.entries(value)) {
            const tmpl = tmplSQLInfo.content.cloneNode(true);
            const div = tmpl.querySelector('div.sql-row');
            const dataKey = div.querySelector('span[data-key]');
            const dataSQL = div.querySelector('span[data-sql]');
            dataKey.dataset.clause = clause;
            dataKey.innerHTML = key;
            dataSQL.innerHTML = sql;
            details.appendChild(div);
          }
          divMain.appendChild(details);
        }
      }
    });
  }
  // dialogSQL.show();
  dialogSQL.showModal();
}

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
    const ul = document.getElementById('ul-custom-metrics');
    document.getElementById('input-base-custom-metric-name').value = '';
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

  dlgAdvancedMetric.addEventListener('close', () => {
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

  app.dialogCompositeMetric.addEventListener('close', () => {
    document.getElementById('composite-metric-name').value = '';
    const textarea = document.getElementById('textarea-composite-metric');
    const btnMetricSave = document.getElementById('btn-composite-metric-save');
    textarea.querySelectorAll('*').forEach(element => element.remove());
    textarea.value = '';
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
