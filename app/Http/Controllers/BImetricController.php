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
		// l'inserimento con Eloquent ha inserito anche i campi created_at/updated_at
		$metric = new BImetric();
		// salvo su DB
		$metric->token = $token;
		$metric->name = $name;
		$metric->json_value = json_encode($request->all());
		$metric->workbookId = $workbookId;
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
		/* $SQL = array_map(function($value) {
			// dump($value);
			return ($value === NULL) ? ' ' : $value;
		}, $request->collect()->get('SQL')); */

		/* array_map(function($value) {
			// dump($value);
			return ($value === NULL) ? ' ' : $value;
		}, $request->collect()->get('SQL')); */
		/* array_walk_recursive($request->collect()->get('SQL'), function($value){
			dump($value);
			return ($value === NULL) ? ' ' : $value;
		}); */
		// cerco nel DB il token del PROCESS da aggiornare
		$metric = $bImetric::findOrFail($token);
		$metric->token = $token;
		$metric->name = $name;
		// NOTE: json_encode converte gli spazi " " all'interno delle proprietà SQL e formula, in NULL (php 7.4)
		$metric->json_value = json_encode($request->all());
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
