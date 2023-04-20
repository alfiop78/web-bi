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
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" />
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
        <i class="material-icons-round md-18" data-sync-status>storage</i>
        <div class="li-content-details">
          <span data-value class="text-ellipsis"></span>
          <span data-created_at></span>
          <span data-updated_at></span>
          <span data-workbook_ref class="sub-elements text-ellipsis"></span>
        </div>
      </div>
      <div class="li-buttons">
        <button data-fn="uploadObject" data-upload class="button-icons material-icons-round md-18">upload</button>
        <button data-fn="downloadObject" data-download class="button-icons material-icons-round md-18">download</button>
        <button data-fn="upgradeObject" data-upgrade class="button-icons material-icons-round md-18">upgrade</button>
        <button data-fn="deleteObject" data-delete class="button-icons material-icons-round md-18">delete</button>
      </div>
    </li>
  </template>

  <main>
    <div id="drawer">

      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>
        <a href="#" id="mdc-back">home</a>
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

    <div id="container">
      <div id="content">
        <div id="body">

          <div class="wrapper">
            <section class="wrapper-content">
              <section class="grid-layout">
                <div class="content">
                  <div class="header">
                    <h5>Sincronizzazione risorse</h5>
                  </div>
                  <div class="body grid-section-2">
                    <menu>
                      <button id="workbook" data-fn="selectObject" data-selected="true">WorkBooks</button>
                      <button id="sheet" data-fn="selectObject">Sheets</button>
                      <button id="metric" data-fn="selectObject">Metriche</button>
                      <button id="filter" data-fn="selectObject">Filtri</button>
                    </menu>
                    <div class="objects">
                      <ul class="elements" id="ul-workbook" data-type="workbooks"></ul>
                      <ul class="elements" id="ul-sheet" data-type="sheets" hidden></ul>
                      <ul class="elements" id="ul-metric" data-type="metrics" hidden></ul>
                      <ul class="elements" id="ul-filter" data-type="filters" hidden></ul>
                      <div class="details">
                        <section>Dettaglio risorsa</section>
                      </div>
                    </div>
                  </div>
                  <div class="footer">
                    <!-- <button name="cancel" value="chiudi">Chiudi</button> -->
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
