<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>mapping - new</title>
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
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/Step.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
  <script src="{{ asset('/js/Table.js') }}"></script>
  <script src="{{ asset('/js/DrawSVG.js') }}"></script>
</head>

<body class="antialiased">

  <template id="tmpl-li">
    <li data-li data-element-search data-label data-searchable="true">
      <span></span>
    </li>

    <li data-li-drag data-element-search data-label data-searchable="true" draggable="true">
      <i class="material-icons-round md-18">drag_handle</i>
      <span></span>
    </li>

    <li data-li-drag data-filter data-element-search data-label data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="filters-add" class="material-icons-round md-18">add</i>
    </li>

    <li data-li-drag data-element-search data-label data-base-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="filters-add" class="material-icons-round md-18">add</i>
    </li>

    <li data-li-drag data-element-search data-label data-advanced-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="metric-edit" class="material-icons-round md-18">edit</i>
    </li>

    <li data-li-drag data-element-search data-label data-composite-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="metric-edit" class="material-icons-round md-18">edit</i>
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

  <main>
    <div id="drawer">

      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>
        <a href="#" id="mdc-back">home</a>
        {{-- {{ dd($schemes) }} --}}
        @foreach($schemes as $schema)
        <a href="#" data-fn="handlerSchema" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
        @endforeach
      </nav>

    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>

      <h1 class="title">Map database</h1>
    </header>

    <template id="tmpl-join-field">
      <div class="join-field" data-active></div>
    </template>

    <template id="tmpl-columns-defined">
      <div class="column-defined">
        <i class="button-icon material-icons-round md-18">table_rows</i>
        <code contenteditable="true" data-blur-fn="editFieldAlias"></code>
      </div>
    </template>

    <template id="tmpl-metrics-defined">
      <div class="metric-defined">
        <section class="formula" data-token>
          <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code><span>(</span><code data-field data-metric-id data-table-alias></code><span>)</span>
        </section>
      </div>

      <div data-composite class="metric-defined">
        <section class="formula" data-token>
          <code data-field></code>
        </section>
      </div>
    </template>

    <template id="tmpl-formula">
      <span class="markContent">
        <i class="material-icons-round md-14">cancel</i>
        <mark></mark>
        <small></small>
      </span>
    </template>

    <template id="tmpl-context-menu-content">
      <ul id="ul-context-menu-filter">
        <li data-fn="editFilter">Modifica</li>
        <li data-fn="removeFilter">Elimina</li>
        <li data-fn="renameFilter">Rinomina</li>
        <li>ecc...</li>
      </ul>

      <ul id="ul-context-menu-basic-metric">
        <li data-fn="removeMetric">Elimina</li>
        <li data-fn="renameMetric">Rinomina</li>
        <li>ecc...</li>
      </ul>
    </template>

    <div id="container">
      <div id="content">
        <div id="body">

          <dialog id="dialog-rename">
            <div class="md-field">
              <input type="text" id="table-alias" value="" autocomplete="on" />
              <label for="table-alias" class="">Alias per la tabella</label>
            </div>
            <section class="buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveAliasTable" value="ok">Salva</button>
            </section>
          </dialog>

          <dialog id="dialog-time" class="medium">
            <section class="dlg-grid">
              <h5>Imposta relazione con tabella TIME</h5>
              <section class="dlg-content col col-2-equals">
                <ul id="time-fields">
                  <li data-field="date" data-fn="handlerTimeField" data-selected>DATE <small>Es.: 2023-12-31</small></li>
                  <li data-field="month_id" data-fn="handlerTimeField">MONTH <small>Es.: 202312</small></li>
                  <li data-field="year" data-fn="handlerTimeField">YEAR <small>Es.: 2023</small></li>
                </ul>
                <ul id="ul-columns" class="custom-scrollbar"></ul>
              </section>
              <section class="buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveTimeDimension" id="btn-time-dimension-save" value="salva">Salva</button>
              </section>
            </section>

          </dialog>

          <div id="context-menu" class="context-menu"></div>

          <dialog id="dialog-workbook-open">
            <section class="dlg-grid">
              <section class="dlg-title">Apri WorkBook</section>
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
              <section class="dlg-title">Apertura nuovo Sheet</section>
              <section class="dlg-content col col-1">
                <nav data-sheet-defined></nav>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <!-- creazione metrica composta -->
          <dialog id="dlg-composite-metric" class="medium">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Metrica</section>
              <section class="dlg-content col col-1">
                <section class="textarea-formula">
                  <div class="md-field">
                    <input type="text" id="composite-metric-name" value="" autocomplete="off" />
                    <label for="composite-metric-name" class="">Nome</label>
                  </div>
                  <div id="textarea-composite-metric" data-fn="addText" data-content-editable class="dropzone textarea"></div>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveCompositeMetric" id="btn-composite-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <!-- creazione metrica filtrata -->
          <dialog id="dlg-metric" class="medium">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Metrica</section>
              <section class="dlg-content col col-3">
                <section class="filter-area-drop">
                  <small>Aggiungere qui i filtri per creare una metrica filtrata</small>
                  <nav id="filter-drop" class="custom-scrollbar dropzone"></nav>
                </section>
                <section class="textarea-formula">
                  <div class="md-field">
                    <input type="text" id="adv-metric-name" value="" autocomplete="off" />
                    <label for="adv-metric-name" class="">Nome</label>
                  </div>
                  <div id="textarea-metric" class="dropzone textarea" data-content-editable contenteditable="true"></div>
                </section>
                <section class="overflow-y">
                  <small>Funzioni temporali</small>
                  <dl id="dl-timing-functions" class="custom-scrollbar">
                    <dt>Last Period/Day</dt>
                    <dd>Periodo temporale precedente, rispetto al livello più basso presente nel report.<br /> Ad esempio se nel report è presente il livello giorno, la funzione presenta i dati del giorno precedente, se invece è presente la settimana, presenta i dati della settimana precedente, ecc</dd>

                    <dt>Last Week</dt>
                    <dd>description</dd>

                    <dt data-value="last-month" data-fn="handlerTimingFunctions" data-time-field="month">Last Month</dt>
                    <dd>description</dd>

                    <dt>Last Quarter</dt>
                    <dd>description</dd>

                    <dt data-value="last-year" data-fn="handlerTimingFunctions" data-time-field="year">Last Year</dt>
                    <dd>La funzione presenta i dati relativi all’anno precedente, rispetto al livello presente nel report.<br /> Ad esempio se nel report è presente il livello mese, la funzione presenta i dati relativi allo stesso mese, ma dell’anno precedente, per il livello trimestre, presenta invece i dati dello stesso trimestre, ma dell’anno precedente</dd>

                    <dt>MAT</dt>
                    <dd>La funzione aggrega i dati relativi ai 12 mesi precedenti quello corrente.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito.</dd>

                    <dt>Last Year MAT</dt>
                    <dd>Analoga alla MAT, solamente che è applicata rispetto al mese corrente dell’anno precedente.</dd>

                    <dt>Last To Date</dt>
                    <dd>La funzione aggrega i dati da inizio mese fino al giorno corrente.<br /> Il livello DAY deve essere presente nel report</dd>

                    <dt>Last Year MTD</dt>
                    <dd>Analoga alla Month to date, solamente che è applicata sui dati dell’anno precedente: da inizio mese al giorno corrente dell’anno precedente.</dd>

                    <dt>Year To Date</dt>
                    <dd>La funzione aggrega i dati da inizio anno fino al giorno corrente. Il livello DAY deve essere presente nel report.</dd>

                    <dt>Last Year YTD</dt>
                    <dd>Analoga alla Year to date, solamente che è applicata sui dati dell’anno precedente: da inizio anno precedente al giorno corrente, sempre riferito all’anno precedente</dd>

                    <dt>Year To Month</dt>
                    <dd>La funzione aggrega i dati da inizio anno fino al mese corrente. Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>

                    <dt>Last Year YTM</dt>
                    <dd>Analoga alla Year to month, solamente che è applicata sui dati dell’anno precedente: da inizio anno precedente al mese corrente, sempre riferito all’anno precedente</dd>

                    <dt>Last 2 Month</dt>
                    <dd>La funzione presenta i dati relativi ai due mesi precedenti.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>

                    <dt>Last 3 Month</dt>
                    <dd>La funzione presenta i dati relativi ai tre mesi precedenti.<br />Il livello MONTH deve essere presente nel report ed essere il livello più basso della dimensione TIME inserito</dd>
                    </ul>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveMetric" id="btn-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-custom-metric" class="small">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Metrica</section>
              <section class="dlg-content col col-1">
                <section>
                  <div class="md-field">
                    <input type="text" id="custom-metric-name" value="" autocomplete="off" />
                    <label for="custom-metric-name" class="">Nome</label>
                  </div>
                  <!--<div id="textarea-metric" class="dropzone" data-content-editable contenteditable="true"></div>-->
                  <div id="textarea-custom-metric" data-fn="addText" data-content-editable class="textarea"></div>
                  <!--<textarea id="textarea-metric" cols="20" class="dropzone" rows="10">SUM(</textarea>-->
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveCustomMetric" id="btn-custom-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-filters" class="medium">
            <section class="dlg-grid">
              <h5>Creazione Filtro</h5>
              <section class="dlg-content col col-2">
                <nav class="custom-scrollbar" data-search-id="input-search-columns">
                  <section class="input-search">
                    <div class="md-field">
                      <input type="search" id="input-search-columns" placeholder="Ricerca" data-element-search="columns" class="input-search" autocomplete="off" autocomplete="off">
                      <label for="column-search" class="">Ricerca</label>
                    </div>
                  </section>
                </nav>
                <section class="textarea-formula">
                  <div class="md-field">
                    <input type="text" id="custom-filter-name" value="" autocomplete="off" />
                    <label for="custom-filter-name" class="">Nome</label>
                  </div>
                  <div id="textarea-filter" data-fn="addText" class="textarea" data-content-editable></div>
                </section>
              </section>
              <section class="buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveFilter" id="btn-filter-save" value="salva" data-mode="new">Salva</button>
              </section>
            </section>
          </dialog>

          <div class="wrapper">
            <div id="window-join" class="absolute-window" data-x="0" data-y="0" data-open="false">
              <section class="wj-content">
                <section class="w-title">
                  <p class="title">Creazione relazione</p>
                  <button type="button" data-fn="closeWindowJoin" class="button-icon material-icons-round md-18">close</button>
                </section>
                <div class="wj-joins">
                  <section data-table-from data-table-id>
                    <div class="table"></div>
                    <div class="joins"></div>
                  </section>
                  <section data-table-to data-table-id>
                    <div class="table"></div>
                    <div class="joins"></div>
                  </section>
                </div>
                <button id="btn-add-join" data-fn="addJoin" class="button-icon material-icons-round md-18" value="Aggiungi join">add</button>
                <div class="wj-fields-list">
                  <section data-table-from>
                    <section class="list-search">
                      <div class="md-field">
                        <input type="search" id="field-from-search" data-element-search="from-fields" autocomplete="off" />
                        <label for="field-from-search" class="">Ricerca</label>
                      </div>
                      <div class="relative-ul">
                        <ul id="ul-from-fields" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                  <section data-table-to>
                    <section class="list-search">
                      <div class="md-field">
                        <input type="search" id="field-to-search" data-element-search="to-fields" autocomplete="off" />
                        <label for="field-to-search" class="">Ricerca</label>
                      </div>
                      <div class="relative-ul">
                        <ul id="ul-to-fields" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                </div>
              </section>
            </div>

            <dialog id="dlg-columns" data-x="0" data-y="0" class="medium absolute">
              <section class="dlg-grid">
                <h5 class="title moveable">Definizione campi id/ds</h5>
                <section class="dlg-content col columns-2">
                  <div class="textarea">
                    <textarea id="textarea-column-id-formula" data-mode="field" rows="6" placeholder="ID Formula" autocomplete="off" autofocus="" required="" minlength="1"></textarea>
                  </div>
                  <div class="textarea">
                    <textarea id="textarea-column-ds-formula" data-mode="field" rows="6" placeholder="DS Formula" autocomplete="off" autofocus="" required="" minlength="1"></textarea>
                  </div>
                </section>
                <section class="buttons">
                  <button name="cancel" value="chiudi">Chiudi</button>
                  <button data-fn="saveColumn" id="btn-columns-define" value="salva">Ok</button>
                </section>
              </section>
            </dialog>

            <section class="steps" data-step="1">
              <!--<button type="button" id="prev" class="button-icon material-icons-round md-48" disabled tooltip="Precedente" flow="right">skip_previous</button>-->
              <div class="overflow">
                <div id="stepTranslate" data-translate-x="0">
                  <section class="step" data-step="1" selected>
                    <section class="wrapper-step">
                      <div id="context-menu-table" class="context-menu">
                        <ul id="ul-context-menu-table">
                          <li id="time-dimension" data-fn="handlerTimeDimension">Dimensione TIME</li>
                          <li id="context-custom-metric" data-fn="addCustomMetric">Aggiungi metrica custom</li>
                          <li data-fn="removeTable">Rimuovi</li>
                          <li data-fn="setAliasTable">Alias tabella</li>
                          <li>item 4</li>
                        </ul>
                      </div>
                      <section id="canvas-area">
                        <menu>
                          <section id="workbook-name" class="data-source" contenteditable="true">WorkSpace 1</section>
                          <button data-fn="workBookNew" id="btn-workbook-new" value="Nuovo" disabled>Nuovo</button>
                          <button id="btn-workbook-open" value="open">Apri</button>
                          <button data-fn="workBookClose" id="btn-workbook-close" value="Chiudi" disabled>Chiudi</button>
                          <button id="btn-versioning" value="Versionamento">Versionamento</button>
                        </menu>
                        <div id="translate" class="translate" data-translate-x="0" data-translate-y="0">
                          <svg id="svg" class="dropzone" data-level="0">
                            <defs>
                              <g id="table-struct" class="struct">
                                <rect x="0" y="0" />
                                <image href="{{ asset('/images/grid_on_5C7893_18dp.svg') }}" data-id x="5" y="6" width="18" height="18">
                                </image>
                                <text x="26" y="20" font-family="Barlow" font-size=".85rem" font-weight="normal"></text>
                                <image data-columns-defined="false" href="{{ asset('/images/view_column_black_18dp.svg') }}" x="5" y="35" width="18" height="18"></image>
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
                            <div class="md-field">
                              <input type="search" id="table-search" data-element-search="tables" autocomplete="off" />
                              <label for="tables-search" class="">Ricerca</label>
                            </div>
                            <div class="relative-ul">
                              <ul id="ul-tables" data-search-id="table-search" class="custom-scrollbar"></ul>
                            </div>
                          </section>
                          <section>
                            <button id="btnSearch" class="button-icon material-icons-round md-18">search</button>
                          </section>
                          <section class="table-preview">
                            <menu>
                              <input type="search" id="columns-search-id" placeholder="Ricerca colonne" />
                            </menu>
                            <div class="table-content">
                              <!-- data-search-input : definisce la input che effettua la ricerca di colonne in questa tabella -->
                              <table id="preview-table" data-search-input="columns-search-id">
                                <thead>
                                  <tr></tr>
                                </thead>
                                <tbody></tbody>
                              </table>
                            </div>
                          </section>
                        </section>
                      </section>
                    </section>

                  </section>
                  <section class="step" data-step="2">
                    <section class="wrapper-content">
                      <menu>
                        <section class="buttons-menu">
                          <button type="button" disabled>Aggiungi WorkBook (analisi multifatti)</button>
                          <button type="button" id="btn-sheet-new" data-fn="newSheet" disabled>Nuovo Sheet</button>
                          <button type="button" id="btn-sheet-open" data-fn="openSheetDialog">Apri Sheet</button>
                          <button type="button" id="btn-sheet-save" data-fn="saveSheet">Salva</button>
                        </section>
                        <section class="sheet-title">
                          <div id="sheet-name" data-blur-fn="handlerEditSheetName" contenteditable="true" data-value="Sheet 1">Sheet 1</div>
                        </section>
                      </menu>
                      <section class="wrapper-sheet">
                        <div class="properties">
                          <section id="workbook-objects" data-section-active="2">
                            <p class="field-search">
                              <input id="input-search-workbooks" data-element-search="workbooks" autocomplete="off" type="search" class="input-search" readonly placeholder="WorkBooks" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-workbooks">search</button>
                            </p>
                            <section data-worksheet-object data-section="1">
                              <li data-workbook>workbook 1</li>
                              <li data-workbook>workbook 2</li>
                            </section>
                            <p class="field-search">
                              <input id="input-search-fields" data-element-search="fields" autocomplete="off" type="search" class="input-search" readonly placeholder="Campi" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-fields">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="2">
                              <ul id="nav-fields" class="custom-scrollbar" data-search-id="input-search-fields"></ul>
                              <li class="new-worksheet-object">
                                <i class="material-icons-round md-18 new-object">add</i>
                                <button class="new-object" data-fn="btnColumnNew" type="button" value="Crea Colonna">Crea colonna</button>
                              </li>
                            </section>
                            <p class="field-search">
                              <input id="input-search-metrics" data-element-search="metrics" autocomplete="off" type="search" class="input-search" readonly placeholder="Metriche" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-metrics">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="3">
                              <ul id="ul-metrics" class="custom-scrollbar" data-search-id="input-search-metrics"></ul>
                              <li class="new-worksheet-object">
                                <i class="material-icons-round md-18 new-object">add</i>
                                <button class="new-object" data-fn="btnCompositeMetric" type="button" value="Nuova Metrica">Nuova Metrica</button>
                              </li>
                            </section>
                            <p class="field-search">
                              <input id="input-search-filters" data-element-search="filters" autocomplete="off" type="search" class="input-search" readonly placeholder="Filtri" />
                              <button type="button" class="button-icon material-icons-round md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-filters">search</button>
                            </p>
                            <section data-worksheet-object class="custom-scrollbar" data-section="4">
                              <ul id="ul-filters" class="custom-scrollbar" data-search-id="input-search-filters"></ul>
                              <li class="new-worksheet-object">
                                <i class="material-icons-round md-18 new-object">add</i>
                                <button class="new-object" data-fn="openDialogFilter" type="button" value="crea filtro">nuovo filtro</button>
                              </li>
                            </section>
                          </section>
                        </div>
                        <div class="report-area">
                          <section class="columns-rows">
                            <section class="sheet-elements">
                              <h5>Colonne</h5>
                              <section id="dropzone-columns" class="dropzone columns"></section>
                            </section>
                            <section class="sheet-elements">
                              <h5>Righe</h5>
                              <section id="dropzone-rows" class="dropzone rows"></section>
                            </section>
                          </section>
                          <section class="table-preview">
                            <menu>
                              <input type="search" placeholder="Ricerca colonne" />
                              <button id="btn-sheet-preview" data-fn="createProcess" value="Elabora">Elabora</button>
                            </menu>
                            <div class="table-content">
                              <table id="preview-datamart">
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
                <button id="next">Sheet</button>
              </section>

              <!--<button type="button" id="next" class="button-icon material-icons-round md-48" tooltip="Anteprima report" flow="left">skip_next</button>-->
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
  <script type="text/javascript" src="{{ asset('/js/supportFn.js') }}" async></script>
</body>

</html>
