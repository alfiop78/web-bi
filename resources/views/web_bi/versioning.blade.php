<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Versionamento</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
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
        <i class="material-icons-round md-18" data-sync-status>label</i>
        <div class="li-content-details">
          <span data-value class="text-ellipsis"></span>
        </div>
      </div>
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

      <div id="content" class="custom-scrollbar">

        <div id="body" hidden>

          <div class="objects">

            <div class="details">
              <section class="placeholder" data-attr="WorkBooks">
                <menu class="allButtons" data-id="workbook" hidden>
                  <button data-fn="uploadAll" data-type="workbook" data-upload class="button-icons material-icons-round md-18">upload</button>
                  <button data-fn="downloadAll" data-type="workbook" data-download class="button-icons material-icons-round md-18">download</button>
                  <button data-fn="upgradeAll" data-type="workbook" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                  <button data-fn="deleteAll" data-type="workbook" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                </menu>
                <div class="relative-ul" data-id="workbook" data-type="workbooks">
                  <ul class="elements custom-scrollbar" id="ul-workbook"></ul>
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
                  <button data-fn="uploadAll" data-type="sheet" data-upload class="button-icons material-icons-round md-18">upload</button>
                  <button data-fn="downloadAll" data-type="sheet" data-download class="button-icons material-icons-round md-18">download</button>
                  <button data-fn="upgradeAll" data-type="sheet" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                  <button data-fn="deleteAll" data-type="sheet" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                </menu>
                <div class="relative-ul custom-scrollbar" data-id="sheet" data-type="sheets">
                  <ul class="elements custom-scrollbar" id="ul-sheet"></ul>
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
                  <button data-fn="uploadAll" data-type="metric" data-upload class="button-icons material-icons-round md-18">upload</button>
                  <button data-fn="downloadAll" data-type="metric" data-download class="button-icons material-icons-round md-18">download</button>
                  <button data-fn="upgradeAll" data-type="metric" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                  <button data-fn="deleteAll" data-type="metric" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                </menu>
                <div class="relative-ul custom-scrollbar" data-id="metric" data-type="metrics">
                  <ul class="elements custom-scrollbar" id="ul-metric"></ul>
                </div>
                <section class="hideableButtons">
                  <button type="button" class="btn-link default" data-select-all data-type="metric">Select All</button>
                  <button type="button" class="btn-link default" data-unselect-all data-type="metric">Unselect All</button>
                </section>
              </section>

              <section data-id="filter" hidden class="placeholder" data-attr="Filtri">
                <menu class="allButtons" data-id="filter" hidden>
                  <button data-fn="uploadAll" data-type="filter" data-upload class="button-icons material-icons-round md-18">upload</button>
                  <button data-fn="downloadAll" data-type="filter" data-download class="button-icons material-icons-round md-18">download</button>
                  <button data-fn="upgradeAll" data-type="filter" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                  <button data-fn="deleteAll" data-type="filter" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                </menu>
                <div class="relative-ul custom-scrollbar" data-id="filter" data-type="filters">
                  <ul class="elements custom-scrollbar" id="ul-filter"></ul>
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

      <div id="controls">
        <div id="fabs">
          <!-- <a href="#" id="previous-step" title="Previous step">logout</a> -->
          <button id="mdc-logout" class="button dense raised">logout</button>
          <div class="spacer"></div>
          <button id="mdc-home" class="button dense raised" onclick="location.href='home/'">i miei veicoli</button>
          <!-- <a href="#" id="next-step" title="Next step">i miei veicoli</a> -->
          <!-- <i class="material-icons md-circle md-right md-24" onclick="">navigate_before</i> -->
          <!-- <a href="/" id="done" hidden="" title="Codelab complete">Done</a> -->
        </div>
      </div>

      <div id="console">
        <div id="fabsConsole">
          <i class="material-icons md-18">info</i>
          <p></p>
        </div>
      </div>
    </div>

    <!-- <div id="container">
      <div id="content">
        <div id="body">

          <div class="wrapper">
            <section class="wrapper-content">
              <section class="grid-layout">
                <div class="content">
                  <div class="body grid-section-2">
                    <div class="objects" data-local>
                      <div class="details reverse">
                        <section class="placeholder" data-attr="WorkBooks">
                          <menu class="allButtons" data-id="workbook" hidden>
                            <button data-fn="uploadAll" data-upload class="button-icons material-icons-round md-18">upload</button>
                            <button data-fn="downloadAll" data-download class="button-icons material-icons-round md-18">download</button>
                            <button data-fn="upgradeAll" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                            <button data-fn="deleteAll" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                          </menu>
                          <div class="relative-ul" data-id="workbook" data-type="workbooks">
                            <ul class="elements custom-scrollbar" id="ul-workbook"></ul>
                          </div>
                          <section class="hideableButtons">
                            <button type="button" class="btn-link default" data-select-all data-type="workbook">Select All</button>
                            <button type="button" class="btn-link default" data-unselect-all data-type="workbook">Unselect All</button>
                          </section>
                        </section>
                        <section class="placeholder" data-attr="Sheets">
                          <menu class="allButtons" data-id="sheet" hidden>
                            <button data-fn="uploadAll" data-upload class="button-icons material-icons-round md-18">upload</button>
                            <button data-fn="downloadAll" data-download class="button-icons material-icons-round md-18">download</button>
                            <button data-fn="upgradeAll" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                            <button data-fn="deleteAll" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                          </menu>
                          <div class="relative-ul custom-scrollbar" data-id="sheet" data-type="sheets">
                            <ul class="elements custom-scrollbar" id="ul-sheet"></ul>
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
                            <button data-fn="uploadAll" data-upload class="button-icons material-icons-round md-18">upload</button>
                            <button data-fn="downloadAll" data-download class="button-icons material-icons-round md-18">download</button>
                            <button data-fn="upgradeAll" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                            <button data-fn="deleteAll" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                          </menu>
                          <div class="relative-ul custom-scrollbar" data-id="metric" data-type="metrics">
                            <ul class="elements custom-scrollbar" id="ul-metric"></ul>
                          </div>
                          <section class="hideableButtons">
                            <button type="button" class="btn-link default" data-select-all data-type="metric">Select All</button>
                            <button type="button" class="btn-link default" data-unselect-all data-type="metric">Unselect All</button>
                          </section>
                        </section>
                        <section data-id="filter" hidden class="placeholder" data-attr="Filtri">
                          <menu class="allButtons" data-id="filter" hidden>
                            <button data-fn="uploadAll" data-upload class="button-icons material-icons-round md-18">upload</button>
                            <button data-fn="downloadAll" data-download class="button-icons material-icons-round md-18">download</button>
                            <button data-fn="upgradeAll" data-upgrade class="button-icons material-icons-round md-18 danger">upgrade</button>
                            <button data-fn="deleteAll" data-delete class="button-icons material-icons-round md-18 danger">delete</button>
                          </menu>
                          <div class="relative-ul custom-scrollbar" data-id="filter" data-type="filters">
                            <ul class="elements custom-scrollbar" id="ul-filter"></ul>
                          </div>
                          <section class="hideableButtons">
                            <button type="button" class="btn-link default" data-select-all data-type="filter">Select All</button>
                            <button type="button" class="btn-link default" data-unselect-all data-type="filter">Unselect All</button>
                          </section>
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
        </div>
      </div>

      <div id="console">
        <div id="fabsConsole">
          <i class="material-icons md-18">info</i>
          <p></p>
        </div>
      </div>

    </div> -->
  </main>
  <div class="loader">
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
    </svg>
  </div>
  <script type="text/javascript" src="{{ asset('/js/versioning.js') }}" async></script>
</body>

</html>
