<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
  /**
   * The URIs that should be excluded from CSRF verification.
   *
   * @var array<int, string>
   */
  // escludo alcune route dal controllo del csrf token. Queste Route sono state modificate da get a post perchè nel get alcuni oggetti json (process) erano troppo lunghi, superavano circa 16.000 crt.
  // l'altro metodo che si può utilizzare, per consentire il csrf è metterlo nel tag meta della pagina come spiegato qui: https://laravel.com/docs/9.x/csrf#csrf-x-csrf-token
  protected $except = [
    '/fetch_api/json/metric_update',
    '/fetch_api/json/workbook_update',
    '/fetch_api/json/sheet_update',
    '/fetch_api/json/filter_update',
    '/fetch_api/json/workbook_store',
    '/fetch_api/json/sheet_store',
    '/fetch_api/json/metric_store',
    '/fetch_api/json/filter_store',
    '/fetch_api/cube/sheet',
    '/fetch_api/cube/sql',
    '/fetch_api/dimension/time'
  ];
}
