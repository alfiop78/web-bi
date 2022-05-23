<?php

namespace App\Http\Controllers;

use App\Models\BImetric;
use Illuminate\Http\Request;

class BImetricController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $metrics = BImetric::all();
        return response()->json(['metrics' => $metrics]);
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
        $jsonContent = json_decode($json);
        // l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
        $metric = new BImetric();
        // il nome della tabella è impostato nel Model
        $metric->token = $jsonContent->{'token'};
        $metric->name = $jsonContent->{'name'};
        $metric->json_value = $json;
        return $metric->save();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\BImetric  $bImetric
     * @return \Illuminate\Http\Response
     */
    public function show(BImetric $bImetric, $token)
    {
        $element = $bImetric::findOrFail($token);
        return response()->json($element);   
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\BImetric  $bImetric
     * @return \Illuminate\Http\Response
     */
    public function edit(BImetric $bImetric)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\BImetric  $bImetric
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, BImetric $bImetric, $json)
    {
        $jsonContent = json_decode($json);
        $metric = $bImetric::findOrFail($jsonContent->{'token'});
        $metric->token = $jsonContent->{'token'};
        $metric->name = $jsonContent->{'name'};
        $metric->json_value = $json;
        return $metric->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BImetric  $bImetric
     * @return \Illuminate\Http\Response
     */
    public function destroy(BImetric $bImetric, $token)
    {
        $element = $bImetric::findOrFail($token);
        return $element->delete();
    }
}
