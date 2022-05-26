<?php

namespace App\Http\Controllers;

use App\Models\BIfilter;
use Illuminate\Http\Request;

class BIfilterController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $filters = BIfilter::all();
        return response()->json(['filters' => $filters]);
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
        $filter = new BIfilter();
        // il nome della tabella è impostato nel Model
        $filter->token = $jsonContent->{'token'};
        $filter->name = $jsonContent->{'name'};
        $filter->json_value = $json;
        return $filter->save();
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\BIfilter  $bIfilter
     * @return \Illuminate\Http\Response
     */
    public function show(BIfilter $bIfilter, $token)
    {
        $element = $bIfilter::findOrFail($token);
        return response()->json($element);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\BIfilter  $bIfilter
     * @return \Illuminate\Http\Response
     */
    public function edit(BIfilter $bIfilter)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\BIfilter  $bIfilter
     * @return \Illuminate\Http\Response
     */
    // TODO: request post come fatto per BIprocessController
    public function update(Request $request, BIfilter $bIfilter, $json)
    {
        $jsonContent = json_decode($json);
        $filter = $bIfilter::findOrFail($jsonContent->{'token'});
        $filter->token = $jsonContent->{'token'};
        $filter->name = $jsonContent->{'name'};
        $filter->json_value = $json;
        return $filter->save();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\BIfilter  $bIfilter
     * @return \Illuminate\Http\Response
     */
    public function destroy(BIfilter $bIfilter, $token)
    {
        $element = $bIfilter::findOrFail($token);
        // dd($element);
        return $element->delete();
    }
}
