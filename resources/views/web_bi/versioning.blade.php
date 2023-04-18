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
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
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

    <li data-li-drag data-filter data-element-search data-label data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="filters-edit" class="material-icons-round md-18">edit</i>
    </li>

    <li data-li-drag data-element-search data-label data-base-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="filters-add" class="material-icons-round md-18">add</i>
    </li>

    <li data-li-drag data-element-search data-label data-advanced-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="metric-edit" class="material-icons-round md-18">edit</i>
    </li>

    <li data-li-drag data-element-search data-label data-composite-metrics data-searchable="true" draggable="true">
      <span class="li-content">
        <i class="material-icons-round md-18">drag_handle</i>
        <span></span>
      </span>
      <i data-id="metric-edit" class="material-icons-round md-18">edit</i>
    </li>
  </template>

  <template id="tmpl-dl-element">
    <dl data-id="dt-hierarchies">
      <dt></dt>
    </dl>
  </template>

  <template id="tmpl-dt">
    <dt data-id="value-icons">
      <div>
        <span data-value></span>
        <span>
          <button data-fn="uploadObject" data-upload="workbook" class="button-icon material-icons-round md-18">upload</button>
          <button data-fn="deleteWorkBook" data-delete class="button-icon material-icons-round md-18">delete</button>
        </span>
      </div>
    </dt>
  </template>

  <template id="tmpl-dd">
    <dd data-id="value-icons">
      <div>
        <span data-value></span>
        <span>
          <button data-fn="uploadObject" data-upload="sheet" class="button-icon material-icons-round md-18">upload</button>
          <button data-fn="deleteSheet" data-delete class="button-icon material-icons-round md-18">delete</button>
        </span>
      </div>
    </dd>
  </template>

  <template id="tmpl-details-element">
    <details data-id="dt-tables">
      <summary></summary>
    </details>
    <li class="new-worksheet-object">
      <i class="material-icons-round md-18 new-object">add</i>
      <button class="new-object" data-fn="btnMetricNew" type="button" value="crea metrica">Metrica Composta</button>
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
            <section class="dlg-grid">
              <h5>Sincronizzazione elementi</h5>
              <section class="dlg-content col">
                <section>
                  <dl id="dl-local-objects"></dl>
                  <dl id="dl-DB-objects"></dl>
                </section>
              </section>
              <section class="buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
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
