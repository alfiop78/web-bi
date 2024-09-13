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
    return response()->json(['sheet' => $sheets]);
  }

  public function indexByWorkbook($workbookToken) {
    // dd($workbookToken);
    // TODO: prima di implementare questo Metodo, devo aggiungere una ForeignKey nella tabella bi_sheets che fa
    // riferimento alla bi_workbooks.id
    $sheets = BIsheet::where('workbookId', $workbookToken)->get(['name', 'token', 'workbookId', 'userId', 'datamartId']);
    // return response()->json(['sheet' => $sheets]);
    return response()->json($sheets);
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
    $userId = $request->collect()->get('userId');
    $datamartId = $request->collect()->get('id'); // datamartId
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    $sheet = new BIsheet();
    // salvo su DB
    $sheet->token = $token;
    $sheet->name = $name;
    $sheet->json_value = $json;
    $sheet->workbookId = $workbookId;
    $sheet->userId = $userId;
    $sheet->datamartId = $datamartId;
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
