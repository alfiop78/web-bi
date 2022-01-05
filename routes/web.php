<?php

use Illuminate\Support\Facades\Route;

// aggiungo il controller UserController
use App\Http\Controllers\UserController;
// aggiungo il controller CorsoController 
use App\Http\Controllers\CorsoController;
// aggiungo il controller TaskController
use App\Http\Controllers\TaskController;
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

Route::get('/page_2', [UserController::class, 'page_2']);

Route::get('/page_3', function () {return view('users');}); // funziona

/* corso udemy*/

Route::get('/corso_udemy', function () {return "Benvenuto nel corso di laravel";});
// altra sintassi per richiamare il controller
Route::get('/corso_udemy_2', [CorsoController::class, 'index']);
/* Route::get('/corso_udemy_2', 'CorsoController@index'); */
Route::get('/corsi', [CorsoController::class, 'index_view']);
/* Route con un path */
Route::get('/corsi_path', [CorsoController::class, 'index_view_path']);

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


// Task app
// 1 - creo il Controller, il Model e la migration con "php artisan make:model Task -c -m"
// 2 - aggiungo i campo title e description nella migration, metodo create
// 3 - eseguo "php artisan migrate" per scrivere su DB la tabella tasks
// 4 - creazione delle Routes

// Route per Visualizzare tutti i task
Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
// creazione di un nuovo task dal Form
Route::get('/tasks/create', [TaskController::class, 'create'])->name('tasks.create');


// end Task app
/* corso udemy*/



