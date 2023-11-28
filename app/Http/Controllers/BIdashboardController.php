<?php

namespace App\Http\Controllers;

use App\Models\BIdashboard;
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
    $dashboards = BIdashboard::get(['name', 'token']);
    $names = [];
    // dd($dashboards);
    foreach ($dashboards as $das) {
      // dd($das->name);
      $names[] = $das;
    }
    return view('web_bi.dashboards')->with('dashboards', $names);
    // return view('web_bi.dashboards')->with('dashboards', $dashboards);
    // return response()->json(['dashboard' => $dashboards]);
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
    $name = $request->collect()->get('title');
    // codifico tutta la $request in json per poterla inserire nel DB
    $json = json_encode($request->all());
    $dashboard = new BIdashboard();
    // salvo su DB
    $dashboard->token = $token;
    $dashboard->name = $name;
    $dashboard->json_value = $json;
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
    $element = $bIdashboard::findOrFail($token);
    return response()->json($element);
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
    //
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
