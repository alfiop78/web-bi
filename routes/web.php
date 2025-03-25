<?php

use Illuminate\Support\Facades\Route;
// aggiungo il controller MapDatabase, collegato a vertica
use App\Http\Controllers\MapDatabaseController;
use App\Http\Controllers\BIConnectionsController;
use App\Http\Controllers\BIdashboardController;
use App\Http\Controllers\BIworkbookController;
use App\Http\Controllers\BIsheetController;
use App\Http\Controllers\BImetricController;
use App\Http\Controllers\BIfilterController;
use App\Models\BIdashboard;
// uso i Model BIsheet, BIworkbook, BImetric e BIfilter che viene utilizzato nella route curlprocess (web_bi.schedule_report)
// use App\Models\BIsheet;
// use App\Models\BIworkbook;
// use App\Models\BIfilter;
// use App\Models\BImetric;
// test 22.12.2022 aggiunta per utilizzare /fetch_api/dimension/time
// NOTE: 30.09.2024 spostate le funzioni per /fetch_api/dimension/time in MapDatabaseController
// use Illuminate\Support\Facades\DB;
// use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;

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

Route::get('/dashboard', function () {
	return view('dashboard');
})->middleware(['auth'])->name('dashboard');

// routes
Route::get('/connections', [BIConnectionsController::class, 'index'])->middleware(['auth'])->name('web_bi.connections');
Route::get('/workspace', [MapDatabaseController::class, 'workspace'])->middleware(['auth'])->name('web_bi.workspace');
Route::get('/versioning', function () {
	// TODO: recuperare solo gli Workbook del DB collegato
	return view('web_bi.versioning');
})->middleware(['auth'])->name('web_bi.versioning');

Route::get('/dashboards', [BIdashboardController::class, 'index'])->middleware(['guest'])->name('web_bi.dashboards');

Route::get('/create-dashboard', [BIworkbookController::class, 'indexByDashboardCreate'])->middleware(['auth'])->name('web_bi.dashboard_create');

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

// copy_table (utilizzata per la Pubblicazione della Dashboard)
Route::get('/fetch_api/copy_from/{from_id}/copy_to/{to_id}/copy_table', [MapDatabaseController::class, 'copy_table'])->name('web_bi.fetch_api.copy_table');

// creazione dimensione time
// Route::post('/fetch_api/dimension/time', [MapDatabaseController::class, 'createTimeDimension'])->name('web_bi.fetch_api.time');
Route::get('/fetch_api/dimension/time', [MapDatabaseController::class, 'dimensionTIME'])->name('web_bi.fetch_api_time');

// visualizzazione anteprima datamart con paginate()
Route::get('/fetch_api/{id}/datamart', [MapDatabaseController::class, 'datamart'])->name('web_bi.fetch_api.datamart');
// preview del datamart
Route::get('/fetch_api/{id}/preview', [MapDatabaseController::class, 'preview'])->name('web_bi.fetch_api.preview');

Route::get('/fetch_api/{id}/check_datamart', [MapDatabaseController::class, 'checkDatamart'])->name('web_bi.fetch_api.check_datamart');

Route::get('/fetch_api/{id}/delete_datamart', [MapDatabaseController::class, 'deleteDatamart'])->name('web_bi.fetch_api.delete_datamart');

// Metodo POST commentato, possibile utilizzo futuro, vedere commenti in MapDatabaseController
Route::post('/fetch_api/datamartpost', [MapDatabaseController::class, 'datamartPost'])->name('web_bi.fetch_api.datamartPost');

Route::get('fetch_api/{id}/show', [BIConnectionsController::class, 'show']);

// show
Route::prefix('/fetch_api/name/')->group(function () {
	Route::get('{token}/metric_show', [BImetricController::class, 'show']);
	Route::get('{token}/filter_show', [BIfilterController::class, 'show']);
	Route::get('{token}/workbook_show', [BIworkbookController::class, 'show']);
	Route::get('{token}/sheet_show', [BIsheetController::class, 'show']);
	Route::get('{token}/dashboard_show', [BIdashboardController::class, 'show']);
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

// update
Route::prefix('/fetch_api/json/')->group(function () {
	Route::post('/workbook_update', [BIworkbookController::class, 'update']);
	Route::post('/sheet_update', [BIsheetController::class, 'update']);
	Route::post('/metric_update', [BImetricController::class, 'update']);
	Route::post('/filter_update', [BIfilterController::class, 'update']);
	Route::post('/dashboard_update', [BIdashboardController::class, 'update']);
});

Route::get('/curl/process/{token}/schedule', [MapDatabaseController::class, 'scheduleProcess'])->middleware(['guest'])->name('web_bi.schedule');

// recupero degli sheets appartenenti a un determinato workbooks
Route::get('fetch_api/workbook_token/{token}/sheet_indexByWorkbook', [BIsheetController::class, 'indexByWorkbook']);
// recupero le dashboards della connessione corrente
Route::get('fetch_api/dashboardsByConnectionId', [BIdashboardController::class, 'indexByConnectionId']);

Route::get('/dashboards/dashboard/{token}', function (Request $request, $token) {
	// INFO: recupero url compresa di querystring
	// dd($request->fullUrl());
	// INFO: recupero la querystring convertita in un array
	// dd($request->query());
	$querystring = $request->query();
	// recupero il campo connectionId relativa alla dashboard ricevuta come parametro
	$dashboard = BIdashboard::findOrFail($token);
	// effettuo la connessione al DB, impostando le variabili di sessione (session('db_driver'))
	BIConnectionsController::curlDBConnection($dashboard->connectionId);
	// restituisco il token alla view per poter recuperare il json della dashboard tramite la route dashboard_show
	// return view('web_bi.dashboards.dashboard')->with('token', $token);
	return view('web_bi.dashboards.dashboard')->with('token', $token)->with('url', $request->fullUrl())->with('querystring', http_build_query($querystring));
})->middleware(['guest'])->name('web_bi.dashboards.dashboard');

// generare il link per raggiungere la dashboard dall'esterno
Route::get('/dashboards/test/{token}', function (Request $request, $token) {
	// dd($request->query());
	$querystring = $request->query();
	// il token è un parametro richiesto dalla route 'web_bi.dashboards.dashboard', i successivi parametri vengono
	// interpretati come querystring
	$params = ['token' => $token];
	foreach ($querystring as $field => $value) {
		$params[$field] = '_value_';
		// WARN: se il valore è NULL il parametro non viene aggiunto nel secondo argomento dell'Helper route
		// $params[$field] = $value;
	}
	// dump($params);
	// return route('web_bi.dashboards.dashboard', ['token' => 't424xsx', 'customer_id_field' => 'cem_azienda_id', 'customer_id_value' => 437]);
	// return route('web_bi.dashboards.dashboard', ['token' => $token, 'test' => 4]);
	return route('web_bi.dashboards.dashboard', $params);
	// http://example.com/post/1?search=rocket
});

// test vertica
Route::get('/mapping/test_vertica', [MapDatabaseController::class, 'test_vertica']); // connessione con il metodo usato in Zend / PHP
Route::get('/mapping/vertica_odbc', [MapDatabaseController::class, 'vertica_odbc']); // connessione con ORM / Facade di Laravel

// routes

require __DIR__ . '/auth.php';
