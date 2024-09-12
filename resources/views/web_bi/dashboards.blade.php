<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Gaia-BI | Dashboard</title>
  <!-- Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wd-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
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
  <header>
    <div class="nav-button">
      <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
    </div>
    <h1 class="title">Dashboard</h1>
  </header>
  <div id="drawer" class="left-sidebar" open>
    <section class="account">
      <h5>user</h5>
      <i class="material-symbols-rounded">person</i>
    </section>

    <nav>
      <a href="{{ route('web_bi.index') }}" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
      <hr />
      <section class="navOverflow">
        <section class="navContent">
          {{-- {{ dd($dashboards) }} --}}
          @foreach($dashboards as $dashboard)
          <a href="#" data-token="{{ json_decode($dashboard)->token }}">
            <i class="material-symbols-rounded white">dashboard</i><span>{{ json_decode($dashboard)->name }}</span>
          </a>
          @endforeach
        </section>
      </section>
      <hr />
      <a href="#" title="Settings"><i class="material-symbols-rounded white">settings</i><span>Impostazioni</span></a>
    </nav>
  </div>
  <template id="tmpl-actions-resource">
    <section class="resourceActions">
      <button class="material-symbols-rounded" data-fn="resourceSettings">settings</button>
      <button class="material-symbols-rounded" data-fn="resourceRemove">delete</button>
    </section>
  </template>

  <main>
    <div id="content" class="custom-scrollbar">

      <div id="body" hidden>
        <div class="wrapper">
          <!--Div that will hold the dashboard-->
          <!-- <div id="dashboard_div"> -->
          <!--Divs that will hold each control and chart-->
          <!-- <div id="filter_div">
              <div class="filters" id="filter-ubicazione"></div>
              <div class="filters" id="filter-telaio"></div>
            </div>
            <div id="chart_div"></div> -->
          <!-- </div> -->
          <div class="row">
            <div class="col">
              <div id="template-layout" class="view"></div>
              <div class="progressBar">
                <label for="progress-bar" hidden>Record <span id="progress-to"></span>&nbsp;di&nbsp;<span id="progress-total"></span>&nbsp;totali</label>
                <progress id="progress-bar" max="100" value="0">70 %</progress>
              </div>
              <!-- <progress id="progress-bar" max="100" value="0"></progress> -->
            </div>
          </div>

        </div>

      </div>

    </div>
    <div id="console">
      <div id="fabsConsole">
        <i class="material-symbols-rounded">info</i>
        <p></p>
      </div>
    </div>
  </main>
  <div class="loader">
    <svg viewBox="0 0 32 32" width="32" height="32">
      <circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
    </svg>
  </div>
  <div class="right-sidebar">Right Sidebar</div>
  <footer>
    <section class="footerContent">
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="80" width="80" />
      <p>Lynx International</p>
    </section>
  </footer>
  <script type="text/javascript" src="{{ asset('/js/init-dashboards.js') }}" async></script>
</body>

</html>
