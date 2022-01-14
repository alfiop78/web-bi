<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Metadata;
use Illuminate\Support\Facades\DB;

class MetadataController extends Controller
{
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
