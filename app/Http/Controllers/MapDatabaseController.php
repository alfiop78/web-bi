<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MapDatabase;
use App\Models\BIdimension;
use App\Models\BIprocess;
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

    // processo la FX
    public function process(Request $request) {
        // echo gettype($cube);
        // dd($request);
        // per accedere al contenuto della $request lo converto in json codificando la $request e decodificandolo in json
        $cube = json_decode(json_encode($request->all())); // object
        $q = new Cube();
        // imposto le proprietà con i magic methods
        $q->reportId = $cube->{'processId'};
        $q->baseTableName = "WEB_BI_TEMP_BASE_$q->reportId";
        $q->datamartName = "decisyon_cache.FX_$q->reportId";
        $q->baseColumns = $cube->{'select'};
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
        // $q->joinFact($cube->{'factJoin'});
        $q->filters($cube->{'filters'});
        // TODO: siccome il group by viene creato uguale alla clausola SELECT potrei unirli e non fare qui 2 chiamate
        $q->groupBy($cube->{'select'});
        /* dd($q); */
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        $baseTable = $q->baseTable(null);
        // dd($baseTable);
        if (!$baseTable) {
            // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
            // creo una tabella temporanea per ogni metrica filtrata
            // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
            if (property_exists($cube, 'filteredMetrics')) {
                $q->filteredMetrics = $cube->{'filteredMetrics'};
                // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
                // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
                $q->groupMetricsByFilters = (object)[];
                $metrics = [];
                $groupToken = "group_".bin2hex(random_bytes(6));
                foreach ($q->filteredMetrics as $metric) {
                    if ( empty(get_object_vars($q->groupMetricsByFilters)) ) {
                        array_push($metrics, $metric);                        
                    } else {
                        foreach ($metrics as $m) {
                            if ( (get_object_vars($metric->filters) == get_object_vars($m->filters)) ) {
                                array_push($metrics, $metric);
                            } else {
                                // è un gruppo diverso da quello già esistente, quindi creo un nuovo token (il token del gruppo)
                                $groupToken = "group_".bin2hex(random_bytes(6));
                                // reimposto l'array altrimenti inserisco in questo gruppo anche gli elementi che sono già stati aggiunti ad altri gruppi
                                $metrics = [];
                                array_push($metrics, $metric);
                            }
                        }
                    }
                    $q->groupMetricsByFilters->$groupToken = $metrics;
                }
                // dd($q->groupMetricsByFilters);
                $metricTable = $q->createMetricDatamarts(null);
            }
            // echo 'elaborazione createDatamart';
            // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
            $datamartName = $q->createDatamart(null);
            // dd($datamartName);
            // restituisco un ANTEPRIMA del json con i dati del datamart appena creato
            $datamartResult = DB::connection('vertica_odbc')->select("SELECT * FROM $datamartName LIMIT 5000;");
            return response()->json($datamartResult);
        }
    }

    public function sqlInfo(Request $request) {
        // echo gettype($cube);
        // dd($request);
        // per accedere al contenuto della $request lo converto in json codificando la $request e decodificandolo in json
        $cube = json_decode(json_encode($request->all())); // object
        $q = new Cube();
        // imposto le proprietà con i magic methods
        $q->reportId = $cube->{'processId'};
        $q->baseTable = "WEB_BI_TEMP_BASE_$q->reportId";
        $q->datamartName = "decisyon_cache.FX_$q->reportId";
        $q->baseColumns = $cube->{'select'};
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
        // $q->joinFact($cube->{'factJoin'});
        if (property_exists($cube, 'filters')) $q->filters($cube->{'filters'});
        // TODO: siccome il group by viene creato uguale alla clausola SELECT potrei unirli e non fare qui 2 chiamate
        $q->groupBy($cube->{'select'});
        /* dd($q); */
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        $resultSQL[] = $q->baseTable('sql');
        // dd($SQLBaseTable);
        // return $resultSQL;
        // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
        // creo una tabella temporanea per ogni metrica filtrata
        // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
        if (property_exists($cube, 'filteredMetrics')) {
            $q->filteredMetrics = $cube->{'filteredMetrics'};
            // verifico quali, tra le metriche filtrate, contengono gli stessi filtri. Le metriche che contengono gli stessi filtri vanno eseguite in un unica query
            // oggetto contenente un array di metriche appartenenti allo stesso gruppo (contiene gli stessi filtri)
            $q->groupMetricsByFilters = (object)[];
            $metrics = [];
            $groupToken = "group_".bin2hex(random_bytes(6));
            foreach ($q->filteredMetrics as $metric) {
                if ( empty(get_object_vars($q->groupMetricsByFilters)) ) {
                    array_push($metrics, $metric);
                } else {
                    foreach ($metrics as $m) {
                        if ( (get_object_vars($metric->filters) == get_object_vars($m->filters)) ) {
                            array_push($metrics, $metric);
                        } else {
                            // è un gruppo diverso da quello già esistente, quindi creo un nuovo token (il token del gruppo)
                            $groupToken = "group_".bin2hex(random_bytes(6));
                            // reimposto l'array altrimenti inserisco in questo gruppo anche gli elementi che sono già stati aggiunti ad altri gruppi
                            $metrics = [];
                            array_push($metrics, $metric);
                        }
                    }
                }
                $q->groupMetricsByFilters->$groupToken = $metrics;
            }
            // dd($q->groupMetricsByFilters);
            
            $resultSQL[] = $q->createMetricDatamarts('sql');
            // dd($q->createMetricDatamarts('sql'));
        }
        // return nl2br(implode("\n\n----------------------\n\n", $resultSQL));
        // echo 'elaborazione createDatamart';
        // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
        $resultSQL[] = $q->createDatamart('sql');
        return nl2br(implode("\n\n\n", $resultSQL));
    }

    // curl
    public function curlprocess($json) {
        $json_decoded = json_decode($json); // object
        $json_value = json_decode($json_decoded->{'json_value'});
        $cube = $json_value->{'report'};
        $reportName = $json_value->{'name'};

        $q = new Cube();
        // imposto le proprietà con i magic methods
        $q->reportId = $cube->{'processId'};
        $q->baseTable = "W_AP_base_$q->reportId";
        $q->datamartName = "decisyon_cache.FX_$q->reportId";
        $q->baseColumns = $cube->{'select'};
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
        // $q->joinFact($cube->{'factJoin'});
        $q->filters($cube->{'filters'});
        // TODO: siccome il group by viene creato uguale alla clausola SELECT potrei unirli e non fare qui 2 chiamate
        $q->groupBy($cube->{'select'});
        /* dd($q); */
        // creo la tabella Temporanea, al suo interno ci sono le metriche NON filtrate
        $baseTable = $q->baseTable();
        // dd($baseTable);
        if (!$baseTable) {
            // se la risposta == NULL la creazione della tabella temporanea è stata eseguita correttamente (senza errori)
            // creo una tabella temporanea per ogni metrica filtrata
            // TODO: 2022-05-06 qui occorre una verifica più approfondita sui filtri contenuti nella metrica, allo stato attuale faccio una query per ogni metrica filtrata, anche se i filtri all'interno della metrica sono uguali. Includere più metriche che contengono gli stessi filtri in un unica query
            if (property_exists($cube, 'filteredMetrics')) {
                $q->filteredMetrics = $cube->{'filteredMetrics'};
                $metricTable = $q->createMetricDatamarts();
            }
            // echo 'elaborazione createDatamart';
            // unisco la baseTable con le metricTable con una LEFT OUTER JOIN baseTable->metric-1->metric-2, ecc... creando la FX finale
            $datamartName = $q->createDatamart();
            // var_dump($datamartName);
            if ($datamartName) return "Datamart ({$datamartName}) per il report {$reportName} creato con successo!\n";
        }
    }

}
