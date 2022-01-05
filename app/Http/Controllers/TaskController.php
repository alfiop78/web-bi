<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// Aggiungo il Model Task
use App\Models\Task;

class TaskController extends Controller
{
    public function index() {
        // recupero i record dalla tabella tasks
        $tasks = Task::all();
        /* dd($tasks); */
        return view('tasks.index')->with('tasks', $tasks);
    }
    public function create() {
        return view('tasks.create');
    }
}
