<?php

namespace App\Http\Controllers;

use App\Models\BIworkbook;
use Illuminate\Http\Request;
use DateTimeImmutable;

class BIworkbookController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		// $workbooks = BIworkbook::all();
		/* $workbooks = BIworkbook::where('connectionId', session('db_id'))->get();
		return response()->json(['workbook' => $workbooks]); */
		$workbooks= BIworkbook::select('token','name', 'workbook_updated_at')->where('connectionId', session('db_id'))->get();
		foreach ($workbooks->collect() as $workbook) {
			$result[] = [
				"name" => $workbook->name,
				"token" => $workbook->token,
				"updated_at" => $workbook->workbook_updated_at,
				"type" => 'workbook'
				// "json_value" => $workbook->json_value // temporaneo, non mi servirà più dopo aver aggiornato tutti gli workbook (issue#292)
			];
		}
		return response()->json(['workbook' => $result]);
	}

	/**
	 * Visualizzo gli WorkBooks del DB attualmente collegato
	 * (Viene invocata da create-dashboard)
	 * @return \Illuminate\Http\Response
	 */
	public function indexByDashboardCreate()
	{
		$workbooks = BIworkbook::where('connectionId', session('db_id'))->get(['token', 'name']);
		return view('web_bi.create-dashboard')->with('workbooks', $workbooks);
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
		// dd($request->all());
		$token = $request->collect()->get('token');
		// codifico tutta la $request in json per poterla inserire nel DB
		// $json = json_encode($request->all());
		$workbook = new BIworkbook();
		$workbook->token = $token;
		$workbook->name = $request->collect()->get('name');
		$workbook->svg = json_encode($request->collect()->get('svg'));
		$workbook->worksheet = json_encode($request->collect()->get('worksheet'));
		$workbook->connectionId = $request->collect()->get('databaseId');
		$workbook->json_value = json_encode((object)[
			'type' => 'workbook',
			'dataModel' => $request->collect()->get('dataModel'),
			'dateTime' => $request->collect()->get('dateTime'),
			'joins' => $request->collect()->get('joins')
		]);
		$workbook_created_at = new DateTimeImmutable($request->collect()->get('created_at'));
		$workbook_updated_at = new DateTimeImmutable($request->collect()->get('updated_at'));
		$workbook->workbook_created_at = $workbook_created_at->format('Y-m-d H:i:s.v');
		$workbook->workbook_updated_at = $workbook_updated_at->format('Y-m-d H:i:s.v');
		// $workbook->json_value = $json;
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
		// dd($request->all());
		$token = $request->collect()->get('token');
		// $name = $request->collect()->get('name');
		// codifico tutta la $request in json per poterla inserire nel DB
		// $json = json_encode($request->all());
		$workbook = $bIworkbook::findOrFail($token);
		$workbook->token = $token;
		$workbook->name = $request->collect()->get('name');
		$workbook->svg = json_encode($request->collect()->get('svg'));
		$workbook->worksheet = json_encode($request->collect()->get('worksheet'));
		$workbook_created_at = new DateTimeImmutable($request->collect()->get('created_at'));
		$workbook_updated_at = new DateTimeImmutable($request->collect()->get('updated_at'));
		$workbook->workbook_created_at = $workbook_created_at->format('Y-m-d H:i:s.v');
		$workbook->workbook_updated_at = $workbook_updated_at->format('Y-m-d H:i:s.v');
		$workbook->json_value = json_encode((object)[
			'type' => 'workbook',
			'dataModel' => $request->collect()->get('dataModel'),
			'dateTime' => $request->collect()->get('dateTime'),
			'joins' => $request->collect()->get('joins')
		]);
		// dd($workbook->json_value);
		// $workbook->json_value = $json;
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
		try {
			$element = $bIworkbook::findOrFail($token);
			return $element->delete();
		} catch (\Throwable $th) {
			return response()->json(['err' => "Elemento non presente nel metadato"]);
		}
	}
}
