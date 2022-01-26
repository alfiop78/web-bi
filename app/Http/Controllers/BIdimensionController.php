<?php

namespace App\Http\Controllers;

use App\Models\BIdimension;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;

class BIdimensionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // dd('index BIdimension Controller');
        // utilizzo del Model, il nome della tabella è impostata nel Model
        $dimensions = BIdimension::all();
        // dd($dimensions);
        // return response()->json($dimensions);
        return response()->json(['dimensions' => $dimensions]); // la stringa 'dimensions' mi serve per identificare il div parent dove appendere l'elenco delle dimensioni nel DOM
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
    public function store(Request $request, $json)
    {
        // dd($json);
        $jsonContent = json_decode($json);
        // l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
        $dim = new BIdimension();
        // il nome della tabella è impostato nel Model
        $dim->name = $jsonContent->{'name'};
        $dim->json_value = $json;
        return $dim->save();
        // dd($key);
        // insert con il query builder
        // $result = DB::connection("mysql_local")->table('bi_dimensions')->insert([
        //     'name' => $key,
        //     'json_value' => $json
        // ]);
        /*$result = DB::table('bi_dimensions')->insert([
            'name' => $key,
            'json_value' => $json
        ]);
        return $result;*/
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\BIdimension  $bIdimension
     * @return \Illuminate\Http\Response
     */
    public function show(BIdimension $bIdimension)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\BIdimension  $bIdimension
     * @return \Illuminate\Http\Response
     */
    public function edit(BIdimension $bIdimension)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\BIdimension  $bIdimension
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, BIdimension $bIdimension)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BIdimension  $bIdimension
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIdimension $bIdimension)
    {
        //
    }
}
