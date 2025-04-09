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

		/* $sheets = BIsheet::select('bi_sheets.name', 'bi_sheets.token', 'bi_sheets.json_value')
			->where('bi_workbooks.connectionId', session('db_id'))
			->join('bi_workbooks', 'bi_sheets.workbookId', '=', 'bi_workbooks.token')->get(); */
		$sheets = BIsheet::select('bi_sheets.name', 'bi_sheets.token', 'bi_sheets.json_value', 'bi_sheets.workbookId')
			->where('bi_workbooks.connectionId', session('db_id'))
			->join('bi_workbooks', 'bi_sheets.workbookId', '=', 'bi_workbooks.token')->get();
		// restituisco solo i dati necessari anzichè tutto il json_value
		foreach ($sheets->collect() as $sheet) {
			$result[] = [
				"name" => $sheet->name,
				"token" => $sheet->token,
				"updated_at" => json_decode($sheet->json_value)->updated_at,
				"type" => json_decode($sheet->json_value)->type,
				"workbook_ref" => $sheet->workbookId,
			];
		}
		// return $result;
		return response()->json(['sheet' => $result]);
		// return response()->json(['sheet' => $sheets]);
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
		// $token = $request->collect()->get('token');
		// $name = $request->collect()->get('name');
		// $workbookId = $request->collect()->get('workbook_ref');
		// $userId = $request->collect()->get('userId');
		// $datamartId = $request->collect()->get('id'); // datamartId
		// codifico tutta la $request in json per poterla inserire nel DB
		// dd($request->all());
		// separo le specifiche (proprietà 'specs') dalla proprietà 'sheet'
		// Alla proprietà 'sheet' però, vanno aggiunti alcune proprietà
		$specs = json_encode($request->collect()->get('specs'));
		// $json = json_encode($request->all());
		$sheet_properties = $request->collect()->get('sheet');
		$sheet_properties['updated_at'] = $request->collect()->get('updated_at');
		$sheet_properties['created_at'] = $request->collect()->get('created_at');
		$sheet_properties['type'] = $request->collect()->get('type');
		$sheet_properties['facts'] = $request->collect()->get('facts');
		// le codifico in json per poterle inserire nella colonna json_value
		$sheet_property = json_encode($sheet_properties);
		// dd($json);
		$sheet = new BIsheet();
		// salvo su DB
		$sheet->token = $request->collect()->get('token');
		$sheet->name = $request->collect()->get('name');
		$sheet->json_value = $sheet_property;
		$sheet->json_specs = $specs;
		$sheet->workbookId = $request->collect()->get('workbook_ref');
		$sheet->userId = $request->collect()->get('userId');
		$sheet->datamartId = $request->collect()->get('id');
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
		// $json = json_encode($request->all());
		$token = $request->collect()->get('token');
		// $sheet_properties = $request->collect()->get('sheet');
		// $sheet_properties['updated_at'] = $request->collect()->get('updated_at');
		// $sheet_properties['created_at'] = $request->collect()->get('created_at');
		// $sheet_properties['type'] = $request->collect()->get('type');
		// $sheet_properties['facts'] = $request->collect()->get('facts');
		// $sheet_property = json_encode($request->collect()->get('sheet'));
		// $sheet_property = json_encode($sheet_properties);
		// dd($sheet_property);
		// dd($json);
		// cerco nel DB il token del PROCESS da aggiornare
		$sheet = $bIsheet::findOrFail($token);
		$sheet->name = $request->collect()->get('name');
		$sheet->json_value = json_encode($request->collect()->get('sheet'));
		$sheet->json_specs = json_encode($request->collect()->get('specs'));
		$sheet->json_facts = json_encode($request->collect()->get('facts'));
		$sheet->userId = $request->collect()->get('userId');
		$sheet->sheet_created_at = $request->collect()->get('created_at');
		$sheet->sheet_updated_at = $request->collect()->get('updated_at');
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
