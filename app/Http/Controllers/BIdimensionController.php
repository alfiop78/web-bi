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
        $dimensions = BIdimension::all();
        // dd($dimensions);
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
    public function store(Request $request)
    {
        $token = $request->collect()->get('token');
        $name = $request->collect()->get('name');
        // codifico tutta la $request in json per poterla inserire nel DB
        $json = json_encode($request->all());
        $dimension = new BIdimension();
        // salvo su DB
        $dimension->token = $token;
        $dimension->name = $name;
        $dimension->json_value = $json;
        return $dimension->save();
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
    public function show(BIdimension $bIdimension, $token)
    {
        $element = $bIdimension::findOrFail($token);
        // dd($element);
        // return response()->json($dimensions);
        return response()->json($element);
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
        $token = $request->collect()->get('token');
        $name = $request->collect()->get('name');
        // codifico tutta la $request in json per poterla inserire nel DB 
        $json = json_encode($request->all());
        // cerco nel DB il token del PROCESS da aggiornare
        $dimension = $bIdimension::findOrFail($token);
        $dimension->token = $token;
        $dimension->name = $name;
        $dimension->json_value = $json;
        return $dimension->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BIdimension  $bIdimension
     * @param  $name : il nome dell'elemento da eliminare
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIdimension $bIdimension, $token)
    {
        // cerco l'elemento da eliminare
        // impostando $primaryKey = 'name' nel Model posso utilizzare findOrFail() invece di 'where(nome_campo, '=', valore)'
        $element = $bIdimension::findOrFail($token);
        // dd($element);
        return $element->delete();
    }
}
