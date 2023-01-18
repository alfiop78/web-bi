<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>mapping - new</title>
  <link rel="stylesheet" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/Storage.js') }}"></script>
  <script src="{{ asset('/js/Cube.js') }}"></script>
</head>

<body class="antialiased">

  <!--<dialog id="dlg-tables" class="small grid">
    <h5>Seleziona tabella</h5>
    <section class="steps">
      <section class="overflow">
        <div id="translate" data-step="1">
          <section class="step">
            <h6>Schema</h6>
            <div class="md-field">
              <input type="search" id="schema-search" data-element-search="schemes" autocomplete="off" />
              <label for="schema-search" class="">Ricerca</label>
            </div>
            <ul>
              @foreach($schemes as $schema)
              <li data-schema="{{ $schema['SCHEMA_NAME'] }}" data-fn="handlerSchema">{{ $schema['SCHEMA_NAME'] }}</li>
              @endforeach
            </ul>
          </section>
          <section class="step">
            <h6>Tabelle</h6>
            <div class="md-field">
              <input type="search" id="table-search" data-element-search="tables" autocomplete="off" />
              <label for="tables-search" class="">Ricerca</label>
            </div>
            <div class="relative-ul">
              <ul id="ul-tables" class="custom-scrollbar"></ul>
            </div>
          </section>
        </div>

      </section>


    </section>
    <div class="buttons">
      <button type="button" name="cancel" class="md-button">annulla</button>
      <button id="btn-table-done" data-fn="btnTableDone" type="button" name="done" class="md-button">ok</button>
    </div>
  </dialog>-->

  <dialog id="dlg-tables" class="small grid">
    <h5>Seleziona tabella</h5>
    <section class="dialog-wrapper">
      <section id="dialog-drawer" class="dialog-drawer" open>
        <h6>Schema</h6>
        <div class="md-field">
          <input type="search" id="schema-search" data-element-search="schemes" autocomplete="off" />
          <label for="schema-search" class="">Ricerca</label>
        </div>
        <ul>
          @foreach($schemes as $schema)
          <li data-schema="{{ $schema['SCHEMA_NAME'] }}" data-fn="handlerSchema">{{ $schema['SCHEMA_NAME'] }}</li>
          @endforeach
        </ul>
        <div class="btn-toggle" data-fn="handlerToggleDrawer" data-drawer-id="dialog-drawer">
          <button type="button" id="toggle-cubes-drawer" class="button-icon material-icons-round md-24 md-warning md-pad-2" tooltip="Lista cubi" flow="right">arrow_circle_left</button>
        </div>
      </section>
      <section class="dialog-list">
        <h6>Tabelle</h6>
        <div class="md-field">
          <input type="search" id="table-search" data-element-search="tables" autocomplete="off" />
          <label for="tables-search" class="">Ricerca</label>
        </div>
        <div class="relative-ul">
          <ul id="ul-tables" class="custom-scrollbar"></ul>
        </div>
      </section>
    </section>
    <div class="buttons">
      <button type="button" name="cancel" class="md-button">annulla</button>
      <button id="btn-table-done" data-fn="btnTableDone" type="button" name="done" class="md-button">ok</button>
    </div>
  </dialog>

  <template id="tmpl-li">
    <li data-element-search data-label data-searchable="true"></li>
  </template>

  <main>
    <div id="drawer">

      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>
        <li id="btn-select-schema" class="icon" disabled>
          <i class="material-icons-round md-24">schema</i>
          <span>Seleziona schema</span>
        </li>
        <li id="btn-create-dimension" class="icon">
          <i class="material-icons-round md-24">storage</i>
          <span>Crea dimensione</span>
        </li>
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

          <section class="wrapper">
            <section>
              <h3>Creazione nuova dimensione</h3>
              <section>
                <!--<div class="md-field">
                  <input type="text" data-id="input-hierarchy-name" autocomplete="off" />
                  <label for="input-hierarchy-name" class="">Nome gerarchia</label>
                </div>-->
                <div class="horizontal-timeline">aggiungi gerarchia</div>
                <button id="btn-add-tables" data-fn="handlerAddTables" type="button">Aggiungi tabelle</button>
                <section>
                  <h3>Lista tabelle aggiunte</h3>
                  <div class="card table">
                    <h4>Nome tabella</h4>
                  </div>
                </section>

              </section>

            </section>
            <section id="area">
              <div class="translate-el">
                <p>area</p>
              </div>
            </section>
          </section>

        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <button id="mdc-back" class="button dense raised">home</button>
          <div class="spacer"></div>
          <button id="mdc-report" class="button dense raised">report</button>
          <button id="mdc-mapping" class="button dense raised">Map Database</button>
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
</body>

</html>
