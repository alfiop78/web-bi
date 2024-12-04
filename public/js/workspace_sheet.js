// apertura nuovo Sheet, viene recuperato dal localStorage
async function sheetSelected(e) {
  // const sheetToken = e.currentTarget.dataset.token;
  document.querySelectorAll('#dropzone-columns > *, #dropzone-rows > *, #ul-filters-sheet > *, #ul-columns-handler > *, #preview-datamart > *').forEach(element => element.remove());
  document.querySelector('#btn-sheet-save').disabled = true;
  Sheet = new Sheets(e.currentTarget.dataset.name, e.currentTarget.dataset.token, WorkBook.workBook.token);
  // reimposto tutte le proprietà della Classe
  Sheet.open();
  input__sheetName.innerText = Sheet.name;
  input__sheetName.dataset.value = Sheet.name;
  input__sheetName.dataset.tempValue = Sheet.name;
  // Re-inserisco, nello Sheet, tutti gli elementi (fileds, filters, metrics, ecc...)
  // della classe Sheet (come quando si aggiungono in fase di creazione Sheet)
  for (const token of Sheet.fields.keys()) {
    // const target = document.getElementById('dropzone-rows');
    rowsDropzone.appendChild(createColumnDefined(token));
  }

  for (const [token, metrics] of Sheet.metrics) {
    if (!metrics.dependencies) columnsDropzone.appendChild(createMetricDefined(token));
  }

  // filters
  Sheet.filters.forEach(token => addFilterToSheet(token));

  dlg__sheet.close();
  // in fase di apertura della preview, le specifiche sono sicuramente già presenti.
  Resource = new Resources('preview-datamart');
  // verifico se il datamart, per lo Sheet selezionato, è già presente sul DB.
  // In caso positivo lo apro in preview-datamart.
  if (await Sheet.exist()) {
    App.closeConsole();
    preview();
  }
  // Imposto la prop 'edit' = true perchè andrò ad operare su uno Sheet aperto
  Sheet.edit = true;
  document.querySelector('#btn-sheet-save').disabled = false;
  document.querySelectorAll('#btn-sql-preview, #btn-sheet-preview').forEach(button => button.disabled = false);
}


function addFilterToSheet(token) {
  // aggiungo, sulla <li> del filtro selezionato, la class 'added' per evidenziare che il filtro
  // è stato aggiunto al report, non può essere aggiunto di nuovo.
  const li__selected = document.querySelector(`li[data-id='${token}']`);
  li__selected.classList.add('added');
  addTemplateFilter(token);
}

async function preview() {
  // NOTE: Chiamata in post per poter passare tutte le colonne, incluso l'alias, alla query
  // TODO: Passo in param un object con le colonne da estrarre (tutte)
  /* const params = JSON.stringify({ sheet_id: sheet.id });
  const url = `/fetch_api/datamartpost`;
  const init = { headers: { 'Content-Type': 'application/json' }, method: 'POST', body: params };
  const req = new Request(url, init);
  await fetch(req)
    .then((response) => {
      console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.json())
    .then(data => {
      console.log(data);
      debugger;
      Dashboard.data = data;
      app.createJsonTemplate();
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    }); */
  // end chiamta in POST

  Resource.specs = JSON.parse(window.localStorage.getItem(Sheet.sheet.token)).specs;

  const progressBar = document.getElementById('progress-bar');
  const progressTo = document.getElementById('progress-to');
  const progressTotal = document.getElementById('progress-total');
  const progressLabel = document.querySelector("label[for='progress-bar']");
  // App.loaderStart();
  App.showConsole('Recupero dati in corso...', null, null);
  await fetch(`/fetch_api/${Sheet.sheet.id}_${Sheet.userId}/preview`)
    .then((response) => {
      console.log(response);
      if (!response.ok) { throw Error(response.statusText); }
      return response;
    })
    .then((response) => response.json())
    .then(async (paginateData) => {
      let partialData = [];
      // TODO: rivedere come utilizzare la progressBar con i dati provenienti dal cursorPaginate.
      // La progress-bar veniva correttamente utilizzata con il paginate
      if (paginateData.total !== 0) {
        console.log(paginateData);
        progressBar.value = +((paginateData.to / paginateData.total) * 100);
        progressLabel.hidden = false;
        progressTo.innerText = paginateData.to;
        progressTotal.innerText = paginateData.total;
        // console.log(paginateData.data);
        // funzione ricorsiva fino a quando è presente next_page_url
        let recursivePaginate = async (url) => {
          await fetch(url).then(response => {
            // console.log(response);
            if (!response.ok) { throw Error(response.statusText); }
            return response;
          }).then(response => response.json()).then(paginate => {
            console.log(paginate);
            progressBar.value = +((paginate.to / paginate.total) * 100);
            progressTo.innerText = paginate.to;
            progressTotal.innerText = paginate.total;
            // console.log(progressBar.value);
            partialData = partialData.concat(paginate.data);
            if (paginate.next_page_url) {
              recursivePaginate(paginate.next_page_url);
            } else {
              // Non sono presenti altre pagine, visualizzo il dashboard
              console.log('tutte le paginate completate :', partialData);
              Resource.data = partialData;
              google.charts.setOnLoadCallback(drawDatamart());
              App.closeConsole();
              App.loaderStop();
              sheetInformations();
            }
          }).catch((err) => {
            App.showConsole(err, 'error');
            console.error(err);
          });
        }
        partialData = paginateData.data;
        if (paginateData.next_page_url) {
          recursivePaginate(paginateData.next_page_url);
        } else {
          // Non sono presenti altre pagine, visualizzo il dashboard
          Resource.data = partialData;
          google.charts.setOnLoadCallback(drawDatamart());
          App.loaderStop();
          App.closeConsole();
          sheetInformations();
        }
      } else {
        App.loaderStop();
        App.closeConsole();
        App.showConsole('Nessun dato presente', 'warning', 2000);
      }
    })
    .catch(err => {
      App.showConsole(err, 'error');
      console.error(err);
    });
}

function sheetInformations() {
  document.querySelectorAll('#info>.info').forEach(info => info.hidden = true);
  if (Sheet) {
    // sono presenti info, elimino la classe css 'none'
    document.querySelector('#info.informations').classList.remove('none');
    for (const [key, value] of Object.entries(Sheet.getInformations())) {
      const ref = document.getElementById(key);
      if (ref) {
        ref.hidden = false;
        const refContent = document.getElementById(`${key}_content`);
        refContent.textContent = value;
      }
    }
  }
}