<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>mapping - new</title>
</head>

<body>
  <p>test</p>
  <dialog id="dlg-schemes" open>
    @foreach($schemes as $schema)
    <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
    @endforeach
  </dialog>
</body>

</html>
