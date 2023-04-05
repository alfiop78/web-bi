<?php

namespace App\Http\Controllers;

use App\Models\BIworkbook;
use Illuminate\Http\Request;

class BIworkbookController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    $workbooks = BIworkbook::all();
    return response()->json(['workbooks' => $workbooks]);
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
    $workbook = new BIworkbook();
    // salvo su DB
    $workbook->token = $token;
    $workbook->name = $name;
    $workbook->json_value = $json;
    return $workbook->save();
  }

  /**
   * Display the specified resource.
   *
   * @param  \App\Models\BIworkbook  $bIworkbook
   * @return \Illuminate\Http\Response
   */
  public function show(BIworkbook $bIworkbook, $token)
  {
    $element = $bIworkbook::findOrFail($token);
    return response()->json($element);
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param  \App\Models\BIworkbook  $bIworkbook
   * @return \Illuminate\Http\Response
   */
  public function edit(BIworkbook $bIworkbook)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \App\Models\BIworkbook  $bIworkbook
   * @return \Illuminate\Http\Response
   */
  public function update(Request $request, BIworkbook $bIworkbook)
  {
    $token = $request->collect()->get('token');
    $name = $request->collect()->get('name');
    // codifico tutta la $request in json per poterla inserire nel DB 
    $json = json_encode($request->all());
    // cerco nel DB il token del PROCESS da aggiornare
    $workbook = $bIworkbook::findOrFail($token);
    $workbook->token = $token;
    $workbook->name = $name;
    $workbook->json_value = $json;
    return $workbook->save();
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param  \App\Models\BIworkbook  $bIworkbook
   * @return \Illuminate\Http\Response
   */
  public function destroy(BIworkbook $bIworkbook, $token)
  {
    $element = $bIworkbook::findOrFail($token);
    return $element->delete();
  }
}
