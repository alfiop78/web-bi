<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0"> -->
  <link rel="icon" href="/favicon.png" type="image/png" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/home.css') }}" />
  <title>Gaia-BI | HOME</title>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- Styles -->

  <style>
    /* body {
      font-family: 'Nunito', sans-serif;
    } */
  </style>
</head>

<body class="antialiased">
  <main>
    <!-- <div id="drawer" close>
      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>
    </div> -->

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>
      <h1 class="title">Gaia-BI</h1>
    </header>
    <div id="container">
      <div class="a">
        <div class="abs">
          <div class="">
            <a href="{{ route('web_bi.mapdb') }}" class="text-sm text-gray-700 dark:text-gray-500 underline"><img src="/favicon.png" alt="Map Database" /></a>
            <h2>WorkSpace</h2>
          </div>
          <div class="">
            <a href="{{ route('web_bi.versioning') }}" class="text-sm text-gray-700 dark:text-gray-500 underline"><img src="/favicon.png" alt="Map Database" /></a>
            <h2>Versionamento</h2>
          </div>
          <div class="">
            <a href="{{ route('web_bi.dashboards') }}" class="text-sm text-gray-700 dark:text-gray-500 underline"><img src="/favicon.png" alt="Map Database" /></a>
            <h2>Dashboards</h2>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <img src="{{ asset('/images/lynx_logo.png') }}" alt="Lynx logo" height="120" width="120" />
    </footer>

  </main>
</body>

</html>
