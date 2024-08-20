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
    return view('web_bi.index')->with('connections', $names);
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
    // dump($request->all());
    // dump($request->input('title'));
    // dump($request->input('host'));
    // dump($request->input('port'));
    // dump($request->input('db'));
    // dd($request->input('username'));

    $connection = new BIConnections();
    // salvo su DB
    $connection->name = $request->input("title");
    $connection->driver = $request->input("database");
    $connection->host = $request->input("host");
    $connection->port = $request->input("port");
    $connection->schema = $request->input("schema");
    $connection->username = $request->input("username");
    $connection->password = $request->input("password");
    return $connection->save();
  }

  /**
   * Display the specified resource.
   *
   * @param  \App\Models\BIConnections  $bIConnections
   * @return \Illuminate\Http\Response
   */
  public function show(BIConnections $bIConnections, $id)
  {
    $element = $bIConnections::findOrFail($id);
    // dd($element->host);
    session(['db_name' => $element->name]);
    session(['db_driver' => $element->driver]);
    session(['db_host' => $element->host]);
    session(['db_port' => $element->port]);
    session(['db_schema' => $element->schema]);
    session(['db_username' => $element->username]);
    session(['db_password' => $element->password]);
    // dump(session('client_db'));
    // dd(session()->get('host')); // stesso risultato di session('host')
    // dump(config('database.connections'));
    // Config::set('database.connections.clientDatabase', [
    //   'driver' => $element->driver,
    //   'host' => $element->host,
    //   'port' => $element->port,
    //   'database' => $element->schema,
    //   'username' => $element->username,
    //   'password' => $element->password,
    //   'charset' => 'utf8mb4',
    //   'collation' => 'utf8mb4_unicode_ci',
    //   'prefix' => '',
    //   'prefix_indexes' => true,
    //   'strict' => true,
    //   'engine' => 'innodb row_format=dynamic'
    // ]);
    dump(config('database.connections.clientDatabase'));
    Config::set([
      'database.connections.clientDatabase.driver' => session('db_driver', config('database.connections.clientDatabase.driver')),
      'database.connections.clientDatabase.host' => session('db_host', config('database.connections.clientDatabase.host')),
      'database.connections.clientDatabase.port' => session('db_port', config('database.connections.clientDatabase.port')),
      'database.connections.clientDatabase.database' => session('db_schema', config('database.connections.clientDatabase.database')),
      'database.connections.clientDatabase.username' => session('db_username', config('database.connections.clientDatabase.username')),
      'database.connections.clientDatabase.password' => session('db_password', config('database.connections.clientDatabase.password')),
    ]);
    dump(config('database.connections.clientDatabase'));
    $schemaList = DB::connection('clientDatabase')->table("information_schema.SCHEMATA")->select("SCHEMA_NAME")->orderBy("SCHEMA_NAME")->get();
    dd($schemaList);

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