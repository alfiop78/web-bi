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
// uso i Model BIsheet, BIworkbook, BImetric e BIfilter che viene utilizzato nella route curlprocess (web_bi.schedule_report)
use App\Models\BIsheet;
use App\Models\BIworkbook;
use PhpParser\Node\Stmt\TryCatch;
use App\Http\Controllers\traitTest;

use Illuminate\Support\Facades\Config;
// Helper per la connessione a Vertica da ODBC
use App\Helpers\VerticaOdbcHelper;

// use function PHPUnit\Framework\isNull;

class MapDatabaseController extends Controller
{
    private $query = NULL;

    public function workspace()
    {
        BIConnectionsController::getDB();
        $schemaList = [];
        /* $db_config = session('db_client_name'); */

        // Controlli l'esistenza della tabella in un solo passaggio e termina la connessione!
        /* dd(VerticaOdbcHelper::open()->hasTable('decisyon_cache', 'WB_DATE')); */
        // Esegui una select al volo in una sola riga! ...anche qui termina la connessione in automatico
        /* $dati = VerticaOdbcHelper::open()->select("SELECT * FROM decisyon_cache.WB_DATE WHERE year = 2020"); */
        /* return response()->json(['exists' => $exists, 'data' => $dati]); */
        /* dd(Schema::connection($db_config)->hasTable("WB_DATE")); // mysql (OK) */
        /* dd(Schema::connection('vertica')->hasTable("decisyon_cache.WB_DATE")); */
        /* dd(Schema::connection('vertica')->hasTable("decisyon_cache.WB_DATE")); */
        /* dd(DB::connection('vertica')->table('decisyon_cache.WB_DATE')->select('year')->whereRaw("year = 2020")->get()); */
        /* dd(DB::connection('vertica')->table('decisyon_cache.WB_DATE')->select('year')->where('year', 2020)->get()); */

        /* dump(session('db_client_name')); */
        /* dd(config("database.connections.{$db_config}")); */
        switch (session('db_driver')) {
            case 'odbc':
                $schemaList = VerticaOdbcHelper::open()
                    ->table("V_CATALOG.SCHEMATA")
                    ->select(["SCHEMA_NAME"])
                    ->where("IS_SYSTEM_SCHEMA", "=", 'FALSE')
                    ->orderBy("SCHEMA_NAME")->get();
                break;
            case 'mysql':
                $schemaList = DB::connection(session('db_client_name'))->select("SHOW SCHEMAS;");
                break;
            default:
                # altri database
                break;
        }
        /* dd($schemaList); */
        // dd(DB::connection("vertica_odbc")->getSchemaBuilder()->hasTable("WB_DATE"));
        // recupero l'elenco delle dimensioni create da bi_dimensions.
        // NOTE: il supporto alle query su colonne JSON è per mysql 5.7+ https://laravel.com/docs/8.x/queries#json-where-clauses

        // $dimensions = DB::table('bi_dimensions')->get('json_value'); // QueryBuilder
        // $dimensions = BIdimension::get('json_value'); // Eloquent

        // TODO: connessione a mysql
        // $schemaList = DB::connection('mysql')->select("SHOW SCHEMAS;");
        return view('web_bi.workspace')->with('schemata', $schemaList);
        // altro esempio
        // return view('web_bi.mapping')->with(['dimensions' => json_encode($dimensions), 'schemes' => $schemaList]);
    }

    public function timeDimensionExists()
    {
        BIConnectionsController::getDB();
        $exists = false;
        /* dump(session(('db_driver'))); */
        $db_config = session('db_client_name');
        /* dd(config("database.connections.{$db_config}")); */
        switch (session('db_driver')) {
            case 'mysql':
                $exists = Schema::connection($db_config)->hasTable('WB_DATE');
                break;
            case 'odbc':
                $exists = VerticaOdbcHelper::open()->hasTable('decisyon_cache', 'WB_DATE');
                break;
            default:
                # code...
                break;
        }
        return $exists;
        /* return (Schema::connection($db_config)->hasTable('decisyon_cache.WB_DATE')); */
    }

    public function executePythonScript(string $script)
    {
        // dd("python scripts {$script}");
        // $command = escapeshellcmd('python3 py_scripts/test.py'); // OK
        $command = escapeshellcmd("python3 py_scripts/{$script}"); // OK
        $output = shell_exec($command);
        return $output;
    }

    // test connessione vertica (senza utilizzo di Eloquen/ORM)
    public function test_vertica()
    {
        # Turn on error reporting
        error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
        # A simple function to trap errors from queries
        function odbc_exec_echo($conn, $sql)
        {
            if (!$rs = odbc_exec($conn, $sql)) {
                echo "<br/>Failed to execute SQL: $sql<br/>" . odbc_errormsg($conn);
            } else {
                echo "<br/>Success: " . $sql;
            }
            return $rs;
        }
        # Connect to the Database
        $dsn = "VerticaDSNunixodbc";
        $conn = odbc_connect($dsn, '', '') or die("<br/>CONNECTION ERROR");
        echo "<p>Connected with DSN: $dsn</p>";
        # Create a table
        $sql = "CREATE TABLE TEST(
            C_ID INT,
            C_FP FLOAT,
            C_VARCHAR VARCHAR(100),
            C_DATE DATE, C_TIME TIME,
            C_TS TIMESTAMP,
            C_BOOL BOOL)";
        $result = odbc_exec_echo($conn, $sql);
        # Insert data into the table with a standard SQL statement
        $sql = "INSERT into test values(1,1.1,'abcdefg1234567890','1901-01-01','23:12:34','1901-01-01 09:00:09','t')";
        $result = odbc_exec_echo($conn, $sql);
        # Insert data into the table with odbc_prepare and odbc_execute
        $values = array(2, 2.28, 'abcdefg1234567890', '1901-01-01', '23:12:34', '1901-01-01 09:00:09', 't');
        $statement = odbc_prepare($conn, "INSERT into test values(?,?,?,?,?,?,?)");
        if (!$result = odbc_execute($statement, $values)) {
            echo "<br/>odbc_execute Failed!";
        } else {
            echo "<br/>Success: odbc_execute.";
        }
        # Get the data from the table and display it
        $sql = "SELECT * FROM TEST";
        if ($result = odbc_exec_echo($conn, $sql)) {
            echo "<pre>";
            while ($row = odbc_fetch_array($result)) {
                print_r($row);
            }
            echo "</pre>";
        }
        # Drop the table and projection
        $sql = "DROP TABLE TEST CASCADE";
        $result = odbc_exec_echo($conn, $sql);
        # Close the ODBC connection
        odbc_close($conn);
    }

    // Invocata sia da Mapping (ottengo la lista dei campi della tabella) che da report (dialog-filter)
    public function table_info(string $schema, string $table)
    {
        BIConnectionsController::getDB();
        /* $db_config = session('db_client_name'); */
        $query = NULL;
        $result = NULL;
        /* dd(session('db_client_name')); */
        switch (session('db_driver')) {
            case 'odbc':
                $sql = "SELECT
                    COLUMNS.COLUMN_NAME as column_name,
                    LOWER(type_name) AS type_name,
                    data_type_length,
                    constraint_name,
                    COLUMNS.ordinal_position AS ordinal_position
                    FROM COLUMNS
                        JOIN TYPES ON COLUMNS.data_type_id = TYPES.type_id
                        LEFT JOIN PRIMARY_KEYS ON PRIMARY_KEYS.TABLE_SCHEMA = COLUMNS.TABLE_SCHEMA
                            AND PRIMARY_KEYS.TABLE_NAME = COLUMNS.TABLE_NAME
                            AND PRIMARY_KEYS.COLUMN_NAME = COLUMNS.COLUMN_NAME
                            AND PRIMARY_KEYS.CONSTRAINT_TYPE = 'p'
                    WHERE COLUMNS.TABLE_SCHEMA = '$schema' AND COLUMNS.TABLE_NAME = '$table'
                    ORDER BY COLUMNS.ordinal_position;";
                $query = VerticaOdbcHelper::open()->rawSelect($sql);
                /* dd($query); */
                $result = [$table => $query];
                /* dd($result); */
                /* $query = DB::connection(session('db_client_name'))->table('COLUMNS') */
                /*     ->select( */
                /*         'COLUMNS.column_name', */
                /*         DB::raw('LOWER(type_name) AS type_name'), */
                /*         'data_type_length', */
                /*         'constraint_name', */
                /*         'COLUMNS.ordinal_position' */
                /*     ) */
                /*     ->join('TYPES', 'COLUMNS.data_type_id', 'TYPES.type_id') */
                /*     ->leftJoin('PRIMARY_KEYS', function ($leftJoin) { */
                /*         $leftJoin->on('PRIMARY_KEYS.TABLE_SCHEMA', 'COLUMNS.TABLE_SCHEMA') */
                /*             ->on('PRIMARY_KEYS.TABLE_NAME', 'COLUMNS.TABLE_NAME') */
                /*             ->on('PRIMARY_KEYS.COLUMN_NAME', 'COLUMNS.COLUMN_NAME') */
                /*             ->where('PRIMARY_KEYS.CONSTRAINT_TYPE', 'p'); */
                /*     }) */
                /*     ->where('COLUMNS.TABLE_SCHEMA', $schema)->where('COLUMNS.TABLE_NAME', $table)->orderBy('COLUMNS.ordinal_position');; */
                break;
            case 'mysql':
                // TODO: 20.11.2024 aggiungere l'ultima modifica fatta per vertica, la relazione con PRIMARY KEY
                $query = DB::connection(session('db_client_name'))->table('information_schema.COLUMNS')
                    ->select(
                        'column_name',
                        'data_type as type_name',
                        DB::raw('CASE WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL
                        THEN CHARACTER_MAXIMUM_LENGTH
                        ELSE NUMERIC_PRECISION END as data_type_length'),
                        'ordinal_position'
                    )->where('COLUMNS.TABLE_SCHEMA', $schema)->where('COLUMNS.TABLE_NAME', $table)->orderBy('COLUMNS.ordinal_position');
                $result = [$table => $query->get()];
                break;
            default:
                break;
        }

        // NOTE: debug query : ->where('TABLE_NAME', $table)->orderBy('ordinal_position')->dd();

        // return response()->json([$table => $info]);

        /* return response()->json([$table => $query->get()]); */
        return response()->json($result);
        // return response()->json($info);
    }

    public function checkDatamart(string $id, string $token, $updated_at)
    {
        // dump($id);
        BIConnectionsController::getDB();
        // TEST: testare con mysql, sqlsrv e pgsql

        // Per eseguire correttamente il test, in fase di creazione della
        // connessione, deve essere aggiunto lo schema dove verranno memorizzati i datamart
        // Per questo motivo ho aggiunto una label relativa alla input Schema nella dialog di creazione
        // di una nuova connessione

        $exist_local = FALSE;
        $exist = FALSE;
        // dump($updated_at);
        switch (session('db_driver')) {
            case 'odbc':
                // verifico se esiste WEB_BI_LOCAL_...
                $exist_local = VerticaOdbcHelper::open()->hasTable('decisyon_cache', "WEB_BI_LOCAL_{$id}");
                $exist = VerticaOdbcHelper::open()->hasTable('decisyon_cache', "WEB_BI_{$id}");
                break;
            case 'mysql':
                $exist_local = Schema::connection(session('db_client_name'))->hasTable("WEB_BI_LOCAL_{$id}");
                $exist = Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$id}");
                break;
            default:
                // TODO: aggiunta di altri database
                break;
        }
        switch (true) {
            case $exist_local:
                // return "WEB_BI_LOCAL_{$id}";
                $datamart_name = "WEB_BI_LOCAL_{$id}";
                break;
            case $exist:
                // Se il report in locale è stato modificato ma non elaborato, l'esecuzione arriva qui.
                // 17.06.2025 Posso aprire questo datamart SOLO se il report in locale non è stato modificato.
                // Però qui devo controllare 'updated_at'.
                // Se il report locale è stato modificato non posso aprire
                // WEB_BI_DATAMART_USERID, se non è stato modificato apro WEB_BI_DATAMART_USERID
                // return "WEB_BI_{$id}";
                $sheet = BIsheet::where("token", $token)->first('sheet_updated_at');
                // converto la updated_at proveniente dallo sheet in localStorage per confrontarla con $sheet_updated_at
                // ...proveniente dal DB
                $local_updated_at = new DateTimeImmutable($updated_at);
                // dd($sheet->sheet_updated_at, $local_updated_at->format('Y-m-d H:i:s.v'));
                // dd(($local_updated_at->format('Y-m-d H:i:s.v') === $sheet->sheet_updated_at));
                if ($sheet) {
                    // Questo Sheet è "pubblicato", verifico se non ci sono state modifiche in locale e apro
                    // WEB_BI_DATAMART_USERID
                    if ($local_updated_at->format('Y-m-d H:i:s.v') === $sheet->sheet_updated_at) {
                        // dd("Sheet DB e locale sono identici");
                        $datamart_name = "WEB_BI_{$id}";
                    } else {
                        // dd("sheet in localstorage e sheet su DB sono differenti");
                        // Lo Sheet in locale è stato modificato ma non è stato elaborato, per questo l'esecuzione
                        // arriva qui (altrimenti verrebbe intercettato dal primo case:)
                        $datamart_name = FALSE;
                    }
                } else {
                    // Il report in locale è stato eseguito come WEB_BI_DATAMART_USERID e non come
                    // WEB_BI_LOCAL_DATAMART_USERID, questo perchè, al momento dell'elaborazione, non era
                    // presente una versione "pubblicata"
                    // In questo caso apro WEB_BI_DATAMART_USERID
                    $datamart_name = "WEB_BI_{$id}";
                }
                /* if ($local_updated_at->format('Y-m-d H:i:s.v') === $sheet->sheet_updated_at) {
					// dd("Sheet DB e locale sono identici");
					$datamart_name = "WEB_BI_{$id}";
				} else {
					// dd("sheet in localstorage e sheet su DB sono differenti");
					$datamart_name = FALSE;
				} */
                break;
            default:
                // return FALSE;
                $datamart_name = FALSE;
                break;
        }
        return $datamart_name;
    }

    private function delete(string $datamart_name)
    {
        if (Schema::connection(session('db_client_name'))->hasTable($datamart_name)) {
            try {
                switch (session('db_driver')) {
                    case 'odbc':
                        // TEST: 17.06.2025 Verificare se, senza specificare lo schema, viene effettuato correttamente il drop table
                        Schema::connection(session('db_client_name'))->drop("decisyon_cache.{$datamart_name}");
                        break;
                    case 'mysql':
                        Schema::connection(session('db_client_name'))->drop($datamart_name);
                        break;
                    default:
                        Schema::connection(session('db_client_name'))->drop($datamart_name);
                        break;
                }
                return TRUE;
            } catch (\Throwable $th) {
                throw $th;
            }
        } else {
            return FALSE;
        }
    }

    public function deleteDatamart($id, $token)
    {
        $sheet = BIsheet::find($token);
        switch (true) {
            case Schema::connection(session('db_client_name'))->hasTable("WEB_BI_LOCAL_{$id}"):
                return $this->delete("WEB_BI_LOCAL_{$id}");
                break;
            case Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$id}"):
                // Se lo sheet è pubblico, non posso eliminare WEB_BI_DATAMART_USERID.
                // Posso eliminare WEB_BI_LOCAL_DATAMART_USERID se è presente (quindi se è stato elaborato almeno una volta)
                // ---
                // Se lo sheet non è pubblico, posso eliminare WEB_BI_DATAMART_USERID.
                // In questo caso, quando non è stato pubblicato, l'elaborazione in locale ha creato WEB_BI_DATAMART_USERID
                // e non WEB_BI_LOCAL_DATAMART_USERID
                return ($sheet) ? $this->delete("WEB_BI_LOCAL_{$id}") : $this->delete("WEB_BI_{$id}");
                break;
            default:
                return FALSE;
                break;
        }
        /* if (Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$id}")) {
			try {
				switch (session('db_driver')) {
					case 'odbc':
						Schema::connection(session('db_client_name'))->drop("decisyon_cache.WEB_BI_{$id}");
						break;
					case 'mysql':
						Schema::connection(session('db_client_name'))->drop("WEB_BI_{$id}");
						break;
					default:
						Schema::connection(session('db_client_name'))->drop("WEB_BI_{$id}");
						break;
				}
				return TRUE;
			} catch (\Throwable $th) {
				throw $th;
			}
			// return Schema::connection(session('db_client_name'))->drop("WEB_BI_{$id}");
			// return Schema::connection(session('db_client_name'))->drop("decisyon_cache.WEB_BI_$id");
			// return Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.WEB_BI_$id");
		} */
    }

    // 26.08.2024 Non ancora implementata da JS
    public function columns_info(string $schema, string $table, string $column)
    {
        /* dd($table); */
        /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
        // TODO: nuova logica session('db_client_name')
        dd("columns_info");
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

    public function table_preview(string $schema, string $table)
    {
        /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
        /* dd("table_preview"); */
        BIConnectionsController::getDB();
        $result = NULL;
        switch (session('db_driver')) {
            case 'mysql':
                /* $result = DB::connection(session('db_client_name'))->select("SELECT * FROM $schema.$table LIMIT 50;"); */
                $result = DB::connection(session('db_client_name'))->table("{$schema}.{$table}")->limit(50);
                break;
            case 'odbc':
                $result = VerticaOdbcHelper::open()->table("{$schema}.{$table}")->limit(50);
                break;
            default:
                break;
        }
        /* dd($result->get()); */
        return response()->json($result->get());
    }

    // 26.08.2024 Non ancora implementata da JS
    // ottengo valori distinti per il field selezionato (dialog-filter)
    public function distinct_values(string $schema, string $table, string $field)
    {
        // TEST: 26.08.2024 da testare
        dd("distinct_values");
        $values = DB::connection(session('db_client_name'))
            ->table($schema . "." . $table)->distinct()
            ->orderBy($field, 'asc')->limit(500)->get($field);
        return response()->json($values);
    }

    private function dropTIMEtables()
    {
        dd("dropTIMEtables");
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
        // TODO: 28.07.2026 creare una PL/SQL per eliminare tutte le tabelle TIME
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

    private function insertTimeTable($db, string $table, array $recordsToInsert)
    {
        if (!empty($recordsToInsert)) {
            try {
                // 4. Avviamo la transazione esplicita per i dati
                $db->beginTransaction();

                // 5. Eseguiamo il Bulk Insert in un colpo solo
                $db->table("decisyon_cache.{$table}")->insert($recordsToInsert);

                // 6. Confermiamo la scrittura dei dati su Vertica
                $db->commit();
            } catch (Exception $e) {
                // In caso di errore facciamo rollback per non lasciare transazioni appese
                $db->rollback();
                throw $e;
            }
        }
    }

    private function wb_years(DateTime $start, DateTime $end)
    {
        /* dd("wb_years"); */
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
                year CHAR(6) NOT NULL
            ) INCLUDE SCHEMA PRIVILEGES";

            // 1. Apre la connessione
            $db = VerticaOdbcHelper::open();

            // 2. Esegue il comando DDL (CREATE TABLE ha un auto-commit implicito in Vertica)
            if ($db->execute($sql)) {

                // 3. Prepariamo l'array cumulativo per il Bulk Insert
                $recordsToInsert = [];
                foreach ($years as $currentYear => $lastYear) {
                    $recordsToInsert[] = [
                        'id'       => $currentYear,
                        'previous' => $lastYear,
                        'year'     => "Y {$currentYear}"
                    ];
                }
                self::insertTimeTable($db, "WB_YEARS", $recordsToInsert);
            }

            // 7. Chiudiamo la connessione in modo sicuro
            $db->close();
        } else {
            // TEST: 02.09.2026 da testare
            $create_stmt = DB::connection(session('db_client_name'))
                ->create('WB_YEARS', function (Blueprint $table) {
                    $table->unsignedBigInteger('id')->primary();
                    $table->unsignedSmallInteger('previous');
                    $table->char('year', 6)->nullable(false);
                });
            if (!$create_stmt) {
                foreach ($years as $currentYear => $lastYear) {
                    // TODO: 02.09.2026 implementare il bulk insert
                    DB::connection(session('db_client_name'))
                        ->table('decisyon_cache.WB_YEARS')
                        ->insert([
                            'id' => $currentYear,
                            'previous' => $lastYear,
                            'year' => "Y {$currentYear}"
                        ]);
                }
            }
        }
    }

    private function wb_quarters(DateTime $start, DateTime $end)
    {
        /* dd("wb_quarter"); */
        $interval = new DateInterval('P3M');
        $period = new DatePeriod($start, $interval, $end);
        $json = (object) null;
        $quarter_id = NULL;
        $quarter_id = 0;
        foreach ($period as $date) {
            $currDate = new DateTimeImmutable($date->format('Y-m-d'));
            $quarter = ceil($currDate->format('n') / 3);
            $quarter_id = "{$currDate->format('Y')}0{$quarter}";
            $last_year = (int) "{$currDate->sub(new DateInterval('P1Y'))->format('Y')}0{$quarter}";
            $previous = ceil($currDate->sub(new DateInterval('P3M'))->format('n') / 3);
            $previous_quarter_id = (int) "{$currDate->sub(new DateInterval('P3M'))->format('Y')}0{$previous}";
            // dd($currDate, $previous_quarter_id);
            $json->{$quarter_id} = (object) [
                "id" => (int) $quarter_id,
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
            // 1. Apre la connessione
            $db = VerticaOdbcHelper::open();
            // 2. Esegue il comando DDL (CREATE TABLE ha un auto-commit implicito in Vertica)
            if ($db->execute($sql)) {

                // 3. Prepariamo l'array cumulativo per il Bulk Insert
                $recordsToInsert = [];
                foreach ($json as $quarter => $value) {
                    $recordsToInsert[] = [
                        'id' => $quarter,
                        'quarter' => $value->quarter,
                        'previous' => $value->previous,
                        'last' => $value->last,
                        'year_id' => $value->year_id
                    ];
                }
                self::insertTimeTable($db, "WB_QUARTERS", $recordsToInsert);
            }

            // 7. Chiudiamo la connessione in modo sicuro
            $db->close();
        } else {
            $create_stmt = DB::connection(session('db_client_name'))
                ->create('WB_QUARTERS', function (Blueprint $table) {
                    $table->unsignedBigInteger('id')->primary();
                    $table->char('quarter', 3)->nullable(false);
                    $table->unsignedMediumInteger('previous');
                    $table->unsignedMediumInteger('last');
                    $table->foreignId('year_id')->nullable(false)->constrained('WB_YEARS');
                });
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
    }

    private function wb_months(DateTime $start, DateTime $end)
    {
        /* dd("wb_months"); */
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
            // 1. Apre la connessione
            $db = VerticaOdbcHelper::open();

            // 2. Esegue il comando DDL (CREATE TABLE ha un auto-commit implicito in Vertica)
            if ($db->execute($sql)) {
                // 3. Prepariamo l'array cumulativo per il Bulk Insert
                $recordsToInsert = [];
                foreach ($json as $month_id => $value) {
                    $recordsToInsert[] = [
                        'id' => $month_id,
                        'month' => $value->month,
                        'previous' => $value->previous,
                        'last' => $value->last,
                        'quarter_id' => $value->quarter_id
                    ];
                }
                self::insertTimeTable($db, "WB_MONTHS", $recordsToInsert);
            }
            // 7.  Chiudiamo la connessione in modo sicuro
            $db->close();
        } else {
            // mysql
            $create_stmt = DB::connection(session('db_client_name'))
                ->create('WB_MONTHS', function (Blueprint $table) {
                    $table->unsignedBigInteger('id')->primary();
                    $table->char('month')->nullable();
                    $table->unsignedMediumInteger('previous');
                    $table->unsignedMediumInteger('last');
                    $table->foreignId('quarter_id')->nullable(false)->constrained('WB_QUARTERS');
                });
            if (!$create_stmt) {
                // $result : null tabella creata correttamente
                foreach ($json as $month_id => $value) {
                    DB::connection(session('db_client_name'))
                        ->table('decisyon_cache.WB_MONTHS')->insert([
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
    }

    private function wb_date(DateTime $start, DateTime $end)
    {
        /* dd("wb_date"); */
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
                "week" => "W {$currDate->format('W')}",
                "week_id" => (int) "{$currDate->format('oW')}",
                // "week" => $currDate->format('W'),
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
        // dd($json);

        // dd(session('db_driver'));
        if (session('db_driver') === 'odbc') {
            // TODO: utilizzare il complex datatype ROW (vertica) per gli OBJECT, ad esempio la colonna 'last', per
            // creare le colonne come "strutture dati"
            // Per recuperarne i valori non bisogna utilizzare MapJSONExtractor ma la sintassi xxx.yyy
            $sql = "CREATE TABLE IF NOT EXISTS decisyon_cache.WB_DATE (
				id DATE PRIMARY KEY,
				date DATE NOT NULL,
				year INTEGER,
				quarter_id INTEGER,
				quarter CHAR(3),
				month_id INTEGER NOT NULL CONSTRAINT wb_date_month_id_foreign REFERENCES decisyon_cache.WB_MONTHS (id),
				month VARCHAR,
				week_id INTEGER,
				week CHAR(4),
				-- day VARCHAR,
				day_of_year INTEGER,
				previous DATE,
				last DATE
				) INCLUDE SCHEMA PRIVILEGES";
            // 1. Apre la connessione
            $db = VerticaOdbcHelper::open();
            // 2. Esegue il comando DDL (CREATE TABLE ha un auto-commit implicito in Vertica)
            if ($db->execute($sql)) {
                // 3. Prepariamo l'array cumulativo per il Bulk Insert
                $recordsToInsert = [];
                foreach ($json as $date => $value) {
                    // $str = json_encode($value);
                    // dd(json_encode($value->previous_json));
                    // $quarter = json_encode($value->quarter);
                    // $month = json_encode($value->month);
                    // NOTE: da vertica 11 è possibile fare la INSERT INTO con più record con la seguente sintassi:
                    // INSERT INTO nometabella (field1, field2) VALUES (1, 'test'), (2, 'test'), (3, 'test')....

                    // DB::connection('client_odbc')->table('decisyon_cache.WB_DATE')->insert([
                    $recordsToInsert[] = [
                        'id' => $date,
                        'date' => $date,
                        'year' => $value->year,
                        'quarter_id' => (int) $value->quarter_id,
                        'quarter' => $value->quarter,
                        // 'quarter' => json_encode($value->quarter),
                        'month_id' => $value->month_id,
                        // 'month' => json_encode($value->month),
                        'month' => $value->month,
                        'week_id' => $value->week_id,
                        'week' => $value->week,
                        // 'day' => json_encode(['weekday' => $value->weekday, 'day_of_year' => $value->day_of_year]),
                        'day_of_year' => $value->day_of_year,
                        'previous' => $value->previous,
                        'last' => $value->last
                        // 'previous_json' => json_encode($value->previous_json)
                    ];
                }
                self::insertTimeTable($db, "WB_DATE", $recordsToInsert);

                // 7. Chiudiamo la connessione in modo sicuro
                $db->close();
            } else {
                dd("Creazione tabella decisyon_cache.WB_DATE non riuscita");
            }
        } else {
            $create_stmt = DB::connection(session('db_client_name'))
                ->create('WB_DATE', function (Blueprint $table) {
                    $table->date('id')->primary();
                    $table->date('date')->nullable(false);
                    $table->unsignedSmallInteger('year');
                    $table->unsignedMediumInteger('quarter_id');
                    $table->char('quarter', 3);
                    $table->foreignId('month_id')->nullable(false)->constrained('WB_MONTHS');
                    $table->char('month');
                    $table->unsignedMediumInteger('week_id');
                    $table->char('week', 4);
                    // $table->char('day');
                    $table->unsignedSmallInteger('day_of_year');
                    $table->date('previous');
                    $table->date('last');
                });
            if (!$create_stmt) {
                // dd($create_stmt);
                // $result : null tabella creata correttamente
                foreach ($json as $date => $value) {
                    // $str = json_encode($value);
                    // dd(json_encode($value->previous_json));
                    // $quarter = json_encode($value->quarter);
                    // $month = json_encode($value->month);
                    // NOTE: da vertica 11 è possibile fare la INSERT INTO con più record con la seguente sintassi:
                    // INSERT INTO nometabella (field1, field2) VALUES (1, 'test'), (2, 'test'), (3, 'test')....

                    // DB::connection('client_odbc')->table('decisyon_cache.WB_DATE')->insert([
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
                        'week_id' => $value->week_id,
                        'week' => $value->week,
                        // 'day' => json_encode(['weekday' => $value->weekday, 'day_of_year' => $value->day_of_year]),
                        'day_of_year' => $value->day_of_year,
                        'previous' => $value->previous,
                        'last' => $value->last
                        // 'previous_json' => json_encode($value->previous_json)
                    ]);
                }
            }
        }
        // return DB::connection(session('db_client_name'))->statement('COMMIT;');
        // DB::connection(session('db_client_name'))->statement('COMMIT;');
        // DB::connection('client_odbc')->statement('COMMIT;');
        // return DB::connection('client_odbc')->statement('COMMIT;');
    }

    public function dimensionTIME()
    {
        // TODO: 03.09.2026 Implementare la possibilità di AGGIUNGERE gli anni, senza eliminare i dati già presenti

        // se la tabella è già presente la elimino
        // TODO: utilizzare il try...catch
        // dd(Schema::connection(session('db_client_name'))->hasTable('WB_DATE'));
        /* dd("dimensionTIME"); */
        /* $this->dropTIMEtables(); */
        BIConnectionsController::getDB();
        // dd(session()->get('db_host')); // stesso risultato di session('db_host')
        // dd(session()->get('db_client_name')); // stesso risultato di session('db_host')
        // dd(Schema::connection(session('db_client_name')));
        $start = new DateTime('2024-01-01 00:00:00');
        // $end   = new DateTime('2019-02-01 00:00:00');
        $end   = new DateTime('2028-01-01 00:00:00');
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
    public function tables(string $schema)
    {
        $query = NULL;
        /* dd("MapDatabaseController -> tables"); */
        /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
        /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
        // connessione a vertica per recuperare l'elenco delle tabelle
        // $tables = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='$schema' ORDER BY TABLE_NAME ASC;");
        BIConnectionsController::getDB();
        switch (session('db_driver')) {
            case 'odbc':
                $query = VerticaOdbcHelper::open()->table('V_CATALOG.ALL_TABLES')
                    ->select(['TABLE_NAME'])
                    ->where('SCHEMA_NAME', '=', $schema); //->orderBy('TABLE_NAME', 'ASC')->get();
                break;
            case 'mysql':
                // $tables = Schema::connection(session('db_client_name'))->getAllTables();
                $query = DB::connection(session('db_client_name'))->table('information_schema.tables')
                    ->select('TABLE_NAME')
                    ->where('TABLE_SCHEMA', $schema);
                // $tables = DB::connection(session('db_client_name'))->select("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA='$schema' ORDER BY TABLE_NAME ASC;");
            default:
                break;
        }
        $query->orderBy('TABLE_NAME');
        /* dd($query->get()); */
        return response()->json($query->get());
    }

    // In questo Metodo provengo da sheet_update.
    // L'utente sta aggiornando lo sheet che ha modificato in locale.
    public static function copy_table(string $datamartFrom, string $datamartTo)
    {
        BIConnectionsController::getDB();
        $copy = NULL;
        switch (session('db_driver')) {
            case 'odbc':
                // TEST: 28.07.2026 da testare dopo utilizzo VerticaOdbcHelper
                $sql = "SELECT COPY_TABLE ('decisyon_cache.{$datamartFrom}','decisyon_cache.{$datamartTo}');";
                $copy = VerticaOdbcHelper::open()->statement($sql);
                break;
            case 'mysql':
                $createTable = DB::connection(session('db_client_name'))
                    ->statement("CREATE TABLE decisyon_cache.{$datamartTo} LIKE decisyon_cache.{$datamartFrom};");
                if ($createTable) {
                    $copy = DB::connection(session('db_client_name'))
                        ->statement("INSERT INTO decisyon_cache.{$datamartTo} SELECT * FROM decisyon_cache.$datamartFrom;");
                }
                break;
            default:
                break;
        }
        return $copy;
    }

    public function publish(string $token)
    {
        // TEST: 28.07.2026 da testare dopo utilizzo VerticaOdbcHelper

        // dd($fromId, $toId);
        // 20.06.2025 Lo sheet, in bi_sheets, è sempre presente altrimenti non avrei potuto
        // aprire (o creare) la dashboard
        BIConnectionsController::getDB();
        $sheet = BIsheet::where('token', $token)->first(['datamartId', 'userId']);
        // dd($sheet->datamartId);
        // dd($sheet->datamartId . $sheet->userId);
        // dump(config("database.connections.client_mysql.database"));
        // dd(Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$toId}"));

        $exists = NULL;
        // se la tabella di destinazione già esiste la elimino
        switch (session('db_driver')) {
            case 'odbc':
                // METODO 1 - creo un'istanza per tenere aperta la connessione al db
                // 1. Apri una sola istanza (quindi UNA sola connessione a Vertica)
                /* $db = VerticaOdbcHelper::open(); */
                /* $tableName = "WEB_BI_{$sheet->datamartId}"; */
                /* $tempTableName = "WEB_BI_{$sheet->datamartId}_{$sheet->userId}"; */
                /* // 2. Verifica se la tabella esiste (riutilizzando l'istanza) */
                /* $exists = $db->hasTable('decisyon_cache', $tableName); */
                /* if ($exists) { */
                /*     // USA execute() per i comandi DDL come DROP TABLE */
                /*     $db->execute("DROP TABLE decisyon_cache.{$tableName};"); */
                /* } */
                /* $sql = "SELECT COPY_TABLE ('decisyon_cache.{$tempTableName}', 'decisyon_cache.{$tableName}');"; */
                /* // USA execute() anche qui perché COPY_TABLE esegue un'azione strutturale */
                /* $copy = $db->execute($sql); */
                /**/
                /* // 3. Opzionale ma consigliato: chiudi la connessione appena hai finito */
                /* $db->close(); */
                // END METODO 1

                // METODO 2 - utilizzo il metodo statico session(), questo gestisce l'apertura
                // di una sola connessione e la chiusura automatica anche in caso di errori/eccezioni
                // durante il processo.
                VerticaOdbcHelper::session(function ($db) use ($sheet) {
                    $tableName = "WEB_BI_{$sheet->datamartId}";
                    $tempTableName = "WEB_BI_{$sheet->datamartId}_{$sheet->userId}";

                    // Controlla se esiste
                    if ($db->hasTable('decisyon_cache', $tableName)) {
                        $db->execute("DROP TABLE decisyon_cache.{$tableName};");
                    }

                    // Esegue la copia
                    $sql = "SELECT COPY_TABLE ('decisyon_cache.{$tempTableName}', 'decisyon_cache.{$tableName}');";
                    return $db->execute($sql);
                });
                // La connessione a Vertica si chiude AUTOMATICAMENTE qui!
                break;
            case 'mysql':
                $exists = Schema::connection(session('db_client_name'))->hasTable('WB_DATE');
                if ($exists) Schema::connection(session('db_client_name'))->drop("decisyon_cache.WEB_BI_{$sheet->datamartId}");
                $createTable = DB::connection(session('db_client_name'))
                    ->statement("CREATE TABLE decisyon_cache.WEB_BI_{$sheet->datamartId} LIKE decisyon_cache.WEB_BI_{$sheet->datamartId}_{$sheet->userId};");
                if ($createTable) {
                    return DB::connection(session('db_client_name'))
                        ->statement("INSERT INTO decisyon_cache.WEB_BI_{$sheet->datamartId} SELECT * FROM decisyon_cache.WEB_BI_{$sheet->datamartId}_{$sheet->userId};");
                }
                break;
            default:
                break;
        }
    }

    public function preview(string $datamart_name)
    {
        $queryColumns = NULL;
        // dd($datamart_name);
        // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
        // $data = DB::connection('vertica_odbc')->table($table)->limit(5)->get(); // ok
        // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497, 43, 473, 437, 445, 461, 485, 549, 621, 1000002079, 455, 471, 179])->paginate(15000);
        // $data = DB::connection('vertica_odbc')->table($table)->whereIn("descrizione_id", [1000002045, 447, 497])->paginate(15000);

        // BUG: 2024.03.24 : senza l'utilizzo di orderBy, il paginate non funziona correttamente quando deve
        // essere disegnata la google DataTable
        // $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->paginate(15000);

        // $data = DB::connection('vertica_odbc')->table("decisyon_cache.WEB_BI_{$id}")->orderBy('area_id')->paginate(15000);

        // INFO: METODO 1
        BIConnectionsController::getDB();
        // dd(session('db_driver'));
        switch (session('db_driver')) {
            case 'odbc':
                /* $queryColumns = DB::connection(session('db_client_name'))->table('COLUMNS')->select('column_name'); */
                $queryColumns = VerticaOdbcHelper::open()->table('COLUMNS')->select(['COLUMN_NAME']);
                break;
            case 'mysql':
                $queryColumns = DB::connection(session('db_client_name'))->table('information_schema.COLUMNS')->select('column_name');
                break;
            default:
                // TODO: implementazione altri DB
                break;
        }

        $columnsData = $queryColumns->where('TABLE_SCHEMA', '=', "decisyon_cache")
            ->where('TABLE_NAME', '=', $datamart_name)->orderBy('ORDINAL_POSITION')->get();

        $query = NULL;
        switch (session('db_driver')) {
            case 'odbc':
                $query = VerticaOdbcHelper::open()->table("decisyon_cache.{$datamart_name}");
                break;
            case 'mysql':
                $query = DB::connection(session('db_client_name'))->table("decisyon_cache.{$datamart_name}");
                break;
            default:
                break;
        }
        foreach ($columnsData as $columns) {
            foreach ($columns as $column) {
                $query->orderBy($column);
            }
        }
        // $data = $query->cursorPaginate(10000);
        // NOTE: il cursorPaginate dovrebbe essere più performante (da testare) ma non contiene i dati relativi al
        // numero di pagine, al momento utilizzo paginate() con la clausola OrderBy
        $data = $query->paginate(10000);
        // if ($data->currentPage() === 3) return $data;
        return $data;
        // INFO: METODO 1

        // INFO: METODO 2

        /* $data = DB::connection(session('db_client_name'))->table("decisyon_cache.WEB_BI_{$id}")->limit(20000)->get();
		// dd($data);
		return response()->json($data); */
        // INFO: METODO 2
    }

    // viene invocata da init-dashboards.js
    public function datamart(Request $request, string $id)
    {
        // TEST: 28.07.2026 da testare dopo utilizzo VerticaOdbcHelper

        /* $data = DB::connection(session('db_client_name'))->table("decisyon_cache.WEB_BI_{$id}")->paginate(20000);
		return $data; */
        // ---------- copiato dal metodo preview ----------------

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
        $query = NULL;
        $queryColumns = NULL;
        // dd(session('db_driver'));
        switch (session('db_driver')) {
            case 'odbc':
                /* $queryColumns = DB::connection(session('db_client_name'))->table('COLUMNS')->select('column_name'); */
                $queryColumns = VerticaOdbcHelper::open()
                    ->table("COLUMNS")->select(["COLUMN_NAME"]);
                dd($queryColumns);
                // FIX: vengono aperte due connessioni, utilizzare il metodo session() come fatto in $this->publish()
                $query = VerticaOdbcHelper::open()->table("decisyon_cache.WEB_BI_{$id}");
                break;
            case 'mysql':
                $queryColumns = DB::connection(session('db_client_name'))
                    ->table('information_schema.COLUMNS')->select('column_name');
                $query = DB::connection(session('db_client_name'))->table("decisyon_cache.WEB_BI_{$id}");
                break;
            default:
                // TODO: implementazione altri DB
                break;
        }
        $columnsData = $queryColumns->where('TABLE_SCHEMA', '=', 'decisyon_cache')
            ->where('TABLE_NAME', '=', "WEB_BI_{$id}")->orderBy('ordinal_position')->get();

        foreach ($request->query() as $key => $value) {
            // se nella querystring è presente la stringa token, non la considero nella query
            // TODO: 26.03.2025 implementare un try...catch per restituire il messaggio d'errore custom se
            // la colonna passata nella querystring non è presente nella tabella
            if ($key !== 'token' && $key !== 'page') $query->where($key, '=', $value);
        }

        foreach ($columnsData as $columns) {
            foreach ($columns as $column) {
                $query->orderBy($column);
            }
        }
        // $query->toSql();
        // $query->dd();

        // $data = $query->cursorPaginate(10000);
        // NOTE: il cursorPaginate dovrebbe essere più performante (da testare) ma non contiene i dati relativi al
        // numero di pagine, al momento utilizzo paginate() con la clausola OrderBy
        $data = $query->paginate(20000);

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
        // ---------- copiato dal metodo preview ----------------
    }

    // Questo metodo l'ho messo in POST dopo aver ricevuto gli errori di memory_limit.
    // Siccome si verificano ugualmente ho commentato questo Metodo, che usa il POST. In futuro mi
    // potrà servire se decido di inviare qui alcuni dati, ad esempio, alcuni parametri per la query, come la definizione
    // delle colonne
    public function datamartPost(Request $request)
    {
        dd($request);
        BIConnectionsController::getDB();
        $id = $request->input(0);
        dd($id);
        // dd($id);
        // $datamart = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='decisyon_cache' AND TABLE_NAME='WEB_BI_$id';");
        // if ($datamart) {
        switch (session('db_driver')) {
            case 'odbc':
                $data = VerticaOdbcHelper::open()->table("decisyon_cache.WEB_BI_$id")
                    ->select(['*'])->limit(20)->get();
                break;
            case 'mysql':
                $data = DB::connection(session('db_client_name'))->table("decisyon_cache.WEB_BI_$id")->limit(20)->get();
                break;
            default:
                # code...
                break;
        }
        // dd(memory_get_usage());
        // dd(memory_get_peak_usage());
        // }
        // dd($datamart);
        // dd($data);
        return response()->json($data);
    }

    /*
	 * Viene creata una struttura in cui le metriche vengono raggruppate in base allo stesso contenuto dei filtri
	 * Se due metriche contengono gli stessi filtri (quindi possono essere calcolate nella stessa query) le raggruppo
	 * in base a un token
	 * */
    private function calcAdvancedMetrics()
    {
        $this->query->filteredMetrics = $this->query->process->advancedMeasures->{$this->query->fact};
        // dd($this->query->filteredMetrics);
        // verifico quali, tra le metriche filtrate, contengono gli stessi filtri.
        // Le metriche che contengono gli stessi filtri vanno eseguite in un unica query.
        // Oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
        $this->query->groupMetricsByFilters = (object)[];
        // raggruppare per tipologia dei filtri
        $groupFilters = array();
        // creo un gruppo di filtri
        foreach ($this->query->filteredMetrics as $metric) {
            // dd($metric->formula->filters);
            // ogni gruppo di filtri ha un tokenGrouup diverso come key dell'array
            $tokenGroup = "grp_" . bin2hex(random_bytes(4));
            if (!in_array($metric->filters, $groupFilters)) $groupFilters[$tokenGroup] = $metric->filters;
        }
        // per ogni gruppo di filtri vado a posizionare le relative metriche al suo interno
        foreach ($groupFilters as $token => $group) {
            $metrics = array();
            foreach ($this->query->filteredMetrics as $metric) {
                // dd($metric->filters);
                // dd($group);
                // se la metrica in ciclo non ha filtri deve comunque essere aggiunta all'array $metrics
                if (empty($metric->filters)) {
                    array_push($metrics, $metric);
                } elseif (get_object_vars($metric->filters) == get_object_vars($group)) {
                    // la metrica in ciclo ha gli stessi filtri del gruppo in ciclo, la aggiungo
                    array_push($metrics, $metric);
                }
            }
            // per ogni gruppo aggiungo l'array $metrics che contiene le metriche che hanno gli stessi filtri del gruppo in ciclo
            $this->query->groupMetricsByFilters->$token = $metrics;
        }
    }

    private function calcCompositeMetrics()
    {
        // dump(!empty((array) $this->query->process->compositeMeasures));
        if (!empty((array) $this->query->process->compositeMeasures)) {
            function recursive($el, $metrics, $ifNullOperator)
            {
                foreach ($el as $nestedElement) {
                    if (is_array($nestedElement)) {
                        // metrica composta annidata
                        $sql[] = recursive($nestedElement, $metrics, $ifNullOperator);
                    } else {
                        // FIX: 26.05.2025 Ricercare questo operatore con il regex e non in questo modo
                        if (in_array("/", $el) || in_array(" / ", $el)) {
                            $sql[] = (in_array($nestedElement, $metrics)) ? "CASE WHEN {$ifNullOperator}({$nestedElement}, 0) = 0 THEN NULL ELSE {$ifNullOperator}({$nestedElement}, 0) END" : trim($nestedElement);
                        } else {
                            $sql[] = (in_array($nestedElement, $metrics)) ? "{$ifNullOperator}({$nestedElement}, 0)" : trim($nestedElement);
                        }
                    }
                }
                // return implode(' ', $sql);
                return implode($sql);
            }
            foreach ($this->query->process->compositeMeasures as $metric) {
                // dd($metric);
                $sql = [];
                // TODO: 09.04.2025 potrei utilizzare un metodo, per ifNullOperator, che restituisce la stringa racchiusa da NVL (o IFNULL) anziché la proprietà
                // nella Classe Cube
                foreach ($metric->SQL as $element) {
                    // dump($element);
                    // se l'elemento in ciclo è un array si tratta di una metrica composta NIDIFICATA, effettuo la stessa operazione
                    // dump($element);
                    if (is_array($element)) {
                        // metrica composta annidata
                        $sql[] = recursive($element, $metric->metrics, $this->query->ifNullOperator);
                    } else {
                        // metrica composta "semplice"
                        // se nella formula è presente il simbolo della divisione, tutte le metriche susseguenti avranno il CASE...WHEN
                        // BUG: quando l'elemento dell'array è ") /" l'operatore della divisione non viene trovato
                        // FIX: 29.05.2025 Utilizzare la stessa logica di createMetrics() utilizzando STR_PAD_BOTH
                        if (in_array("/", $sql) || in_array(" / ", $sql)) {
                            $sql[] = (in_array($element, $metric->metrics))
                                ? "CASE WHEN {$this->query->ifNullOperator}({$element}, 0) = 0 THEN NULL ELSE {$this->query->ifNullOperator}({$element}, 0) END"
                                : trim($element);
                        } else {
                            // FIX: 29.05.2025 Utilizzare la stessa logica di createMetrics() utilizzando STR_PAD_BOTH
                            $sql[] = (in_array($element, $metric->metrics))
                                ? "{$this->query->ifNullOperator}({$element}, 0)"
                                : trim($element);
                        }
                    }
                }
                // dd($sql);
                // WARN: è necessario aggiungere gli spazi perchè in javascript li elimino con trim()
                // $sql_string = implode(' ', $sql);
                $sql_string = implode($sql);
                // dump($sql_string);
                // if ($metric->alias === 'test_issue245_1') dd($sql_string);
                // racchiudo le metriche all'interno della composta con la funzione NVL (o IFNULL) ottenendo
                // Es. : ( NVL(ricavo,0) - NVL(costo,0) / NVL(ricavo,0) * 100)
                // $this->query->compositeMeasures[] = "\n{$sql_string} AS '{$metric->alias}'";
                $this->query->compositeMeasures[] = "{$sql_string} AS \"{$metric->alias}\"";
                // dd($this->query->compositeMeasures);
                // dump($this->query->compositeMeasures);
            }
            // dd($this->query->compositeMeasures);
        }
    }

    public function createSheet(Request $request)
    {
        /* dd($request); */
        try {
            $process = json_decode(json_encode($request->all())); // object
            // 16.06.2025 Verifico se questo Sheet è presente in bi_sheets. Se è presente, devo nominare
            // il datamart WEB_BI_LOCAL_DATAMART_USERID altrimenti vado a sovrascrivere il datamart presente in bi_sheets (e anche eventuali
            // sheet presenti sulle Dashboard)
            $this->query = new Cube($process);
            // $sheet = BIsheet::find($process->token);
            $this->query->sheet = BIsheet::find($process->token);
            // elaborazione in locale, verifico se è presente lo sheet "pubblicato".
            // Se presente creo WEB_BI_LOCAL_... per non sovrascrivere quello pubblicato
            // Se non è presente una versione pubblicata posso utilizzare WEB_BI_...
            $this->query->datamart_name = ($this->query->sheet) ?
                "WEB_BI_LOCAL_{$this->query->datamart_id}_{$this->query->user_id}" :
                "WEB_BI_{$this->query->datamart_id}_{$this->query->user_id}";
            // dd($this->query->datamart_name);
            $this->query->datamartFields();

            // Ciclo su tutte le Fact mappate (in caso di analisi multicubo)
            foreach ($this->query->facts as $fact) {
                $this->query->fact = $fact;
                $this->query->factId = substr($fact, -5);
                // $this->query->baseTableName = "WB_BASE_{$this->query->datamart_id}_{$this->query->user_id}_{$this->query->factId}";
                $this->query->baseTableName = ($this->query->sheet) ?
                    "WB_BASE_LOCAL_{$this->query->datamart_id}_{$this->query->user_id}_{$this->query->factId}" :
                    "WB_BASE_{$this->query->datamart_id}_{$this->query->user_id}_{$this->query->factId}";
                $this->query->createBaseQuery();
                // WARN: 17.06.2025 in fase schedulazione curlprocess() qui c'è un controllo sulle metriche di base, prima di invocare createBaseTable()
                $this->query->createBaseTable();
                // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
                // creo una tabella temporanea per ogni metrica filtrata
                // dd($this->query->process->{"advancedMeasures"});
                // dd(empty($this->query->process->{"advancedMeasures"}));
                if (!empty($this->query->process->advancedMeasures)) {
                    // Sono presneti metriche avanzate
                    // dump("Metriche advanced");
                    // dd($this->query->process->advancedMeasures);
                    if (property_exists($this->query->process->advancedMeasures, $fact)) {
                        $this->calcAdvancedMetrics();
                        $this->query->createAdvancedMeasuresDatamart();
                    }
                }
            }
            // calcolo metriche composte
            $this->calcCompositeMetrics();
            // dd($this->query->compositeMeasures);
            return $this->query->createDatamart();
        } catch (\Throwable $th) {
            // abort(500);
            // $msg = $th->getMessage();
            // dump($th);
            // return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
            // return response()->json(['error' => 500, 'message' => $msg], 500);
            throw $th;
        }
        // } catch (Exception $e) {
        //   $msg = $e->getMessage();
        //   abort(500);
        //   // return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
        // }
    }

    /**
     * Creazione dell'oggetto 'process' per l'esecuzione da curl
     *
     * @return ProcessObject
     */
    public function scheduleProcess(string $token)
    {
        // recupero l'oggetto Sheet dal metadato
        // dd(BIsheet::find($token));
        if (BIsheet::find($token)) {
            // $sheet = BIsheet::where("token", $token)->get(['json_value', 'workbookId']);
            $sheet = BIsheet::where("token", $token)->first(['json_value', 'json_facts', 'datamartId', 'userId', 'workbookId']);
            $facts = json_decode($sheet->json_facts);
            // dd($sheet->workbookId);
            $json_sheet = json_decode($sheet->json_value);
            // dd($json_sheet);
            // $json_sheet = json_decode(BIsheet::where("token", $token)->first('json_value')->json_value);
            // WorkBook
            if (BIworkbook::find($sheet->workbookId)) {
                // recupero il json del workbook, qui è memorizzato il databaseId al quale si collega questo
                // sheet (il token dello sheet passato da curl o da jobScheduler)
                // $workbook = json_decode(BIworkbook::where("token", $sheet->workbookId)->first('json_value')->json_value);
                $workbook = json_decode(BIworkbook::where("token", $sheet->workbookId)->first(['json_value', 'connectionId', 'worksheet']));
                // dd($workbook->connectionId);
                // dd($workbook->worksheet);
                $worksheet = json_decode($workbook->worksheet);
                // dump($worksheet);
                // dd($worksheet->filters);
                // dd($workbook->worksheet->filters);
                // Call un metodo statico che imposterà le variabili di sessione che riguardano la connessione al db
                BIConnectionsController::curlDBConnection($workbook->connectionId);
                // creo l'object 'process' che verrà processato da this->sheetCurlProcess()
                $process = (object)[
                    'datamartId' => $sheet->datamartId,
                    'token' => $token,
                    'userId' => $sheet->userId,
                    'facts' => $facts,
                    'from' => $json_sheet->from,
                    'joins' => $json_sheet->joins,
                    'filters' => (object)[],
                    'fields' => (object)[],
                    'baseMeasures' => (object)[],
                    'advancedMeasures' => (object)[],
                    'compositeMeasures' => (object)[],
                    'hierarchiesTimeLevel' =>  NULL
                ];
                $metrics = (object)[];
                $advancedMeasures = (object)[];
                // fields vengono recuperati dal WorkBook
                foreach ($json_sheet->fields as $token => $field) {
                    // dd($field);
                    // recupero le proprietà 'field', 'tableAlias' mentre la proprietà 'name' la utilizzo dallo Sheet
                    $process->fields->$token = (object)[
                        'SQL' => $field->SQL,
                        'name' => $field->name,
                        'token' => $token
                    ];
                    // se è un livello della dimensione TIME, ne importo 'hierarchiesTimeLevel' per stabilire l'ultimo livello "TIME" presente nel report
                    // dump(($field->time));
                    if ($field->time) $process->hierarchiesTimeLevel = $field->time->table;
                }
                // dd($process);
                // recupero i filtri impostati nello Sheet
                // dump($json_sheet->filters);
                foreach ($json_sheet->filters as $token) {
                    // recupero le definizioni dei filtri dall'oggetto $workbook
                    // dd($workbook->worksheet->filters);
                    // dump(property_exists($workbook->worksheet->filters, $token));
                    // dd($workbook->worksheet->filters->$token);
                    if (property_exists($worksheet->filters, $token)) {
                        $process->filters->$token = $worksheet->filters->$token;
                    } else {
                        return "Filtro ({$token}) non presente nel WorkBook";
                    }
                }
                // dd($process->filters);

                $timingFunctions = ['last-year', 'last-month', 'ecc..'];
                foreach ($facts as $fact) {
                    // metriche di base
                    // dd($json_sheet->sheet);
                    if (property_exists($json_sheet, 'metrics')) {
                        foreach ($json_sheet->metrics as $token => $object) {
                            // anche qui, come in 'fields', alcune proprietà vanno recuperato da json_sheet mentre altre dal WorkBook
                            // utilizzo la stessa logica presente in createProcess()
                            // dump($object);
                            switch ($object->type) {
                                case 'composite':
                                    /* if (BImetric::find($token)) {
										$json_composite_measures = json_decode(BImetric::where("token", $token)->first('json_value')->json_value);
										$process->compositeMeasures->$token = (object)[
											"alias" => $object->alias,
											"SQL" => $json_composite_measures->SQL,
											"metrics" => $json_composite_measures->metrics
										];
									} else {
										return "Metrica (objectId : {$token}) non presente nel Database";
									} */
                                    // 16.06.2025 Le metriche composte ora sono state aggiunte alla proprietà 'worksheet'
                                    if (property_exists($worksheet->composite, $token)) {
                                        $process->compositeMeasures->$token = (object)[
                                            "alias" => $worksheet->composite->$token->alias,
                                            "SQL" => $worksheet->composite->$token->SQL,
                                            "metrics" => $worksheet->composite->$token->metrics
                                        ];
                                        // dd($process->compositeMeasures);
                                    } else {
                                        return "Metrica composta (objectId : {$token}) non presente nel Database";
                                    }
                                    break;
                                case 'advanced':
                                    // dd($workbook->worksheet->{$object->factId});
                                    // dump(property_exists($workbook->worksheet->{$object->factId}, $token));
                                    if (property_exists($worksheet->{$object->factId}, $token)) {
                                        $json_advanced_measures = $worksheet->{$object->factId}->$token;
                                        // dump($json_advanced_measures);
                                        // dd("Metrica avanzata $token trovata");
                                        $json_filters_metric = (object)[];
                                        foreach ($json_advanced_measures->filters as $filterToken) {
                                            // se il filtro è un timingFn recupero la definizione $object-timingFn che si trova all'interno della metrica
                                            if (in_array($filterToken, $timingFunctions)) {
                                                $json_filters_metric->$filterToken = $json_advanced_measures->timingFn->$filterToken;
                                            } else {
                                                if (property_exists($worksheet->filters, $filterToken)) {
                                                    $json_filters_metric->$filterToken = $worksheet->filters->$filterToken;
                                                } else {
                                                    return "Filtro ({$filterToken}) della metrica ({$token}) non presente nel WorkBook";
                                                }
                                            }
                                        }
                                        $advancedMeasures->$token = (object)[
                                            "token" => $token,
                                            "alias" => $object->alias,
                                            "aggregateFn" => $object->aggregateFn,
                                            "SQL" => $json_advanced_measures->SQL,
                                            "distinct" => $json_advanced_measures->distinct,
                                            "filters" => $json_filters_metric
                                        ];
                                        if (property_exists($json_advanced_measures, 'metrics')) $advancedMeasures->$token->metrics = $json_advanced_measures->metrics;
                                        // dd($advancedMeasures);
                                        $process->advancedMeasures->$fact = $advancedMeasures;
                                    }
                                    break;
                                default:
                                    // base metrics
                                    $metrics->$token = (object)[
                                        'token' => $object->token, // TODO: probabilmente il token non serve
                                        "alias" => $object->alias,
                                        "aggregateFn" => $object->aggregateFn,
                                        "SQL" => $json_sheet->metrics->{$token}->SQL,
                                        "distinct" => $json_sheet->metrics->{$token}->distinct
                                    ];
                                    if (property_exists($json_sheet->metrics->{$token}, 'metrics')) $metrics->$token->metrics = $json_sheet->metrics->{$token}->metrics;
                                    // dd($metrics);
                                    $process->baseMeasures->$fact = $metrics;
                                    break;
                            }
                        }
                        // dd("STOP");
                    }
                }
                // metriche composte
                return $this->curlProcess($process);
            } else {
                return "WorkBook (objectId: {$sheet->workbookId}) non presente nel Database";
            }
        } else {
            return "Report (objectId: {$token}) non presente nel Database\n";
        }
    }

    private function curlProcess($process)
    {
        // utilizzo per test anche alla url : http://web-bi.local/curl/process/bd0aqzq/schedule aprendola su browser
        // curl http://127.0.0.1:8000/curl/process/210wu29ifoh/schedule
        // con il login : curl https://user:psw@gaia.automotive-cloud.com/curl/process/{processToken}/schedule
        // ...oppure : curl -u 'user:psw' https://gaia.automotive-cloud.com/curl/process/{processToken}/schedule
        // dd($process);
        $this->query = new Cube($process);
        $this->query->datamart_name = "WEB_BI_{$this->query->datamart_id}_{$this->query->user_id}";
        // dd($this->query->datamart_name);
        $this->query->datamartFields();
        foreach ($this->query->facts as $fact) {
            $this->query->fact = $fact;
            $this->query->factId = substr($fact, -5);
            $this->query->baseTableName = "WB_BASE_{$this->query->datamart_id}_{$this->query->user_id}_{$this->query->factId}";
            $this->query->createBaseQuery();
            // dump(($this->query->process->baseMeasures));
            // dump(!empty((array) $this->query->process->baseMeasures));
            // se sono presenti metrica di base calcolo createBaseTable()
            if (!empty((array) $this->query->process->baseMeasures)) $this->query->createBaseTable();
            // dd($res === true ||$res === NULL);
            // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
            // creo una tabella temporanea per ogni metrica filtrata
            // dd($this->query->process->{"advancedMeasures"});
            // dd(empty($this->query->process->{"advancedMeasures"}));
            // dump(!empty((array) $this->query->process->advancedMeasures));
            if (!empty((array) $this->query->process->advancedMeasures)) {
                // sono presenti metriche avanzate
                if (property_exists($this->query->process->advancedMeasures, $fact)) {
                    $this->calcAdvancedMetrics();
                    $this->query->createAdvancedMeasuresDatamart();
                }
            }
        }
        // metriche composte
        $this->calcCompositeMetrics();

        try {
            // if ($this->query->createDatamart()) return "OK\n";
            if ($this->query->createDatamart()) {
                // dd("DATAMART CREATO");
                // 16.06.2025 Se è presente una tabella nominata WEB_BI_{$this->datamart_id} significa che lo sheet è stato
                // pubblicato su una Dashboard, eseguo il copy_table() per aggiornare anche i dati dello sheet visibile sulla dashboard
                if (Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$this->query->datamart_id}")) {
                    // if ($this->copy_table($this->query->datamart_name, $this->query->datamart_id)) return "OK\n";
                    // TEST: 20.06.2025
                    // dd($process->token);
                    // if ($this->publish($process->token)) return "OK\n";
                    // return ($this->publish($process->token)) ? "OK\n" : "NON COMPLETATO\n";
                    // dd(($this->publish($process->token)) ? "OK\n" : "NON COMPLETATO\n");
                    return ($this->publish($process->token)) ? "OK\n" : "NON COMPLETATO\n";
                } else {
                    return "OK\n";
                }
            }
        } catch (\Throwable $th) {
            $msg = $th->getMessage();
            return response()->json(['error' => 500, 'message' => "Errore esecuzione query: $msg"], 500);
            // abort(500, "ERRORE ESECUZIONE QUERY : $msg");
        }
    }

    public function sql(Request $request)
    {
        // echo gettype($cube);
        // per accedere al contenuto della $request lo converto in json codificando la $request e decodificandolo in json
        $process = json_decode(json_encode($request->all())); // object
        $this->query = new Cube($process);
        $this->query->datamart_name = "WEB_BI_{$this->query->datamart_id}_{$this->query->user_id}";
        $this->query->datamartFields();
        foreach ($this->query->facts as $fact) {
            $this->query->sql_info = (object)[
                "SELECT" => (object)[],
                "METRICS" => (object)[],
                "FROM" => (object)[],
                "WHERE" => (object)[],
                "WHERE-TIME" => (object)[],
                "AND" => (object)[],
                "GROUP BY" => (object)[]
            ];
            $this->query->fact = $fact;
            $this->query->factId = substr($fact, -5);
            $this->query->baseTableName = "WB_BASE_{$this->query->datamart_id}_{$this->query->user_id}_{$this->query->factId}";
            $this->query->createBaseQuery();
            $resultSQL['base'][] = $this->query->createBaseTable();
            // return $resultSQL;
            // dd($res === true ||$res === NULL);
            // creo una tabella temporanea per ogni metrica filtrata
            if (!empty($this->query->process->{"advancedMeasures"})) {
                // sono presenti metriche avanzate
                if (property_exists($this->query->process->{"advancedMeasures"}, $fact)) {
                    $this->calcAdvancedMetrics();
                    $this->query->json_info_advanced = [];
                    $resultSQL['advanced'] = $this->query->createAdvancedMeasuresDatamart();
                }
            }
        }
        ob_clean();
        $resultSQL['datamart'] = $this->query->createDatamart();
        return $resultSQL;
    }
}
