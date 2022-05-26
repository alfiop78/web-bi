<?php

namespace App\Http\Controllers;

use App\Models\BIcube;
use Illuminate\Http\Request;

class BIcubeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $cubes = BIcube::all();
        return response()->json(['cubes' => $cubes]);
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
    // TODO: request post come fatto per BIprocessController
    public function store(Request $request, $json)
    {
        $jsonContent = json_decode($json);
        // l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
        $cube = new BIcube();
        // il nome della tabella è impostato nel Model
        $cube->token = $jsonContent->{'token'};
        $cube->name = $jsonContent->{'name'};
        $cube->json_value = $json;
        return $cube->save();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\BIcube  $bIcube
     * @return \Illuminate\Http\Response
     */
    public function show(BIcube $bIcube, $token)
    {
        $element = $bIcube::findOrFail($token);
        return response()->json($element);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\BIcube  $bIcube
     * @return \Illuminate\Http\Response
     */
    public function edit(BIcube $bIcube)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\BIcube  $bIcube
     * @return \Illuminate\Http\Response
     */
    // TODO: request post come fatto per BIprocessController
    public function update(Request $request, BIcube $bIcube, $json)
    {
        $jsonContent = json_decode($json);
        $cube = $bIcube::findOrFail($jsonContent->{'token'});
        $cube->token = $jsonContent->{'token'};
        $cube->name = $jsonContent->{'name'};
        $cube->json_value = $json;
        return $cube->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BIcube  $bIcube
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIcube $bIcube, $token)
    {
        $element = $bIcube::findOrFail($token);
        return $element->delete();
    }
}
