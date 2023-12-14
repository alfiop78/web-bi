<?php

namespace App\Http\Controllers;

use App\Models\BIsheet_specs;
use Illuminate\Http\Request;

class BIsheetSpecsController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    $sheet_specs = BIsheet_specs::all();
    return response()->json(['sheets' => $sheet_specs]);
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
    $sheet_specs = new BIsheet_specs();
    // salvo su DB
    $sheet_specs->token = $token;
    $sheet_specs->name = $name;
    $sheet_specs->json_value = $json;
    return $sheet_specs->save();
  }

  /**
   * Display the specified resource.
   *
   * @param  \App\Models\BIsheet_specs  $bIsheet_specs
   * @return \Illuminate\Http\Response
   */
  public function show(BIsheet_specs $bIsheet_specs, $token)
  {
    // PERF: nelle successive versioni di Laravel è stato introdotto findOr()
    // che consente di restituire una risposta alternativa in caso di
    // record non trovato
    $element = $bIsheet_specs::find($token);
    return response()->json($element);
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  \App\Models\BIsheet_specs  $bIsheet_specs
   * @return \Illuminate\Http\Response
   */
  public function edit(BIsheet_specs $bIsheet_specs)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \App\Models\BIsheet_specs  $bIsheet_specs
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, BIsheet_specs $bIsheet_specs)
  {
    $token = $request->collect()->get('token');
    $name = $request->collect()->get('name');
    $json = json_encode($request->all());
    $specs = $bIsheet_specs::findOrFail($token);
    $specs->token = $token;
    $specs->name = $name;
    $specs->json_value = $json;
    return $specs->save();
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\BIsheet_specs  $bIsheet_specs
   * @return \Illuminate\Http\Response
   */
  public function destroy(BIsheet_specs $bIsheet_specs)
  {
    //
  }
}
