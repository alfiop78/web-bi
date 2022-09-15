<?php

use Illuminate\Support\Facades\Route;

// aggiungo il controller UserController
use App\Http\Controllers\UserController;
// aggiungo il controller MapDatabase, collegato a vertica
use App\Http\Controllers\MapDatabaseController;
// aggiungo il controller MetadataController, collegato al 192.168.2.7 web_bi_md per il metadato
use App\Http\Controllers\MetadataController;
use App\Http\Controllers\BIdimensionController;
use App\Http\Controllers\BIcubeController;
use App\Http\Controllers\BImetricController;
use App\Http\Controllers\BIfilterController;
use App\Http\Controllers\BIprocessController;
// uso il Model BIprocess che viene utilizzato nella route curlprocess (web_bi.schedule_report)
use App\Models\BIprocess;
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

Route::get('/index_origin', function () {
  return view('web_bi.index_origin');
})->name('web_bi.index_origin'); // home page
/* map database web-bi*/
Route::get('/', function () {
  return view('web_bi.index');
})->name('web_bi.index'); // home page

Route::get('/mapping', [MapDatabaseController::class, 'mapping'])->name('web_bi.mapping'); // page mapping
Route::get('/report', function () {
  return view('web_bi.report');
})->name('web_bi.report'); // page report
Route::get('/fetch_api/schema', [MapDatabaseController::class, 'schemata']); // recupero l'elenco dei database presenti (schema)
Route::get('/fetch_api/schema/{schema}/tables', [MapDatabaseController::class, 'tables'])->name('web_bi.fetch_api.tables'); // recupero elenco tabelle dello schema selezionato
Route::get('/fetch_api/{schema}/schema/{table}/table_info', [MapDatabaseController::class, 'table_info'])->name('web_bi.fetch_api.table_info'); // recupero il DESCRIBE della tabella
Route::get('/report', function () {
  return view('web_bi.report');
})->name('web_bi.report'); // page report
Route::get('/fetch_api/schema/{schema}/table/{table}/field/{field}/distinct_values', [MapDatabaseController::class, 'distinct_values'])->name('web_bi.fetch_api.distinct_values'); // recupero i valori distinti del campo field passato come parametro
Route::post('/fetch_api/cube/process', [MapDatabaseController::class, 'process'])->name('web_bi.fetch_api.process'); // processo la query che crea la FX
Route::post('/fetch_api/cube/sqlInfo', [MapDatabaseController::class, 'sqlInfo'])->name('web_bi.fetch_api.sqlInfo'); // restituisco SQL del process

// curl http://127.0.0.1:8000/curl/process/t1cm3v1nnso/schedule
// http://gaia.automotive-cloud.com/curl/process/j8ykcl339r9/schedule
Route::get('/curl/process/{token}/schedule', function (BIprocess $biProcess, $token) {
  $map = new MapDatabaseController();
  // interrogo la tabella bi_processes per recuperare il json_value relativo al report indicato nel token
  $json_value = BIprocess::where("token", "=", $token)->first('json_value');
  return $map->curlprocess($json_value);
})->name('web_bi.schedule_report');

// store json
Route::prefix('/fetch_api/json/')->group(function () {
  Route::post('/dimension_store', [BIdimensionController::class, 'store']);
  Route::post('/cube_store', [BIcubeController::class, 'store']);
  Route::post('/metric_store', [BImetricController::class, 'store']);
  Route::post('/filter_store', [BIfilterController::class, 'store']);
  Route::post('/process_store', [BIprocessController::class, 'store']);
});
// destroy json
Route::prefix('/fetch_api/name/')->group(function () {
  Route::get('{token}/dimension_destroy', [BIdimensionController::class, 'destroy']);
  Route::get('{token}/cube_destroy', [BIcubeController::class, 'destroy']);
  Route::get('{token}/metric_destroy', [BImetricController::class, 'destroy']);
  Route::get('{token}/filter_destroy', [BIfilterController::class, 'destroy']);
  Route::get('{token}/process_destroy', [BIprocessController::class, 'destroy']);
});
// index
Route::prefix('/fetch_api/versioning/')->group(function () {
  Route::get('dimensions', [BIdimensionController::class, 'index']);
  Route::get('cubes', [BIcubeController::class, 'index']);
  Route::get('metrics', [BImetricController::class, 'index']);
  Route::get('filters', [BIfilterController::class, 'index']);
  Route::get('processes', [BIprocessController::class, 'index']);
});
// show
Route::prefix('/fetch_api/name/')->group(function () {
  Route::get('{token}/dimension_show', [BIdimensionController::class, 'show']);
  Route::get('{token}/cube_show', [BIcubeController::class, 'show']);
  Route::get('{token}/metric_show', [BImetricController::class, 'show']);
  Route::get('{token}/filter_show', [BIfilterController::class, 'show']);
  Route::get('{token}/process_show', [BIprocessController::class, 'show']);
});
// update
Route::prefix('/fetch_api/json/')->group(function () {
  Route::post('/dimension_update', [BIdimensionController::class, 'update']);
  Route::post('/cube_update', [BIcubeController::class, 'update']);
  Route::post('/metric_update', [BImetricController::class, 'update']);
  Route::post('/filter_update', [BIfilterController::class, 'update']);
  Route::post('/process_update', [BIprocessController::class, 'update']);
});

// test vertica
Route::get('/mapping/test_vertica', [MapDatabaseController::class, 'test_vertica']); // connessione con il metodo usato in Zend / PHP
Route::get('/mapping/vertica_odbc', [MapDatabaseController::class, 'vertica_odbc']); // connessione con ORM / Facade di Laravel
/* map database web-bi*/
