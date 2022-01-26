<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MapDatabase;
use App\Models\BIdimension;
use Illuminate\Support\Facades\DB;
use App\Classes\Cube;

class MapDatabaseController extends Controller
{
    public function mapping() {
        // recupero l'elenco delle dimensioni create da bi_dimensions.
        // NOTE: il support alle query su colonne JSON è per mysql 5.7+ https://laravel.com/docs/8.x/queries#json-where-clauses
        // $dimensions = DB::table('bi_dimensions')->get('json_value'); // QueryBuilder
        // $dimensions = BIdimension::get('json_value'); // Eloquent
        $schemaList = DB::connection('vertica_odbc')->select("SELECT SCHEMA_NAME FROM V_CATALOG.SCHEMATA WHERE IS_SYSTEM_SCHEMA = FALSE ORDER BY SCHEMA_NAME;");
        return view('web_bi.mapping')->with('schemes', $schemaList);
        // return view('web_bi.mapping')->with(['dimensions' => json_encode($dimensions), 'schemes' => $schemaList]);
    }

    // test connessione vertica (senza utilizzo di Eloquen/ORM)
    public function test_vertica() {
        
        # A simple function to trap errors from queries
        function errortrap_odbc($conn, $sql) {
            if(!$rs = odbc_exec($conn,$sql)) {
                echo "<br/>Failed to execute SQL: $sql<br/>" . odbc_errormsg($conn);
            } else {
                echo "<br/>Success: " . $sql;
            }
            return $rs;
        }
        # Connect to the Database
        $dsn = "VMart251";
        // $conn = odbc_connect($dsn,'dbadmin','password');
        $conn = odbc_connect($dsn,'','');
        echo $conn;
        if ($conn == NULL) {
            echo odbc_error();
            echo odbc_errormsg();
            exit;
        }
        echo "<p>Connected with DSN: $dsn</p>";
        $sql = "SELECT ID, DESCRIZIONE FROM automotive_bi_data.Azienda WHERE id = 43;";
        if($result = errortrap_odbc($conn, $sql)) {
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
    public function vertica_odbc() {
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
    public function table_info($schema, $table) {
        /* dd($table); */
        /* $tables = DB::connection('mysql')->select("DESCRIBE Azienda"); */
        $info = DB::connection('vertica_odbc')->select("SELECT C.COLUMN_NAME, C.DATA_TYPE, C.IS_NULLABLE, CC.CONSTRAINT_NAME
                FROM COLUMNS C LEFT JOIN CONSTRAINT_COLUMNS CC
                ON C.TABLE_ID=CC.TABLE_ID 
                AND C.COLUMN_NAME=CC.COLUMN_NAME 
                AND CC.CONSTRAINT_TYPE='p' 
                WHERE C.TABLE_SCHEMA = '$schema' AND C.TABLE_NAME = '$table' 
                ORDER BY c.ordinal_position ASC;");
        return response()->json($info);
    }

    // ottengo valori distinti per il field selezionato (dialog-filter)
    public function distinct_values($schema, $table, $field) {
        $values = DB::connection('vertica_odbc')->table($schema.".".$table)->distinct()->orderBy($field, 'asc')->limit(500)->get($field);
        return response()->json($values);
    }

    // Elenco delle tabelle dello schema selezionato
    public function tables($schema) {
        /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
        /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
        // connessione a vertica per recuperare l'elenco delle tabelle
        $tables = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='$schema' ORDER BY TABLE_NAME ASC;");
        /* $tables = DB::connection('vertica')->select("SELECT * FROM automotive_bi_data.Azienda"); */
        return response()->json($tables);
    }

    // test
    public function post($test) {
        /* dd(request()->all()); */
        dd($test);
    }

    // processo la FX
    public function process($cube) {
        // echo gettype($cube);
        // dd(json_decode($cube));
        $cube = json_decode($cube); // object
        /* dd($cube); */
        $q = new Cube();
        $q->reportId = $cube->{'processId'};
        $q->reportName = $cube->{'name'}; // il nome del report non deve avere caratteri non consentiti per la creazione di tabelle (per ora non c'è un controllo sul nome inserito, da javascript)
        $q->n_select($cube->{'select'});
        $q->metrics($cube->{'metrics'});
        $q->n_from($cube->{'from'});
        $q->n_where($cube->{'where'});
        $q->joinFact($cube->{'factJoin'});
        $q->filters($cube->{'filters'});
        $q->n_groupBy($cube->{'select'});
        /* dd($q); */
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        $baseTable = $q->baseTable();
        if (!$baseTable) {
            // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
            // creo una tabella temporanea per ogni metrica filtrata
            $metricTable = $q->createMetricDatamarts($cube->{'filteredMetrics'});
            // echo 'elaborazione createDatamart';
            // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
            $datamartName = $q->createDatamart();
            // dd($result);
            // restituisco un json con i dati del datamart appena creato
            $datamartResult = DB::connection('vertica_odbc')->select("SELECT * FROM $datamartName;");
            return response()->json($datamartResult);
        }
    }

}
