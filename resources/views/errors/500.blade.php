<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/home.css') }}" />
  <title>Gaia-BI | ERROR (500)</title>

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
  <h2>{{ $exception->getMessage(); }}</h2>
</body>

</html>
