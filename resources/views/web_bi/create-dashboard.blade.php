<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Creazione Dashboard</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-create-dashboard.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
  <script src="{{ asset('/js/Templates.js') }}"></script>
  <script src="{{ asset('/js/Dashboards.js') }}"></script>
</head>

<body class="antialiased">

  <template id="tmpl-thumbnails">
    <section id class="thumb-layout" data-fn="layoutSelected">
      <div class="title"></div>
      <div class="thumbnails"></div>
    </section>
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

      <h1 class="title">Creazione Dashboard</h1>
    </header>

    <div id="container">

      <div id="content" class="custom-scrollbar">

        <div id="body" hidden>
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
          <dialog id="dlg-sheets">
            <h5>Selezione del/i Report</h5>
          </dialog>
          <fieldset>
            <legend>Parametri Dashboard</legend>
            <input type="text" id="title" placeholder="Titolo" />
            <section>
              <p>Selezione del Layout (dialog per la visualizzazione delle preview dei layout e scelta del layout)</p>
              <button type="button" id="btn-dlg-layout" data-fn="openDlgTemplateLayout">Seleziona Template</button>
            </section>
            <p>Selezione del Report (dialog per la selezione del/i report/s)</p>
            <p>Definizione Colonne</p>
            <p>Definizione Filtri</p>
            <p>Formattazione delle colonne</p>
            <p>Definizione della relazione tra i Filtri</p>
            <p>Definizione delle funzioni di group</p>
            <p>Opzioni del grafico/Tabella</p>
            <textarea id="note" rows="10" cols="60" name="note" placeholder="Note"></textarea>
          </fieldset>
          <section class="buttons">
            <button id="btnPreview" type="button" data-fn="preview">Anteprima</button>
            <button id="btnSave" type="button" data-fn="save">Salva</button>
          </section>
          <section id="dashboard-preview" class="dashboard-preview">
            <div id="template-layout" class="dashboard"></div>
          </section>

        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <!-- <a href="#" id="previous-step" title="Previous step">logout</a> -->
          <button id="mdc-logout" class="button dense raised">HOME</button>
          <div class="spacer"></div>
          <!-- <button id="mdc-home" class="button dense raised" onclick="location.href='home/'">i miei veicoli</button> -->
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

  </main>
  <div class="loader">
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
    </svg>
  </div>
  <script type="text/javascript" src="{{ asset('/js/init-dashboard-create.js') }}" async></script>
</body>

</html>
