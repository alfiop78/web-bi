<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Workspace</title>
  <!-- TODO: tooltip e loader -->
  <!-- <link rel="stylesheet" href="{{ asset('/css/md-tooltip.css') }}"> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-preview-table.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-mapdb.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-sheet-page.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-table-preview.css') }}" />
  <!-- Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
  <script src="{{ asset('/js/Application.js') }}"></script>
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
  <header>
    <div class="nav-button">
      <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
    </div>
    <h1 class="title">Creazione Data Model</h1>
  </header>
  <div id="drawer" class="left-sidebar">
    <section class="account">
      <h5>user</h5>
      <i class="material-symbols-rounded md-light">person</i>
    </section>

    <nav>
      <a href="{{ route('web_bi.index') }}" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
      <hr />
      <section class="navOverflow">
        <section class="navContent">
          <a href="{{ route('web_bi.versioning') }}" title="Versionamento"><i class="material-symbols-rounded white">cloud_sync</i><span>Versionamento</span></a>
          <a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded white">dashboard_customize</i><span>Creazione Dashboard</span></a>
          <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded white">dashboard</i><span>Dashboards</span></a>
        </section>
      </section>
      <hr />
      <a href="#" title="Settings"><i class="material-symbols-rounded white">settings</i><span>Impostazioni</span></a>
      <!-- <button>
        <a href="#" title="test">
          <i class="material-symbols-rounded">info</i><span>test &lt;button&gt;</span>
        </a>
      </button> -->
    </nav>
  </div>

  <template id="tmpl-li">
    <!-- lista per la selezione di elementi -->
    <li class="select-list" data-element-search data-label data-searchable="true">
      <span></span>
    </li>

    <!-- li con icona 'delete' -->
    <li class="icons-list" data-li-icon data-element-search data-label data-searchable="true">
      <span></span>
      <div>
        <button type="button" data-edit data-fn="editCustomMetric" class="button-icon material-symbols-rounded md-18">edit</button>
        <button type="button" data-delete data-fn="removeWBMetric" class="button-icon material-symbols-rounded md-18">delete</button>
      </div>
    </li>

    <li class="drag-list columns" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18" draggable="true">drag_handle</i>
      <i class="material-symbols-rounded md-18">view_column</i>
      <span></span>
    </li>

    <li class="drag-list filters" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18 md-dimgray" draggable="true">drag_handle</i>
      <i class="material-symbols-rounded md-18">filter_alt</i>
      <span></span>
    </li>

    <li class="drag-list metrics basic" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18 md-dimgray" draggable="true">drag_handle</i>
      <i class="material-symbols-rounded md-18">functions</i>
      <span></span>
    </li>

    <li class="drag-list metrics advanced" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18 md-dimgray" draggable="true">drag_handle</i>
      <i class="material-symbols-rounded md-18">query_stats</i>
      <span></span>
    </li>

    <li class="drag-list metrics composite" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18 md-dimgray" draggable="true">drag_handle</i>
      <i class="material-symbols-rounded md-18">multiline_chart</i>
      <span></span>
    </li>

    <li class="drag-list default" data-element-search data-label data-searchable="true">
      <i class="material-symbols-rounded md-18" draggable="true">drag_handle</i>
      <span></span>
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
          <button data-fn="uploadObject" data-upload="workbook" class="button-icon material-symbols-rounded md-18">upload</button>
          <button data-fn="deleteWorkBook" data-delete class="button-icon material-symbols-rounded md-18">delete</button>
        </span>
      </div>
    </dt>
  </template>

  <template id="tmpl-dd">
    <dd data-id="value-icons">
      <div>
        <span data-value></span>
        <span>
          <button data-fn="uploadObject" data-upload="sheet" class="button-icon material-symbols-rounded md-18">upload</button>
          <button data-fn="deleteSheet" data-delete class="button-icon material-symbols-rounded md-18">delete</button>
        </span>
      </div>
    </dd>
  </template>

  <template id="tmpl-details-element">
    <details data-id="dt-tables">
      <summary></summary>
    </details>
    <li class="new-worksheet-object">
      <i class="material-symbols-rounded md-18 new-object">add</i>
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
      <i class="material-symbols-rounded md-18 filters">filter_alt</i>
      <span></span>
      <button data-token data-fn="removeFilterByAdvMetric" type="button" class="button-icon material-symbols-rounded md-18">delete</button>
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
        <button data-fn="copyToClipboard" data-copy class="material-symbols-rounded md-18">copy</button>
      </div>
      <div class="sql-content"></div>
    </div>
  </template>

  <template id="tmpl-content-div">
    <div></div>
  </template>

  <main data-database-id="{{ session('db_id')}}">


    <template id="tmpl-join-field">
      <div class="join-field" data-fn="handlerJoin" data-active>Campo</div>
    </template>

    <template id="tmpl-columns-defined">
      <div class="column-defined">
        <i class="button-icon material-symbols-rounded md-18">table_rows</i>
        <code contenteditable="true" data-blur-fn="editFieldAlias"></code>
        <button type="button" data-remove class="button-icon material-symbols-rounded md-18 column-defined" data-fn="removeDefinedColumn" data-column-token>delete</button>
        <button type="button" data-undo class="button-icon material-symbols-rounded md-18 column-defined" data-fn="undoDefinedColumn" data-column-token>undo</button>
      </div>
    </template>

    <template id="tmpl-filters-defined">
      <div class="filter-defined">
        <i class="button-icon material-symbols-rounded md-18">filter_alt</i>
        <span class="defined"></span>
        <button type="button" data-remove class="button-icon material-symbols-rounded md-18 filter-defined" data-fn="removeDefinedFilter" data-filter-token>delete</button>
        <button type="button" data-undo class="button-icon material-symbols-rounded md-18 filter-defined" data-fn="undoDefinedFilter" data-filter-token>undo</button>
      </div>
    </template>

    <template id="tmpl-adv-metric">
      <div id="adv-metric-defined" class="metrics">
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
      <div class="metric-defined metrics">
        <!-- <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code><span>(</span><code data-field data-metric-id data-table-alias></code><span>)</span> -->
        <code data-aggregate="" data-metric-id contenteditable="true" data-blur-fn="editAggregate"></code>
        <!-- <span data-field></span> -->
        <code data-field data-token data-value contenteditable="true" data-blur-fn="editMetricName"></code>
        <button type="button" data-remove class="button-icon material-symbols-rounded md-18 metric-defined" data-fn="removeDefinedMetric" data-metric-token>delete</button>
        <button type="button" data-undo class="button-icon material-symbols-rounded md-18 metric-defined" data-fn="undoDefinedMetric" data-metric-token>undo</button>
      </div>
    </template>

    <template id="tmpl-formula">
      <span class="markContent">
        <i class="material-symbols-rounded md-14">cancel</i>
        <mark></mark>
        <small></small>
      </span>
    </template>

    <template id="tmpl-composite-formula">
      <span class="markContent">
        <i class="material-symbols-rounded md-14">cancel</i>
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

    <div id="content" class="grid">
      <div id="body" class="raw menu" data-step="1" hidden>
        <!-- menu workbook -->
        <menu class="standard">
          <section data-workbook-menu>
            <button class="btn-link default" id="btn-workbook-new" value="Nuovo">Nuovo</button>
            <button class="btn-link default" id="btn-workbook-open" value="open">Apri</button>
            <button class="btn-link default" id="btn-time-dimension" value="open">Tabella TIME</button>
            <!-- <button id="btn-workbook-close" value="Chiudi" disabled>Chiudi</button> -->
          </section>
          <section data-workbook-menu>
            <div id="workbook-name" class="name" contenteditable="true" data-default-value="Titolo WorkBook">Titolo WorkBook</div>
          </section>
          <section data-sheet-menu>
            <button class="btn-link default" type="button" id="btn-sheet-new" data-fn="newSheetDialog">Nuovo</button>
            <button class="btn-link default" type="button" id="btn-sheet-open" data-fn="openSheetDialog">Apri</button>
            <button class="btn-link default" type="button" id="btn-sheet-save" data-fn="saveSheet">Salva</button>
          </section>
          <section data-sheet-menu>
            <div id="sheet-name" class="name" contenteditable="true" data-default-value="Titolo Sheet"></div>
          </section>
          <section class="dbStatus">
            {{-- session()->forget('db_name') --}}
            <span id="db-connection-status" data-connected="{{ session('db_id', 0) }}">
              <span id="database-name">{{ session('db_name', 'Nessun Database collegato') }}</span>
              @if (session('db_name'))
              <i id="db-icon-status" class="material-symbols-rounded">database</i>
              @else
              <i id="db-icon-status" class="material-symbols-rounded">database_off</i>
              @endif
            </span>
          </section>
        </menu>

        <dialog id="dlg-schema">
          <section class="dlg-grid">
            <h5 class="">Seleziona schema Database</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <div class="list-search">
                    <input type="search" id="schemata-search-id" data-element-search="schemata" autocomplete="off" placeholder="Ricerca Schema" />
                    <div class="relative-ul">
                      <ul id="ul-schemata" data-search-id="schemata-search-id" class="custom-scrollbar">
                        @php
                        // {{ dump(session('db_driver')); }}
                        @endphp
                        @foreach($schemata as $schema)
                        @switch(session('db_driver'))
                        @case('odbc')
                        <li class="select-list" data-fn="handlerSchema" data-searchable="true" data-element-search="schemata" data-label="{{$schema['SCHEMA_NAME']}}" data-schema="{{$schema['SCHEMA_NAME']}}">{{ $schema['SCHEMA_NAME'] }}</li>
                        @break
                        @case('mysql')
                        <li class="select-list" data-fn="handlerSchema" data-searchable="true" data-element-search="schemata" data-label="{{$schema->Database}}" data-schema="{{$schema->Database}}">{{ $schema->Database }}</li>
                        @break
                        @default
                        <!-- Default case... -->
                        @endswitch
                        @endforeach
                      </ul>
                    </div>
                  </div>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
            </section>
          </section>
        </dialog>

        <dialog id="dialog-rename">
          <section class="dlg-grid">
            <h5 class="title moveable">Alias tabella</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <input type="text" id="table-alias" placeholder="Alias" value="" autocomplete="on" />
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveAliasTable" value="ok">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dialog-new-workbook">
          <section class="dlg-grid">
            <h5 class="title moveable">Titolo WorkBook</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <input type="text" id="input-workbook-name" placeholder="Nome" value="" autocomplete="on" />
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="newWorkBook" value="ok">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dialog-new-sheet">
          <section class="dlg-grid">
            <h5 class="title moveable">Titolo Sheet</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <input type="text" id="input-sheet-name" placeholder="Nome" value="" autocomplete="on" />
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="newSheet" value="ok">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dialog-time" data-x="0" data-y="40" class="mediumSize absolute moveable">
          <section class="dlg-grid">
            <h5 class="title moveable">Imposta relazione con tabella TIME</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col col-6-span">
                  <ul id="time-fields">
                    <!-- TODO: creare qui la struttura delle tabelle TIME con <summary> e <details> -->
                    <li class="select-list content" data-field="id" data-field-ds="year" data-table="WB_YEARS" data-datatype="integer" data-fn="handlerTimeField">YEAR <small>Es.: 2023</small></li>
                    <li class="select-list content" data-field="id" data-field-ds="quarter" data-table="WB_QUARTERS" data-datatype="integer" data-fn="handlerTimeField">QUARTER <small>Es.: 202302</small></li>
                    <li class="select-list content" data-field="id" data-field-ds="month" data-table="WB_MONTHS" data-datatype="integer" data-fn="handlerTimeField">MONTH <small>Es.: 202312</small></li>
                    <!-- <li data-field="week_id" data-datatype="integer" data-fn="handlerTimeField">WEEK <small>Es.: 202312</small></li> -->
                    <li class="select-list content" data-field="id" data-field-ds="date" data-table="WB_DATE" data-datatype="date" data-fn="handlerTimeField">DATE <small>Es.: 2023-12-31</small></li>
                  </ul>
                </section>
                <section class="col col-6-span">
                  <section class="list-search">
                    <input type="search" id="time-column-search" data-element-search="time-column" placeholder="Ricerca colonna" autocomplete="off" />
                    <div class="relative-ul">
                      <ul id="ul-columns" data-search-id="time-column-search" class="custom-scrollbar"></ul>
                    </div>
                  </section>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveTimeDimension" id="btn-time-dimension-save" value="salva">Salva</button>
              <button data-fn="updateTimeDimension" id="btn-time-dimension-update" value="Aggiorna" hidden>Aggiorna</button>
            </section>
          </section>
        </dialog>

        <div id="context-menu" class="context-menu"></div>

        <dialog id="dialog-workbook-open" class="smallSize">
          <section class="dlg-grid">
            <h5 class="title">Apri WorkBook</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <div class="list-search">
                    <input type="search" id="workbooks-search-id" data-element-search="workbooks" autocomplete="off" placeholder="Ricerca WorkBooks" />
                    <div class="relative-ul">
                      <ul id="ul-workbooks" data-search-id="workbooks-search-id" class="custom-scrollbar"></ul>
                    </div>
                  </div>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
            </section>
          </section>
        </dialog>

        <dialog id="dialog-sheet-open" class="smallSize">
          <section class="dlg-grid">
            <h5 class="title">Apertura Sheet</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <div class="list-search">
                    <input type="search" id="sheets-search-id" data-element-search="sheets" autocomplete="off" placeholder="Ricerca Sheets" />
                    <div class="relative-ul">
                      <ul id="ul-sheets" data-search-id="sheets-search-id" class="custom-scrollbar"></ul>
                    </div>
                  </div>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
            </section>
          </section>
        </dialog>

        <!-- creazione metrica filtrata -->
        <dialog id="dlg-metric" data-x="0" data-y="40" class="mediumSize absolute moveable droppable">
          <section class="dlg-grid">
            <h5 class="title moveable">Creazione Metrica avanzata</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col col-4-span">
                  <section id="filter-area-drop">
                    <div class="relative-ul">
                      <ul id="filter-drop" class="custom-scrollbar dropzone"></ul>
                    </div>
                  </section>
                </section>
                <section class="col col-4-span">
                  <section class="input-area">
                    <input type="text" id="input-advanced-metric-name" placeholder="Nome" value="" autocomplete="off" />
                    <div id="input-metric"></div>
                    <div>
                      <input type="checkbox" id="check-distinct" disabled />
                      <label for="check-distinct">DISTINCT</label>
                    </div>
                    <textarea id="advanced-metric-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                  </section>
                </section>
                <section class="col col-4-span">
                  <div class="relative-ul">
                    <dl id="dl-timing-functions" class="custom-scrollbar">
                      <dt class="btn-link">Last Period/Day</dt>
                      <dd>Periodo temporale precedente, rispetto al livello più basso presente nel report.<br /> Ad esempio se nel report è presente il livello giorno, la funzione presenta i dati del giorno precedente, se invece è presente la settimana, presenta i dati della settimana precedente, ecc</dd>

                      <dt class="btn-link">Last Week</dt>
                      <dd>description</dd>

                      <dt data-value="last-month" class="btn-link" data-fn="handlerTimingFunctions" data-table="WB_MONTHS" data-time-field="previous">Last Month</dt>
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

                      <dt class="btn-link" data-value="year-to-month" data-fn="handlerTimingFunctions" data-table="WB_MONTHS" data-time-field="year-to-month">Year To Month</dt>
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
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveAdvancedMeasure" id="btn-metric-save" value="salva">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dlg-composite-metric" data-x="0" data-y="0" class="mediumSize absolute moveable droppable">
          <section class="dlg-grid">
            <h5 class="title moveable">Creazione Metrica Composta</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <section class="textarea-formula">
                    <input type="text" id="composite-metric-name" placeholder="Nome" value="" autocomplete="off" autofocus />
                    <div id="textarea-composite-metric" data-fn="addText" data-content-editable class="dropzone textarea-content"></div>
                    <textarea id="composite-metric-note" row="5" cols="10" disabled placeholder="Note"></textarea>
                  </section>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveCompositeMeasure" id="btn-composite-metric-save" value="salva">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dlg-custom-metric" data-x="0" data-y="40" class="mediumSize absolute moveable">
          <section class="dlg-grid">
            <h5 class="title moveable">Creazione Metrica composta</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col col-4-span">
                  <div class="list-search">
                    <input type="search" id="input-search-custom-metrics" placeholder="Ricerca" data-element-search="custom-metrics" class="input-search" autocomplete="off" tabindex="2">
                    <div class="relative-ul">
                      <ul id="ul-custom-metrics" class="custom-scrollbar" data-search-id="input-search-custom-metrics"></ul>
                    </div>
                  </div>
                </section>
                <section class="col col-8-span">
                  <section class="textarea-formula">
                    <input type="text" id="input-base-custom-metric-name" placeholder="Nome" value="" autocomplete="off" autofocus tabindex="1" />
                    <div id="textarea-custom-metric" data-fn="addText" data-content-editable class="textarea-content placeholder"></div>
                    <textarea id="custom-metric-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                  </section>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveBaseCustomMeasure" id="btn-custom-metric-save" value="salva">Salva</button>
            </section>
          </section>
        </dialog>

        <dialog id="dlg-join" data-x="0" data-y="40" class="absolute moveable">
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
                <button id="btn-add-join" class="btn-link link" data-fn="addJoin" value="Aggiungi Join">Aggiungi join</button>
                <button id="btn-remove-join" class="btn-link link important" data-fn="removeJoin" value="Elimina Join">Elimina join</button>
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

        <dialog id="dlg-sql-info" data-x="0" data-y="40" class="absolute moveable">
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

        <dialog id="dlg-filters" data-x="0" data-y="40" class="mediumSize absolute moveable">
          <section class="dlg-grid">
            <h5 class="title moveable">Creazione Filtro</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col col-4-span">
                  <div class="list-search">
                    <input type="search" id="input-search-columns" placeholder="Ricerca" data-element-search="columns" class="input-search" autocomplete="off" tabindex="2">
                    <div class="relative-ul">
                      <nav id="wbFilters" class="custom-scrollbar" data-search-id="input-search-columns"></nav>
                    </div>
                  </div>
                </section>
                <section class="col col-8-span">
                  <section class="textarea-formula">
                    <input type="text" id="input-filter-name" placeholder="Nome" value="" autocomplete="off" autofocus tabindex="1" />
                    <div class="textarea__container">
                      <div id="popup">
                        <ul>
                          <li>val 1</li>
                          <li>val 2</li>
                        </ul>
                      </div>
                      <div id="textarea-filter" contenteditable="true" spellcheck="false"><br /></div>
                    </div>
                    <textarea id="filter-note" row="5" cols="10" placeholder="Note" disabled></textarea>
                  </section>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button data-fn="saveFilter" id="btn-filter-save" value="salva">Salva</button>
            </section>
          </section>
        </dialog>

        <div class="wrapper">

          <dialog id="dlg-columns" data-x="0" data-y="40" class="absolute moveable">
            <section class="dlg-grid">
              <h5 class="title moveable">Definizione colonne</h5>
              <section class="dlg-content">
                <section class="row">
                  <section class="col col-4-span">
                    <div class="list-search">
                      <input type="search" id="input-search-fields-dc" placeholder="Ricerca" data-element-search="fields" class="input-search" autocomplete="off" autofocus tabindex="1">
                      <div class="relative-ul">
                        <nav id="table-field-list" class="custom-scrollbar" data-search-id="input-search-fields-dc"></nav>
                      </div>
                    </div>
                  </section>
                  <section class="col col-8-span">
                    <section class="textareas">
                      <input type="text" id="column-name" placeholder="Nome" autocomplete="off" tabindex="2">
                      <section class="textarea-column">
                        <div id="textarea-column-id" data-fn="addText" class="textarea-content dropzone" data-content-editable></div>
                      </section>
                      <section class="textarea-column">
                        <div id="textarea-column-ds" data-fn="addText" class="textarea-content dropzone" data-content-editable></div>
                      </section>
                    </section>
                  </section>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveColumn" id="btn-columns-define" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <section id="steps" data-step="1">
            <div class="overflow">
              <div id="stepTranslate">
                <section class="step" data-step="1" selected>
                  <section class="wrapper-step">
                    <div id="context-menu-table" class="context-menu">
                      <ul id="ul-context-menu-table" class="context-menu-items">
                        <button id="addFactJoin" class="btn-link-context" data-fn="handlerAddJoin" disabled>Aggiungi Join</button>
                        <button id="time-dimension" data-fn="handlerTimeDimension" class="btn-link-context">Dimensione TIME</button>
                        <button id="context-custom-metric" data-fn="addCustomMetric" class="btn-link-context">Metrica person.</button>
                        <button data-fn="removeTable" class="btn-link-context">Rimuovi</button>
                        <button data-fn="setAliasTable" class="btn-link-context">Imposta alias</button>
                      </ul>
                    </div>
                    <div id="table-popup" class="popup">
                      <button class="material-symbols-rounded md-18" data-id data-fn="tableSelected">table_rows_narrow</button>
                    </div>
                    <div id="context-menu-column" class="context-menu">
                      <ul id="ul-context-menu-column" class="context-menu-items">
                        <span>Metrica</span>
                        <button id="btn-add-metric" data-fn="saveBaseMeasure" class="btn-link-context">Imposta metrica</button>
                        <button id="btn-remove-wb-metric" data-fn="removeWBMetric" class="btn-link-context">Elimina</button>
                        <span>Colonna</span>
                        <button id="btn-add-column" data-fn="setColumn" class="btn-link-context">Nuova colonna</button>
                        <button id="btn-edit-column" data-fn="editColumn" class="btn-link-context">Modifica</button>
                        <button id="btn-remove-column" data-fn="removeColumn" class="btn-link-context">Elimina</button>
                      </ul>
                    </div>
                    <section id="canvas-area">
                      <section id="svg-console">
                        <span id="message-console"></span>
                      </section>
                      <div id="translate" class="translate" data-translate-x="0" data-translate-y="0">
                        <svg id="svg" class="dropzone" data-level="0">
                          <defs>
                            <g id="table-struct" class="struct">
                              <rect class="table" x="0" y="0" />
                              <text x="32" y="20" font-family="Barlow" font-size=".8rem" font-weight="normal"></text>
                              <rect class="symbol" x="0" y="0" />
                              <image href="{{ asset('/images/table_18dp_1.svg') }}" data-id x="4" y="6" width="18" height="18"></image>
                              <!-- <rect id="startIconsAnimation" x="0" y="0" width="200px" height="60px" fill="transparent" /> -->
                              <!-- <image href="{{ asset('/images/table_18dp_1.svg') }}" data-fn="showTableRows" data-id x="4" y="36" width="18" height="18"> -->
                              <!-- <animate attributeName="y" begin="4s" from="0" to="40" dur="5s" fill="freeze" /> -->
                              <!-- <animate attributeType="XML" attributeName="y" begin="me.click" from="0" to="40" dur="10s" fill="freeze" /> -->
                              <!-- <animate attributeType="XML" attributeName="y" begin="startIconsAnimation.mouseenter" from="6" to="36" dur=".5s" fill="freeze" /> -->
                              <!-- <animate attributeType="XML" attributeName="y" begin="startIconsAnimation.mouseleave" from="36" to="6" dur=".5s" fill="freeze" /> -->
                              <!-- </image> -->
                            </g>
                            <g id="table-struct-fact" class="struct fact">
                              <rect class="table" x="0" y="0" />
                              <text x="32" y="20" font-family="Barlow" font-size=".85rem"></text>
                              <rect class="symbol" x="0" y="0" />
                              <image href="{{ asset('/images/database_18dp_1.svg') }}" data-id x="4" y="6" width="18" height="18"></image>
                              <!-- <text x="12" y="17" font-family="Barlow" font-size=".85rem" font-weight="bold"></text> -->
                            </g>
                            <g id="table-common" class="struct common">
                              <rect class="common" x="6" y="4" />
                              <rect class="sub-common" x="12" y="8" />
                              <rect class="table" x="0" y="0" />
                              <text x="32" y="20" font-family="Barlow" font-size=".85rem" font-style="italic"></text>
                              <rect class="symbol" x="0" y="0" />
                              <image href="{{ asset('/images/layers_black_18dp.svg') }}" data-id x="4" y="6" width="18" height="18"></image>
                            </g>
                            <g id="web-bi-time">
                              <image id="time" href="{{ asset('/images/access_time_filled_865858_18dp.svg') }}" height="18" width="18"></image>
                            </g>
                            <g id="time-dimension">
                              <desc id="WB_YEARS" data-table="WB_YEARS" data-alias="WB_YEARS" data-field="id" data-table-join="WB_QUARTERS" data-schema="decisyon_cache" data-joins="0">wb_years</desc>
                              <desc id="WB_QUARTERS" data-table="WB_QUARTERS" data-alias="WB_QUARTERS" data-join-field="year_id" data-field="id" data-table-join="WB_MONTHS" data-related-join="WB_YEARS" data-schema="decisyon_cache" data-joins="1">wb_quarters</desc>
                              <desc id="WB_MONTHS" data-table="WB_MONTHS" data-alias="WB_MONTHS" data-join-field="quarter_id" data-field="id" data-table-join="WB_DATE" data-related-join="WB_QUARTERS" data-schema="decisyon_cache" data-joins="1">wb_months</desc>
                              <desc id="WB_DATE" data-table="WB_DATE" data-alias="WB_DATE" data-field="id" data-join-field="month_id" data-related-join="WB_MONTHS" data-schema="decisyon_cache" data-joins="1">wb_date</desc>
                            </g>
                            <foreignObject id="btn-join" x="0" y="0" width="26" height="18">
                              <button class="material-symbols-rounded md-18">join_inner</button>
                            </foreignObject>
                          </defs>
                          <!-- <foreignObject x="100" y="150" width="20" height="20">
                              <button class="material-symbols-rounded md-18">edit</button>
                            </foreignObject> -->
                        </svg>
                        <span id="coords"></span>
                      </div>
                    </section>
                    <section class="row">
                      <div class="col col-3 border">
                        <section class="list-search buttonSection">
                          <input type="search" id="table-search" data-element-search="tables" placeholder="Ricerca tabelle" autocomplete="off" />
                          <div class="relative-ul">
                            <ul id="ul-tables" data-search-id="table-search" class="custom-scrollbar"></ul>
                          </div>
                          <button class="btn-link link" id="btnSchemata" disabled="true">Carica Schema</button>
                        </section>
                      </div>
                      <div class="col col-9-span border">
                        <section class="table-preview">
                          <input type="search" id="columns-search-id" autocomplete="off" placeholder="Ricerca colonne" />
                          <div class="table-content">
                            <table id="preview-table" class="custom-scrollbar" data-search-input="columns-search-id"></table>
                          </div>
                        </section>

                      </div>
                    </section>
                  </section>

                </section>
                <section class="step" data-step="2">
                  <section class="wrapper-content">
                    <section id="wrapper-sheet" class="wrapper-sheet">
                      <div id="workbook-content-area">
                        <section id="workbook-objects" data-section-active="2">
                          <p class="field-search">
                            <input id="input-search-fields" data-element-search="elements" autocomplete="off" type="search" class="input-search columns" readonly placeholder="Campi" />
                            <button type="button" class="button-icon material-symbols-rounded md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-fields">search</button>
                          </p>
                          <section data-worksheet-object class="custom-scrollbar" data-section="1">
                            <ul id="nav-fields" class="custom-scrollbar" data-search-id="input-search-fields"></ul>
                            <button class="btn-link link" data-fn="btnColumnNew" type="button" value="Nuova Colonna" disabled>Nuova Colonna</button>
                          </section>
                          <p class="field-search">
                            <input id="input-search-metrics" data-element-search="elements" autocomplete="off" type="search" class="input-search metrics" readonly placeholder="Metriche" />
                            <button type="button" class="button-icon material-symbols-rounded md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-metrics">search</button>
                          </p>
                          <section data-worksheet-object class="custom-scrollbar" data-section="2">
                            <ul id="ul-metrics" class="custom-scrollbar" data-search-id="input-search-metrics"></ul>
                            <button class="btn-link link" data-fn="btnCompositeMetric" type="button" value="Nuova Metrica">Nuova Metrica</button>
                          </section>
                          <p class="field-search">
                            <input id="input-search-filters" data-element-search="filters" autocomplete="off" type="search" class="input-search filters" readonly placeholder="Filtri" />
                            <button type="button" class="button-icon material-symbols-rounded md-18" data-fn="handlerWorkSheetSearch" data-id="input-search-filters">search</button>
                          </p>
                          <section data-worksheet-object class="custom-scrollbar" data-section="3">
                            <ul id="ul-filters" class="custom-scrollbar" data-search-id="input-search-filters"></ul>
                            <button class="btn-link link" data-fn="openDialogFilter" type="button" value="Nuovo Filtro">Nuovo Filtro</button>
                          </section>
                        </section>
                      </div>
                      <div class="report-area">
                        <div class="local-loader" hidden="true">
                          <svg viewBox="0 0 32 32" width="32" height="32">
                            <circle id="local-spinner" cx="16" cy="16" r="14" fill="none"></circle>
                          </svg>
                        </div>

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
                        <section class="sheet-preview">
                          <dialog id="dlg-sheet-config" data-x="0" data-y="0" class="absolute moveable">
                            <section class="dlg-grid">
                              <h5 class="title moveable">Configurazione</h5>
                              <section class="dlg-content">
                                <section class="row">
                                  <section class="col">
                                    <input id="field-label" type="text" value="" placeholder="Etichetta colonna" />
                                  </section>
                                </section>
                                <section class="row">
                                  <section class="col col-5-span">
                                    <div class="field label">
                                      <label for="field-datatype">Tipo di dato</label>
                                      <select id="field-datatype">
                                        <option id="string" value="string">Stringa</option>
                                        <option id="number" value="number">Numero</option>
                                        <option id="date" value="date">Data</option>
                                        <option id="datetime" value="datetime">Date Time</option>
                                        <option id="timeofday" value="timeofday">Time of Day</option>
                                        <option id="boolean" value="boolean">Vero/Falso</option>
                                      </select>
                                    </div>
                                  </section>
                                  <section class="col col-5-span">
                                    <div class="field label">
                                      <label for="field-format">Formattazione</label>
                                      <select id="field-format">
                                        <option value="default" selected>Default</option>
                                        <option value="currency">Valuta €</option>
                                        <option value="percent">Percentuale</option>
                                      </select>
                                    </div>
                                  </section>
                                  <section class="col col-2-span">
                                    <div class="field label">
                                      <label for="frationDigits">Decimali</label>
                                      <input id="frationDigits" type="number" value="2" />
                                    </div>
                                  </section>
                                </section>
                                <section class="row">
                                  <section class="col">
                                    <div class="field hr">
                                      <input type="checkbox" id="filter-column" name="filter-column" />
                                      <label for="filter-column">Imposta filtro Dashboard</label>
                                    </div>
                                  </section>
                                </section>

                              </section>
                              <section class="dlg-buttons">
                                <button name="cancel" value="chiudi">Chiudi</button>
                                <button id="btn-column-save">Salva</button>
                                <!-- <button data-fn="btnSaveColumn" id="btn-column-save">Ok</button> -->
                              </section>
                            </section>
                          </dialog>

                          <div class="table-content columnsHandler">
                            <div class="relative-ul" id="column-handler">
                              <ul id="ul-columns-handler" class="custom-scrollbar"></ul>
                            </div>
                            <section id="datatable">
                              <table id="preview-datamart"></table>
                            </section>
                          </div>
                        </section>
                        <div class="progressBar">
                          <label for="progress-bar" hidden>Record <span id="progress-to"></span>&nbsp;di&nbsp;<span id="progress-total"></span>&nbsp;totali</label>
                          <progress id="progress-bar" max="100" value="0">70 %</progress>
                        </div>
                      </div>
                    </section>
                  </section>
                </section>
              </div>
              <section class="actions">
                <button id="workbook" class="btn-buttons">Workbook</button>
                <div>
                  <button id="sheet" class="btn-buttons">Sheet</button>
                  <button id="btn-sql-preview" class="btn-buttons" data-fn="createProcess" value="SQL" disabled>SQL</button>
                  <button id="btn-sheet-preview" class="btn-buttons important" data-fn="createProcess" value="Elabora">Elabora</button>
                </div>
              </section>

            </div>
          </section>

        </div>

      </div>

    </div>
    <div id="console">
      <div id="fabsConsole">
        <i class="material-symbols-rounded">info</i>
        <p></p>
      </div>
    </div>
  </main>
  <div class="loader">
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
    </svg>
  </div>
  <div id="boxInfo" class="right-sidebar">
    <button type="button" id="btnShowInfo" class="material-symbols-rounded">multiple_stop</button>
    <div id="info" class="informations none">
      <div id="info__name" class="info" hidden>
        <!-- <button id="btnCopyText__name" type="button" class="material-symbols-rounded">content_copy</button> -->
        <span>Nome</span>
        <p id="info__name_content"></p>
      </div>
      <div id="info__token" class="info" hidden>
        <!-- <button id="btnCopyText__token" type="button" class="material-symbols-rounded">content_copy</button> -->
        <span>ObjectID</span>
        <p id="info__token_content"></p>
      </div>
      <div id="info__datamart_id" class="info" hidden>
        <!-- <button id="btnCopyText__id" type="button" class="material-symbols-rounded">content_copy</button> -->
        <span>Report Id</span>
        <p id="info__datamart_id_content"></p>
      </div>
      <div id="info__created_at" class="info" hidden>
        <!-- <button id="btnCopyText__id" type="button" class="material-symbols-rounded">content_copy</button> -->
        <span>Data creazione</span>
        <p id="info__created_at_content"></p>
      </div>
      <div id="info__updated_at" class="info" hidden>
        <!-- <button id="btnCopyText__id" type="button" class="material-symbols-rounded">content_copy</button> -->
        <span>Data aggiornamento</span>
        <p id="info__updated_at_content"></p>
      </div>
    </div>
  </div>
  <footer>
    <section class="footerContent">
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="48" width="48" />
      <p>Lynx International</p>
    </section>
  </footer>
  <script type="text/javascript" src="{{ asset('/js/init-responsive.js') }}" async></script>
  <!-- init-map-loaded ci sono funzioni dopo aver completato il DOMContentLoaded -->
  <script type="text/javascript" src="{{ asset('/js/init-map-loaded.js') }}" async></script>
  <script type="text/javascript" src="{{ asset('/js/init-sheet.js') }}" async></script>
  <script type="text/javascript" src="{{ asset('/js/supportFn.js') }}" async></script>
</body>

</html>
