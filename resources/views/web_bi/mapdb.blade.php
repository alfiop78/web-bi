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

  <template id="tmpl-li">
    <li data-element-search data-label data-searchable="true"></li>
    <li data-element-search data-label data-searchable="true" draggable="true"></li>
  </template>

  <template id="tmpl-hierarchies">
    <div class="hierarchy" data-translate-x="0">
      <div class="card-table" data-translate-x="0">area</div>
    </div>
  </template>

  <template id="tmpl-card-table">
    <div data-id="card-struct">
      <section class="card">
        <div class="card-table" data-translate-x="0">table</div>
        <div class="card-area" data-translate-x="0">table 2</div>
      </section>
      <canvas id="canvas" width="200" height="350"></canvas>
      <section class="card">
        <div class="card-area" data-translate-x="0">table</div>
      </section>
    </div>
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
              </section>

            </section>
            <section id="canvas-area">
              <!--<svg width="190" height="160" xmlns="http://www.w3.org/2000/svg">
                <path d="M 10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent" />
                <path d="M 70 10 C 70 20, 110 20, 110 10" stroke="black" fill="transparent" />
                <path d="M 130 10 C 120 20, 180 20, 170 10" stroke="black" fill="transparent" />
                <path d="M 10 60 C 20 80, 40 80, 50 60" stroke="black" fill="transparent" />
                <path d="M 70 60 C 70 80, 110 80, 110 60" stroke="black" fill="transparent" />
                <path d="M 130 60 C 120 80, 180 80, 170 60" stroke="black" fill="transparent" />
                <path d="M 10 110 C 20 140, 40 140, 50 110" stroke="black" fill="transparent" />
                <path d="M 70 110 C 70 140, 110 140, 110 110" stroke="black" fill="transparent" />
                <path d="M 130 110 C 120 140, 180 140, 170 110" stroke="black" fill="transparent" />
              </svg>-->
              <div id="translate" class="translate" data-translate-x="0">
                <svg id="svg">
                  <line id="line-1" x1="50" y1="54" x2="60" y2="54" stroke="red" />
                </svg>
                <!--<canvas id="canvas-1"></canvas>-->
                <div class="hierarchy" id="h">
                  <div data-id="card-struct" data-fn="handlerAddTable">
                    <section class="card" data-id="1">
                      <div class="card-area" data-translate-x="0">
                        <div class="table dropzone">
                          <span>table</span>
                          <section class="material-icons-round md-18" data-join>join_inner</section>
                        </div>
                      </div>
                    </section>
                    <!--<section class="card">
                      <div class="card-area" data-translate-x="0">
                        <div class="table">
                          <span>table name</span>
                        </div>
                      </div>
                    </section>-->
                  </div>
                </div>

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
                <button type="button" id="test" data-fn="handlerTest">TEST</button>
              </section>
            </section>
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
