<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MapDatabase;
use Illuminate\Support\Facades\DB;
use App\Classes\Cube;

class MapDatabaseController extends Controller
{
    public function mapping() {
        // recupero tutti i record
        /* $corsi = Corso::all(); */
        /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
        /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
        /* dd($tables); */
        // get recupera uno specifico campo
        //$corsi = corso::get('name');
        // find recupero un record specifico
        // $corso = corso::find(1); // 1 : id record
        // dd($corso); // utilizzo di Die Dump, interrompe l'esecuzione e mostra il dump.
        // restituisco i dati recuperati dal db alla view
        /* return view('web_bi.mapping')->with('tableList', $tables);  */
        return view('web_bi.mapping'); 
        /* return response(json_encode($tables))->header('Content-Type', 'application/json'); */
        /* return response()->json($tables); */
    }

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

    public function vertica_odbc() {
        // Facade
        // utilizzo di odbc dopo l'installazione del repository laravel-odbc
        // https://github.com/andreossido/laravel-odbc
        // la connessione viene fatta nel Model MapDatabase ed in questo modo riesco ad accedere direttamente allo schema impostato nel .env
        /* $books = DB::table('Azienda')->where('id', '473')->get(); */
        /* $tablesList = DB::table('all_tables')->where('schema_name', 'automotive_bi_data')->get('table_name'); errore perchè all_tables non è presente nello schema automotive_bi_data, probabilmente qui potrei creare un'altra connessione in config/database.php per accedere a schemi diversi, dovrò comunque farlo per lo schema decisyon_cache */
        $tablesList = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='automotive_bi_data';");
        // se la connessione non viene fatta nel Model MapDatabase posso farla qui ma devo specificare lo schema
        /* $books = DB::connection('vertica_odbc')->table('automotive_bi_data.Azienda')->where('id', '473')->get(); */
        dd($tablesList);

        # ORM
        /* $books = Book::where('Author', 'Abram Andrea')->get(); */
    }

    public function report() {
        // pagina report
        return view('web_bi.report'); 
    }

    public function table_info($schema, $table) {
        /* dd($table); */
        // questa viene richiamata sia dalla pagina Mapping che dalla pagina Report
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

    public function distinct_values($table, $field) {
        /* DB::table('users')->distinct()->get(); */
        // connessione a mysql
        /* $values = DB::connection('mysql')->table('Azienda')->distinct()->get(); */
        // TODO: Aggiungere un limit di 1000 record
        $values = DB::table($table)->distinct()->orderBy($field, 'asc')->limit(500)->get($field);
        return response()->json($values);
    }

    public function tables() {
        /* $tables = DB::connection('mysql_local')->select("SHOW TABLES"); */
        /* $tables = DB::connection('mysql')->select("SHOW TABLES"); */
        // connessione a vertica per recuperare l'elenco delle tabelle
        $tables = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE SCHEMA_NAME='automotive_bi_data';");
        /* $tables = DB::connection('vertica')->select("SELECT * FROM automotive_bi_data.Azienda"); */
        return response()->json($tables);
    }

    public function post($test) {
        /* dd(request()->all()); */
        dd($test);
    }

    public function cube($cube) {
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
        $baseTable = $q->baseTable();
        if (!$baseTable) {
            // dd($baseTable);
            // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
            $metricTable = $q->createMetricDatamarts($cube->{'filteredMetrics'});
            // dd($metricTable);

            // echo 'elaborazione createDatamart';

            $datamartName = $q->createDatamart();
            // dd($result);
            $datamartResult = DB::connection('vertica_odbc')->select("SELECT * FROM $datamartName;");
            return response()->json($datamartResult);
        }
    }

}
