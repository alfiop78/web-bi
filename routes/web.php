<?php

use Illuminate\Support\Facades\Route;

// aggiungo il controller UserController
use App\Http\Controllers\UserController;
// aggiungo il controller MapDatabase
use App\Http\Controllers\MapDatabaseController;

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

Route::get('/', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);

/* map database web-bi*/
Route::get('/mapping', [MapDatabaseController::class, 'mapping']);
Route::get('/mapping/tables', [MapDatabaseController::class, 'tables'])->name('fetchAPI_tables'); // recupero elenco tabelle dello schema
Route::get('/mapping/{schema}/schema/{table}/table_info', [MapDatabaseController::class, 'table_info'])->name('fetchAPI_table_info'); // recupero il DESCRIBE della tabella
Route::get('/report', [MapDatabaseController::class, 'report']);
Route::get('/report/{schema}/schema/{table}/table_info', [MapDatabaseController::class, 'table_info'])->name('fetchAPI_table_info_report');
Route::get('/report/{table}/distinct_values/{field}', [MapDatabaseController::class, 'distinct_values'])->name('fetchAPI_distinc_values'); // recupero i valori distinti del campo field passato come parametro
Route::get('/ajax/cube/{jsonData}', [MapDatabaseController::class, 'cube'])->name('fetchAPI_cube'); // processo la query che crea la FX
// test POST request
Route::get('/report/{test}/post', [MapDatabaseController::class, 'post'])->name('test_post_request');
// test vertica
Route::get('/mapping/test_vertica', [MapDatabaseController::class, 'test_vertica']); // connessione con il metodo usato in Zend / PHP
Route::get('/mapping/vertica_odbc', [MapDatabaseController::class, 'vertica_odbc']); // connessione con il metodo ORM / Facade di Laravel
/* map database web-bi*/