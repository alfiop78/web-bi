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
        // $dimensions = BIdimension::all();
        // dd($dimensions);
        // return response()->json($dimensions);
        // return response()->json(['dimensions' => $dimensions]); // la stringa 'dimensions' mi serve per identificare il div parent dove appendere l'elenco delle dimensioni nel DOM
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
        $dimensions = BIdimension::all();
        // dd($dimensions);
        // return response()->json($dimensions);
        return response()->json(['dimensions' => $dimensions]); // la stringa 'dimensions' mi serve per identificare il div parent dove appendere l'elenco delle dimensioni nel DOM
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
     * @param  $name : il nome dell'elemento da eliminare
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIdimension $bIdimension, $name)
    {
        // dd($name);
        // passando un valore id (senza la prop protected $primaryKey nel Model)
        // $el = BIdimension::findOrFail(5); // ok
        // impostando $primaryKey nel Model
        // $element = $bIdimension::findOrFail($name); // cerco l'elemento da eliminare

        $elements = $bIdimension::where(['name' => $name])->get();
        return $elements[0]->delete();
        
        /*foreach ($elements as $element) {
            $element->delete();
        }
        dd($element);
        return $element->delete();*/
        // dd($bIdimension::findOrFail($name)->get()); // questo posso utilizzarlo grazie alla proprietà protected $primaryKey impostata nel Model. Se questa proprietà non è impostata Eloquent utilizza il campo id in automatico.
        // utilizzando ->where->get ottengo una collection quindi devo ciclarla per eliminare i record oppure $elements[0]->delete()
        // $element = $bIdimension::where(['name' => $name])->get();
        // NOTE: C'è un altro problema se viene utilizzato primaryKey nel Model. Nel metodo show in questo Controller viene utilizzato all() ma, siccome il campo 'name' è una primaryKey (nel Model) non riesco a recuperare il campo 'name' che viene restituito = 0 (da rivedere)
    }
}
