<?php

namespace App\Http\Controllers;

use App\Models\BIsheet;
use Illuminate\Http\Request;

class BIsheetController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    $sheets = BIsheet::all();
    return response()->json(['sheets' => $sheets]);
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
    $sheet = new BIsheet();
    // salvo su DB
    $sheet->token = $token;
    $sheet->name = $name;
    $sheet->json_value = $json;
    return $sheet->save();
  }

  /**
   * Display the specified resource.
   *
   * @param  \App\Models\BIsheet  $bIsheet
   * @return \Illuminate\Http\Response
   */
  public function show(BIsheet $bIsheet, $token)
  {
    $element = $bIsheet::findOrFail($token);
    return response()->json($element);
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  \App\Models\BIsheet  $bIsheet
   * @return \Illuminate\Http\Response
   */
  public function edit(BIsheet $bIsheet)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \App\Models\BIsheet  $bIsheet
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, BIsheet $bIsheet)
  {
    $token = $request->collect()->get('token');
    $name = $request->collect()->get('name');
    // codifico tutta la $request in json per poterla inserire nel DB 
    $json = json_encode($request->all());
    // cerco nel DB il token del PROCESS da aggiornare
    $sheet = $bIsheet::findOrFail($token);
    $sheet->token = $token;
    $sheet->name = $name;
    $sheet->json_value = $json;
    return $sheet->save();
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\BIsheet  $bIsheet
   * @return \Illuminate\Http\Response
   */
  public function destroy(BIsheet $bIsheet, $token)
  {
    $element = $bIsheet::findOrFail($token);
    return $element->delete();
  }
}
