<?php

namespace App\Http\Controllers;

use App\Models\BIConnections;
use Illuminate\Http\Request;
// aggiunta per utilizzare Config per la connessione a differenti db
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class BIConnectionsController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    $connections = BIConnections::get(['id', 'name', 'driver', 'host']);
    // $connections = BIConnections::all();
    $names = [];
    // dd($connections);
    foreach ($connections as $connection) {
      // dd($das->name);
      $names[] = $connection;
    }
    return view('web_bi.connections')->with('connections', $names);
  }

  /**
   * Show the form for creating a new resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function create()
  {
    //
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\Response
   */
  public function store(Request $request)
  {
    $connection = new BIConnections();
    // salvo su DB
    $connection->name = $request->input("title");
    $connection->driver = $request->input("database");
    $connection->host = $request->input("host");
    $connection->port = $request->input("port");
    $connection->dsn = $request->input("dsn");
    $connection->schema = $request->input("schema");
    $connection->username = $request->input("username");
    $connection->password = $request->input("password");
    return $connection->save();
  }

  public static function getDB()
  {
    $database_name = "client_" . session('db_driver');
    // la key 'db_client_name' deve corrispondere alla key memorizzata in database.php
    session(['db_client_name' => $database_name]);
    // dump($database_name);
    // $schemata = [config("database.connections.{$database_name}.schema")[0], session('db_schema')];
    Config::set([
      "database.connections.{$database_name}.driver" => session('db_driver'),
      "database.connections.{$database_name}.host" => session('db_host'),
      "database.connections.{$database_name}.port" => session('db_port'),
      "database.connections.{$database_name}.dsn" => session('db_dsn'),
      "database.connections.{$database_name}.database" => session('db_schema'),
      // TODO: andrà implementato un nome schema di gaiaBi al posto di decisyon_cache
      "database.connections.{$database_name}.schema" => ['decisyon_cache', session('db_schema')],
      // "database.connections.{$database_name}.schema" => $schemata,
      "database.connections.{$database_name}.username" => session('db_username'),
      "database.connections.{$database_name}.password" => session('db_password'),
    ]);
    // dump(config("database.connections.{$database_name}"));
  }

  /*
 * Questo metodo statico viene invocato da MapDatabaseControlle->scheduleProcess()
 * Lo scopo di questo metodo è inizializzare le variabili di sessione che creano la connessione al DB
 * quando viene utilizzato curl (dall'applicazione web la connessione viene effettuata sulla home).
 * La connessione da curl viene recuperata dall'oggetto WorkBook, al cui interno c'è il campo databaseId
 * */
  public static function curlDBConnection($id)
  {
    $element = BIConnections::findOrFail($id);
    session(['db_id' => $element->id]);
    session(['db_name' => $element->name]);
    session(['db_driver' => $element->driver]);
    session(['db_dsn' => $element->dsn]);
    session(['db_host' => $element->host]);
    session(['db_port' => $element->port]);
    session(['db_schema' => $element->schema]);
    session(['db_username' => $element->username]);
    session(['db_password' => $element->password]);
    BIConnectionsController::getDB();

    // dd(session()->get('host')); // stesso risultato di session('host')
    // $schemaList = DB::connection('clientDatabase')->table("information_schema.SCHEMATA")->select("SCHEMA_NAME")->orderBy("SCHEMA_NAME")->get();
    // dd($schemaList);
    return response()->json($element);
  }

  /**
   * Display the specified resource.
   * Viene stabilita la connessione al db in base alla selezione dell'utente
   *
   * @param  \App\Models\BIConnections  $bIConnections
   * @return \Illuminate\Http\Response
   */
  public function show(BIConnections $bIConnections, $id)
  {
    $element = $bIConnections::findOrFail($id);
    session(['db_id' => $element->id]);
    session(['db_name' => $element->name]);
    session(['db_driver' => $element->driver]);
    session(['db_dsn' => $element->dsn]);
    session(['db_host' => $element->host]);
    session(['db_port' => $element->port]);
    session(['db_schema' => $element->schema]);
    session(['db_username' => $element->username]);
    session(['db_password' => $element->password]);
    $this::getDB();

    // dd(session()->get('host')); // stesso risultato di session('host')
    // $schemaList = DB::connection('clientDatabase')->table("information_schema.SCHEMATA")->select("SCHEMA_NAME")->orderBy("SCHEMA_NAME")->get();
    // dd($schemaList);
    return response()->json($element);
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  \App\Models\BIConnections  $bIConnections
   * @return \Illuminate\Http\Response
   */
  public function edit(BIConnections $bIConnections)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \App\Models\BIConnections  $bIConnections
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, BIConnections $bIConnections)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\BIConnections  $bIConnections
   * @return \Illuminate\Http\Response
   */
  public function destroy(BIConnections $bIConnections)
  {
    //
  }
}
