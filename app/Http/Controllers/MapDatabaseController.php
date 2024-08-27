<?php

namespace App\Http\Controllers;

use DateTime;
use DateInterval;
use DatePeriod;
use DateTimeImmutable;
// ... oppure quando si istanzia l'oggetto
// new \DateTime() con lo slash perchè è un oggetto php

use Illuminate\Http\Request;
use App\Classes\Cube;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
// aggiunta per utilizzare create table
use Illuminate\Database\Schema\Blueprint;
// aggiunta per utilizzare Config per la connessione a differenti db
use App\Http\Controllers\BIConnectionsController;

class MapDatabaseController extends Controller
{
  public function mapdb()
  {
    // recupero ed imposto la connessione al db selezionata dall'utente nella index
    BIConnectionsController::getDB();
    // dump(session('db_client_name'));
    // dd(config('database.connections.client_odbc'));
    switch (session('db_driver')) {
      case 'mysql':
        $schemaList = DB::connection(session('db_client_name'))->select("SHOW SCHEMAS;");
        break;
      case 'odbc':
        $schemaList = DB::connection(session('db_client_name'))->table("V_CATALOG.SCHEMATA")->select("SCHEMA_NAME")->where("IS_SYSTEM_SCHEMA", FALSE)->orderBy("SCHEMA_NAME")->get();
        break;
      default:
        # code...
        break;
    }
    // dd($schemaList);

    // dump(Schema::connection("mysql")->hasTable("bi_sheets"));
    // dd(Schema::connection("vertica_odbc")->hasTable("decisyon_cache.WB_DATE"));
    // dump(Schema::connection("vertica_odbc")->hasTable("WB_DATE"));
    // dump(Schema::connection("vertica_odbc")->hasTable("automotive_bi_data.Azienda"));
    // dd(DB::connection("vertica_odbc")->getSchemaBuilder()->hasTable("WB_DATE"));
    // recupero l'elenco delle dimensioni create da bi_dimensions.
    // NOTE: il support alle query su colonne JSON è per mysql 5.7+ https://laravel.com/docs/8.x/queries#json-where-clauses
    // $dimensions = DB::table('bi_dimensions')->get('json_value'); // QueryBuilder
    // $dimensions = BIdimension::get('json_value'); // Eloquent
    // TODO: connessione a mysql
    // $schemaList = DB::connection('mysql')->select("SHOW SCHEMAS;");
    // $schemaList = DB::connection('vertica_odbc')->select("SELECT SCHEMA_NAME FROM V_CATALOG.SCHEMATA WHERE IS_SYSTEM_SCHEMA = FALSE ORDER BY SCHEMA_NAME;");
    // $schemaList = DB::connection('vertica_odbc')->table("V_CATALOG.SCHEMATA")->select("SCHEMA_NAME")->where("IS_SYSTEM_SCHEMA", FALSE)->orderBy("SCHEMA_NAME")->get();
    // session(['db_driver' => 'vertica']);
    // dd($schemaList);
    return view('web_bi.mapdb')->with('schemata', $schemaList);
    // altro esempio
    // return view('web_bi.mapping')->with(['dimensions' => json_encode($dimensions), 'schemes' => $schemaList]);
  }

  public function timeDimensionExists()
  {
    // dd(Schema::connection('vertica_odbc')->hasTable('decisyon_cache.WB_DATE')); ok
    return (Schema::connection(session('db_client_name'))->hasTable('WB_DATE'));
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
    BIConnectionsController::getDB();
    switch (session('db_driver')) {
      case 'odbc':
        $query = DB::connection(session('db_client_name'))->table('COLUMNS')
          ->select('column_name', 'type_name', 'data_type_length', 'ordinal_position')
          ->join('TYPES', 'COLUMNS.data_type_id', 'TYPES.type_id');
        break;
      case 'mysql':
        // TEST: da testare
        $query = DB::connection(session('db_client_name'))->table('information_schema.COLUMNS')
          ->select(
            'column_name',
            'data_type as type_name',
            DB::raw('CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL
              THEN CHARACTER_MAXIMUM_LENGTH
              ELSE NUMERIC_PRECISION END as data_type_length'),
            'ordinal_position'
          );
        break;
      default:
        break;
    }
    // $info = DB::connection('vertica_odbc')->table('COLUMNS')
    //   ->select('column_name', 'type_name', 'data_type_length', 'ordinal_position')
    //   ->join('TYPES', 'COLUMNS.data_type_id', 'TYPES.type_id')
    //   ->where('TABLE_SCHEMA', $schema)->where('TABLE_NAME', $table)->orderBy('ordinal_position')->get();
    $query->where('TABLE_SCHEMA', $schema)
      ->where('TABLE_NAME', $table)->orderBy('ordinal_position');
    // return response()->json([$table => $info]);
    return response()->json([$table => $query->get()]);
    // return response()->json($info);
  }

  public function datamartExists($id)
  {
    // dump($id);
    BIConnectionsController::getDB();
    // dd(config('database.connections.client_odbc'));
    // dd(Schema::connection('vertica_odbc')->hasTable("WEB_BI_$id"));
    // TEST: testare con mysql, sqlsrv e pgsql
    // Per eseguire correttamente il test, in fase di creazione della
    // connessione, deve essere aggiunto lo schema dove verranno memorizzati i datamart
    // Per questo motivo ho aggiunto una label relativa alla input Schema nella dialog di creazione
    // di una nuova connessione
    // dd(Schema::connection(session('db_client_name'))->hasTable("decisyon_cache.WEB_BI_$id"));
    // dd(Schema::connection(session('db_client_name'))->hasTable("WEB_BI_$id"));
    return Schema::connection(session('db_client_name'))->hasTable("WEB_BI_$id");
  }

  // 26.08.2024 Non ancora implementata da JS
  public function columns_info($schema, $table, $column)
  {
    /* dd($table); */
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    // TODO: nuova logica session('db_client_name')
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
    /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
    // $data = DB::connection('vertica_odbc')->select("SELECT * FROM $schema.$table LIMIT 50;");
    $data = DB::connection(session('db_client_name'))->select("SELECT * FROM $schema.$table LIMIT 50;");
    return response()->json($data);
  }

  // 26.08.2024 Non ancora implementata da JS
  // ottengo valori distinti per il field selezionato (dialog-filter)
  public function distinct_values($schema, $table, $field)
  {
    // TEST: 26.08.2024 da testare
    $values = DB::connection(session('db_client_name'))
      ->table($schema . "." . $table)->distinct()
      ->orderBy($field, 'asc')->limit(500)->get($field);
    return response()->json($values);
  }

  private function dropTIMEtables()
  {
    BIConnectionsController::getDB();
    switch (session('db_driver')) {
      case 'odbc':
        $foreignKey = 'CONSTRAINT';
        break;
      case 'mysql':
        $foreignKey = 'FOREIGN KEY';
        break;
      default:
        break;
    }
    if (Schema::connection(session('db_client_name'))->hasTable('WB_DATE')) {
      DB::connection(session('db_client_name'))->statement("ALTER TABLE decisyon_cache.WB_DATE DROP $foreignKey wb_date_month_id_foreign;");
      Schema::connection(session('db_client_name'))->drop('decisyon_cache.WB_DATE');
      if (Schema::connection(session('db_client_name'))->hasTable('WB_MONTHS')) {
        DB::connection(session('db_client_name'))->statement("ALTER TABLE decisyon_cache.WB_MONTHS DROP $foreignKey wb_months_quarter_id_foreign;");
        Schema::connection(session('db_client_name'))->drop('decisyon_cache.WB_MONTHS');
        if (Schema::connection(session('db_client_name'))->hasTable('WB_QUARTERS')) {
          DB::connection(session('db_client_name'))->statement("ALTER TABLE decisyon_cache.WB_QUARTERS DROP $foreignKey wb_quarters_year_id_foreign;");
          Schema::connection(session('db_client_name'))->drop('decisyon_cache.WB_QUARTERS');
          if (Schema::connection(session('db_client_name'))->hasTable('WB_YEARS')) Schema::connection(session('db_client_name'))->drop('decisyon_cache.WB_YEARS');
        }
      }
    }
  }

  private function wb_years($start, $end)
  {
    $yearsInterval = new DateInterval('P1Y');
    $yearPeriod = new DatePeriod($start, $yearsInterval, $end);
    $years = [];
    foreach ($yearPeriod as $date) {
      $currDate = new DateTimeImmutable($date->format('Y-m-d'));
      $years[(int) $date->format('Y')] = (int) $currDate->sub($yearsInterval)->format('Y');
    }

    // dd(Schema::connection(session('db_client_name'))->hasTable('WB_YEARS'));
    // dd($years);
    if (session('db_driver') === 'odbc') {
      $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WB_YEARS (
        id INTEGER PRIMARY KEY,
        previous INTEGER,
        year CHAR(6) NOT NULL) INCLUDE SCHEMA PRIVILEGES";
      $create_stmt = DB::connection(session('db_client_name'))->statement($sql);
    } else {
      $create_stmt = Schema::connection(session('db_client_name'))
        ->create('WB_YEARS', function (Blueprint $table) {
          $table->unsignedBigInteger('id')->primary();
          $table->unsignedSmallInteger('previous');
          $table->char('year', 6)->nullable(false);
        });
    }
    // $create_stmt : null tabella creata correttamente
    // dump(config("database.connections.client_mysql.database"));
    // dd(Schema::connection(session('db_client_name'))->hasTable('WB_YEARS'));
    // dd($create_stmt);
    // la tabella non esiste, la creo
    if (!$create_stmt) {
      foreach ($years as $currentYear => $lastYear) {
        DB::connection(session('db_client_name'))->table('decisyon_cache.WB_YEARS')->insert([
          'id' => $currentYear,
          'previous' => $lastYear,
          'year' => "Y {$currentYear}"
        ]);
      }
      // return DB::connection(session('db_client_name'))->statement('COMMIT;');
      // DB::connection(session('db_client_name'))->statement('COMMIT;');
    }
  }

  private function wb_quarters($start, $end)
  {
    $interval = new DateInterval('P3M');
    $period = new DatePeriod($start, $interval, $end);
    $json = (object) null;
    $quarter_id = NULL;
    $quarter_id = 0;
    foreach ($period as $date) {
      $currDate = new DateTimeImmutable($date->format('Y-m-d'));
      $quarter = ceil($currDate->format('n') / 3);
      $quarter_id = (int) "{$currDate->format('Y')}0{$quarter}";
      $last_year = (int) "{$currDate->sub(new DateInterval('P1Y'))->format('Y')}0{$quarter}";
      $previous = ceil($currDate->sub(new DateInterval('P3M'))->format('n') / 3);
      $previous_quarter_id = (int) "{$currDate->sub(new DateInterval('P3M'))->format('Y')}0{$previous}";
      // dd($currDate, $previous_quarter_id);
      $json->{$quarter_id} = (object) [
        "id" => $quarter_id,
        "quarter" => "Q {$quarter}",
        "previous" => $previous_quarter_id, // quarter 3 mesi precedenti
        "last" => $last_year,
        "year_id" => (int) $date->format('Y')
      ];
    }
    // dd($json);
    if (session('db_driver') === 'odbc') {
      $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WB_QUARTERS (
        id INTEGER PRIMARY KEY,
        quarter CHAR(3) NOT NULL,
        previous INTEGER,
        last INTEGER,
        year_id INTEGER NOT NULL CONSTRAINT wb_quarters_year_id_foreign REFERENCES decisyon_cache.WB_YEARS (id)
      ) INCLUDE SCHEMA PRIVILEGES";
      // nella foreignId utilizzo gli stessi nomi utilizzati da Laravel (tabella_campo_foreign)
      $create_stmt = DB::connection('vertica_odbc')->statement($sql);
    } else {
      $create_stmt = Schema::connection(session('db_client_name'))
        ->create('WB_QUARTERS', function (Blueprint $table) {
          $table->unsignedBigInteger('id')->primary();
          $table->char('quarter', 3)->nullable(false);
          $table->unsignedMediumInteger('previous');
          $table->unsignedMediumInteger('last');
          $table->foreignId('year_id')->nullable(false)->constrained('WB_YEARS');
        });
    }
    // dd($create_stmt);

    if (!$create_stmt) {
      // $result : null tabella creata correttamente
      foreach ($json as $quarter => $value) {
        DB::connection(session('db_client_name'))->table('decisyon_cache.WB_QUARTERS')->insert([
          'id' => $quarter,
          'quarter' => $value->quarter,
          'previous' => $value->previous,
          'last' => $value->last,
          'year_id' => $value->year_id
        ]);
      }
      // return DB::connection(session('db_client_name'))->statement('COMMIT;');
      // DB::connection(session('db_client_name'))->statement('COMMIT;');
    }
  }

  private function wb_months($start, $end)
  {
    $interval = new DateInterval('P1M');
    $period = new DatePeriod($start, $interval, $end);
    $json = (object) null;
    foreach ($period as $months) {
      $currDate = new DateTimeImmutable($months->format('Y-m-d'));
      // calcolo il quarter
      $quarter = ceil($currDate->format('n') / 3);
      $json->{$months->format('Ym')} = (object) [
        "id" => (int) $months->format('Ym'),
        "month" => $months->format('F'),
        "previous" => (int) $currDate->sub(new DateInterval('P1M'))->format('Ym'),
        "last" => (int) $currDate->sub(new DateInterval('P1Y'))->format('Ym'),
        "quarter_id" => (int) "{$currDate->format('Y')}0{$quarter}"
      ];
    }

    if (session('db_driver') === 'odbc') {
      $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WB_MONTHS (
        id INTEGER PRIMARY KEY,
        month VARCHAR NOT NULL,
        previous INTEGER,
        last INTEGER,
        quarter_id INTEGER NOT NULL CONSTRAINT wb_months_quarter_id_foreign REFERENCES decisyon_cache.WB_QUARTERS (id)
        ) INCLUDE SCHEMA PRIVILEGES";
      $create_stmt = DB::connection(session('db_client_name'))->statement($sql);
    } else {
      // la tabella non esiste, la creo
      $create_stmt = Schema::connection(session('db_client_name'))
        ->create('WB_MONTHS', function (Blueprint $table) {
          $table->unsignedBigInteger('id')->primary();
          $table->char('month')->nullable();
          $table->unsignedMediumInteger('previous');
          $table->unsignedMediumInteger('last');
          $table->foreignId('quarter_id')->nullable(false)->constrained('WB_QUARTERS');
        });
    }
    if (!$create_stmt) {
      // $result : null tabella creata correttamente
      foreach ($json as $month_id => $value) {
        DB::connection(session('db_client_name'))->table('decisyon_cache.WB_MONTHS')->insert([
          'id' => $month_id,
          'month' => $value->month,
          'previous' => $value->previous,
          'last' => $value->last,
          'quarter_id' => $value->quarter_id
        ]);
      }
      // return DB::connection(session('db_client_name'))->statement('COMMIT;');
      // DB::connection(session('db_client_name'))->statement('COMMIT;');
    }
  }

  private function wb_date($start, $end)
  {
    $interval = new DateInterval('P1D');
    $period = new DatePeriod($start, $interval, $end);
    $json = (object) null;
    foreach ($period as $date) {
      $currDate = new DateTimeImmutable($date->format('Y-m-d'));
      // calcolo il quarter
      $quarter = ceil($currDate->format('n') / 3);
      $json->{$currDate->format('Y-m-d')} = (object) [
        "id" => $currDate->format('Y-m-d'),
        "date" => $currDate->format('Y-m-d'),
        // "trans_ly" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d'),
        "weekday" => $currDate->format('l'),
        "week" => $currDate->format('W'),
        "month_id" => (int) $currDate->format('Ym'),
        "month" => $currDate->format('F'),
        /* "month" => (object) [
          "id" => $currDate->format('m'),
          "ds" => $currDate->format('F'),
          "short" => $currDate->format('M')
        ], */
        "quarter_id" => "{$currDate->format('Y')}0{$quarter}",
        "quarter" => "Q {$quarter}",
        // "quarter" => (object) ["id" => $quarter, "ds" => "Q {$quarter}"],
        "year" => $currDate->format('Y'),
        "day_of_year" => $currDate->format('z'),
        // "lastOfMonth" => $current->format('t'),
        /* "previous_json" => (object) [
          "day" => $currDate->sub(new DateInterval('P1D'))->format('Y-m-d'),
          "week" => $currDate->sub(new DateInterval('P1W'))->format('Y-m-d'),
          "month" => $currDate->sub(new DateInterval('P1M'))->format('Y-m-d'),
          "quarter" => ceil($currDate->sub(new DateInterval('P3M'))->format('n') / 3), // quarter 3 mesi precedenti
          "year" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d')
        ], */
        "last" => $currDate->sub(new DateInterval('P1Y'))->format('Y-m-d'),
        "previous" => $currDate->sub(new DateInterval('P1D'))->format('Y-m-d')
      ];
    }

    if (session('db_driver') === 'odbc') {
      // TODO: utilizzare il complex datatype ROW (vertica) per gli OBJECT, ad esempio la colonna 'last', per
      // creare le colonne come "strutture dati"
      // Per recuperarne i valori non bisogna utilizzare MapJSONExtractor ma la sintassi xxx.yyy
      $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WB_DATE (
        id DATE PRIMARY KEY,
        date DATE NOT NULL,
        year INTEGER,
        quarter_id INTEGER,
        quarter VARCHAR,
        month_id INTEGER NOT NULL CONSTRAINT wb_date_month_id_foreign REFERENCES decisyon_cache.WB_MONTHS (id),
        month VARCHAR,
        week CHAR(2),
        day VARCHAR,
        previous DATE,
        last DATE
        ) INCLUDE SCHEMA PRIVILEGES";
      $create_stmt = DB::connection(session('db_client_name'))->statement($sql);
    } else {
      $create_stmt = Schema::connection(session('db_client_name'))
        ->create('WB_DATE', function (Blueprint $table) {
          $table->date('id')->primary();
          $table->date('date')->nullable(false);
          $table->unsignedSmallInteger('year');
          $table->unsignedMediumInteger('quarter_id');
          $table->char('quarter');
          $table->foreignId('month_id')->nullable(false)->constrained('WB_MONTHS');
          $table->char('month');
          $table->char('week', 2);
          $table->char('day');
          $table->date('previous');
          $table->date('last');
        });
    }
    if (!$create_stmt) {
      foreach ($json as $date => $value) {
        // $str = json_encode($value);
        // dd(json_encode($value->previous_json));
        // $quarter = json_encode($value->quarter);
        // $month = json_encode($value->month);
        // NOTE: da vertica 11 è possibile fare la INSERT INTO con più record con la seguente sintassi:
        // INSERT INTO nometabella (field1, field2) VALUES (1, 'test'), (2, 'test'), (3, 'test')....

        DB::connection(session('db_client_name'))->table('decisyon_cache.WB_DATE')->insert([
          'id' => $date,
          'date' => $date,
          'year' => $value->year,
          'quarter_id' => (int) $value->quarter_id,
          'quarter' => $value->quarter,
          // 'quarter' => json_encode($value->quarter),
          'month_id' => $value->month_id,
          // 'month' => json_encode($value->month),
          'month' => $value->month,
          'week' => $value->week,
          'day' => json_encode(['weekday' => $value->weekday, 'day_of_year' => $value->day_of_year]),
          'previous' => $value->previous,
          'last' => $value->last
          // 'previous_json' => json_encode($value->previous_json)
        ]);
      }
    }
    // return DB::connection(session('db_client_name'))->statement('COMMIT;');
    // DB::connection(session('db_client_name'))->statement('COMMIT;');
  }

  public function dimensionTIME()
  {
    // se la tabella è già presente la elimino
    // TODO: utilizzare il try...catch
    // dd(Schema::connection(session('db_client_name'))->hasTable('WB_DATE'));
    $this->dropTIMEtables();
    $start = new DateTime('2019-01-01 00:00:00');
    $end   = new DateTime('2026-01-01 00:00:00');
    // test
    // $start = new DateTime('2024-01-01 00:00:00');
    // $end   = new DateTime('2024-07-01 00:00:00');

    $this->wb_years($start, $end);
    $this->wb_quarters($start, $end);
    $this->wb_months($start, $end);
    $this->wb_date($start, $end);
    return true;
  }

  // Elenco delle tabelle dello schema selezionato
  public function tables($schema)
  {
    /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
    /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
    // connessione a vertica per recuperare l'elenco delle tabelle
    // $tables = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='$schema' ORDER BY TABLE_NAME ASC;");
    BIConnectionsController::getDB();
    switch (session('db_driver')) {
      case 'odbc':
        $query = DB::connection(session('db_client_name'))->table('V_CATALOG.ALL_TABLES')
          ->where('SCHEMA_NAME', $schema);
        break;
      case 'mysql':
        // $tables = Schema::connection(session('db_client_name'))->getAllTables();
        $query = DB::connection(session('db_client_name'))->table('information_schema.tables')
          ->where('TABLE_SCHEMA', $schema);
        // $tables = DB::connection(session('db_client_name'))->select("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='$schema' ORDER BY TABLE_NAME ASC;");
      default:
        break;
    }
    $query->addSelect('TABLE_NAME');
    $query->orderBy('TABLE_NAME');
    // dd($query->get());
    return response()->json($query->get());
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
    // TODO: nuova logica session('db_client_name').
    // Per mysql và utilizzato CREATE TABLE ... LIKE (vedere documentazione)
    $sql = "SELECT COPY_TABLE ('decisyon_cache.WEB_BI_{$fromId}','decisyon_cache.WEB_BI_{$toId}');";
    $copy = DB::connection('vertica_odbc')->statement($sql);
    return $copy;
  }

  public function preview($id)
  {
    // dd($id);
    // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
    // $data = DB::connection('vertica_odbc')->table($table)->limit(5)->get(); // ok
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497, 43, 473, 437, 445, 461, 485, 549, 621, 1000002079, 455, 471, 179])->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497])->paginate(15000);

    // BUG: 2024.03.24 : senza l'utilizzo di orderBy, il paginate non funziona correttamente quando deve
    // essere disegnata la google DataTable
    // $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->paginate(15000);

    // $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->orderBy('area_id')->paginate(15000);

    BIConnectionsController::getDB();
    switch (session('db_driver')) {
      case 'odbc':
        $queryColumns = DB::connection(session('db_client_name'))->table('COLUMNS')->select('column_name');
        break;
      case 'mysql':
        $queryColumns = DB::connection(session('db_client_name'))->table('information_schema.COLUMNS')->select('column_name');
        break;
        // TODO: implementazione altri DB
      default:
        break;
    }
    $columnsData = $queryColumns->where('TABLE_SCHEMA', "decisyon_cache")
      ->where('TABLE_NAME', "WEB_BI_{$id}")->orderBy('ordinal_position')->get();

    $query = DB::connection(session('db_client_name'))->table("decisyon_cache.WEB_BI_{$id}");
    foreach ($columnsData as $columns) {
      foreach ($columns as $column) {
        $query->orderBy($column);
      }
    }

    // $data = $query->cursorPaginate(10000);
    // NOTE: il cursorPaginate dovrebbe essere più performante (da testare) ma non contiene i dati relativi al
    // numero di pagine, al momento utilizzo paginate() con la clausola OrderBy
    $data = $query->paginate(10000);

    // $query->orderBy('area_id')->orderBy('area')
    //   ->orderBy('zona_id')->orderBy('zona')
    //   ->orderBy('descrizione_id')->orderBy('descrizione')
    //   ->orderBy('year_id')->orderBy('year')
    //   ->orderBy('quarter_id')->orderBy('quarter')
    //   ->orderBy('month_id')->orderBy('month')
    //   ->orderBy('basketMLI_id')->orderBy('basketMLI');
    // $data = $query->cursorPaginate(15000);
    // dd($data);
    return $data;
  }

  public function datamart($id)
  {
    // dd($id);
    // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
    // TODO viene utilizzata anche dalla preview, forse per la preview meglio utilizzare un'altra function
    // $data = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.WEB_BI_$id LIMIT 5000");
    // $table = "decisyon_cache.WEB_BI_$id";
    // $data = DB::connection('vertica_odbc')->table($table)->limit(10)->get(); // ok

    // $data = DB::connection('vertica_odbc')->table($table)->select("area_id", "zona_id", "dealer_id")->get();
    // Utilizzo di paginate()
    // $data = DB::connection('vertica_odbc')->table($table)->select("dealer_id", "dealer_ds")->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->where("dealer_id", "=", 447)->paginate(15000);
    // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [447, 497])->paginate(15000);
    // TODO: nuova logica session('db_client_name')
    $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->paginate(20000);
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
    // TODO: nuova logica session('db_client_name')
    $data = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.WEB_BI_$id LIMIT 20");
    // dd(memory_get_usage());
    // dd(memory_get_peak_usage());
    // }
    // dd($datamart);
    // dd($data);
    return response()->json($data);
  }

  public function sheetCreate(Request $request)
  {
    $process = json_decode(json_encode($request->all())); // object
    $query = new Cube($process);
    $query->datamartFields();
    foreach ($query->facts as $fact) {
      $query->fact = $fact;
      $query->factId = substr($fact, -5);
      $query->baseTableName = "WB_BASE_{$query->report_id}_{$query->datamart_id}_{$query->factId}";
      $res = $query->base_table_new();
      $query->queries[$query->baseTableName] = $query->datamart_fields;
      if (!$res) {
        // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
        // creo una tabella temporanea per ogni metrica filtrata
        // dd($query->process->{"advancedMeasures"});
        // dd(empty($query->process->{"advancedMeasures"}));
        if (!empty($query->process->{"advancedMeasures"})) {
          // sono presenti metriche avanzate
          if (property_exists($query->process->{"advancedMeasures"}, $fact)) {
            $query->filteredMetrics = $query->process->{'advancedMeasures'}->{$fact};
            // verifico quali, tra le metriche filtrate, contengono gli stessi filtri.
            // Le metriche che contengono gli stessi filtri vanno eseguite in un unica query.
            // Oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
            $query->groupMetricsByFilters = (object)[];
            // raggruppare per tipologia dei filtri
            $groupFilters = array();
            // creo un gruppo di filtri
            foreach ($query->filteredMetrics as $metric) {
              // dd($metric->formula->filters);
              // ogni gruppo di filtri ha un tokenGrouup diverso come key dell'array
              $tokenGroup = "grp_" . bin2hex(random_bytes(4));
              if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
            }
            // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
            foreach ($groupFilters as $token => $group) {
              $metrics = array();
              foreach ($query->filteredMetrics as $metric) {
                if (get_object_vars($metric->filters) == get_object_vars($group)) {
                  // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                  array_push($metrics, $metric);
                }
              }
              // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
              $query->groupMetricsByFilters->$token = $metrics;
            }
            // dd($query->groupMetricsByFilters);
            $metricTable = $query->createMetricDatamarts_new();
          }
        }
      }
    }
    if (!empty($query->process->compositeMeasures)) {
      foreach ($query->process->compositeMeasures as $metric) {
        $query->compositeMeasures[] = implode(" ", $metric->SQL) . " AS '{$metric->alias}'";
      }
    }
    return $query->datamart_new();
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
    // array di colonne che verranno incluse nel datamart finale
    $q->datamartFields();
    foreach ($q->facts as $fact) {
      if (property_exists($process, 'sql_info')) {
        $q->sql_info = (object)[
          "SELECT" => (object)[],
          "METRICS" => (object)[],
          "FROM" => (object)[],
          "WHERE" => (object)[],
          "WHERE-TIME" => (object)[],
          "AND" => (object)[],
          "GROUP BY" => (object)[]
        ];
      }
      $q->select();
      // $fact : svg-data-xxxxx
      $q->factId = substr($fact, -5);
      $q->baseTableName = "WB_BASE_{$q->report_id}_{$q->datamart_id}_{$q->factId}";
      // se esistono metriche di base
      if (property_exists($q->process, 'baseMeasures')) {
        $q->baseMetrics = $q->process->{'baseMeasures'}->{$fact};

        $q->metrics();
        // var_dump($q->_metrics_base);
        $q->from($process->{'from'}->{$fact});
        $q->where($process->{'joins'}->{$fact});
        if (property_exists($process, 'compositeMeasures')) $q->compositeMetrics = $process->{'compositeMeasures'};
        // i filtri vengono verificati già nella funzione createProcess()
        $q->filters($process->{'filters'});
        $q->groupBy();
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        // $resultSQL['base'] = $q->baseTable();
        $q->baseTable();
        // array di query elaborate
        $q->queries[$q->baseTableName] = $q->datamart_fields;
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
    dd($q->queries);
    // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
    // creo una tabella temporanea per ogni metrica filtrata
    // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
    // dd($q->results);
    $resultSQL["base"] = $q->results;
    $resultSQL['datamart'] = $q->datamart();
    return $resultSQL;
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
    $q->sql_info = (object)[
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
