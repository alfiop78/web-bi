<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Tasks</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">

        <!-- Styles -->

        <style>
            body {
                font-family: 'Nunito', sans-serif;
            }
        </style>
    </head>
    <body class="antialiased">
        <div class="relative flex items-top justify-center min-h-screen bg-gray-100 dark:bg-gray-900 sm:items-center py-4 sm:pt-0">
                <div class="hidden fixed top-0 right-0 px-6 py-4 sm:block">
                    <!-- <a href="/tasks/create" class="text-sm text-gray-700 dark:text-gray-500 underline">Crea nuovo Task</a> -->
                    <!-- utilizzo dell'alias della Route -->
                    <a href="{{ route('tasks.create') }}" class="text-sm text-gray-700 dark:text-gray-500 underline">Crea nuovo Task</a>

                </div>

            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <p>Tasks visualizzazione dei task</p>
                <!-- verifico se ci sono record in tasks -->
                @if($tasks->count() > 0)
                    @foreach($tasks as $task)
                        <p>{{ $task->title }} <span>{{ $task->description }}</span></p>
                    @endforeach
                @else
                    <b>Nessun task trovato</b>
                @endif

            </div>
        </div>
    </body>
</html>
