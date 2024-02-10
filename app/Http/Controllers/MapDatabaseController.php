<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Classes\Cube;
use Exception;
use Illuminate\Support\Facades\Schema;

class MapDatabaseController extends Controller
{
  public function mapdb()
  {
    // recupero l'elenco delle dimensioni create da bi_dimensions.
    // NOTE: il support alle query su colonne JSON è per mysql 5.7+ https://laravel.com/docs/8.x/queries#json-where-clauses
    // $dimensions = DB::table('bi_dimensions')->get('json_value'); // QueryBuilder
    // $dimensions = BIdimension::get('json_value'); // Eloquent
    // TODO: connessione a mysql
    // $schemaList = DB::connection('mysql')->select("SHOW SCHEMAS;");
    $schemaList = DB::connection('vertica_odbc')->select("SELECT SCHEMA_NAME FROM V_CATALOG.SCHEMATA WHERE IS_SYSTEM_SCHEMA = FALSE ORDER BY SCHEMA_NAME;");
    // dd($schemaList);
    return view('web_bi.mapdb')->with('schemes', $schemaList);
    // altro esempio
    // return view('web_bi.mapping')->with(['dimensions' => json_encode($dimensions), 'schemes' => $schemaList]);
  }

  // test connessione vertica (senza utilizzo di Eloquen/ORM)
  public function test_vertica()
  {

    # A simple function to trap errors from queries
    function errortrap_odbc($conn, $sql)
    {
      if (!$rs = odbc_exec($conn, $sql)) {
        echo "<br/>Failed to execute SQL: $sql<br/>" . odbc_errormsg($conn);
      } else {
        echo "<br/>Success: " . $sql;
      }
      return $rs;
    }
    # Connect to the Database
    $dsn = "VMart251";
    // $conn = odbc_connect($dsn,'dbadmin','password');
    $conn = odbc_connect($dsn, '', '');
    echo $conn;
    if ($conn == NULL) {
      echo odbc_error();
      echo odbc_errormsg();
      exit;
    }
    echo "<p>Connected with DSN: $dsn</p>";
    $sql = "SELECT ID, DESCRIZIONE FROM automotive_bi_data.Azienda WHERE id = 43;";
    if ($result = errortrap_odbc($conn, $sql)) {
      var_dump($result);
      $row = odbc_fetch_array($result);
      // exit;
      /*echo "<pre>";
            while($row = odbc_fetch_array($result) ) {
                var_dump($row);
            }*/
      // echo "</pre>";
    }
    dd($row);
  }

  // test utilizzando Eloquent
  public function vertica_odbc()
  {
    // Facade
    // utilizzo di odbc dopo l'installazione del repository laravel-odbc
    // https://github.com/andreossido/laravel-odbc
    /* $books = DB::table('Azienda')->where('id', '473')->get(); */
    /* $tablesList = DB::table('all_tables')->where('schema_name', 'automotive_bi_data')->get('table_name'); errore perchè all_tables non è presente nello schema automotive_bi_data, probabilmente qui potrei creare un'altra connessione in config/database.php per accedere a schemi diversi, dovrò comunque farlo per lo schema decisyon_cache */
    $tablesList = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='automotive_bi_data';");
    /* $books = DB::connection('vertica_odbc')->table('automotive_bi_data.Azienda')->where('id', '473')->get(); */
    dd($tablesList);

    # ORM
    /* $books = Book::where('Author', 'Abram Andrea')->get(); */
  }

  // Invocata sia da Mapping (ottengo la lista dei campi della tabella) che da report (dialog-filter)
  public function table_info($schema, $table)
  {
    /* dd($table); */
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    // $info = DB::connection('vertica_odbc')->select("SELECT C.COLUMN_NAME, C.DATA_TYPE, C.IS_NULLABLE, CC.CONSTRAINT_NAME
    //             FROM COLUMNS C LEFT JOIN CONSTRAINT_COLUMNS CC
    //             ON C.TABLE_ID=CC.TABLE_ID
    //             AND C.COLUMN_NAME=CC.COLUMN_NAME
    //             AND CC.CONSTRAINT_TYPE='p'
    //             WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table'
    //             ORDER BY c.ordinal_position ASC;");

    // $info = DB::connection('vertica_odbc')->select("SELECT C.column_name, c.is_nullable, types.type_name, c.data_type_length, c.ordinal_position
    //             FROM COLUMNS C, TYPES types
    //             WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table' and C.data_type_id = types.type_id
    //             ORDER BY c.ordinal_position ASC;");

    $info = DB::connection('vertica_odbc')->table('COLUMNS')
      ->select('column_name', 'type_name', 'data_type_length', 'ordinal_position')
      ->join('TYPES', 'COLUMNS.data_type_id', 'TYPES.type_id')
      ->where('TABLE_SCHEMA', $schema)->where('TABLE_NAME', $table)->orderBy('ordinal_position')->get();
    return response()->json([$table => $info]);
    // return response()->json($info);
  }

  // chiamata con promise.all
  public function tables_info($schema, $table)
  {
    /* dd($table); */
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    // $info = DB::connection('vertica_odbc')->select("SELECT C.COLUMN_NAME, C.DATA_TYPE, C.IS_NULLABLE, CC.CONSTRAINT_NAME
    //             FROM COLUMNS C LEFT JOIN CONSTRAINT_COLUMNS CC
    //             ON C.TABLE_ID=CC.TABLE_ID
    //             AND C.COLUMN_NAME=CC.COLUMN_NAME
    //             AND CC.CONSTRAINT_TYPE='p'
    //             WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table'
    //             ORDER BY c.ordinal_position ASC;");

    // $info = DB::connection('vertica_odbc')->select("SELECT C.column_name, c.is_nullable, types.type_name, c.data_type_length, c.ordinal_position FROM COLUMNS C, TYPES types WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table' and C.data_type_id = types.type_id ORDER BY c.ordinal_position ASC;");
    $info = DB::connection('vertica_odbc')->table('COLUMNS')
      ->select('column_name', 'type_name', 'data_type_length', 'ordinal_position')
      ->join('TYPES', 'COLUMNS.data_type_id', 'TYPES.type_id')
      ->where('TABLE_SCHEMA', $schema)->where('TABLE_NAME', $table)->orderBy('ordinal_position')->get();

    return response()->json([$table => $info]);
  }

  public function columns_info($schema, $table, $column)
  {
    /* dd($table); */
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    $info = DB::connection('vertica_odbc')->select("SELECT C.COLUMN_NAME, C.DATA_TYPE, C.IS_NULLABLE, CC.CONSTRAINT_NAME, C.TABLE_SCHEMA, C.TABLE_NAME
                FROM COLUMNS C LEFT JOIN CONSTRAINT_COLUMNS CC
                ON C.TABLE_ID=CC.TABLE_ID
                AND C.COLUMN_NAME=CC.COLUMN_NAME
                AND CC.CONSTRAINT_TYPE='p'
                WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table'
                AND C.COLUMN_NAME = '$column'
                ORDER BY c.ordinal_position ASC;");
    return response()->json($info);
  }

  public function table_preview($schema, $table)
  {
    /* dd($table); */
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    $data = DB::connection('vertica_odbc')->select("SELECT * FROM $schema.$table LIMIT 50;");
    return response()->json($data);
  }

  // ottengo valori distinti per il field selezionato (dialog-filter)
  public function distinct_values($schema, $table, $field)
  {
    $values = DB::connection('vertica_odbc')->table($schema . "." . $table)->distinct()->orderBy($field, 'asc')->limit(500)->get($field);
    return response()->json($values);
  }

  // Elenco delle tabelle dello schema selezionato
  public function tables($schema)
  {
    /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
    /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
    // connessione a vertica per recuperare l'elenco delle tabelle
    $tables = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='$schema' ORDER BY TABLE_NAME ASC;");
    /* $tables = DB::connection('vertica')->select("SELECT * FROM automotive_bi_data.Azienda"); */
    return response()->json($tables);
  }

  public function copy_table($fromId, $toId)
  {
    // dd($fromId, $toId);
    // TODO: se la tabella di destinazione già esiste la elimino
    if (Schema::connection('vertica_odbc')->hasTable("WEB_BI_{$toId}")) {
      // tabella esiste
      // echo ("tabella $toId esiste");
      Schema::connection('vertica_odbc')->drop("decisyon_cache.WEB_BI_{$toId}");
    }
    $sql = "SELECT COPY_TABLE ('decisyon_cache.WEB_BI_{$fromId}','decisyon_cache.WEB_BI_{$toId}');";
    // NOTE: forse può essere utilizzato ->select invece di ->statement
    $copy = DB::connection('vertica_odbc')->statement($sql);
    return $copy;
  }


  // preview del datamart, 100 righe
  public function preview($id)
  {
    // dd($id);
    // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
    // $data = DB::connection('vertica_odbc')->table($table)->limit(5)->get(); // ok
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497, 43, 473, 437, 445, 461, 485, 549, 621, 1000002079, 455, 471, 179])->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497])->paginate(15000);
    $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->paginate(15000);
    return $data;
  }

  public function datamart($id)
  {
    // dd($id);
    // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
    // TODO viene utilizzata anche dalla preview, forse per la preview meglio utilizzare un'altra function
    // $data = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.WEB_BI_$id LIMIT 5000");
    $table = "decisyon_cache.WEB_BI_$id";
    // $data = DB::connection('vertica_odbc')->table($table)->limit(10)->get(); // ok

    // $data = DB::connection('vertica_odbc')->table($table)->select("area_id", "zona_id", "dealer_id")->get();
    // Utilizzo di paginate()
    // $data = DB::connection('vertica_odbc')->table($table)->select("dealer_id", "dealer_ds")->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->where("dealer_id", "=", 447)->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [447, 497])->paginate(15000);
    $data = DB::connection('vertica_odbc')->table($table)->paginate(15000);
    return $data;

    // return response()->json($data);
  }

  // Questo metodo l'ho messo in POST dopo aver ricevuto gli errori di memory_limit.
  // Siccome si verificano ugualmente ho commentato questo Metodo, che usa il POST. In futuro mi
  // potrà servire se decido di inviare qui alcuni dati, ad esempio, alcuni parametri per la query, come la definizione
  // delle colonne
  public function datamartPost(Request $request)
  {
    dd($request);
    $id = $request->input(0);
    dd($id);
    // dd($id);
    // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
    // if ($datamart) {
    $data = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.WEB_BI_$id LIMIT 20");
    // dd(memory_get_usage());
    // dd(memory_get_peak_usage());
    // }
    // dd($datamart);
    // dd($data);
    return response()->json($data);
  }

  // sheet
  public function sheetCreate(Request $request)
  {
    $process = json_decode(json_encode($request->all())); // object
    $q = new Cube();
    // imposto le proprietà con i magic methods
    $q->reportId = $process->{'id'};
    $q->facts = $process->{'facts'}; // array
    $q->datamartId = $process->{'datamartId'};
    $q->baseTableName = "WEB_BI_TMP_BASE_{$q->reportId}_{$q->datamartId}";
    $q->datamartName = "WEB_BI_{$q->reportId}_{$q->datamartId}";
    $q->baseColumns = $process->{'fields'};
    // imposto le colonne da includere nel datamart finale
    $q->fields();
    $q->select();
    foreach ($q->facts as $factId) {
      if (property_exists($process, 'baseMeasures')) {
        $q->baseMetrics = $process->{'baseMeasures'}->{$factId};
        $q->metrics();
        $q->from($process->{'from'}->{$factId});
        $q->where($process->{'joins'}->{$factId});
        if (property_exists($process, 'compositeMeasures')) $q->compositeMetrics = $process->{'compositeMeasures'};
        // i filtri vengono verificati già nella funzione createProcess()
        $q->filters($process->{'filters'});
        $q->groupBy($process->{'fields'});
        $baseTable = $q->baseTable();
        if (!$baseTable) {
          // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
          // creo una tabella temporanea per ogni metrica filtrata
          // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
          if (property_exists($process, 'advancedMeasures')) {
            // TODO: rinominare 'advancedMeasures'
            $q->filteredMetrics = $process->{'advancedMeasures'}->{$factId};
            // verifico quali, tra le metriche filtrate, contengono gli stessi filtri.
            // Le metriche che contengono gli stessi filtri vanno eseguite in un unica query.
            // Oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
            $q->groupMetricsByFilters = (object)[];
            // raggruppare per tipologia dei filtri
            $groupFilters = array();
            // creo un gruppo di filtri
            foreach ($q->filteredMetrics as $metric) {
              // dd($metric->formula->filters);
              // ogni gruppo di filtri ha un tokenGrouup diverso come key dell'array
              $tokenGroup = "group_" . bin2hex(random_bytes(4));
              if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
            }
            // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
            foreach ($groupFilters as $token => $group) {
              $metrics = array();
              foreach ($q->filteredMetrics as $metric) {
                if (get_object_vars($metric->filters) == get_object_vars($group)) {
                  // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                  array_push($metrics, $metric);
                }
              }
              // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
              $q->groupMetricsByFilters->$token = $metrics;
            }
            // dd($q->groupMetricsByFilters);
            $metricTable = $q->createMetricDatamarts();
          }
          // echo 'elaborazione createDatamart';
          // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
          // $datamartName = $q->createDatamart();
          // Restituisco il reportId
          // return $q->createDatamart();

          // restituisco un ANTEPRIMA del datamart appena creato
          // WARN: Errore di memory exhausted, bisogna utilizzare il paginate()
          // $datamartResult = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.$q->datamartName LIMIT 10000;");
          // return response()->json($datamartResult);

          // $datamartResult = DB::connection('vertica_odbc')->table("decisyon_cache.$q->datamartName")->paginate(15000);
          // return $datamartResult;
        } else {
          return 'BaseTable non create';
        }
      }
      /* $q->from($elements->{'from'});
      $q->where($elements->{'joins'});
      if (property_exists($elements, 'compositeMeasures')) $q->compositeMetrics = $elements->{'compositeMeasures'};
      if (property_exists($process, 'filters')) $q->filters($process->{'filters'});
      $q->groupBy($process->{'fields'});
      $baseTable = $q->baseTable();
      // dd($baseTable);
      if (!$baseTable) {
        // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
        // creo una tabella temporanea per ogni metrica filtrata
        // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
        if (property_exists($elements, 'advancedMeasures')) {
          $q->filteredMetrics = $elements->{'advancedMeasures'};
          // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
          // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
          $q->groupMetricsByFilters = (object)[];
          // raggruppare per tipologia dei filtri
          $groupFilters = array();
          // creo un gruppo di filtri
          foreach ($q->filteredMetrics as $metric) {
            // dd($metric->formula->filters);
            // ogni gruppo di filtri ha un tokenGrouup diverso come key dekk'array
            $tokenGroup = "group_" . bin2hex(random_bytes(4));
            if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
          }
          // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
          foreach ($groupFilters as $token => $group) {
            $metrics = array();
            foreach ($q->filteredMetrics as $metric) {
              if (get_object_vars($metric->filters) == get_object_vars($group)) {
                // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                array_push($metrics, $metric);
              }
            }
            // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
            $q->groupMetricsByFilters->$token = $metrics;
          }
          // dd($q->groupMetricsByFilters);
          $metricTable = $q->createMetricDatamarts();
        }
        // echo 'elaborazione createDatamart';
        // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
        // $datamartName = $q->createDatamart();
        // Restituisco il reportId
        // return $q->createDatamart();

        // restituisco un ANTEPRIMA del datamart appena creato
        // WARN: Errore di memory exhausted, bisogna utilizzare il paginate()
        // $datamartResult = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.$q->datamartName LIMIT 10000;");
        // return response()->json($datamartResult);

        // $datamartResult = DB::connection('vertica_odbc')->table("decisyon_cache.$q->datamartName")->paginate(15000);
        // return $datamartResult;
      } else {
        return 'BaseTable non create';
      } */
    }
    return $q->createDatamart();
    // if (property_exists($process, 'compositeMeasures')) $q->compositeMetrics = $process->{'compositeMeasures'};
    // if (property_exists($cube, 'metrics')) {
    //   $q->baseMetrics = $cube->{'metrics'};
    //   $q->metrics();
    // }
    // $q->from($cube->{'from'});
    // $q->where($cube->{'joins'});
    // su property_exists
    // if (property_exists($process, 'filters')) $q->filters($process->{'filters'});
    // $q->groupBy($process->{'fields'});
    // // try {
    // // TODO: da rinominare in 'baseTable'
    // $baseTable = $q->baseTable();
    // dd($baseTable);
    /* } catch (Exception $e) {
      $msg = $e->getMessage();
      // return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
      // header($_SERVER["SERVER_PROTOCOL"] . ' 500 Internal Server Error', true, 500);
      // return abort(500, "ERRORE ESECUZIONE QUERY : $msg");
      abort(500, "ERRORE ESECUZIONE QUERY : $msg");
    } */
  }

  public function sheetCurlProcess($report)
  {
    // curl http://127.0.0.1:8000/curl/process/210wu29ifoh/schedule
    // con il login : curl https://user:psw@gaia.automotive-cloud.com/curl/process/{processToken}/schedule
    // ...oppure : curl -u 'user:psw' https://gaia.automotive-cloud.com/curl/process/{processToken}/schedule
    // var_dump($report);
    // var_dump($json->fields);
    // exit;
    // $json_decoded = json_decode($json); // object
    // $json_value = json_decode($json_decoded->{'json_value'});
    // $report = $json_value;
    // $reportName = $json_value->{'name'};

    $q = new Cube();
    // imposto le proprietà con i magic methods
    $q->reportId = $report->{'id'};
    $q->baseTableName = "WEB_BI_TMP_BASE_$q->reportId";
    $q->datamartName = "WEB_BI_$q->reportId";
    $q->baseColumns = $report->{'fields'};

    // imposto le colonne da includere nel datamart finale
    $q->fields();
    $q->select($report->{'fields'});
    if (property_exists($report, 'compositeMeasures')) $q->compositeMetrics = $report->{'compositeMeasures'};
    if (property_exists($report, 'metrics')) {
      $q->baseMetrics = $report->{'metrics'};
      $q->metrics();
    }
    $q->from($report->{'from'});
    $q->where($report->{'joins'});
    if (property_exists($report, 'filters')) $q->filters($report->{'filters'});
    $q->groupBy($report->{'fields'});
    /* dd($q); */
    // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
    // try {
    $baseTable = $q->baseTable(null);
    if (!$baseTable) {
      // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
      // creo una tabella temporanea per ogni metrica filtrata
      // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
      if (property_exists($report, 'advancedMeasures')) {
        $q->filteredMetrics = $report->{'advancedMeasures'};
        // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
        // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
        $q->groupMetricsByFilters = (object)[];
        // raggruppare per tipologia dei filtri
        $groupFilters = array();
        // creo un gruppo di filtri
        foreach ($q->filteredMetrics as $metric) {
          // dd($metric->formula->filters);
          // ogni gruppo di filtri ha un tokenGrouup diverso come key dekk'array
          $tokenGroup = "group_" . bin2hex(random_bytes(4));
          if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
        }
        // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
        foreach ($groupFilters as $token => $group) {
          $metrics = array();
          foreach ($q->filteredMetrics as $metric) {
            if (get_object_vars($metric->filters) == get_object_vars($group)) {
              // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
              array_push($metrics, $metric);
            }
          }
          // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
          $q->groupMetricsByFilters->$token = $metrics;
        }
        // dd($q->groupMetricsByFilters);
        $metricTable = $q->createMetricDatamarts(null);
      }
      // echo 'elaborazione createDatamart';
      // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
      $datamartName = $q->createDatamart(null);
      // echo $datamartName;
      // var_dump($datamartName);
      // if ($datamartName) return "Datamart ({$datamartName}) per il report {$reportName} creato con successo!\n";
      if ($datamartName) return "OK\n";
    }
    // } catch (Exception $e) {
    //   $msg = $e->getMessage();
    //   return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
    //   // abort(500, "ERRORE ESECUZIONE QUERY : $msg");
    // }
    // dd($baseTable);
  }

  public function sql(Request $request)
  {
    // echo gettype($cube);
    // dd($request);
    // per accedere al contenuto della $request lo converto in json codificando la $request e decodificandolo in json
    $process = json_decode(json_encode($request->all())); // object
    $q = new Cube($process);
    // imposto le proprietà con i magic methods
    /* $q->reportId = $process->{'id'};
    $q->facts = $process->{'facts'}; // array
    $q->datamartId = $process->{'datamartId'};
    // $q->baseTableName = "WEB_BI_TMP_BASE_{$q->reportId}_{$q->datamartId}";
    $q->datamartName = "WEB_BI_{$q->reportId}_{$q->datamartId}"; */
    // $q->baseColumns = $process->{'fields'};
    $q->sql_info = (object)[
      "SELECT" => (object)[],
      "METRICS" => (object)[],
      "FROM" => (object)[],
      "WHERE" => (object)[],
      "WHERE-TIME" => (object)[],
      "AND" => (object)[],
      "GROUP BY" => (object)[]
    ];
    // imposto le colonne da includere nel datamart finale
    $q->datamartFields();
    $q->createSelect();
    foreach ($q->facts as $factId) {
      $factNumber = substr($factId, -5);
      $q->baseTableName = "WEB_BI_TMP_BASE_{$q->reportId}_{$q->datamartId}_{$factNumber}";
      if (property_exists($process, 'baseMeasures')) {
        $q->baseMetrics = $process->{'baseMeasures'}->{$factId};
        $q->metrics();
        // var_dump($q->_metrics_base);
        $q->from($process->{'from'}->{$factId});
        $q->where($process->{'joins'}->{$factId});
        if (property_exists($process, 'compositeMeasures')) $q->compositeMetrics = $process->{'compositeMeasures'};
        // i filtri vengono verificati già nella funzione createProcess()
        $q->filters($process->{'filters'});
        $q->groupBy($process->{'fields'});
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        $resultSQL['base'] = $q->baseTable();
        if (property_exists($process, 'advancedMeasures')) {
          $q->filteredMetrics = $process->{'advancedMeasures'};
          $q->json_info_advanced = array();
          // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
          // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
          $q->groupMetricsByFilters = (object)[];
          // raggruppare per tipologia dei filtri
          $groupFilters = array();
          // creo un gruppo di filtri
          foreach ($q->filteredMetrics as $metric) {
            // var_dump($metric->filters);
            // ogni gruppo di filtri ha un tokenGrouup diverso come key dell'array
            $tokenGroup = "group_" . bin2hex(random_bytes(4));
            if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
          }
          // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
          foreach ($groupFilters as $token => $group) {
            $metrics = array();
            foreach ($q->filteredMetrics as $metric) {
              if (get_object_vars($metric->filters) == get_object_vars($group)) {
                // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                array_push($metrics, $metric);
              }
            }
            // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
            $q->groupMetricsByFilters->$token = $metrics;
          }
          // dd($q->groupMetricsByFilters);
          $resultSQL['advanced'] = $q->createMetricDatamarts();
          // WARN: Attenzione, nel comando dd() gli oggetti all'interno di json_info_advanced non
          // sono visibili ma hanno un numero di riferimento che punta all'oggetto originale.

          // return $resultSQL;
        }
      }
    }
    // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
    // creo una tabella temporanea per ogni metrica filtrata
    // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
    $resultSQL['datamart'] = $q->createDatamart();
    return $resultSQL;
    // return nl2br(implode("\n\n\n", $resultSQL));
  }

  /* public function sql(Request $request)
  {
    // echo gettype($cube);
    // dd($request);
    // per accedere al contenuto della $request lo converto in json codificando la $request e decodificandolo in json
    $cube = json_decode(json_encode($request->all())); // object
    $q = new Cube();
    // imposto le proprietà con i magic methods
    $q->reportId = $cube->{'id'};
    $q->datamartId = $cube->{'datamartId'};
    $q->facts = $cube->{'facts'}; // array
    $q->baseTableName = "WEB_BI_TMP_BASE_{$q->reportId}_{$q->datamartId}";
    $q->datamartName = "WEB_BI_{$q->reportId}_{$q->datamartId}";
    $q->baseColumns = $cube->{'fields'};
    $q->json__info = (object)[
      "SELECT" => (object)[],
      "METRICS" => (object)[],
      "FROM" => (object)[],
      "WHERE" => (object)[],
      "WHERE-TIME" => (object)[],
      "AND" => (object)[],
      "GROUP BY" => (object)[]
    ];
    // imposto le colonne da includere nel datamart finale
    $q->fields();
    $q->select();
    // imposto il magic method con le metriche composte
    if (property_exists($cube, 'compositeMeasures')) $q->compositeMetrics = $cube->{'compositeMeasures'};
    // verifico se sono presenti metriche di base
    if (property_exists($cube, 'metrics')) {
      $q->baseMetrics = $cube->{'metrics'};
      $q->metrics();
    }
    // creo le clausole per SQL
    $q->from($cube->{'from'});
    $q->where($cube->{'joins'});
    // TODO: un filtro deve essere sempre presente, qui dovrei togliere il controllo
    // su property_exists

    if (property_exists($cube, 'filters')) $q->filters($cube->{'filters'});
    $q->groupBy($cube->{'fields'});
    // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
    $resultSQL['base'] = $q->baseTable();
    // dd($resultSQL);
    // return $resultSQL;
    // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
    // creo una tabella temporanea per ogni metrica filtrata
    if (property_exists($cube, 'advancedMeasures')) {
      $q->filteredMetrics = $cube->{'advancedMeasures'};
      $q->json_info_advanced = array();
      // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
      // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
      $q->groupMetricsByFilters = (object)[];
      // raggruppare per tipologia dei filtri
      $groupFilters = array();
      // creo un gruppo di filtri
      foreach ($q->filteredMetrics as $metric) {
        // var_dump($metric->filters);
        // ogni gruppo di filtri ha un tokenGrouup diverso come key dell'array
        $tokenGroup = "group_" . bin2hex(random_bytes(4));
        if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
      }
      // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
      foreach ($groupFilters as $token => $group) {
        $metrics = array();
        foreach ($q->filteredMetrics as $metric) {
          if (get_object_vars($metric->filters) == get_object_vars($group)) {
            // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
            array_push($metrics, $metric);
          }
        }
        // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
        $q->groupMetricsByFilters->$token = $metrics;
      }
      // dd($q->groupMetricsByFilters);
      $resultSQL['advanced'] = $q->createMetricDatamarts();
      // WARN: Attenzione, nel comando dd() gli oggetti all'interno di json_info_advanced non
      // sono visibili ma hanno un numero di riferimento che punta all'oggetto originale.

      // return $resultSQL;
    }
    // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
    $resultSQL['datamart'] = $q->createDatamart();
    return $resultSQL;
    // return nl2br(implode("\n\n\n", $resultSQL));
  } */

  // curl
  public function curlprocess($json)
  {
    // curl http://127.0.0.1:8000/curl/process/210wu29ifoh/schedule
    // con il login : curl https://user:psw@gaia.automotive-cloud.com/curl/process/{processToken}/schedule
    // ...oppure : curl -u 'user:psw' https://gaia.automotive-cloud.com/curl/process/{processToken}/schedule
    $json_decoded = json_decode($json); // object
    $json_value = json_decode($json_decoded->{'json_value'});
    $cube = $json_value->{'report'};
    $reportName = $json_value->{'name'};

    $q = new Cube();
    // imposto le proprietà con i magic methods
    $q->reportId = $cube->{'processId'};
    $q->baseTableName = "WEB_BI_TMP_BASE_$q->reportId";
    $q->datamartName = "WEB_BI_$q->reportId";
    $q->baseColumns = $cube->{'select'};
    $q->json__info = (object)[
      "SELECT" => "SELECT",
      "columns" => (object)[],
      "FROM" => "FROM",
      "from" => (object)[],
      "WHERE" => "WHERE",
      "where" => (object)[],
      "filters" => (object)[],
      "GROUP" => "GROUP BY",
      "groupBy" => (object)[]
    ];
    // imposto le colonne da includere nel datamart finale
    $q->fields();
    // imposto il magic method con le metriche composte
    if (property_exists($cube, 'compositeMetrics')) $q->compositeMetrics = $cube->{'compositeMetrics'};
    // verifico se sono presenti metriche di base
    if (property_exists($cube, 'metrics')) {
      $q->baseMetrics = $cube->{'metrics'};
      $q->metrics();
    }

    // creo le clausole per SQL
    $q->select($cube->{'select'});
    $q->from($cube->{'from'});
    $q->where($cube->{'where'});
    if (property_exists($cube, 'filters')) $q->filters($cube->{'filters'});
    // TODO: siccome il group by viene creato uguale alla clausola SELECT potrei unirli e non fare qui 2 chiamate
    $q->groupBy($cube->{'select'});
    /* dd($q); */
    // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
    try {
      $baseTable = $q->baseTable(null);
      if (!$baseTable) {
        // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
        // creo una tabella temporanea per ogni metrica filtrata
        // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
        if (property_exists($cube, 'advancedMetrics')) {
          $q->filteredMetrics = $cube->{'advancedMetrics'};
          // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
          // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
          $q->groupMetricsByFilters = (object)[];
          // raggruppare per tipologia dei filtri
          $groupFilters = array();
          // creo un gruppo di filtri
          foreach ($q->filteredMetrics as $metric) {
            // ogni gruppo di filtri ha un tokenGrouup diverso come key dekk'array
            $tokenGroup = "group_" . bin2hex(random_bytes(4));
            if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
          }
          // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
          foreach ($groupFilters as $token => $group) {
            $metrics = array();
            foreach ($q->filteredMetrics as $metric) {
              if (get_object_vars($metric->filters) == get_object_vars($group)) {
                // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                array_push($metrics, $metric);
              }
            }
            // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
            $q->groupMetricsByFilters->$token = $metrics;
          }
          // dd($q->groupMetricsByFilters);
          $q->createMetricDatamarts(null);
        }
        // echo 'elaborazione createDatamart';
        // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
        $datamartName = $q->createDatamart(null);
        // echo $datamartName;
        // var_dump($datamartName);
        // if ($datamartName) return "Datamart ({$datamartName}) per il report {$reportName} creato con successo!\n";
        if ($datamartName) return "OK\n";
      }
    } catch (Exception $e) {
      $msg = $e->getMessage();
      return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
      // abort(500, "ERRORE ESECUZIONE QUERY : $msg");
    }
    // dd($baseTable);
  }
}
