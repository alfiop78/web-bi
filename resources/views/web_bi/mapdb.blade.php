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
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-mapdb.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/Storage.js') }}"></script>
  <script src="{{ asset('/js/Cube.js') }}"></script>
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

    <template id="tmpl-join-field">
      <div class="join-field" data-active></div>
    </template>

    <div id="container">
      <div id="content">
        <div id="body">
          <div class="wrapper-steps">
            <div id="window-join" data-x="0" data-y="0" data-open="false">
              <section class="wj-content">
                <section class="wj-title">
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

            <section class="wrapper">
              <section id="canvas-area">
                <div id="translate" class="translate" data-translate-x="0" data-translate-y="0">
                  <svg id="svg" class="dropzone" data-level="0">
                    <defs>
                      <g id="table-struct" class="struct">
                        <rect x="0" y="0" />
                        <text x="18" y="20" font-family="Barlow" font-size=".85rem" font-weight="normal"></text>
                        <image id="backspace" href="{{ asset('/images/backspace.svg') }}" data-id data-fn="removeTable" x="152" y="0" width="18" height="18">
                        </image>
                      </g>
                    </defs>
                  </svg>
                  <span id="coords"></span>
                </div>
              </section>
              <section id="tables-area">
                <section class="table-area-wrapper">
                  <nav id="schema-drawer" class="nav-drawer">
                    <section>
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
                    <button type="button" id="btn-open-schema-drawer" data-drawer-id="schema-drawer" data-fn="handlerToggleDrawer" value="Schema">Schema</button>
                  </nav>
                  <section class="list-search">
                    <div class="md-field">
                      <input type="search" id="table-search" data-element-search="tables" autocomplete="off" />
                      <label for="tables-search" class="">Ricerca</label>
                    </div>
                    <div class="relative-ul">
                      <ul id="ul-tables" class="custom-scrollbar"></ul>
                    </div>
                  </section>
                  <section>preview table</section>
                </section>
              </section>
            </section>

          </div>

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
