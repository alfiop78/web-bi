<?php

namespace App\Http\Controllers;

use App\Models\BIdashboard;
use App\Models\BIsheet;
use Illuminate\Http\Request;

class BIdashboardController extends Controller
{
	/**
	 * Display a listing of the resource.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function index()
	{
		// $dashboards = BIdashboard::get(['name', 'token']);
		$dashboards = BIdashboard::where(['connectionId' => session('db_id'), 'published' => true])->get(['name', 'published', 'token']);
		// dd($dashboards);
		return view('web_bi.dashboards')->with('dashboards', $dashboards);
		// return response()->json(['dashboard' => $dashboards]);
	}

	/**
	 * Visualizzo la lista di risorse (dashboard) appartenenti alla connessione corrente
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function indexByConnectionId()
	{
		$dashboards = BIdashboard::where('connectionId', session('db_id'))->get(['name', 'token', 'json_value']);
		// dd($dashboards);
		return response()->json($dashboards);
		// return view('web_bi.create-dashboard')->with('dashboards', $dashboards);
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
		// dd($request);
		$token = $request->collect()->get('token');
		$name = $request->collect()->get('title');
		// codifico tutta la $request in json per poterla inserire nel DB
		$json = json_encode($request->all());
		$dashboard = new BIdashboard();
		// salvo su DB
		$dashboard->token = $token;
		$dashboard->name = $name;
		$dashboard->published = $request->collect()->get('published');
		$dashboard->json_value = $json;
		// dd($json);
		$dashboard->connectionId = session('db_id');
		return $dashboard->save();
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  \App\Models\BIdashboard  $bIdashboard
	 * @return \Illuminate\Http\Response
	 */
	public function show(BIdashboard $bIdashboard, $token)
	{
		$dashboard = $bIdashboard::findOrFail($token);
		// insieme alla Dashboard recupero anche tutti gli sheet ad esso appartenenti
		// dump($dashboard);
		// dump($dashboard->json_value);
		// dd(json_decode($dashboard->json_value));
		$dashboard_resources = json_decode($dashboard->json_value);
		// dump($dashboard_resources->resources);
		$resources = (object)[];
		// dd($dashboard_resources);
		foreach ($dashboard_resources->resources as $resource_token => $value) {
			$resources->$resource_token = BIsheet::findOrFail($value->token);
			// dd($resources);
		}
		// TODO: 19.09.2025 Non sono necessari tutte le colonne del record in bi_sheets, valutare le colonne da
		// recuperare insieme alla Dashboard
		return response()->json(['dashboard' => $dashboard, 'resources' => $resources]);
		// return response()->json($dashboard);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  \App\Models\BIdashboard  $bIdashboard
	 * @return \Illuminate\Http\Response
	 */
	public function edit(BIdashboard $bIdashboard)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @param  \App\Models\BIdashboard  $bIdashboard
	 * @return \Illuminate\Http\Response
	 */
	public function update(Request $request, BIdashboard $bIdashboard)
	{
		$token = $request->collect()->get('token');
		$name = $request->collect()->get('title');
		// codifico tutta la $request in json per poterla inserire nel DB
		$json = json_encode($request->all());
		// cerco nel DB il token del PROCESS da aggiornare
		$dashboard = $bIdashboard::findOrFail($token);
		// salvo su DB
		$dashboard->name = $name;
		$dashboard->published = $request->collect()->get('published');
		$dashboard->json_value = $json;
		return $dashboard->save();
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  \App\Models\BIdashboard  $bIdashboard
	 * @return \Illuminate\Http\Response
	 */
	public function destroy(BIdashboard $bIdashboard)
	{
		//
	}
}
