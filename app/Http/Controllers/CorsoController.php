<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CorsoController extends Controller
{
    public function index()
    {
        return "Metodo index del CorsoController, creato con php artisan make:controller CorsoController";
    }
    
    public function index_view()
    {
        return view('index_view');
    }

    public function index_view_path()
    {
        // restituisco una view presente all'interno di un path /corsi/index
        return view('corsi.index');
    }

}
