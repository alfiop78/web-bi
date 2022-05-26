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
    public function store(Request $request)
    {
        $token = $request->collect()->get('token');
        $name = $request->collect()->get('name');
        // codifico tutta la $request in json per poterla inserire nel DB
        $json = json_encode($request->all());
        $cube = new BIcube();
        // salvo su DB
        $cube->token = $token;
        $cube->name = $name;
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
    public function update(Request $request, BIcube $bIcube)
    {
        $token = $request->collect()->get('token');
        $name = $request->collect()->get('name');
        // codifico tutta la $request in json per poterla inserire nel DB 
        $json = json_encode($request->all());
        // cerco nel DB il token del PROCESS da aggiornare
        $cube = $bIcube::findOrFail($token);
        $cube->token = $token;
        $cube->name = $name;
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
