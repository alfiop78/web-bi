<?php

use Illuminate\Support\Facades\Route;

// aggiungo il controller UserController
use App\Http\Controllers\UserController;
// aggiungo il controller MapDatabase, collegato a vertica
use App\Http\Controllers\MapDatabaseController;
// aggiungo il controller MetadataController, collegato al 192.168.2.7 web_bi_md per il metadato
use App\Http\Controllers\MetadataController;

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

/* map database web-bi*/
Route::get('/', function() {return view('web_bi.index');})->name('web_bi.index'); // home page
// Route::get('/mapping', [MapDatabaseController::class, 'mapping'])->name('web_bi.mapping'); // page mapping
Route::get('/mapping', [MetadataController::class, 'mapping'])->name('web_bi.mapping'); // page mapping
Route::get('/fetch_api/schema', [MapDatabaseController::class, 'schemata']); // recupero l'elenco dei database presenti (schema)
Route::get('/fetch_api/schema/{schema}/tables', [MapDatabaseController::class, 'tables'])->name('web_bi.fetch_api.tables'); // recupero elenco tabelle dello schema selezionato
Route::get('/fetch_api/{schema}/schema/{table}/table_info', [MapDatabaseController::class, 'table_info'])->name('web_bi.fetch_api.table_info'); // recupero il DESCRIBE della tabella
Route::get('/report', [MapDatabaseController::class, 'report'])->name('web_bi.report'); // page report
Route::get('/fetch_api/schema/{schema}/table/{table}/field/{field}/distinct_values', [MapDatabaseController::class, 'distinct_values'])->name('web_bi.fetch_api.distinct_values'); // recupero i valori distinti del campo field passato come parametro
Route::get('/fetch_api/cube/{jsonData}/process', [MapDatabaseController::class, 'process'])->name('web_bi.fetch_api.process'); // processo la query che crea la FX
// Utilizzo un unico metodo per salvare il Metadato, questo perchè i campi da salvare sono sempre 2 (key, json_value)
// Come parametri passo il json da salvare (al cui interno c'è la proprietà 'name') e il nome della tabella in cui salvare i dati (es.: bi_dimensions, bi_filters, ecc...)
Route::get('/fetch_api/json/{json}/table/{table}/save', [MetadataController::class, 'save']);

// test POST request
Route::get('/report/{test}/post', [MapDatabaseController::class, 'post'])->name('test_post_request');
// test vertica
Route::get('/mapping/test_vertica', [MapDatabaseController::class, 'test_vertica']); // connessione con il metodo usato in Zend / PHP
Route::get('/mapping/vertica_odbc', [MapDatabaseController::class, 'vertica_odbc']); // connessione con ORM / Facade di Laravel
/* map database web-bi*/
