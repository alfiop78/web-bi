<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Escludi gli URL dal controllo CRSF (Erroe 419)

        // escludo alcune route dal controllo del csrf token. Queste Route sono state modificate da get a post perchè nel get
        // alcuni oggetti json (process) erano troppo lunghi, superavano circa 16.000 crt.
        // l'altro metodo che si può utilizzare, per consentire il csrf è metterlo
        // nel tag meta della pagina come spiegato qui: https://laravel.com/docs/9.x/csrf#csrf-x-csrf-token
        // INFO: 02.09.2026 CsrfToken
        $middleware->validateCsrfTokens(except: [
            /* 'stripe/*', // Esempio per webhook esterni */
            /* 'api/mio-endpoint', // Inserisci qui la tua rotta POST */
            '/fetch_api/cube/sheet_create',
            '/fetch_api/dimension/time'
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
