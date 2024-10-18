<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Versionamento</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout.css') }}" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" /> -->
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
    <li class="checkInput" data-li data-element-search data-label data-searchable="true" data-sync="false">
      <input type="checkbox" />
      <div class="li-content" data-fn="showResource">
        <i class="material-symbols-rounded" data-sync-status>label</i>
        <div class="li-content-details">
          <span data-value class="text-ellipsis"></span>
        </div>
      </div>
    </li>
  </template>
  <header>
    <div class="nav-button">
      <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
    </div>
    <h1 class="title">Sincronizzazione risorse</h1>
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
          <a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded">dashboard_customize</i><span>Creazione Dashboard</span></a>
          <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded">dashboard</i><span>Dashboards</span></a>
        </section>
      </section>
      <hr />
      <a href="#" title="Settings"><i class="material-symbols-rounded">settings</i><span>Impostazioni</span></a>
    </nav>
  </div>

  <main data-database-id="{{session('db_id')}}">

    <div id="content" class="custom-scrollbar">

      <div id="body" class="raw menu" hidden>
        <menu class="standard onlyStatus">
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
          {{-- session()->forget('db_name') --}}
        </menu>
        <div class="wrapper">
          <div class="row autofit">

            <div class="card grid">
              <div class="row">
                <section class="col col-4-span">
                  <h1>WorkBooks</h1>
                </section>
                <section class="col col-7-span">
                  <menu class="allButtons" data-id="workbook" hidden>
                    <button data-fn="uploadAll" data-type="workbook" data-upload class="button-icons material-symbols-rounded">upload</button>
                    <button data-fn="downloadAll" data-type="workbook" data-download class="button-icons material-symbols-rounded">download</button>
                    <button data-fn="upgradeAll" data-type="workbook" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="workbook" data-delete class="button-icons material-symbols-rounded danger">delete</button>
                  </menu>
                </section>
              </div>
              <div class="visual">
                <section class="list-search">
                  <input id="search-workbook" type="search" autocomplete="off" data-search-id="search-workbook" data-element-search="workbook" placeholder="Ricerca" />
                  <div class="relative-ul" data-id="workbook" data-type="workbook">
                    <ul class="elements custom-scrollbar" data-search-id="search-workbook" id="ul-workbook"></ul>
                  </div>
                </section>
              </div>
              <div class="buttons align-center">
                <button type="button" class="btn-link link" data-select-all data-type="workbook">Select All</button>
                <button type="button" class="btn-link link" data-unselect-all data-type="workbook">Unselect All</button>
              </div>
            </div>
            <!-- Sheets -->
            <div class="card grid">
              <div class="row">
                <section class="col col-5-span">
                  <h1>Sheets</h1>
                </section>
                <section class="col col-7-span">
                  <menu class="allButtons" data-id="sheet" hidden>
                    <button data-fn="uploadAll" data-type="sheet" data-upload class="button-icons material-symbols-rounded">upload</button>
                    <button data-fn="downloadAll" data-type="sheet" data-download class="button-icons material-symbols-rounded">download</button>
                    <button data-fn="upgradeAll" data-type="sheet" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="sheet" data-delete class="button-icons material-symbols-rounded danger">delete</button>
                  </menu>
                </section>
              </div>
              <div class="visual">
                <section class="list-search">
                  <input id="search-sheet" type="search" autocomplete="off" data-search-id="search-sheet" data-element-search="sheet" placeholder="Ricerca" />
                  <div class="relative-ul" data-id="sheet" data-type="sheet">
                    <ul class="elements custom-scrollbar" data-search-id="search-sheet" id="ul-sheet"></ul>
                  </div>
                </section>
              </div>
              <div class="buttons align-center">
                <button type="button" class="btn-link link" data-select-all data-type="sheet">Select All</button>
                <button type="button" class="btn-link link" data-unselect-all data-type="sheet">Unselect All</button>
              </div>
            </div>
            <!-- Metriche -->
            <div class="card grid">
              <div class="row">
                <section class="col col-5-span">
                  <h1>Metriche</h1>
                </section>
                <section class="col col-7-span">
                  <menu class="allButtons" data-id="metric" hidden>
                    <button data-fn="uploadAll" data-type="metric" data-upload class="button-icons material-symbols-rounded">upload</button>
                    <button data-fn="downloadAll" data-type="metric" data-download class="button-icons material-symbols-rounded">download</button>
                    <button data-fn="upgradeAll" data-type="metric" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="metric" data-delete class="button-icons material-symbols-rounded danger">delete</button>
                  </menu>
                </section>
              </div>
              <div class="visual">
                <section class="list-search">
                  <input id="search-metric" type="search" autocomplete="off" data-search-id="search-metric" data-element-search="metric" placeholder="Ricerca" />
                  <div class="relative-ul" data-id="metric" data-type="metric">
                    <ul class="elements custom-scrollbar" data-search-id="search-metric" id="ul-metric"></ul>
                  </div>
                </section>
              </div>
              <div class="buttons align-center">
                <button type="button" class="btn-link link" data-select-all data-type="metric">Select All</button>
                <button type="button" class="btn-link link" data-unselect-all data-type="metric">Unselect All</button>
              </div>
            </div>
            <!-- Filtri -->
            <div class="card grid">
              <div class="row">
                <section class="col col-5-span">
                  <h1>Filtri</h1>
                </section>
                <section class="col col-7-span">
                  <menu class="allButtons" data-id="filter" hidden>
                    <button data-fn="uploadAll" data-type="filter" data-upload class="button-icons material-symbols-rounded">upload</button>
                    <button data-fn="downloadAll" data-type="filter" data-download class="button-icons material-symbols-rounded">download</button>
                    <button data-fn="upgradeAll" data-type="filter" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
                    <button data-fn="deleteAll" data-type="filter" data-delete class="button-icons material-symbols-rounded danger">delete</button>
                  </menu>
                </section>
              </div>
              <div class="visual">
                <section class="list-search">
                  <input id="search-filter" type="search" autocomplete="off" data-search-id="search-filter" data-element-search="filter" placeholder="Ricerca" />
                  <div class="relative-ul" data-id="filter" data-type="filter">
                    <ul class="elements custom-scrollbar" data-search-id="search-filter" id="ul-filter"></ul>
                  </div>
                </section>
              </div>
              <div class="buttons align-center">
                <button type="button" class="btn-link link" data-select-all data-type="filter">Select All</button>
                <button type="button" class="btn-link link" data-unselect-all data-type="filter">Unselect All</button>
              </div>

            </div>
          </div>
          <div class="row">
            <section class="col col-12">
              <div class="details">
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
            </section>

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
  <script type="text/javascript" src="{{ asset('/js/versioning.js') }}" async></script>
</body>

</html>
