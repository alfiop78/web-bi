<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
// aggiunte
/* use Illuminate\Support\Facades\DB; */
/* use Illuminate\Database\PostgresConnection; */
/* use App\Database\Schema\Grammars\VerticaSchemaGrammar; */

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /* aggiungo questa riga perchè in versioni vecchie di mysql (prima della 5.7.7)
         * ottengo un errore in fase di creazione della tabella users, nella migration
         */
        Schema::defaultStringLength(191); // <-- Aggiungi questa riga

        // Registriamo il connettore personalizzato per Vertica in Laravel 11
        /* DB::extend('vertica', function ($config, $name) { */
        /*     // 1. Creiamo la stringa DSN nativa per connetterci via PDO ODBC o PGSQL */
        /*     $dsn = "odbc:DSN={$config['dsn']}"; */
        /**/
        /*     // 2. Generiamo l'oggetto PDO nativo di PHP 8.4 */
        /*     $options = array_diff_key($config['options'] ?? [], ['odbc' => 1]); */
        /*     $pdo = new \PDO($dsn, $config['username'], $config['password'], $options); */
        /**/
        /*     // 3. Creiamo la connessione usando la base Postgres */
        /*     $connection = new PostgresConnection($pdo, $config['database'], $config['prefix'], $config); */
        /**/
        /*     // 4. Iniettiamo la tua grammatica dello schema che risolve il problema di hasTable */
        /*     $connection->setSchemaGrammar(new VerticaSchemaGrammar); */
        /**/
        /*     return $connection; */
        /* }); */
    }
}
