<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <meta http-equiv="Cache-Control" content="no-cache,must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <link rel="manifest" href="/sw/manifest.json">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>Web-BI | HOME</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <!-- script per serviceWorker -->
  <script src="{{ asset('/sw/registration.js') }}"></script>
  <!-- Fonts -->
  <!-- <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@100;200;400;500;600&display=swap" rel="stylesheet" /> -->
  <!-- Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
</head>

<body class="antialiased">
  <header>
    <div class="nav-button">
      <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
    </div>
    <h1 class="title">Gaia-BI</h1>
  </header>
  <div id="drawer" class="left-sidebar" open>
    <section class="account">
      <h5>user</h5>
      <i class="material-symbols-rounded md-light">person</i>
    </section>

    <nav>
      <a href="#" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
      <hr />
      <section class="navOverflow">
        <section class="navContent">
          <a href="{{ route('web_bi.workspace') }}" title="Workspace"><i class="material-symbols-rounded">workspaces</i><span>Workspace</span></a>
          <a href="{{ route('web_bi.versioning') }}" title="Versionamento"><i class="material-symbols-rounded">cloud_sync</i><span>Versionamento</span></a>
          <a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded">dashboard_customize</i><span>Creazione Dashboard</span></a>
          <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded">dashboard</i><span>Dashboards</span></a>
        </section>
      </section>
      <hr />
      <a href="#" title="Settings"><i class="material-symbols-rounded">settings</i><span>Impostazioni</span></a>
    </nav>
  </div>
  <main>
    <div id="content">
      <div id="body" class="raw menu" hidden>
        <menu class="standard onlyStatus">
          <section class="dbStatus">
            {{-- session()->forget('db_name') --}}
            <span id="db-connection-status" data-connected="{{ session('db_id', 0) }}">
              <span id="database-name">{{ session('db_name', 'Nessun Database collegato') }}</span>
              @if (session('db_name'))
              <i id="db-icon-status" class="material-symbols-rounded">database</i>
              @else
              <i id="db-icon-status" class="material-symbols-rounded">database_off</i>
              @endif
            </span>
          </section>
          {{-- session()->forget('db_name') --}}
        </menu>
        <div class="wrapper flex">
          <dialog id="dlg-new-connection" data-x="0" data-y="0">
            <form id="form-new-connection" method="post" action="{{ route('connection.store') }}">
              @csrf
              <section class="dlg-grid">
                <h5 class="title">Crea nuova connessione</h5>
                <section class="dlg-content">
                  <section class="row">
                    <section class="col col-12">
                      <input id="input-connection-name" type="text" name="title" value="" placeholder="Nome connessione" />
                    </section>
                  </section>
                  <section class="row">
                    <section class="col col-12">
                      <div class="field label">
                        <label for="field-db">Database</label>
                        <select id="field-db" name="database">
                          <option value="mysql">MySQL</option>
                          <option value="pgsql">PostgreSQL</option>
                          <option value="odbc">Vertica</option>
                          <option value="sqlsrv">SQL Server</option>
                        </select>
                      </div>
                    </section>
                  </section>
                  <section class="row">
                    <section class="col col-8-span">
                      <input id="input-host" type="text" name="host" value="" placeholder="host" />
                    </section>
                    <section class="col col-4-span">
                      <input id="input-port" type="text" name="port" placeholder="port" />
                    </section>
                  </section>
                  <section class="row align-end">
                    <section class="col col-6-span">
                      <input id="input-dsn" type="text" value="" name="dsn" placeholder="DSN" />
                    </section>
                    <section class="col col-6-span">
                      <label>*Schema in cui memorizzare i datamart</label>
                      <input id="input-schema" type="text" value="" name="schema" placeholder="decisyon_cache (default)" value="decisyon_cache" disabled />
                    </section>
                  </section>
                  <section class="row">
                    <section class="col col-6-span">
                      <input id="input-username" type="text" value="" name="username" placeholder="Username" />
                    </section>
                    <section class="col col-6-span">
                      <input id="input-psw" type="password" name="password" placeholder="Password" />
                    </section>
                  </section>
                </section>
                <section class="dlg-buttons">
                  <button type="reset" name="cancel" value="chiudi">Chiudi</button>
                  <button type="submit" id="btn-connection-save">Salva</button>
                </section>
              </section>
            </form>
          </dialog>
          <div class="row autofit">

            <div class="card col col-1">
              <h1>Connessione al Database</h1>
              <p>Selezionare o creare una nuova connessione al Database</p>
              <div class="visual">
                <section class="list-search">
                  <input type="search" id="database-search" data-element-search="connections" placeholder="Ricerca Database" autocomplete="off" />
                  <div class="relative-ul">
                    <ul id="ul-connections" data-search-id="database-search" class="custom-scrollbar">
                      @foreach($connections as $connection)
                      <li class="select-list" data-id="{{ $connection['id'] }}">
                        <span>{{$connection['name']}}</span>
                        <span><small>{{ $connection['driver'] }}</small>&nbsp;<small>({{ $connection['host'] }})</small></span>
                      </li>
                      @endforeach
                    </ul>
                  </div>
                </section>
              </div>
              <div class="card-button">
                <button id="new-connection" class="btn-link link">Aggiungi</button>
                <button id="remove-connection" class="btn-link link" disabled>Elimina</button>
                <button id="edit-connection" class="btn-link link" disabled>Modifica</button>
              </div>
            </div>
            <div class="card col col-2-span">
              <h1>Log Modifiche</h1>
              <!-- <p>Ultime modifiche</p> -->
              <div class="visual">
                <li><i>2024.12.11</i>&nbsp;<span>Aggiunta estrazione Excel e CSV</span></li>
                <li><i>2024.12.11</i>&nbsp;<span>Drag&Drop per spostare le colonne definite nello Sheet</span></li>
                <li><i>2024.12.11</i>&nbsp;<span>Spostamento area Filtri definiti nello Sheet</span> </li>
                <li>...</li>
              </div>
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
  <div class="right-sidebar"></div>
  <footer>
    <section class="footerContent">
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="80" width="80" />
      <p>Lynx International</p>
    </section>
  </footer>
  <script type="text/javascript" src="{{ asset('/js/init-home.js') }}" async></script>
</body>

</html>
