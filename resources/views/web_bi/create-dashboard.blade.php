<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <meta http-equiv="Cache-Control" content="no-cache,must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Creazione Dashboard</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout.css') }}" /> -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboards.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-create-dashboard.css') }}" />
  <!-- layout temporaneo, verrà eliminato dopo aver aggiunto i css del progetto exampleCollection/gridsystem2/ -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/temp__layout.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/Templates.js') }}"></script>
  <script src="{{ asset('/js/Dashboards.js') }}"></script>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</head>

<body class="antialiased">
  <header>
    <div class="nav-button">
      <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
    </div>
    <h1 class="title">Creazione Dashboard</h1>
  </header>
  <div id="drawer" class="left-sidebar" open>
    <section class="account">
      <h5>user</h5>
      <i class="material-symbols-rounded md-light">person</i>
    </section>

    <nav>
      <a href="{{ route('web_bi.index') }}" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
      <hr />
      <section class="navOverflow">
        <section class="navContent">
          <a href="{{ route('web_bi.workspace') }}" title="Workspace"><i class="material-symbols-rounded">workspaces</i><span>Workspace</span></a>
          <a href="{{ route('web_bi.versioning') }}" title="Versionamento"><i class="material-symbols-rounded white">cloud_sync</i><span>Versionamento</span></a>
          <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded white">dashboard</i><span>Dashboards</span></a>
        </section>
      </section>
      <hr />
      <a href="#" title="Settings"><i class="material-symbols-rounded white">settings</i><span>Impostazioni</span></a>
    </nav>
  </div>

  <template id="template__li">
    <li class="select-list" data-li data-element-search data-label data-searchable="true">
      <span></span>
    </li>
  </template>

  <template id="template__filters">
    <div class="filters draggable">
      <i class="material-symbols-rounded" draggable="true">drag_indicator</i>
      <div></div>
    </div>
  </template>

  <template id="template__filter">
    <!-- <div class="filter-container dropzone">
      <div class="preview-filter" draggable="true"></div>
      <button type="button" data-fn="btnRemoveFilter" class="material-symbols-rounded md-18">delete</button>
    </div> -->
    <div class="filter__container" draggable="true">
      <i class="button-icon material-symbols-rounded md-18">drag_indicator</i>
      <span></span>
      <button type="button" class="button-icon material-symbols-rounded md-18">info</button>
      <!-- <div class="defined_contents"> -->
      <!-- </div> -->
    </div>
  </template>

  <template id="tmpl-thumbnails">
    <section id class="thumb-layout" data-fn="layoutSelected">
      <div class="title"></div>
      <div class="thumbnails"></div>
    </section>
  </template>

  <template id="tmpl-actions-resource">
    <section class="resourceActions">
      <button class="material-symbols-rounded" data-id="" data-popover-id="popover__chartWrappers" data-fn="resourceSettings" disabled>table_chart_view</button>
      <button class="material-symbols-rounded" data-fn="resourceRemove">delete</button>
    </section>
  </template>

  <template id="tmpl__url_params">
    <section class="flex-row">
      <input type="checkbox" id name />
      <label for></label>
      <input type="text" placeholder="Nome parametro" />
    </section>
  </template>

  <main>

    <div id="content" class="grid custom-scrollbar">

      <div id="body" class="raw menu" hidden>

        <div id="popover__chartWrappers" popover>
          <nav data-popover-id="popover__chartWrappers"></nav>
        </div>

        <dialog id="dialog-dashboard-open">
          <section class="dlg-grid">
            <h5 class="title">Apri Dashboard</h5>
            <section class="dlg-content">
              <section class="row">
                <section class="col">
                  <div class="list-search">
                    <input type="search" id="dashboards-search-id" data-element-search="dashboards" autocomplete="off" placeholder="Ricerca Dashboard" />
                    <div class="relative-ul">
                      <ul id="ul-dashboards" data-search-id="dashboards-search-id" class="custom-scrollbar"></ul>
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
        <dialog id="dlg__create_url">
          <section class="dlg-grid">
            <h5 class="title">Aggiungi parametri della url</h5>
            <section class="dlg-content">
              <section class="row">
                <section id="url_params" class="col">
                  <!-- <div id="url"></div> -->
                </section>
              </section>
              <section class="row">
                <section class="col">
                  <div id="url"></div>
                </section>
              </section>
            </section>
            <section class="dlg-buttons">
              <button name="cancel" value="chiudi">Chiudi</button>
              <button id="btn__url_generate" value="chiudi">Genera</button>
            </section>
          </section>
        </dialog>
        <menu class="standard">
          <section>
            <button type="button" class="btn-link default" data-fn="openDashboard" value="Apri">Apri</button>
            <button type="button" id="addLayout" class="btn-link default" data-fn="openDlgTemplateLayout" value="Crea nuova Dashboard">Crea Dashboard</button>
            <button id="btnSave" class="btn-link default" type="button" data-fn="save">Salva</button>
            <button id="btnPublish" type="button" class="btn-buttons" value="Pubblica" data-fn="publish" disabled>Pubblica</button>
            <!-- <button id="btn__create_url" type="button" class="btn-buttons" value="Genera URL" disabled>Genera URL</button> -->
          </section>
          <section>
            <div id="dashboardTitle" class="name" contenteditable="true" data-default-value="Titolo Dashboard" data-mutation-observer="title">Titolo Dashboard</div>
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
        <div class="wrapper menu">
          <dialog id="dlg-chart" class="small">
            <section class="dlg-grid">
              <h5 class="title">Selezione del report</h5>
              <!-- TODO: Aggiungere un sottotilo per tutte le dialog, con tag <p> -->
              <section class="dlg-content col col-1">
                <section class="row">
                  <!-- WorkBooks -->
                  <section class="col col-6-span">
                    <h4>WorkBooks</h4>
                    <section class="list-search">
                      <input type="search" id="workbooks-search-id" data-element-search="workbooks" placeholder="Ricerca" autocomplete="off" />
                      <div class="relative-ul">
                        <ul id="ul-workbooks" data-search-id="workbooks-search-id" class="custom-scrollbar">
                          @foreach($workbooks as $workbook)
                          <li data-li data-element-search="workbooks" class="select-list" data-label="{{ $workbook->name }}" data-searchable="true" data-token="{{ $workbook->token }}" data-fn="workbookSelected">
                            <span>{{ $workbook->name }}</span>
                          </li>
                          @endforeach
                        </ul>
                      </div>
                    </section>
                  </section>
                  <!-- Sheets -->
                  <section class="col col-6-span">
                    <h4>Sheets</h4>
                    <section class="list-search">
                      <input type="search" id="sheets-search-id" data-element-search="sheets" placeholder="Ricerca" autocomplete="off" />
                      <div class="relative-ul">
                        <ul id="ul-sheets" data-search-id="sheets-search-id" class="custom-scrollbar"></ul>
                      </div>
                    </section>

                  </section>

                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button id="btn-chart-save">Salva</button>
              </section>
            </section>
          </dialog>
          <!-- dialog Templates per i layout -->
          <dialog id="dlg-template-layout" class="large">
            <section class="dlg-grid">
              <h5 class="title">Selezione del Layout pagina</h5>
              <section class="dlg-content col col-1 search">
                <input type="search" id="search-templates" placeholder="Ricerca" autocomplete="on" />
                <section id="thumbnails" class="preview-area"></section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="btnTemplateDone" id="btn-template-save">OK</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg__config_dashboardFilters">
            <section class="dlg-grid">
              <h5 class="title">Definizione dei filtri della pagina</h5>
              <section class="dlg-content">
                <section class="row">
                  <section class="col">
                    <span>test</span>
                  </section>
                </section>
                <section class="row">
                  <section class="col col-5-span">
                    <!-- <p>section 1</p> -->
                    <div class="list-search">
                      <!-- <input type="search" id="input-search-metrics-dlg-composite" placeholder="Ricerca" data-element-search="metrics-dlg-composite" class="input-search" autocomplete="off" tabindex="3"> -->
                      <p>Filtri del report</p>
                      <div class="relative-ul">
                        <ul id="filters__sameReport"></ul>
                      </div>
                    </div>
                  </section>
                  <section class="col col-5-span">
                    <p>section 2</p>
                  </section>
                  <section class="col col-2-span">
                    <p>Reports</p>
                  </section>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button id="btn__filterDashboard_done">Salva</button>
              </section>
            </section>
          </dialog>

          <div class="row">
            <div class="card col col-6">
              <h1>Parametri</h1>
              <p>description</p>
              <div class="visual">

                <fieldset>
                  <legend>Parametri Dashboard</legend>

                  <div>
                    <section>
                      <!-- <p>Selezione del Layout (dialog per la visualizzazione delle preview dei layout e scelta del layout)</p> -->
                      <!-- <button type="button" class="btn-link" id="btn-dlg-layout" data-fn="openDlgTemplateLayout">Selezione del Layout</button> -->
                    </section>
                    <p>Opzioni del grafico/Tabella</p>
                  </div>

                  <div>
                    <textarea id="note" name="note" placeholder="Note"></textarea>
                  </div>
                </fieldset>
              </div>
            </div>
            <div class="card col col-6-span">
              <h1>Parametri Utenti/Gruppi</h1>
              <p>description</p>
              <div class="visual">
                <fieldset>
                  <legend>Parametri Utenti/Gruppi</legend>

                  <div>
                    <section>
                      <!-- <p>Selezione del Layout (dialog per la visualizzazione delle preview dei layout e scelta del layout)</p> -->
                      <!-- <button type="button" class="btn-link" id="btn-dlg-layout" data-fn="openDlgTemplateLayout">Selezione del Layout</button> -->
                    </section>
                    <p>Opzioni del grafico/Tabella</p>
                  </div>

                </fieldset>
              </div>

            </div>
          </div>
          <div class="row">
            <div class="col menu">

              <section class="buttons">
                <button id="btnPreview" type="button" data-fn="preview" disabled>Anteprima</button>
              </section>
              <div id="template-layout" class="preview"></div>
            </div>

          </div>

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
  <div class="right-sidebar"></div>
  <footer>
    <section class="footerContent">
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="80" width="80" />
      <p>Lynx International</p>
    </section>
  </footer>
  <script type="text/javascript" src="{{ asset('/js/init-dashboard-create.js') }}"></script>
  <script type="text/javascript" src="{{ asset('/js/dashboard-create-functions.js') }}" defer></script>
  <script type="text/javascript" src="{{ asset('/js/dashboard-create-events.js') }}" defer></script>
</body>

</html>
