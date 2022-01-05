<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Crea nuovo Tasks</title>

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
                    <!-- <a href="/tasks" class="text-sm text-gray-700 dark:text-gray-500 underline">Visualizza tutti i Task</a> -->
                    <!-- qui si può anche utilizzare una funzione Helper di Laravel, route, per inserire il link della route che ha un alias (vedere ->name(....) nella Route) -->
                    <a href="{{ route('tasks.index') }}" class="text-sm text-gray-700 dark:text-gray-500 underline">Visualizza tutti i Task</a>

                </div>

            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <p>Creazione di un nuovo Task</p>
                <div class="mb-3">
                  <label for="formGroupExampleInput" class="form-label">Title</label>
                  <input type="text" class="form-control" id="formGroupExampleInput" placeholder="Titolo del Task">
                </div>
                <div class="mb-3">
                  <label for="formGroupExampleInput2" class="form-label">Description</label>
                  <textarea></textarea>
                </div>
                <button type="submit" value="archivia">ARCHIVIA</button>
            </div>
        </div>
    </body>
</html>
