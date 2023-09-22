<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Versionamento</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" /> -->
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
      <div class="li-content" data-fn="showResource">
        <i class="material-icons-round md-18" data-sync-status>label</i>
        <div class="li-content-details">
          <span data-value class="text-ellipsis"></span>
        </div>
      </div>
      <!-- <div class="updated_at"> -->
      <!--   <span class="sub-elements">Aggiornato : <span data-updated_at class=" sub-elements"></span></span> -->
      <!-- </div> -->
      <div class="li-buttons">
        <button data-fn="uploadObject" data-upload class="button-icons material-icons-round md-18">upload</button>
        <button data-fn="downloadObject" data-download class="button-icons material-icons-round md-18">download</button>
        <button data-fn="upgradeObject" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
        <button data-fn="deleteObject" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
      </div>
    </li>
  </template>

  <main>
    <div id="drawer">

      <section class="account">
        <i class="material-icons md-light">person</i>
      </section>

      <nav>
        <!-- <a href="{{ url('/mapdb') }}"><i class="material-icons-round md-24">home</i></a> -->
        <section class="icon-vertical-menu">
          <a href="{{ url('/') }}"><i class="material-icons-round md-24">home</i></a>
        </section>
      </nav>

    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>

      <h1 class="title">Sincronizzazione risorse</h1>
    </header>

    <div id="container">
      <div id="content">
        <div id="body">

          <div class="wrapper">
            <section class="wrapper-content">
              <section class="grid-layout">
                <div class="content">
                  <!-- <input id="resource-search" type="search" data-element-search placeholder="Ricerca" autocomplete="on" /> -->
                  <div class="body grid-section-2">
                    <div class="objects" data-local>
                      <div class="details reverse">
                        <section class="placeholder" data-attr="WorkBooks">
                          <div></div>
                          <div class="relative-ul" data-id="workbook" data-type="workbooks">
                            <ul class="elements custom-scrollbar" id="ul-workbook"></ul>
                          </div>
                        </section>
                        <section class="placeholder" data-attr="Sheets">
                          <div></div>
                          <div class="relative-ul custom-scrollbar" data-id="sheet" data-type="sheets">
                            <ul class="elements custom-scrollbar" id="ul-sheet"></ul>
                          </div>
                        </section>
                      </div>
                      <div class="details">
                        <section>
                          <menu>
                            <button id="metric" class="btn-link default" data-fn="selectObject" data-selected>Metriche</button>
                            <button id="filter" class="btn-link default" data-fn="selectObject">Filtri</button>
                          </menu>
                          <div class="relative-ul hideable custom-scrollbar" data-id="metric" data-type="metrics">
                            <ul class="elements custom-scrollbar" id="ul-metric"></ul>
                          </div>
                          <div class="relative-ul hideable custom-scrollbar" data-id="filter" data-type="filters" hidden>
                            <ul class="elements custom-scrollbar" id="ul-filter"></ul>
                          </div>
                        </section>
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
                  <div class="footer">
                    <button name="cancel" value="chiudi">Chiudi</button>
                  </div>
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
  <script type="text/javascript" src="{{ asset('/js/versioning.js') }}" async></script>
</body>

</html>
