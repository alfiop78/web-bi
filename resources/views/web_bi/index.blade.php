<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web-BI | HOME</title>
  <!-- <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0"> -->
  <link rel="icon" href="/favicon.png" type="image/png" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
</head>

<body class="antialiased">
  <main>

    <div id="drawer">
      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>

        <a href="{{ route('web_bi.mapdb') }}">WorkSpace</a>
        <a href="{{ route('web_bi.versioning') }}">Versionamento</a>
        <a href="{{ route('web_bi.dashboard_create') }}">Crea Dashboard</a>
        <a href="{{ route('web_bi.dashboards') }}">Dashboard</a>
        <hr />
        <a href="#">Impostazioni</a>
      </nav>
    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>
      <h1 class="title">Gaia-BI</h1>
    </header>
    <div id="container">
      <div id="content">
        <div id="body">
          <dialog id="dlg-new-connection" data-x="0" data-y="0">
            <form id="form-new-connection" method="post" action="{{ route('connection.store') }}">
              @csrf
              <section class="dlg-grid">
                <h5 class="title">Crea nuova connessione</h5>
                <section class="dlg-content">
                  <section class="row">
                    <div class="col grid-12">
                      <input id="input-connection-name" type="text" name="title" value="" placeholder="Nome connessione" />
                    </div>
                  </section>
                  <section class="row">
                    <div class="col grid-12">
                      <div class="field label">
                        <label for="field-db">Database</label>
                        <select id="field-db" name="database">
                          <option value="mysql">MySQL</option>
                          <option value="pgsql">PostgreSQL</option>
                          <option value="vertica">Vertica</option>
                          <option value="sqlsrv">SQL Server</option>
                        </select>
                      </div>
                    </div>
                  </section>
                  <section class="row">
                    <div class="col grid-8">
                      <input id="input-host" type="text" name="host" value="" placeholder="host" />
                    </div>
                    <div class="col grid-4">
                      <input id="input-port" type="text" name="port" placeholder="port" />
                    </div>
                  </section>
                  <section class="row">
                    <div class="col grid-6">
                      <input id="input-dsn" type="text" value="" name="dsn" placeholder="DSN" />
                    </div>
                    <div class="col grid-6">
                      <input id="input-schema" type="text" value="" name="schema" placeholder="Schema" />
                    </div>
                  </section>
                  <section class="row">
                    <div class="col grid-6">
                      <input id="input-username" type="text" value="" name="username" placeholder="Username" />
                    </div>
                    <div class="col grid-6">
                      <input id="input-psw" type="password" name="password" placeholder="Password" />
                    </div>
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
              <div class="row">
                <div class="col grid-4">
                  <h4>Connessione al Database</h4>
                  <div class="row">
                    <section class="col grid-12">
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
                    </section>
                  </div>
                  <div class="row">
                    <section class="col grid-12">
                      <!-- <a href="#" id="new-connection"><i class="material-icons-round md-18">add</i><span>Crea connessione</span></a> -->
                      <section class="btn-link">
                        <button id="new-connection" class="btn-link link">Aggiungi</button>
                        <button id="remove-connection" class="btn-link link" disabled>Elimina</button>
                        <button id="edit-connection" class="btn-link link" disabled>Modifica</button>
                      </section>
                    </section>
                  </div>
                </div>
                <div class="col grid-8">
                  <h4>Titolo sezione</h4>
                  grid-8
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
        <i class="material-icons md-18">info</i>
        <p></p>
      </div>
    </div>

  </main>
  <script type="text/javascript" src="{{ asset('/js/init-home.js') }}" async></script>
</body>

</html>
