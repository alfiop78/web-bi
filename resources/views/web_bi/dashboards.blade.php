<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Dashboard</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-versioning.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboards.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/Templates.js') }}"></script>
  <script src="{{ asset('/js/Dashboards.js') }}"></script>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
</head>

<body class="antialiased">
  <template id="tmpl-li">
    <li data-li data-element-search data-label data-searchable="true">
      <span></span>
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

      <h1 class="title">Dashboard</h1>
    </header>

    <div id="container">

      <div id="content" class="custom-scrollbar">

        <div id="body" hidden>
          <dialog id="dlg-dashboard-list" class="small">
            <section class="dlg-grid">
              <h5 class="title">Seleziona Dashboard</h5>
              <section class="dlg-content col col-1">
                <section class="list-search">
                  <input type="search" id="" data-element-search="" placeholder="Ricerca" autocomplete="off" />
                  <div class="relative-ul">
                    <ul id="ul-dashboards" data-search-id="" class="custom-scrollbar"></ul>
                  </div>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="annulla">Annulla</button>
              </section>
            </section>
          </dialog>
          <!--Div that will hold the dashboard-->
          <!-- <div id="dashboard_div"> -->
          <!--Divs that will hold each control and chart-->
          <!-- <div id="filter_div">
              <div class="filters" id="filter-ubicazione"></div>
              <div class="filters" id="filter-telaio"></div>
            </div>
            <div id="chart_div"></div> -->
          <!-- </div> -->

          <div id="template-layout"></div>

          <!-- <div class="objects">
            <div id="chart_div"></div>
          </div> -->

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
  <script type="text/javascript" src="{{ asset('/js/init-dashboards.js') }}" async></script>
</body>

</html>
