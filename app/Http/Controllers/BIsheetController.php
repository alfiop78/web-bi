<?php

namespace App\Http\Controllers;

use App\Models\BIsheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class BIsheetController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    // dd(session('db_id'));
    // TODO: con il databaseId eseguo la query tra bi_sheet e bi_workbook per recuperare gli sheets che fanno parte
    // degli workbook con connectionId = session('db_id')
    // $sheets = BIsheet::all();
    // return response()->json(['sheet' => $sheets]);

    $sheets = BIsheet::select('bi_sheets.name', 'bi_sheets.token', 'bi_sheets.json_value')
      ->where('bi_workbooks.connectionId', session('db_id'))
      ->join('bi_workbooks', 'bi_sheets.workbookId', '=', 'bi_workbooks.token')->get();
    // dd($sheets);
    return response()->json(['sheet' => $sheets]);
  }

  public function indexByWorkbook($workbookToken)
  {
    // dd($workbookToken);
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
    // dd($request->all());
    $specs = json_encode($request->collect()->get('specs'));
    // WARN: in questo caso salvo specs anche qui, da rivedere, probabilmente
    // dovrò creare due proprietà separate nel localStorage (sheet e specs)
    $json = json_encode($request->all());
    $sheet = new BIsheet();
    // salvo su DB
    $sheet->token = $token;
    $sheet->name = $name;
    $sheet->json_value = $json;
    $sheet->json_specs = $specs;
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
    $specs = json_encode($request->collect()->get('specs'));
    // WARN: in questo caso salvo specs anche qui, da rivedere, probabilmente
    // dovrò creare due proprietà separate nel localStorage (sheet e specs)
    $json = json_encode($request->all());
    // cerco nel DB il token del PROCESS da aggiornare
    $sheet = $bIsheet::findOrFail($token);
    $sheet->token = $token;
    $sheet->name = $name;
    $sheet->json_value = $json;
    $sheet->json_specs = $specs;
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
    try {
      // TODO: elimino il datamart
      $element = $bIsheet::findOrFail($token);
      // dump($element);
      dump("{$element->datamartId}_{$element->userId}");
      dd(Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.WEB_BI_{$element->datamartId}_{$element->userId}"));
      return $element->delete();
    } catch (\Throwable $th) {
      return response()->json(['err' => "Elemento non presente nel metadato"]);
    }
  }
}
