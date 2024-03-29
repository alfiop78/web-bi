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
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboard-drawer.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-versioning.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboards.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboard-layout.css') }}" />
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
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>
        <!-- <a href="#" title="Dashboard 1" onclick="App.menuOpen('profile/')"><i class="material-icons md-18">person</i><span>Dashboard 1</span></a> -->

        <!-- <a href="" title="Dashboard 2"><i class="material-icons md-18">settings</i><span>Dashboard 2</span></a> -->
        {{-- {{ dd($dashboards) }} --}}
        @foreach($dashboards as $dashboard)
        <a href="#" data-token="{{ json_decode($dashboard)->token }}">{{ json_decode($dashboard)->name }}</a>
        @endforeach
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
          <!--Div that will hold the dashboard-->
          <!-- <div id="dashboard_div"> -->
          <!--Divs that will hold each control and chart-->
          <!-- <div id="filter_div">
              <div class="filters" id="filter-ubicazione"></div>
              <div class="filters" id="filter-telaio"></div>
            </div>
            <div id="chart_div"></div> -->
          <!-- </div> -->

          <progress id="progress-bar" max="100" value="0"></progress>
          <div id="template-layout" class="layout"></div>

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
