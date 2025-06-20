<?php

namespace App\Http\Controllers;

use App\Models\BIsheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use DateTimeImmutable;

// aggiunta per richiamare i Metodi di MapDatabaseController
use App\Http\Controllers\MapDatabaseController;

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

		/* $sheets = BIsheet::select('bi_sheets.name', 'bi_sheets.token', 'bi_sheets.json_value')
			->where('bi_workbooks.connectionId', session('db_id'))
			->join('bi_workbooks', 'bi_sheets.workbookId', '=', 'bi_workbooks.token')->get(); */
		$sheets = BIsheet::select('bi_sheets.name', 'bi_sheets.token', 'bi_sheets.sheet_updated_at', 'bi_sheets.workbookId')
			->where('bi_workbooks.connectionId', session('db_id'))
			->join('bi_workbooks', 'bi_sheets.workbookId', '=', 'bi_workbooks.token')->get();
		// restituisco solo i dati necessari anzichè tutto il json_value
		$result = [];
		foreach ($sheets->collect() as $sheet) {
			$result[] = [
				"name" => $sheet->name,
				"token" => $sheet->token,
				"updated_at" => $sheet->sheet_updated_at,
				"type" => 'sheet',
				"workbook_ref" => $sheet->workbookId,
			];
		}
		// dd($result);
		return response()->json(['sheet' => $result]);
		// return response()->json(['sheet' => $sheets]);
	}

	public function indexSpecs($token)
	{
		// dd($token);
		$sheet = BIsheet::select('json_specs')->where('token', $token)
			->first();
		// dd($sheet);
		return response()->json($sheet);
		/* $sheet = BIsheet::findOrFail($token);
		return response()->json($sheet->json_specs); */
	}

	public function indexByWorkbookId($workbookToken)
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
		$sheet = new BIsheet();
		// salvo su DB
		$sheet->token = $request->collect()->get('token');
		$sheet->name = $request->collect()->get('name');
		$sheet->json_value = json_encode($request->collect()->get('sheet'));
		$sheet->json_specs = json_encode($request->collect()->get('specs'));
		$sheet->json_facts = json_encode($request->collect()->get('facts'));
		$sheet->userId = $request->collect()->get('userId');
		$sheet->workbookId = $request->collect()->get('workbook_ref');
		$sheet_created_at = new DateTimeImmutable($request->collect()->get('created_at'));
		$sheet_updated_at = new DateTimeImmutable($request->collect()->get('updated_at'));
		$sheet->sheet_created_at = $sheet_created_at->format('Y-m-d H:i:s.v');
		$sheet->sheet_updated_at = $sheet_updated_at->format('Y-m-d H:i:s.v');
		$sheet->datamartId = $request->collect()->get('datamartId');
		return $sheet->save();
	}

	/**
	 * Display the specified resource.
	 * Recupero tutta la risorsa (tutte le colonne)
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
		// $json = json_encode($request->all());
		// dd($json);
		$token = $request->collect()->get('token');
		// cerco nel DB il token da aggiornare
		$sheet = $bIsheet::findOrFail($token);
		$sheet->name = $request->collect()->get('name');
		$sheet->json_value = json_encode($request->collect()->get('sheet'));
		$sheet->json_specs = json_encode($request->collect()->get('specs'));
		$sheet->json_facts = json_encode($request->collect()->get('facts'));
		$sheet->userId = $request->collect()->get('userId');
		$sheet_created_at = new DateTimeImmutable($request->collect()->get('created_at'));
		$sheet_updated_at = new DateTimeImmutable($request->collect()->get('updated_at'));
		$sheet->sheet_created_at = $sheet_created_at->format('Y-m-d H:i:s.v');
		$sheet->sheet_updated_at = $sheet_updated_at->format('Y-m-d H:i:s.v');
		// $date = new DateTimeImmutable($sheet->sheet_updated_at);
		// dd($date->format('Y-m-d H:i:s.v'));
		// TODO: 20.06.2025 Se è presente un WEB_BI_LOCAL_ (con le ultime modifiche) devo
		// ricopiare WEB_BI_LOCAL.... -> WEB_BI_datamartId_userId e, se è presente una versione
		// pubblicata di questo sheet (sulle dashboard) devo fare il copy_table anche da :
		// WEB_BI_LOCAL_... -> WEB_BI_datamartId
		// TODO: 20.06.2025 Verifico se è presente la WEB_BI_LOCAL_.... per eliminarla
		$datamart_name_local = "WEB_BI_LOCAL_{$request->collect()->get('datamartId')}_{$request->collect()->get('userId')}";
		$datamart_name_user = "WEB_BI_{$request->collect()->get('datamartId')}_{$request->collect()->get('userId')}";
		$datamart_name = "WEB_BI_{$request->collect()->get('datamartId')}";
		if (Schema::connection(session('db_client_name'))->hasTable($datamart_name_local)) {
			// La tabella WEB_BI_LOCAL_ è presente, quindi il report è stato rielaborato
			// in questo caso la tabella $datamart_name_user è sempre presente
			Schema::connection(session('db_client_name'))->drop("decisyon_cache.{$datamart_name_user}");
			MapDatabaseController::copy_table($datamart_name_local, $datamart_name_user);
			// Elimino la tabella WEB_BI_LOCAL_
			try {
				switch (session('db_driver')) {
					case 'odbc':
						Schema::connection(session('db_client_name'))->drop("decisyon_cache.{$datamart_name_local}");
						// Schema::connection(session('db_client_name'))->drop("decisyon_cache.WEB_BI_LOCAL_{$datamartId}");
						break;
					case 'mysql':
						Schema::connection(session('db_client_name'))->drop($datamart_name_local);
						break;
					default:
						Schema::connection(session('db_client_name'))->drop($datamart_name_local);
						break;
				}
				// return TRUE;
			} catch (\Throwable $th) {
				throw $th;
			}
		}

		if (Schema::connection(session('db_client_name'))->hasTable($datamart_name)) {
			// il datamart è stato pubblicato su una dashboard, quindi esiste WEB_BI_datamartId
			Schema::connection(session('db_client_name'))->drop("decisyon_cache.{$datamart_name}");
			MapDatabaseController::copy_table($datamart_name_user, $datamart_name);
		}

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
