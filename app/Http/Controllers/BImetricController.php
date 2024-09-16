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
    return response()->json(['metric' => $metrics]);
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
    $name = $request->collect()->get('alias');
    $workbookId = $request->collect()->get('workbook_ref');
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    // l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
    $metric = new BImetric();
    // salvo su DB
    $metric->token = $token;
    $metric->name = $name;
    $metric->json_value = $json;
    $metric->workbookId = $workbookId;

    // **************************** vecchia gestione con una route ::get ***************
    /*$jsonContent = json_decode($json);
        // l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
        $metric = new BImetric();
        // il nome della tabella è impostato nel Model
        $metric->token = $jsonContent->{'token'};
        $metric->name = $jsonContent->{'name'};
        $metric->json_value = $json;
        ***************************/
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
  public function update(Request $request, BImetric $bImetric)
  {
    $token = $request->collect()->get('token');
    $name = $request->collect()->get('alias');
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    // cerco nel DB il token del PROCESS da aggiornare
    $metric = $bImetric::findOrFail($token);
    $metric->token = $token;
    $metric->name = $name;
    $metric->json_value = $json;
    /* ************************* route ::get ***************************
        $jsonContent = json_decode($json);
        $metric = $bImetric::findOrFail($jsonContent->{'token'});
        $metric->token = $jsonContent->{'token'};
        $metric->name = $jsonContent->{'name'};
        $metric->json_value = $json;*/
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
    try {
      $element = $bImetric::findOrFail($token);
      return $element->delete();
    } catch (\Throwable $th) {
      return response()->json(['err' => "Elemento non presente nel metadato"]);
    }
  }
}
