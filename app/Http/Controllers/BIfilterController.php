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
    return response()->json(['filter' => $filters]);
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
    $workbookId = $request->collect()->get('workbook_ref');
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    $filter = new BIfilter();
    // salvo su DB
    $filter->token = $token;
    $filter->name = $name;
    $filter->json_value = $json;
    $filter->workbookId = $workbookId;
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
  public function update(Request $request, BIfilter $bIfilter)
  {
    $token = $request->collect()->get('token');
    $name = $request->collect()->get('name');
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    // cerco nel DB il token del PROCESS da aggiornare
    $filter = $bIfilter::findOrFail($token);
    $filter->token = $token;
    $filter->name = $name;
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
