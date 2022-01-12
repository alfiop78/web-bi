<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BI_Dimension;
use Illuminate\Support\Facades\DB;

class BIDimensionController extends Controller
{
    public function dimension_save($json) {
        // dd(json_decode($json));
        $dimension = json_decode($json);
        $key = $dimension->{'name'};
        $result = DB::connection("mysql_local")->table('bi_dimensions')->insert([
            'name' => $key,
            'json_value' => $json
        ]);
        // dd($result); // true se il record è stato inserito
        return $result;

    }
}
