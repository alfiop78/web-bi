<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Workspace</title>
  <!-- TODO: tooltip e loader -->
  <!-- <link rel="stylesheet" href="{{ asset('/css/md-tooltip.css') }}"> -->
  <!-- <link rel="stylesheet" type="text/css" href="/css/md-loader.css" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-steps-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-preview-table.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-mapdb.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-sheet-page.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/Step.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
  <!-- non utilizzata se tutte le istanze Table vengono convertite in Google Chart -->
  <script src="{{ asset('/js/Table.js') }}"></script>
  <script src="{{ asset('/js/DrawSVG.js') }}"></script>
  <script src="{{ asset('/js/Dashboards.js') }}"></script>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</head>

<body class="antialiased">

  <template id="tmpl-li">
    <li data-li data-element-search data-label data-searchable="true">
      <span></span>
    </li>

    <!-- li con icona 'delete' -->
    <li data-li-icon data-element-search data-label data-searchable="true">
      <span></span>
      <div>
        <button type="button" data-edit data-fn="editCustomMetric" class="button-icon material-icons-round md-18">edit</button>
        <button type="button" data-delete data-fn="removeWBMetric" class="button-icon material-icons-round md-18">delete</button>
      </div>
    </li>

    <li data-li-drag data-element-search data-label data-searchable="true" draggable="true">
      <i class="material-icons-round md-18">drag_handle</i>
      <span></span>
    </li>

    <li data-li-drag data-filter data-element-search="filters" data-label data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
    </li>

    <li data-li-drag data-element-search="metrics" data-label data-basic data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <!-- <i data-id="metric-new" class="material-icons-round md-18">add</i> -->
    </li>

    <li data-li-drag data-element-search="metrics" data-label data-advanced data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
    </li>

    <li data-li-drag data-element-search="metrics" data-label data-composite data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
    </li>
  </template>

  <template id="tmpl-dl-element">
    <dl data-id="dt-hierarchies">
      <dt></dt>
    </dl>
  </template>

  <template id="tmpl-dt">
    <dt data-id="value-icons">
      <div>
        <span data-value></span>
        <span>
          <button data-fn="uploadObject" data-upload="workbook" class="button-icon material-icons-round md-18">upload</button>
          <button data-fn="deleteWorkBook" data-delete class="button-icon material-icons-round md-18">delete</button>
        </span>
      </div>
    </dt>
  </template>

  <template id="tmpl-dd">
    <dd data-id="value-icons">
      <div>
        <span data-value></span>
        <span>
          <button data-fn="uploadObject" data-upload="sheet" class="button-icon material-icons-round md-18">upload</button>
          <button data-fn="deleteSheet" data-delete class="button-icon material-icons-round md-18">delete</button>
        </span>
      </div>
    </dd>
  </template>

  <template id="tmpl-details-element">
    <details data-id="dt-tables">
      <summary></summary>
    </details>
    <li class="new-worksheet-object">
      <i class="material-icons-round md-18 new-object">add</i>
      <button class="new-object" data-fn="btnMetricNew" type="button" value="crea metrica">Metrica Composta</button>
    </li>
  </template>

  <template id="tmpl-preview-table">
    <thead>
      <tr></tr>
    </thead>
    <tbody></tbody>
    <th data-field scope="col"></th>
    <tr></tr>
    <td scope="row"></td>
  </template>

  <template id="tmpl-filter-dropped-adv-metric">
    <li data-token class="li-content-icons">
      <i class="material-icons-round md-18">filter_alt</i>
      <span></span>
      <button data-token data-fn="removeFilterByAdvMetric" type="button" class="button-icon material-icons-round md-18">delete</button>
    </li>
  </template>

  <template id="tmpl-sql-info-element">
    <div class="sql-raw"></div>
    <details class="sql-details" open>
      <summary data-id></summary>
    </details>
    <div class="sql-row"><span data-key></span><span data-sql></span></div>
  </template>

  <template id="tmpl-sql-raw">
    <div class="sql-raw">
      <div class="absolute-icons">
        <button data-fn="copyToClipboard" data-copy class="material-icons-round md-18">copy</button>
      </div>
      <div class="sql-content"></div>
    </div>
  </template>

  <main>
    <div id="drawer" open>

      <section class="account">
        <i class="material-icons md-light">person</i>
      </section>

      <nav>
        <!-- <a href="#" id="mdc-back">HOME</a> -->
        <section class="icon-vertical-menu">
          <a href="{{ url('/') }}"><i class="material-icons-round md-24">home</i></a>
          <button id="btn-datanase" class="material-icons-round md-24 main-menu" disabled>storage</button>
          <button id="btn-schema" class="material-icons-round md-24 main-menu">schema</button>
        </section>
      </nav>

    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <!-- <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a> -->
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>

      <h1 class="title">Map database</h1>
    </header>

    <template id="tmpl-join-field">
      <div class="join-field" data-fn="handlerJoin" data-active>Campo</div>
    </template>

    <template id="tmpl-columns-defined">
      <div class="column-defined">
        <i class="button-icon material-icons-round md-18">table_rows</i>
        <code contenteditable="true" data-blur-fn="editFieldAlias"></code>
        <button type="button" data-remove class="button-icon material-icons-round md-18 column-defined" data-fn="removeDefinedColumn" data-column-token>delete</button>
        <button type="button" data-undo class="button-icon material-icons-round md-18 column-defined" data-fn="undoDefinedColumn" data-column-token>undo</button>
      </div>
    </template>

    <template id="tmpl-filters-defined">
      <div class="filter-defined">
        <i class="button-icon material-icons-round md-18">filter_alt</i>
        <span class="defined"></span>
        <button type="button" data-remove class="button-icon material-icons-round md-18 filter-defined" data-fn="removeDefinedFilter" data-filter-token>delete</button>
        <button type="button" data-undo class="button-icon material-icons-round md-18 filter-defined" data-fn="undoDefinedFilter" data-filter-token>undo</button>
      </div>
    </template>

    <template id="tmpl-adv-metric">
      <div id="adv-metric-defined">
        <section class="formula" data-token>
          <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code><span data-field></span>
        </section>
      </div>

      <!-- <div data-composite class="metric-defined">
        <section class="formula" data-token>
          <code data-field></code>
        </section>
      </div> -->
    </template>

    <template id="tmpl-metrics-defined">

      <!-- 08-09-2023 -->
      <div class="metric-defined">
        <!-- <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code><span>(</span><code data-field data-metric-id data-table-alias></code><span>)</span> -->
        <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code><span data-field></span>
        <button type="button" data-remove class="button-icon material-icons-round md-18 metric-defined" data-fn="removeDefinedMetric" data-metric-token>delete</button>
        <button type="button" data-undo class="button-icon material-icons-round md-18 metric-defined" data-fn="undoDefinedMetric" data-metric-token>undo</button>
      </div>
    </template>

    <template id="tmpl-formula">
      <span class="markContent">
        <i class="material-icons-round md-14">cancel</i>
        <mark></mark>
        <small></small>
      </span>
    </template>

    <template id="tmpl-composite-formula">
      <span class="markContent">
        <i class="material-icons-round md-14">cancel</i>
        <mark></mark>
      </span>
    </template>

    <template id="tmpl-context-menu-content">
      <ul id="ul-context-menu-filter" class="context-menu-items">
        <button data-fn="editFilter" class="btn-link-context">Modifica</button>
        <button data-button="delete" data-fn="removeWBFilter" class="btn-link-context">Elimina</button>
      </ul>

      <ul id="ul-context-menu-basic" class="context-menu-items">
        <button data-fn="newAdvMeasure" class="btn-link-context">Crea metrica avanzata</button>
        <button data-button="delete" data-fn="removeMetric" class="btn-link-context" disabled>Elimina</button>
      </ul>

      <ul id="ul-context-menu-advanced" class="context-menu-items">
        <button data-fn="editAdvancedMetric" class="btn-link-context">Modifica</button>
        <button data-fn="removeAdvancedMetric" class="btn-link-context" disabled>Elimina</button>
        <!-- <button data-fn="renameAdvancedMetric" class="btn-link-context" disabled>Rinomina</button> -->
      </ul>

      <ul id="ul-context-menu-composite" class="context-menu-items">
        <button data-fn="editCompositeMetric" class="btn-link-context">Modifica</button>
        <button data-fn="removeCompositeMetric" class="btn-link-context" disabled>Elimina</button>
        <!-- <button data-fn="renameCompositeMetric" class="btn-link-context" disabled>Rinomina</button> -->
      </ul>
    </template>

    <div id="container">
      <div id="content">
        <div id="body">

          <dialog id="dlg-schema" class="small">
            <section class="dlg-grid">
              <h5 class="">Seleziona schema Database</h5>
              <nav>
                {{-- {{ dd($schemes) }} --}}
                @foreach($schemes as $schema)
                <a href="#" data-fn="handlerSchema" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
                @endforeach
              </nav>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <dialog id="dialog-rename">
            <section class="dlg-grid">
              <h5 class="title moveable">Alias tabella</h5>
              <section class="dlg-content col col-1 row-1">
                <input type="text" id="table-alias" placeholder="Alias" value="" autocomplete="on" />
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveAliasTable" value="ok">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dialog-time" data-x="0" data-y="0" class="medium absolute moveable">
            <section class="dlg-grid">
              <h5 class="title moveable">Imposta relazione con tabella TIME</h5>
              <section class="dlg-content col col-2-equals">
                <ul id="time-fields">
                  <li data-field="date" data-fn="handlerTimeField" data-selected>DATE <small>Es.: 2023-12-31</small></li>
                  <li data-field="month_id" data-fn="handlerTimeField">MONTH <small>Es.: 202312</small></li>
                  <li data-field="year" data-fn="handlerTimeField">YEAR <small>Es.: 2023</small></li>
                </ul>
                <section class="list-search">
                  <input type="search" id="time-column-search" data-element-search="time-column" placeholder="Ricerca colonna" autocomplete="off" />
                  <div class="relative-ul">
                    <ul id="ul-columns" data-search-id="time-column-search" class="custom-scrollbar"></ul>
                  </div>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveTimeDimension" id="btn-time-dimension-save" value="salva">Salva</button>
              </section>
            </section>

          </dialog>

          <div id="context-menu" class="context-menu"></div>

          <dialog id="dialog-workbook-open">
            <section class="dlg-grid">
              <h5 class="title">Apri WorkBook</h5>
              <section class="dlg-content col col-1">
                <nav data-workbook-defined></nav>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <dialog id="dialog-sheet-open">
            <section class="dlg-grid">
              <h5 class="title">Apertura Sheet</h5>
              <section class="dlg-content col col-1">
                <nav data-sheet-defined></nav>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <!-- creazione metrica filtrata -->
          <dialog id="dlg-metric" data-x="0" data-y="0" class="large absolute moveable droppable">
            <section class="dlg-grid">
              <h5 class="title moveable">Creazione Metrica avanzata</h5>
              <section class="dlg-content col col-3">
                <section id="filter-area-drop">
                  <nav id="filter-drop" class="custom-scrollbar dropzone"></nav>
                </section>
                <section class="input-area">
                  <input type="text" id="adv-metric-name" placeholder="Nome" value="" autocomplete="off" />
                  <div id="input-metric"></div>
                  <div>
                    <input type="checkbox" id="check-distinct" disabled />
                    <label for="check-distinct">DISTINCT</label>
                  </div>
                  <textarea id="advanced-metric-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                </section>
                <section class="list-search placeholder">
                  <div class="relative-ul">
                    <dl id="dl-timing-functions" class="custom-scrollbar">
                      <dt class="btn-link">Last Period/Day</dt>
                      <dd>Periodo temporale precedente, rispetto al livello più basso presente nel report.<br /> Ad esempio se nel report è presente il livello giorno, la funzione presenta i dati del giorno precedente, se invece è presente la settimana, presenta i dati della settimana precedente, ecc</dd>

                      <dt class="btn-link">Last Week</dt>
                      <dd>description</dd>

                      <dt data-value="last-month" class="btn-link" data-fn="handlerTimingFunctions" data-time-field="month">Last Month</dt>
                      <dd>description</dd>

                      <dt class="btn-link">Last Quarter</dt>
                      <dd>description</dd>

                      <dt class="btn-link" data-value="last-year" data-fn="handlerTimingFunctions" data-time-field="year">Last Year</dt>
                      <dd>La funzione presenta i dati relativi all’anno precedente, rispetto al livello presente nel report.<br /> Ad esempio se nel report è presente il livello mese, la funzione presenta i dati relativi allo stesso mese, ma dell’anno precedente, per il livello trimestre, presenta invece i dati dello stesso trimestre, ma dell’anno precedente</dd>

                      <dt class="btn-link">MAT</dt>
                      <dd>La funzione aggrega i dati relativi ai 12 mesi precedenti quello corrente.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito.</dd>

                      <dt class="btn-link">Last Year MAT</dt>
                      <dd>Analoga alla MAT, solamente che è applicata rispetto al mese corrente dell’anno precedente.</dd>

                      <dt class="btn-link">Last To Date</dt>
                      <dd>La funzione aggrega i dati da inizio mese fino al giorno corrente.<br /> Il livello DAY deve essere presente nel report</dd>

                      <dt class="btn-link">Last Year MTD</dt>
                      <dd>Analoga alla Month to date, solamente che è applicata sui dati dell’anno precedente: da inizio mese al giorno corrente dell’anno precedente.</dd>

                      <dt class="btn-link">Year To Date</dt>
                      <dd>La funzione aggrega i dati da inizio anno fino al giorno corrente. Il livello DAY deve essere presente nel report.</dd>

                      <dt class="btn-link">Last Year YTD</dt>
                      <dd>Analoga alla Year to date, solamente che è applicata sui dati dell’anno precedente: da inizio anno precedente al giorno corrente, sempre riferito all’anno precedente</dd>

                      <dt class="btn-link">Year To Month</dt>
                      <dd>La funzione aggrega i dati da inizio anno fino al mese corrente. Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>

                      <dt class="btn-link">Last Year YTM</dt>
                      <dd>Analoga alla Year to month, solamente che è applicata sui dati dell’anno precedente: da inizio anno precedente al mese corrente, sempre riferito all’anno precedente</dd>

                      <dt class="btn-link">Last 2 Month</dt>
                      <dd>La funzione presenta i dati relativi ai due mesi precedenti.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>

                      <dt class="btn-link">Last 3 Month</dt>
                      <dd>La funzione presenta i dati relativi ai tre mesi precedenti.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>
                    </dl>
                  </div>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveMetric" id="btn-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-custom-metric" data-x="0" data-y="0" class="medium absolute moveable">
            <section class="dlg-grid">
              <h5 class="title moveable">Creazione Metrica</h5>
              <section class="dlg-content col col-2">
                <div class="list-search">
                  <input type="search" id="input-search-custom-metrics" placeholder="Ricerca" data-element-search="custom-metrics" class="input-search" autocomplete="off">
                  <div class="relative-ul">
                    <ul id="ul-custom-metrics" class="custom-scrollbar" data-search-id="input-search-custom-metrics"></ul>
                  </div>
                </div>
                <section class="textarea-formula">
                  <input type="text" id="custom-metric-name" placeholder="Nome" value="" autocomplete="off" />
                  <div id="textarea-custom-metric" data-fn="addText" data-content-editable class="textarea placeholder"></div>
                  <textarea id="custom-metric-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveCustomMetric" id="btn-custom-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-join" data-x="0" data-y="0" class="small absolute moveable">
            <section class="dlg-grid">
              <h5 class="title moveable">Creazione Join</h5>
              <section class="dlg-content col">
                <section class="joins">
                  <section data-table-from data-table-id>
                    <div class="table"></div>
                    <div class="join"></div>
                  </section>
                  <section data-table-to data-table-id>
                    <div class="table"></div>
                    <div class="join"></div>
                  </section>
                </section>
                <section class="btn-link">
                  <button id="btn-add-join" class="btn-link default" data-fn="addJoin" value="Aggiungi Join">Aggiungi join</button>
                  <button id="btn-remove-join" class="btn-link attention" data-fn="removeJoin" value="Elimina Join">Elimina join</button>
                </section>
                <div class="wj-fields-list">
                  <section data-table-from>
                    <section class="list-search">
                      <input type="search" id="field-from-search" placeholder="Ricerca" data-element-search="from-fields" autocomplete="off" />
                      <div class="relative-ul">
                        <ul id="ul-from-fields" data-search-id="field-from-search" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                  <section data-table-to>
                    <section class="list-search">
                      <input type="search" id="field-to-search" placeholder="Ricerca" data-element-search="to-fields" autocomplete="off" />
                      <div class="relative-ul">
                        <ul id="ul-to-fields" data-search-id="field-to-search" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                </div>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-sql-info" data-x="0" data-y="0" class="medium absolute moveable">
            <section class="grid dlg-grid row-4">
              <h5 class="title moveable">SQL</h5>
              <menu>
                <button type="button" data-sql="0" id="btn-sql-info-raw" data-active data-fn="btnSQLInfo" value="SQL">SQL</button>
                <button type="button" data-sql="1" id="btn-sql-info-format" data-fn="btnSQLInfo" value="SQL Formattato">SQL Formattato</button>
              </menu>
              <!-- <section class="content col m2">
                <div data-sql="0" id="sql-info-raw" class="sql-info custom-scrollbar"></div>
                <div data-sql="1" id="sql-info-format" class="sql-info custom-scrollbar" hidden></div>
              </section> -->
              <section class="content">
                <div data-sql="0" id="sql-info-raw" class="sql-info custom-scrollbar"></div>
                <div data-sql="1" id="sql-info-format" class="sql-info custom-scrollbar" hidden></div>
              </section>
              <output id="outbox"></output>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>

          </dialog>

          <dialog id="dlg-filters" data-x="0" data-y="0" class="medium absolute moveable">
            <section class="dlg-grid">
              <h5 class="title moveable">Creazione Filtro</h5>
              <section class="dlg-content col col-2">
                <div class="list-search">
                  <input type="search" id="input-search-columns" placeholder="Ricerca" data-element-search="columns" class="input-search" autocomplete="off">
                  <div class="relative-ul">
                    <nav class="custom-scrollbar" data-search-id="input-search-columns"></nav>
                  </div>
                </div>
                <section class="textarea-formula">
                  <input type="text" id="input-filter-name" placeholder="Nome" value="" autocomplete="off" />
                  <div id="textarea-filter" data-fn="addText" class="textarea" data-content-editable></div>
                  <textarea id="filter-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveFilter" id="btn-filter-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <div class="wrapper">

            <dialog id="dlg-columns" data-x="0" data-y="0" class="medium absolute moveable">
              <section class="dlg-grid">
                <h5 class="title moveable">Definizione colonne</h5>
                <section class="dlg-content col-4 col-8">
                  <div class="list-search">
                    <input type="search" id="input-search-fields-dc" placeholder="Ricerca" data-element-search="fields" class="input-search" autocomplete="off">
                    <div class="relative-ul">
                      <nav id="table-field-list" class="custom-scrollbar" data-search-id="input-search-fields-dc"></nav>
                    </div>
                  </div>
                  <section class="textareas">
                    <input type="text" id="column-name" placeholder="Nome" autocomplete="off">
                    <section class="textarea-column">
                      <div id="textarea-column-id" data-fn="addText" class="textarea-content" data-content-editable data-active></div>
                    </section>
                    <section class="textarea-column">
                      <div id="textarea-column-ds" data-fn="addText" class="textarea-content" data-content-editable></div>
                    </section>
                  </section>
                </section>
                <section class="dlg-buttons">
                  <button name="cancel" value="chiudi">Chiudi</button>
                  <button data-fn="saveColumn" id="btn-columns-define" value="salva">Ok</button>
                </section>
              </section>
            </dialog>

            <section class="steps" data-step="1">
              <div class="overflow">
                <div id="stepTranslate" data-translate-x="0">
                  <section class="step" data-step="1" selected>
                    <section class="wrapper-step">
                      <menu class="standard">
                        <section id="workbook-name" class="name data-source" contenteditable="true">WorkSpace 1</section>
                        <button data-fn="workBookNew" id="btn-workbook-new" value="Nuovo" disabled>Nuovo</button>
                        <button id="btn-workbook-open" value="open">Apri</button>
                        <button data-fn="workBookClose" id="btn-workbook-close" value="Chiudi" disabled>Chiudi</button>
                      </menu>
                      <div id="context-menu-table" class="context-menu">
                        <ul id="ul-context-menu-table" class="context-menu-items">
                          <button id="time-dimension" data-fn="handlerTimeDimension" class="btn-link-context">Dimensione TIME</button>
                          <button id="context-custom-metric" data-fn="addCustomMetric" class="btn-link-context">Metrica person.</button>
                          <button data-fn="removeTable" class="btn-link-context">Rimuovi</button>
                          <button data-fn="setAliasTable" class="btn-link-context">Imposta alias</button>
                        </ul>
                      </div>
                      <div id="context-menu-column" class="context-menu">
                        <ul id="ul-context-menu-column" class="context-menu-items">
                          <span>Metrica</span>
                          <button id="btn-add-metric" data-fn="setMetric" class="btn-link-context">Nuova metrica</button>
                          <button id="btn-remove-wb-metric" data-fn="removeWBMetric" class="btn-link-context">Elimina</button>
                          <span>Colonna</span>
                          <button id="btn-add-column" data-fn="setColumn" class="btn-link-context">Nuova colonna</button>
                          <button id="btn-edit-column" data-fn="editColumn" class="btn-link-context">Modifica</button>
                          <button id="btn-remove-column" data-fn="removeColumn" class="btn-link-context">Elimina</button>
                        </ul>
                      </div>
                      <section id="canvas-area">
                        <!-- <dialog id="dlg-info" class="small positioned popup"></dialog> -->
                        <div id="translate" class="translate" data-translate-x="0" data-translate-y="0">
                          <dialog id="dlg-info" class="positioned popup">
                            <button class="button-icon material-icons-round md-18 columns" disabled>view_column</button>
                            <button class="button-icon material-icons-round md-18 metrics" disabled>multiline_chart</button>
                            <button class="button-icon material-icons-round md-18" disabled>history</button>
                            <button class="button-icon material-icons-round md-18" disabled>info</button>
                          </dialog>
                          <svg id="svg" class="dropzone" data-level="0">
                            <defs>
                              <g id="table-struct" class="struct">
                                <rect x="0" y="0" />
                                <image href="{{ asset('/images/grid_on_5C7893_18dp.svg') }}" data-id x="5" y="6" width="18" height="18">
                                </image>
                                <text x="26" y="20" font-family="Barlow" font-size=".85rem" font-weight="normal"></text>
                                <!-- <image data-columns-defined="false" href="{{ asset('/images/view_column_black_18dp.svg') }}" x="5" y="35" width="18" height="18"></image> -->
                              </g>
                              <g id="web-bi-time">
                                <image id="time" href="{{ asset('/images/access_time_filled_865858_18dp.svg') }}" height="18" width="18"></image>
                              </g>
                            </defs>
                          </svg>
                          <span id="coords"></span>
                        </div>
                      </section>
                      <section id="tables-area">
                        <section class="table-area-wrapper">
                          <section class="list-search">
                            <input type="search" id="table-search" data-element-search="tables" placeholder="Ricerca tabelle" autocomplete="off" />
                            <div class="relative-ul">
                              <ul id="ul-tables" data-search-id="table-search" class="custom-scrollbar"></ul>
                            </div>
                          </section>
                          <section class="table-preview">
                            <input type="search" id="columns-search-id" autocomplete="off" placeholder="Ricerca colonne" />
                            <div class="table-content">
                              <!-- data-search-input : definisce la input che effettua la ricerca di colonne in questa tabella -->
                              <table id="preview-table" class="custom-scrollbar" data-search-input="columns-search-id"></table>
                            </div>
                          </section>
                        </section>
                      </section>
                    </section>

                  </section>
                  <section class="step" data-step="2">
                    <section class="wrapper-content">
                      <menu class="standard">
                        <section class="buttons-menu">
                          <button type="button" disabled>Aggiungi WorkBook (analisi multifatti)</button>
                          <button type="button" id="btn-sheet-new" data-fn="newSheet" disabled>Nuovo Sheet</button>
                          <button type="button" id="btn-sheet-open" data-fn="openSheetDialog">Apri Sheet</button>
                          <button type="button" id="btn-sheet-save" data-fn="saveSheet">Salva</button>
                        </section>
                        <section class="sheet-title">
                          <div id="sheet-name" class="name" data-blur-fn="handlerEditSheetName" contenteditable="true" data-value="Sheet 1">Sheet 1</div>
                        </section>
                      </menu>
                      <section id="wrapper-sheet" class="wrapper-sheet">
                        <div class="properties">
                          <section id="workbook-objects" data-section-active="2">
                            <p class="field-search">
                              <input id="input-search-workbooks" data-element-search="workbooks" autocomplete="off" type="search" class="input-search workbooks" readonly placeholder="WorkBooks" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-workbooks">search</button>
                            </p>
                            <section data-worksheet-object data-section="1">
                              <li data-workbook>workbook 1</li>
                              <li data-workbook>workbook 2</li>
                            </section>
                            <p class="field-search">
                              <input id="input-search-fields" data-element-search="fields" autocomplete="off" type="search" class="input-search columns" readonly placeholder="Campi" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-fields">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="2">
                              <ul id="nav-fields" class="custom-scrollbar" data-search-id="input-search-fields"></ul>
                              <button class="btn-link default" data-fn="btnColumnNew" type="button" value="Nuova Colonna" disabled>Nuova Colonna</button>
                            </section>
                            <p class="field-search">
                              <input id="input-search-metrics" data-element-search="metrics" autocomplete="off" type="search" class="input-search metrics" readonly placeholder="Metriche" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-metrics">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="3">
                              <ul id="ul-metrics" class="custom-scrollbar" data-search-id="input-search-metrics"></ul>
                              <button class="btn-link default" data-fn="btnCompositeMetric" type="button" value="Nuova Metrica">Nuova Metrica</button>
                            </section>
                            <p class="field-search">
                              <input id="input-search-filters" data-element-search="filters" autocomplete="off" type="search" class="input-search filters" readonly placeholder="Filtri" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-filters">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="4">
                              <ul id="ul-filters" class="custom-scrollbar" data-search-id="input-search-filters"></ul>
                              <button class="btn-link default" data-fn="openDialogFilter" type="button" value="Nuovo Filtro">Nuovo Filtro</button>
                            </section>
                          </section>
                        </div>
                        <div class="report-area">

                          <section class="columns-rows">
                            <div id="sheet-columns" class="relative">
                              <section class="sheet-elements">
                                <span>Colonne</span>
                                <section id="dropzone-columns" class="dropzone columns custom-scrollbar"></section>
                              </section>
                            </div>
                            <div id="sheet-rows" class="relative">
                              <section class="sheet-elements">
                                <span>Righe</span>
                                <section id="dropzone-rows" class="dropzone rows custom-scrollbar"></section>
                              </section>
                            </div>
                            <div id="sheet-filters" class="relative">
                              <section class="sheet-elements">
                                <span>Filtri</span>
                                <section id="dropzone-filters" class="dropzone filters custom-scrollbar"></section>
                              </section>
                            </div>
                          </section>
                          <section class="table-preview">
                            <!-- creazione metrica composta -->
                            <dialog id="dlg-composite-metric" data-x="0" data-y="0" class="small absolute moveable droppable">
                              <section class="dlg-grid">
                                <h5 class="title moveable">Creazione Metrica Composta</h5>
                                <section class="dlg-content col col-1">
                                  <section class="textarea-formula">
                                    <input type="text" id="composite-metric-name" placeholder="Nome" value="" autocomplete="off" />
                                    <div id="textarea-composite-metric" data-fn="addText" data-content-editable class="dropzone textarea"></div>
                                    <textarea id="composite-metric-note" row="5" cols="10" disabled placeholder="Note"></textarea>
                                  </section>
                                </section>
                                <section class="dlg-buttons">
                                  <button name="cancel" value="chiudi">Chiudi</button>
                                  <button data-fn="saveCompositeMetric" id="btn-composite-metric-save" value="salva">Salva</button>
                                </section>
                              </section>
                            </dialog>

                            <dialog id="dlg-sheet-config" data-x="0" data-y="0" class="medium absolute moveable">
                              <section class="dlg-grid">
                                <h5 class="title">Configurazione</h5>
                                <section class="dlg-content col col-1">
                                  <section class="">
                                    <input id="field-label" type="text" value="" placeholder="Etichetta colonna" />
                                    <section>
                                      <label for="field-datatype">Tipo di dato</label>
                                      <select id="field-datatype">
                                        <option id="string" value="string">Stringa</option>
                                        <option id="number" value="number">Numero</option>
                                        <option id="date" value="date">Data</option>
                                        <option id="datetime" value="datetime">Date Time</option>
                                        <option id="timeofday" value="timeofday">Time of Day</option>
                                        <option id="boolean" value="boolean">Vero/Falso</option>
                                      </select>
                                    </section>
                                    <section>
                                      <label for="field-format">Formattazione colonna</label>
                                      <select id="field-format">
                                        <option value="default" selected>Default</option>
                                        <option value="currency">Valuta €</option>
                                        <option value="percent">Percentuale</option>
                                      </select>
                                      <label for="frationDigits">Posizioni decimali</label>
                                      <input id="frationDigits" type="number" value="2" />
                                    </section>
                                    <section>
                                      <input type="checkbox" id="filter-column" name="filter-column" />
                                      <label for="filter-column">Imposta come filtro</label>
                                    </section>
                                  </section>
                                </section>
                                <section class="dlg-buttons">
                                  <button name="cancel" value="chiudi">Chiudi</button>
                                  <button id="btn-column-save">Ok</button>
                                  <!-- <button data-fn="btnSaveColumn" id="btn-column-save">Ok</button> -->
                                </section>
                              </section>
                            </dialog>

                            <div class="table-content columnsHandler">
                              <div class="relative-ul" id="column-handler">
                                <ul id="ul-columns-handler" class="custom-scrollbar"></ul>
                              </div>
                              <table id="preview-datamart" class="custom-scrollbar">
                                <thead>
                                  <tr></tr>
                                </thead>
                                <tbody></tbody>
                              </table>
                            </div>
                          </section>
                        </div>
                      </section>
                    </section>
                  </section>
                </div>

              </div>
              <section class="actions">
                <button id="prev">Workbook</button>
                <div>

                  <button id="next">Sheet</button>
                  <button id="btn-sql-preview" class="btn-link important" disabled data-fn="createProcess" value="SQL" hidden>SQL</button>
                  <button id="btn-sheet-preview" class="btn-link important" disabled data-fn="createProcess" value="Elabora" hidden>Elabora</button>
                </div>
              </section>

            </section>

          </div>

        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <!--<button id="mdc-back" class="button dense raised">home</button>
            <button id="prev" class="button dense raised">WorkBook</button>
            <div class="spacer"></div>
            <button id="next" class="button dense raised">report</button>-->
        </div>
      </div>

      <div id="console">
        <div id="fabsConsole">
          <i class="material-icons md-18">info</i>
          <p></p>
        </div>
      </div>

    </div>
  </main>
  <div class="loader">
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
    </svg>
  </div>
  <script type="text/javascript" src="{{ asset('/js/init-responsive.js') }}" async></script>
  <script type="text/javascript" src="{{ asset('/js/init-sheet.js') }}" async></script>
  <script type="text/javascript" src="{{ asset('/js/supportFn.js') }}" async></script>
</body>

</html>
