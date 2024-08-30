<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Versionamento</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-versioning.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
</head>

<body class="antialiased">

  <template id="tmpl-li">
    <li data-li data-element-search data-label data-searchable="true" data-sync="false">
      <input type="checkbox" />
      <div class="li-content" data-fn="showResource">
        <i class="material-symbols-rounded md-18" data-sync-status>label</i>
        <div class="li-content-details">
          <span data-value class="text-ellipsis"></span>
        </div>
      </div>
      <div class="li-buttons">
        <button data-fn="uploadObject" data-upload class="button-icons material-symbols-rounded md-18">upload</button>
        <button data-fn="downloadObject" data-download class="button-icons material-symbols-rounded md-18">download</button>
        <button data-fn="upgradeObject" data-upgrade class="button-icons material-symbols-rounded md-18 danger">upgrade</button>
        <button data-fn="deleteObject" data-delete class="button-icons material-symbols-rounded md-18 danger">delete</button>
      </div>
    </li>
  </template>

  <main>
    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-symbols-rounded white">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
      </div>
      <h1 class="title">Sincronizzazione risorse</h1>
    </header>
    <div id="drawer">
      <section class="account">
        <h5>user</h5>
        <i class="material-symbols-rounded md-light">person</i>
      </section>

      <nav>
        {{-- session()->forget('db_name') --}}
        <a href="#" title="Database selected">
          @if (session('db_name'))
          <i id="db-icon-status" class="material-symbols-rounded done">database</i>
          @else
          <!-- dump('sessione non impostata') -->
          <i id="db-icon-status" class="material-symbols-rounded error">database_off</i>
          @endif
          <span id="database-name">{{ session('db_name', 'Database non impostato') }}</span>
        </a>
        <hr />
        <a href="{{ route('web_bi.index') }}" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
        <a href="{{ route('web_bi.mapdb') }}" title="Workspace"><i class="material-symbols-rounded">workspaces</i><span>Workspace</span></a>
        <a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded">dashboard_customize</i><span>Creazione Dashboard</span></a>
        <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded">dashboard</i><span>Dashboards</span></a>
        <hr />
        <a href="#" title="Settings"><i class="material-symbols-rounded">settings</i><span>Impostazioni</span></a>
      </nav>
    </div>

    <div id="container">

      <div id="content" class="custom-scrollbar">

        <div id="body" hidden>
          <div class="wrapper">

            <div class="objects">

              <div class="details">
                <section class="placeholder" data-attr="WorkBooks">
                  <menu class="allButtons" data-id="workbook" hidden>
                    <button data-fn="uploadAll" data-type="workbook" data-upload class="button-icons material-symbols-rounded md-18">upload</button>
                    <button data-fn="downloadAll" data-type="workbook" data-download class="button-icons material-symbols-rounded md-18">download</button>
                    <button data-fn="upgradeAll" data-type="workbook" data-upgrade class="button-icons material-symbols-rounded md-18 danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="workbook" data-delete class="button-icons material-symbols-rounded md-18 danger">delete</button>
                  </menu>
                  <input id="search-workbook" type="search" autocomplete="off" data-search-id="search-workbook" data-element-search="workbook" placeholder="Ricerca" />
                  <div class="relative-ul" data-id="workbook" data-type="workbook">
                    <ul class="elements custom-scrollbar" data-search-id="search-workbook" id="ul-workbook"></ul>
                  </div>
                  <section class="hideableButtons">
                    <button type="button" class="btn-link default" data-select-all data-type="workbook">Select All</button>
                    <button type="button" class="btn-link default" data-unselect-all data-type="workbook">Unselect All</button>
                  </section>
                </section>
              </div>

              <div class="details">
                <section class="placeholder" data-attr="Sheets">
                  <menu class="allButtons" data-id="sheet" hidden>
                    <button data-fn="uploadAll" data-type="sheet" data-upload class="button-icons material-symbols-rounded md-18">upload</button>
                    <button data-fn="downloadAll" data-type="sheet" data-download class="button-icons material-symbols-rounded md-18">download</button>
                    <button data-fn="upgradeAll" data-type="sheet" data-upgrade class="button-icons material-symbols-rounded md-18 danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="sheet" data-delete class="button-icons material-symbols-rounded md-18 danger">delete</button>
                  </menu>
                  <input id="search-sheet" type="search" autocomplete="off" data-search-id="search-sheet" data-element-search="sheet" placeholder="Ricerca" />
                  <div class="relative-ul custom-scrollbar" data-id="sheet" data-type="sheet">
                    <ul class="elements custom-scrollbar" data-search-id="search-sheet" id="ul-sheet"></ul>
                  </div>
                  <section class="hideableButtons">
                    <button type="button" class="btn-link default" data-select-all data-type="sheet">Select All</button>
                    <button type="button" class="btn-link default" data-unselect-all data-type="sheet">Unselect All</button>
                  </section>
                </section>

              </div>
              <div class="details menu">
                <menu>
                  <button id="metric" class="btn-link default" data-fn="selectObject" data-selected>Metriche</button>
                  <button id="filter" class="btn-link default" data-fn="selectObject">Filtri</button>
                </menu>

                <section data-id="metric" class="placeholder" data-attr="Metriche">
                  <menu class="allButtons" data-id="metric" hidden>
                    <button data-fn="uploadAll" data-type="metric" data-upload class="button-icons material-symbols-rounded md-18">upload</button>
                    <button data-fn="downloadAll" data-type="metric" data-download class="button-icons material-symbols-rounded md-18">download</button>
                    <button data-fn="upgradeAll" data-type="metric" data-upgrade class="button-icons material-symbols-rounded md-18 danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="metric" data-delete class="button-icons material-symbols-rounded md-18 danger">delete</button>
                  </menu>
                  <input id="search-metric" type="search" autocomplete="off" data-search-id="search-metric" data-element-search="metric" placeholder="Ricerca" />
                  <div class="relative-ul custom-scrollbar" data-id="metric" data-type="metric">
                    <ul class="elements custom-scrollbar" data-search-id="search-metric" id="ul-metric"></ul>
                  </div>
                  <section class="hideableButtons">
                    <button type="button" class="btn-link default" data-select-all data-type="metric">Select All</button>
                    <button type="button" class="btn-link default" data-unselect-all data-type="metric">Unselect All</button>
                  </section>
                </section>

                <section data-id="filter" hidden class="placeholder" data-attr="Filtri">
                  <menu class="allButtons" data-id="filter" hidden>
                    <button data-fn="uploadAll" data-type="filter" data-upload class="button-icons material-symbols-rounded md-18">upload</button>
                    <button data-fn="downloadAll" data-type="filter" data-download class="button-icons material-symbols-rounded md-18">download</button>
                    <button data-fn="upgradeAll" data-type="filter" data-upgrade class="button-icons material-symbols-rounded md-18 danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="filter" data-delete class="button-icons material-symbols-rounded md-18 danger">delete</button>
                  </menu>
                  <input id="search-filter" type="search" autocomplete="off" data-search-id="search-filter" data-element-search="filter" placeholder="Ricerca" />
                  <div class="relative-ul custom-scrollbar" data-id="filter" data-type="filter">
                    <ul class="elements custom-scrollbar" data-search-id="search-filter" id="ul-filter"></ul>
                  </div>
                  <section class="hideableButtons">
                    <button type="button" class="btn-link default" data-select-all data-type="filter">Select All</button>
                    <button type="button" class="btn-link default" data-unselect-all data-type="filter">Unselect All</button>
                  </section>
                </section>

              </div>


              <section id="info-resource" class="placeholder" data-attr="Dettaglio risorsa">
                <section id="info">
                  <div id="created_at" class="item-resources">
                    <span>Data Creazione</span>
                    <span data-value></span>
                  </div>
                  <div id="updated_at" class="item-resources">
                    <span>Data aggiorn.</span>
                    <span data-value></span>
                  </div>
                  <div id="note" class="item-resources">
                    <span>Note</span>
                    <span data-value></span>
                  </div>
                </section>
              </section>
            </div>
          </div>


        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <!-- <a href="#" id="previous-step" title="Previous step">logout</a> -->
          <!-- <button id="mdc-logout" class="button dense raised">HOME</button> -->
          <div class="spacer"></div>
          <!-- <button id="mdc-home" class="button dense raised" onclick="location.href='home/'">i miei veicoli</button> -->
          <!-- <a href="#" id="next-step" title="Next step">i miei veicoli</a> -->
          <!-- <i class="material-icons md-circle md-right md-24" onclick="">navigate_before</i> -->
          <!-- <a href="/" id="done" hidden="" title="Codelab complete">Done</a> -->
        </div>
      </div>

      <div id="console">
        <div id="fabsConsole">
          <i class="material-symbols-rounded md-18">info</i>
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
  <script type="text/javascript" src="{{ asset('/js/versioning.js') }}" async></script>
</body>

</html>
