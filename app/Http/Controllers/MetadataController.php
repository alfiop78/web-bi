<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Metadata;
use Illuminate\Support\Facades\DB;

class MetadataController extends Controller
{
    public function mapping() {
        // recupero l'elenco delle dimensioni create da bi_dimensions
        // NOTE: il support alle query su colonne JSON è per mysql 5.7+ https://laravel.com/docs/8.x/queries#json-where-clauses
        $dimensions = DB::table('bi_dimensions')->get('json_value');
        // dd($dimensions);
        // dd($dimensions[0]->json_value);
        // dd(response()->json($dimensions));
        $schemaList = DB::connection('vertica_odbc')->select("SELECT SCHEMA_NAME FROM V_CATALOG.SCHEMATA WHERE IS_SYSTEM_SCHEMA = FALSE ORDER BY SCHEMA_NAME;");
        // dd($schemaList);
        // return response()->json($schemaList);
        // dd($query);
        // return view('web_bi.mapping')->with(['dimensions' => json_encode($dimensions), 'schemes' => $schemaList]); TEST
        return view('web_bi.mapping')->with(['dimensions' => $dimensions, 'schemes' => $schemaList]);
    }

    public function save($json, $table) {
        $jsonContent = json_decode($json);
        $key = $jsonContent->{'name'};
        // $result = DB::connection("mysql_local")->table('bi_dimensions')->insert([
        //     'name' => $key,
        //     'json_value' => $json
        // ]);
        // dd($result); // true se il record è stato inserito
        $result = DB::table($table)->insert([
            'name' => $key,
            'json_value' => $json
        ]);
        return $result;
    }

}
