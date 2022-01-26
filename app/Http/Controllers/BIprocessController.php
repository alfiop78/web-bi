<?php

namespace App\Http\Controllers;

use App\Models\BIprocess;
use Illuminate\Http\Request;

class BIprocessController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $processes = BIprocess::all();
        // dd($dimensions);
        return response()->json(['processes' => $processes]);
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
        $process = new BIprocess();
        // il nome della tabella è impostato nel Model
        $key = $jsonContent->{'name'};
        $process->name = $jsonContent->{'name'};
        $process->json_value = $json;
        return $process->save();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\BIprocess  $bIprocess
     * @return \Illuminate\Http\Response
     */
    public function show(BIprocess $bIprocess)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\BIprocess  $bIprocess
     * @return \Illuminate\Http\Response
     */
    public function edit(BIprocess $bIprocess)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\BIprocess  $bIprocess
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, BIprocess $bIprocess)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BIprocess  $bIprocess
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIprocess $bIprocess)
    {
        //
    }
}
