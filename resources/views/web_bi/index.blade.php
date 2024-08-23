<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web-BI | HOME</title>
  <!-- <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0"> -->
  <link rel="icon" href="/favicon.png" type="image/png" />
  <!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" /> -->
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/index.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
  <!-- Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
</head>

<body class="antialiased">
  <main>


    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-symbols-rounded white">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
      </div>
      <h1 class="title">Gaia-BI</h1>
    </header>
    <div id="container">
      <div id="content">
        <div id="body">
          <div class="wrapper">
            <div id="drawer" open>
              <section class="account">
                <h5>user</h5>
                <i class="material-symbols-rounded md-light">person</i>
              </section>

              <nav>
                {{-- session()->forget('db_name') --}}
                <a href="#" title="Database selected">
                  @if (session('db_name'))
                  <i id="db-icon-status" class="material-symbols-rounded done">database</i>
                  @else
                  <!-- dump('sessione non impostata') -->
                  <i id="db-icon-status" class="material-symbols-rounded error">database_off</i>
                  @endif
                  <span id="database-name">{{ session('db_name', 'Database non impostato') }}</span>
                </a>
                <hr />
                <a href="{{ route('web_bi.mapdb') }}" title="Workspace"><i class="material-symbols-rounded">workspaces</i><span>Workspace</span></a>
                <a href="{{ route('web_bi.versioning') }}" title="Versionamento"><i class="material-symbols-rounded">cloud_sync</i><span>Versionamento</span></a>
                <a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded">dashboard_customize</i><span>Creazione Dashboard</span></a>
                <a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded">dashboard</i><span>Dashboards</span></a>
                <hr />
                <a href="#" title="Settings"><i class="material-symbols-rounded md-18">settings</i><span>Impostazioni</span></a>
              </nav>
            </div>

            <dialog id="dlg-new-connection" data-x="0" data-y="0">
              <form id="form-new-connection" method="post" action="{{ route('connection.store') }}">
                @csrf
                <section class="dlg-grid">
                  <h5 class="title">Crea nuova connessione</h5>
                  <section class="dlg-content">
                    <section class="row">
                      <section class="col grid-12">
                        <input id="input-connection-name" type="text" name="title" value="" placeholder="Nome connessione" />
                      </section>
                    </section>
                    <section class="row">
                      <section class="col grid-12">
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
                      <section class="col grid-8">
                        <input id="input-host" type="text" name="host" value="" placeholder="host" />
                      </section>
                      <section class="col grid-4">
                        <input id="input-port" type="text" name="port" placeholder="port" />
                      </section>
                    </section>
                    <section class="row">
                      <section class="col grid-6">
                        <input id="input-dsn" type="text" value="" name="dsn" placeholder="DSN" />
                      </section>
                      <section class="col grid-6">
                        <label>*Schema in cui memorizzare i datamart</label>
                        <input id="input-schema" type="text" value="" name="schema" placeholder="Schema" />
                      </section>
                    </section>
                    <section class="row">
                      <section class="col grid-6">
                        <input id="input-username" type="text" value="" name="username" placeholder="Username" />
                      </section>
                      <section class="col grid-6">
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

            <div class="grid">
              <div class="grid-content">
                <div class="row start">
                  <section class="col grid-5">
                    <h4>Connessione al Database</h4>
                    <div class="row">
                      <div class="col grid-12">
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
                    </div>
                    <div class="row">
                      <section class="col grid-12">
                        <!-- <a href="#" id="new-connection"><i class="material-symbols-rounded-round md-18">add</i><span>Crea connessione</span></a> -->
                        <section class="btn-link">
                          <button id="new-connection" class="btn-link link">Aggiungi</button>
                          <button id="remove-connection" class="btn-link link" disabled>Elimina</button>
                          <button id="edit-connection" class="btn-link link" disabled>Modifica</button>
                        </section>
                      </section>
                    </div>
                  </section>
                  <section class="col grid-7">
                    <h4>Titolo sezione</h4>
                    grid-8
                  </section>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    <footer>
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="120" width="120" />
    </footer>

    <div id="console">
      <div id="fabsConsole">
        <i class="material-symbols-rounded md-18">info</i>
        <p></p>
      </div>
    </div>

  </main>
  <script type="text/javascript" src="{{ asset('/js/init-home.js') }}" async></script>
</body>

</html>
