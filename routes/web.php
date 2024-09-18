<?php

use Illuminate\Support\Facades\Route;

// aggiungo il controller UserController
use App\Http\Controllers\UserController;
// aggiungo il controller MapDatabase, collegato a vertica
use App\Http\Controllers\MapDatabaseController;
// aggiungo il controller MetadataController, collegato al 192.168.2.7 web_bi_md per il metadato
// use App\Http\Controllers\MetadataController;
use App\Http\Controllers\BIworkbookController;
use App\Http\Controllers\BIsheetController;
use App\Http\Controllers\BImetricController;
use App\Http\Controllers\BIfilterController;
use App\Http\Controllers\BIdashboardController;
use App\Http\Controllers\BIConnectionsController;
// uso il Model BIsheet che viene utilizzato nella route curlprocess (web_bi.schedule_report)
use App\Models\BIsheet;
use App\Models\BIworkbook;
use App\Models\BIfilter;
use App\Models\BImetric;
// test 22.12.2022 aggiunta per utilizzare /fetch_api/dimension/time
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/users', [UserController::class, 'index']);

// Route::get('/index_origin', function () {
//   return view('web_bi.index_origin');
// })->name('web_bi.index_origin'); // home page

// pagina predisposta per il dvd (Marco Gardin) al momento non utilizzata
// Route::get('/', function () {
//   return view('web_bi.index');
// })->name('web_bi.index');

Route::get('/', [BIConnectionsController::class, 'index'])->name('web_bi.index');

Route::get('/mapdb', [MapDatabaseController::class, 'mapdb'])->name('web_bi.mapdb');

Route::get('/versioning', function () {
  // TODO: recuperare solo gli Workbook del DB collegato
  return view('web_bi.versioning');
})->name('web_bi.versioning');

// Route::get('/dashboards', function () {
//   return view('web_bi.dashboards');
// })->name('web_bi.dashboards');

Route::get('/dashboards', [BIdashboardController::class, 'index'])->name('web_bi.dashboards');

/* Route::get('/create-dashboard', function () {
  return view('web_bi.create-dashboard');
})->name('web_bi.dashboard_create'); */
Route::get('/create-dashboard', [BIworkbookController::class, 'indexByDashboardCreate'])->name('web_bi.dashboard_create');

// recupero l'elenco dei database presenti (schema)
Route::get('/fetch_api/schema', [MapDatabaseController::class, 'schemata']);
// recupero elenco tabelle dello schema selezionato
Route::get('/fetch_api/schema/{schema}/tables', [MapDatabaseController::class, 'tables'])->name('web_bi.fetch_api.tables');
// verifica tabelle TIME
Route::get('/fetch_api/time/exists', [MapDatabaseController::class, 'timeDimensionExists'])->name('web_bi.fetch_api.timeExists');

// recupero il DESCRIBE della tabella
// viene utilizzata dalla request getTable() e altre fn in init-responsive.js
Route::get('/fetch_api/{schema}/schema/{table}/table_info', [MapDatabaseController::class, 'table_info'])->name('web_bi.fetch_api.table_info');

// recupero il DESCRIBE della tabella
Route::get('/fetch_api/{schema}/schema/{table}/table/{column}/column_name', [MapDatabaseController::class, 'columns_info'])->name('web_bi.fetch_api.columns_info');
// viene utilizzata da getPreviewSVGTable() e getPreviewTable()
Route::get('/fetch_api/{schema}/schema/{table}/table_preview', [MapDatabaseController::class, 'table_preview'])->name('web_bi.fetch_api.table_preview');

// TODO: viene utilizzata ?
// recupero i valori distinti del campo field passato come parametro
Route::get('/fetch_api/schema/{schema}/table/{table}/field/{field}/distinct_values', [MapDatabaseController::class, 'distinct_values'])->name('web_bi.fetch_api.distinct_values');

// processo la query che crea la FX
Route::post('/fetch_api/cube/sheet_create', [MapDatabaseController::class, 'sheetCreate'])->name('web_bi.fetch_api.sheet_create');
// restituisco SQL del process
// TODO: da reimplementare da quando è cambiata la logica con workbook/sheet
Route::post('/fetch_api/cube/sql', [MapDatabaseController::class, 'sql'])->name('web_bi.fetch_api.sql');

Route::get('/500', function () {
  return view('errors.500');
});

// copy_table
Route::get('/fetch_api/copy_from/{from_id}/copy_to/{to_id}/copy_table', [MapDatabaseController::class, 'copy_table'])->name('web_bi.fetch_api.copy_table');

// creazione dimensione time
// Route::post('/fetch_api/dimension/time', [MapDatabaseController::class, 'createTimeDimension'])->name('web_bi.fetch_api.time');
Route::get('/fetch_api/dimension/time', [MapDatabaseController::class, 'dimensionTIME'])->name('web_bi.fetch_api_time');

/* Route::get('/fetch_api/dimension/time', function () {

  $start = new DateTime('2021-01-01 00:00:00');
  $end   = new DateTime('2025-01-01 00:00:00');
  // $end   = new DateTime('2021-01-31 00:00:00');
  $interval = new DateInterval('P1D');
  $period = new DatePeriod($start, $interval, $end);
  $json = (object) null;
  foreach ($period as $date) {
    $currDate = new DateTimeImmutable($date->format('Y-m-d'));
    // calcolo il quarter
    $quarter = ceil($currDate->format('n') / 3);
    $json->{$currDate->format('Y-m-d')} = (object) [
      "date" => $currDate->format('Y-m-d'),
      "trans_ly" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d'),
      "weekday" => $currDate->format('l'),
      // "day" => (object)
      "week" => $currDate->format('W'),
      "month_id" => $currDate->format('Ym'),
      "month" => (object) [
        "id" => $currDate->format('m'),
        "ds" => $currDate->format('F'),
        "short" => $currDate->format('M')
      ],
      "quarter_id" => "{$currDate->format('Y')}0{$quarter}",
      "quarter" => (object) ["id" => $quarter, "ds" => "Q {$quarter}"],
      "year" => $currDate->format('Y'),
      "day_of_year" => $currDate->format('z'),
      // "lastOfMonth" => $current->format('t'),
      "last" => (object) [
        "day" => $currDate->sub(new DateInterval('P1D'))->format('Y-m-d'),
        "week" => $currDate->sub(new DateInterval('P1W'))->format('Y-m-d'),
        "month" => $currDate->sub(new DateInterval('P1M'))->format('Y-m-d'),
        "quarter" => ceil($currDate->sub(new DateInterval('P3M'))->format('n') / 3), // quarter 3 mesi precedenti
        "year" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d')
      ]
    ];
  }
  // dd($json);
  // if (!DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable('WEB_BI_TIME')) {
  if (!Schema::connection('vertica_odbc')->hasTable('WEB_BI_TIME')) {
    // la tabella non esiste, la creo
    // TODO: utilizzare il complex datatype ROW (vertica) per creare le colonne come "strutture dati".
    // Per recuperarne i valori non bisogna utilizzare MapJSONExtractor ma la sintassi xxx.yyy

    $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WEB_BI_TIME (
    date DATE NOT NULL PRIMARY KEY,
    trans_ly DATE,
    year INTEGER,
    quarter_id INTEGER,
    quarter VARCHAR,
    month_id INTEGER,
    month VARCHAR,
    week CHAR(2),
    day VARCHAR,
    last VARCHAR(1000)
    ) INCLUDE SCHEMA PRIVILEGES";
    $result = DB::connection('vertica_odbc')->statement($sql);
    // if (!$result) echo "tabella creata";
    // var_dump($result);
    //last VARCHAR,
    //json VARCHAR(2000)
  }
  // var_dump($json);
  echo "\nstart JSON :" . date('H:i:s', time());

  foreach ($json as $date => $value) {
    // $str = json_encode($value);
    // dd($value->last);
    // $quarter = json_encode($value->quarter);
    // $month = json_encode($value->month);
    // NOTE: da vertica 11 è possibile fare la INSERT INTO con più record con la seguente sintassi:
    // INSERT INTO nometabella (field1, field2) VALUES (1, 'test'), (2, 'test'), (3, 'test')....

    $result_insert = DB::connection('vertica_odbc')->table('decisyon_cache.WEB_BI_TIME')->insert([
      'date' => "{$date}",
      'trans_ly' => "{$value->trans_ly}",
      'year' => $value->year,
      'quarter_id' => (int) $value->quarter_id,
      'quarter' => json_encode($value->quarter),
      'month_id' => $value->month_id,
      'month' => json_encode($value->month),
      'week' => $value->week,
      'day' => json_encode(['weekday' => $value->weekday, 'day_of_year' => $value->day_of_year]),
      'last' => json_encode($value->last)
      // 'json' => "{$str}"
    ]);
  }
  echo "\nend JSON :" . date('H:i:s', time());
  $result_insert = DB::connection('vertica_odbc')->statement('COMMIT;');
  return $result_insert;
})->name('web_bi.fetch_api.time'); */

/* Route::get('/fetch_api/dimension/time', function () {
  // TODO: creare la struttura come quella di decisyon con le tabelle in relazione :
  // YEAR, QUARTER, MONTH, DATE
  $start = new DateTime('2021-01-01 00:00:00');
  $end   = new DateTime('2025-01-01 00:00:00');
  // $end   = new DateTime('2021-01-31 00:00:00');
  $interval = new DateInterval('P1D');
  $period = new DatePeriod($start, $interval, $end);
  $json = (object) null;
  foreach ($period as $date) {
    $currDate = new DateTimeImmutable($date->format('Y-m-d'));
    // calcolo il quarter
    $quarter = ceil($currDate->format('n') / 3);
    $json->{$currDate->format('Y-m-d')} = (object) [
      "date" => $currDate->format('Y-m-d'),
      "trans_ly" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d'),
      "weekday" => $currDate->format('l'),
      // "day" => (object)
      "week" => $currDate->format('W'),
      "month_id" => $currDate->format('Ym'),
      "month" => (object) [
        "id" => $currDate->format('m'),
        "ds" => $currDate->format('F'),
        "short" => $currDate->format('M')
      ],
      "quarter_id" => "{$currDate->format('Y')}0{$quarter}",
      "quarter" => (object) ["id" => $quarter, "ds" => "Q {$quarter}"],
      "year" => $currDate->format('Y'),
      "day_of_year" => $currDate->format('z'),
      // "lastOfMonth" => $current->format('t'),
      "last" => (object) [
        "day" => $currDate->sub(new DateInterval('P1D'))->format('Y-m-d'),
        "week" => $currDate->sub(new DateInterval('P1W'))->format('Y-m-d'),
        "month" => $currDate->sub(new DateInterval('P1M'))->format('Y-m-d'),
        "quarter" => ceil($currDate->sub(new DateInterval('P3M'))->format('n') / 3), // quarter 3 mesi precedenti
        "year" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d')
      ]
    ];
  }
  // dd($json);
  // if (!DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable('WEB_BI_TIME')) {
  if (!Schema::connection('vertica_odbc')->hasTable('WEB_BI_TIME')) {
    // la tabella non esiste, la creo
    // TODO: utilizzare il complex datatype ROW (vertica) per creare le colonne come "strutture dati".
    // Per recuperarne i valori non bisogna utilizzare MapJSONExtractor ma la sintassi xxx.yyy
    $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WEB_BI_TIME (
    date DATE NOT NULL PRIMARY KEY,
    trans_ly DATE,
    year INTEGER,
    quarter_id INTEGER,
    quarter VARCHAR,
    month_id INTEGER,
    month VARCHAR,
    week CHAR(2),
    day VARCHAR,
    last VARCHAR(1000)
    ) INCLUDE SCHEMA PRIVILEGES";
    $result = DB::connection('vertica_odbc')->statement($sql);
    // if (!$result) echo "tabella creata";
    // var_dump($result);
    //last VARCHAR,
    //json VARCHAR(2000)
  }
  // var_dump($json);
  echo "\nstart JSON :" . date('H:i:s', time());

  foreach ($json as $date => $value) {
    // $str = json_encode($value);
    // dd($value->last);
    // $quarter = json_encode($value->quarter);
    // $month = json_encode($value->month);
    // NOTE: da vertica 11 è possibile fare la INSERT INTO con più record con la seguente sintassi:
    // INSERT INTO nometabella (field1, field2) VALUES (1, 'test'), (2, 'test'), (3, 'test')....
    $result_insert = DB::connection('vertica_odbc')->table('decisyon_cache.WEB_BI_TIME')->insert([
      'date' => "{$date}",
      'trans_ly' => "{$value->trans_ly}",
      'year' => $value->year,
      'quarter_id' => (int) $value->quarter_id,
      'quarter' => json_encode($value->quarter),
      'month_id' => $value->month_id,
      'month' => json_encode($value->month),
      'week' => $value->week,
      'day' => json_encode(['weekday' => $value->weekday, 'day_of_year' => $value->day_of_year]),
      'last' => json_encode($value->last)
      // 'json' => "{$str}"
    ]);
  }
  echo "\nend JSON :" . date('H:i:s', time());
  $result_insert = DB::connection('vertica_odbc')->statement('COMMIT;');
  return $result_insert;
})->name('web_bi.fetch_api.time'); */

// curl http://127.0.0.1:8000/curl/process/t1cm3v1nnso/schedule
// curl https://gaia.automotive-cloud.com/curl/process/j8ykcl339r9/schedule
// con il login : curl https://user:psw@gaia.automotive-cloud.com/curl/process/{processToken}/schedule
// ...oppure : curl -u 'user:psw' https://gaia.automotive-cloud.com/curl/process/{processToken}/schedule
/* Route::get('/curl/process/{token}/schedule', function (BIprocess $biProcess, $token) {
  $map = new MapDatabaseController();
  // interrogo la tabella bi_processes per recuperare il json_value relativo al report indicato nel token
  $json_value = BIprocess::where("token", "=", $token)->first('json_value');
  return $map->curlprocess($json_value);
})->name('web_bi.schedule_report'); */

Route::get('/curl/process/{token}/schedule', function ($token) {
  // TODO: molto probabilmente converrà spostare la function di questa Route in MapDatabaseController
  $map = new MapDatabaseController();
  // interrogo la tabella bi_processes per recuperare il json_value relativo al report indicato nel token
  // $json_sheet = BIsheet::where("token", "=", $token)->first('json_value');
  $json_sheet = json_decode(BIsheet::where("token", "=", $token)->first('json_value')->{'json_value'});
  $json_workbook = json_decode(BIworkbook::where("token", "=", $json_sheet->{'workbook_ref'})->first('json_value')->{'json_value'});
  // creo l'object 'process' da inviare a MapDatabaseController -> sheetCurlProcess()
  $process = (object)[
    "id" => $json_sheet->{'id'},
    "name" => $json_sheet->{'name'},
    "from" => $json_sheet->{'from'},
    "joins" => $json_sheet->{'joins'}
  ];
  $fields = (object)[];
  $metrics = (object)[];
  $advancedMeasures = (object)[];
  $compositeMeasures = (object)[];
  // var_dump($json_sheet);
  // fields da recuperare nel WorkBook
  foreach ($json_sheet->{'fields'} as $token => $name) {
    // recupero le proprietà 'field', 'tableAlias' mentre la proprietà 'name' la utilizzo dallo Sheet
    $fields->$token = (object)[
      "field" => $json_workbook->{'fields_new'}->{$token}->{'field'},
      "name" => $name,
      "tableAlias" => $json_workbook->{'fields_new'}->{$token}->{'tableAlias'}
    ];
  }
  // recupero i filtri impostati nello Sheet
  foreach ($json_sheet->{'filters'} as $token) {
    // TODO: utilizzare la stessa logica di 'fields' (con object e non con array)
    $json_filters[] = json_decode(BIfilter::where("token", "=", $token)->first('json_value')->{'json_value'});
  }

  if (property_exists($json_sheet, 'metrics')) {
    foreach ($json_sheet->{'metrics'} as $token => $object) {
      // anche qui, come in 'fields', alcune proprietà vanno recuperato da json_sheet mentre altre dal WorkBook
      $metrics->$token = (object)[
        "alias" => $object->alias,
        "aggregateFn" => $object->aggregateFn,
        "SQL" => $json_workbook->{'metrics'}->{$token}->SQL,
        "distinct" => $json_workbook->{'metrics'}->{$token}->distinct
      ];
    }
  }
  // metriche avanzate
  if (property_exists($json_sheet, 'advMetrics')) {
    $timingFunctions = ['last-year', 'last-month', 'ecc..'];
    foreach ($json_sheet->{'advMetrics'} as $token => $object) {
      // recupero la metrica avanzata dal DB
      $json_advanced_measures = json_decode(BImetric::where("token", "=", $token)->first('json_value')->{'json_value'});
      // recupero i filtri contenuti all'interno della metrica avanzata in ciclo
      $json_filters_metric = (object)[];
      foreach ($json_advanced_measures->{'filters'} as $filterToken) {
        // se il filtro è un timingFn recupero la definizione $object-timingFn che si trova all'interno della metrica
        if (in_array($filterToken, $timingFunctions)) {
          $json_filters_metric->$filterToken = $json_advanced_measures->timingFn->$filterToken;
        } else {
          $json_filters_metric->$filterToken = json_decode(BIfilter::where("token", "=", $filterToken)->first('json_value')->{'json_value'});
        }
      }
      $advancedMeasures->$token = (object)[
        "alias" => $object->alias,
        "aggregateFn" => $object->aggregateFn,
        "SQL" => $json_advanced_measures->SQL,
        "distinct" => $json_advanced_measures->distinct,
        "filters" => $json_filters_metric
      ];
    }
  }
  // metriche composite
  if (property_exists($json_sheet, 'compositeMetrics')) {
    foreach ($json_sheet->{'compositeMetrics'} as $token => $object) {
      // recupero la metrica avanzata dal DB
      $json_composite_measures = json_decode(BImetric::where("token", "=", $token)->first('json_value')->{'json_value'});
      $compositeMeasures->$token = (object)[
        "alias" => $object->alias,
        "SQL" => $json_composite_measures->sql
      ];
    }
  }

  $process->fields = $fields;
  $process->filters = $json_filters;
  if (count(get_object_vars($metrics)) !== 0) $process->metrics = $metrics;
  if (count(get_object_vars($advancedMeasures)) !== 0) $process->advancedMeasures = $advancedMeasures;
  if (count(get_object_vars($compositeMeasures)) !== 0) $process->compositeMeasures = $compositeMeasures;
  // var_dump($process->advancedMeasures);
  // exit;
  return $map->sheetCurlProcess($process);
})->name('web_bi.schedule_report');

// visualizzazione anteprima datamart con paginate()
Route::get('/fetch_api/{id}/datamart', [MapDatabaseController::class, 'datamart'])->name('web_bi.fetch_api.datamart');
// preview del datamart
Route::get('/fetch_api/{id}/preview', [MapDatabaseController::class, 'preview'])->name('web_bi.fetch_api.preview');

Route::get('/fetch_api/{id}/check_datamart', [MapDatabaseController::class, 'checkDatamart'])->name('web_bi.fetch_api.check_datamart');

Route::get('/fetch_api/{id}/delete_datamart', [MapDatabaseController::class, 'deleteDatamart'])->name('web_bi.fetch_api.delete_datamart');

// Metodo POST commentato, possibile utilizzo futuro, vedere commenti in MapDatabaseController
Route::post('/fetch_api/datamartpost', [MapDatabaseController::class, 'datamartPost'])->name('web_bi.fetch_api.datamartPost');

Route::get('fetch_api/{id}/show', [BIConnectionsController::class, 'show']);

// store
Route::post('/fetch_api/connections/store', [BIConnectionsController::class, 'store'])->name('connection.store');
// store json
Route::prefix('/fetch_api/json/')->group(function () {
  Route::post('/workbook_store', [BIworkbookController::class, 'store']);
  Route::post('/sheet_store', [BIsheetController::class, 'store']);
  Route::post('/metric_store', [BImetricController::class, 'store']);
  Route::post('/filter_store', [BIfilterController::class, 'store']);
  Route::post('/dashboard_store', [BIdashboardController::class, 'store']);
});
// destroy json
Route::prefix('/fetch_api/name/')->group(function () {
  Route::get('{token}/workbook_destroy', [BIworkbookController::class, 'destroy']);
  Route::get('{token}/sheet_destroy', [BIsheetController::class, 'destroy']);
  Route::get('{token}/metric_destroy', [BImetricController::class, 'destroy']);
  Route::get('{token}/filter_destroy', [BIfilterController::class, 'destroy']);
});
// index
Route::prefix('/fetch_api/versioning/')->group(function () {
  Route::get('workbooks', [BIworkbookController::class, 'index']);
  Route::get('sheets', [BIsheetController::class, 'index']);
  Route::get('metrics', [BImetricController::class, 'index']);
  Route::get('filters', [BIfilterController::class, 'index']);
  Route::get('dashboards', [BIdashboardController::class, 'index']);
});
// show
Route::prefix('/fetch_api/name/')->group(function () {
  Route::get('{token}/metric_show', [BImetricController::class, 'show']);
  Route::get('{token}/filter_show', [BIfilterController::class, 'show']);
  Route::get('{token}/workbook_show', [BIworkbookController::class, 'show']);
  Route::get('{token}/sheet_show', [BIsheetController::class, 'show']);
  Route::get('{token}/dashboard_show', [BIdashboardController::class, 'show']);
});
// update
Route::prefix('/fetch_api/json/')->group(function () {
  Route::post('/workbook_update', [BIworkbookController::class, 'update']);
  Route::post('/sheet_update', [BIsheetController::class, 'update']);
  Route::post('/metric_update', [BImetricController::class, 'update']);
  Route::post('/filter_update', [BIfilterController::class, 'update']);
  Route::post('/dashboard_update', [BIdashboardController::class, 'update']);
});

// recupero degli sheets appartenenti a un determinato workbooks
Route::get('fetch_api/workbook_token/{token}/sheet_indexByWorkbook', [BIsheetController::class, 'indexByWorkbook']);
// recupero le dashboards della connessione corrente
Route::get('fetch_api/dashboardsByConnectionId', [BIdashboardController::class, 'indexByConnectionId']);

// test vertica
Route::get('/mapping/test_vertica', [MapDatabaseController::class, 'test_vertica']); // connessione con il metodo usato in Zend / PHP
Route::get('/mapping/vertica_odbc', [MapDatabaseController::class, 'vertica_odbc']); // connessione con ORM / Facade di Laravel
/* map database web-bi*/
