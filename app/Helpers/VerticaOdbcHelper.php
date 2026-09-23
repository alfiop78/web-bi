<?php

namespace App\Helpers;

use Exception;
use stdClass;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class VerticaOdbcHelper
{
    /** @var resource|null */
    protected $connection = null;

    // Proprietà dello stato del Query Builder
    protected string $queryTable = '';
    protected array $queryColumns = ['*'];
    protected array $queryJoins = [];
    protected array $queryWheres = [];
    protected array $queryOrderBys = [];
    protected ?int $queryLimit = null;

    protected static ?self $instance = null;

    /**
     * Mantiene l'approccio Singleton opzionale per riutilizzare la connessione.
     */
    public static function open(): self
    {
        if (static::$instance === null || !is_resource(static::$instance->connection)) {
            static::$instance = new self();
        }
        return static::$instance;
    }

    public function __construct()
    {
        $dsn = session('db_dsn');
        $user = session('db_username', '');
        $password = session('db_password', '');

        if (empty($dsn)) {
            throw new Exception("Parametro 'db_dsn' non trovato nella sessione utente.");
        }

        $this->connection = @odbc_connect($dsn, $user, $password);

        if (!$this->connection) {
            throw new Exception("Impossibile connettersi a Vertica tramite ODBC: " . odbc_errormsg());
        }
    }

    // =========================================================================
    // SEZIONE: TRANSAZIONI
    // =========================================================================

    public function beginTransaction(): void
    {
        if (!@odbc_autocommit($this->connection, false)) {
            throw new Exception("Impossibile avviare la transazione Vertica: " . odbc_errormsg($this->connection));
        }
    }

    public function commit(): void
    {
        if (!@odbc_commit($this->connection)) {
            throw new Exception("Impossibile completare il Commit della transazione: " . odbc_errormsg($this->connection));
        }
        @odbc_autocommit($this->connection, true);
    }

    public function rollback(): void
    {
        @odbc_rollback($this->connection);
        @odbc_autocommit($this->connection, true);
    }

    public function transaction(callable $callback)
    {
        $this->beginTransaction();
        try {
            $result = $callback($this);
            $this->commit();
            return $result;
        } catch (Exception $e) {
            $this->rollback();
            throw $e;
        }
    }

    // =========================================================================
    // SEZIONE: QUERY BUILDER (METODI FLUENTI)
    // =========================================================================

    public function table(string $table): self
    {
        $this->resetQuery();
        $this->queryTable = preg_replace('/[^a-zA-Z0-9_\.\s\-\[\]]/', '', $table);
        return $this;
    }

    public function select(array $columns = ['*']): self
    {
        $this->queryColumns = $columns;
        return $this;
    }

    public function addSelect(array $columns): self
    {
        if ($this->queryColumns === ['*']) {
            $this->queryColumns = [];
        }
        $this->queryColumns = array_merge($this->queryColumns, $columns);
        return $this;
    }

    public function join(string $table, string $firstColumn, string $operator, string $secondColumn): self
    {
        $operator = $this->sanitizeOperator($operator);
        $this->queryJoins[] = "INNER JOIN {$table} ON {$firstColumn} {$operator} {$secondColumn}";
        return $this;
    }

    public function leftJoin(string $table, string $firstColumn, string $operator, string $secondColumn): self
    {
        $operator = $this->sanitizeOperator($operator);
        $this->queryJoins[] = "LEFT JOIN {$table} ON {$firstColumn} {$operator} {$secondColumn}";
        return $this;
    }

    /**
     * Ripristinato il tuo metodo originale funzionante con escaping manuale
     */
    public function where(string $column, string $operator, $value): self
    {
        $operator = $this->sanitizeOperator($operator);
        $escapedValue = $this->escapeValue($value);
        $this->queryWheres[] = "{$column} {$operator} {$escapedValue}";
        return $this;
    }

    /**
     * Clausola WHERE IN basata sull'escaping manuale dei singoli elementi dell'array
     */
    public function whereIn(string $column, array $values): self
    {
        if (empty($values)) {
            $this->queryWheres[] = "1 = 0";
            return $this;
        }

        $escapedValues = array_map([$this, 'escapeValue'], $values);
        $valuesString = implode(', ', $escapedValues);

        $this->queryWheres[] = "{$column} IN ({$valuesString})";
        return $this;
    }

    public function orderBy(string $column, string $direction = 'ASC'): self
    {
        $direction = strtoupper($direction) === 'DESC' ? 'DESC' : 'ASC';
        $column = preg_replace('/[^a-zA-Z0-9_\.\(\)]/', '', $column);
        $this->queryOrderBys[] = "{$column} {$direction}";
        return $this;
    }

    public function limit(int $value): self
    {
        $this->queryLimit = $value;
        return $this;
    }

    public function statement(string $sql): self
    {
        $this->resetQuery();
        $this->queryTable = "({$sql}) AS custom_statement_subquery";
        return $this;
    }

    // =========================================================================
    // SEZIONE: ESECUZIONE QUERY / SCRITTURA / MODIFICA (TERMINALI)
    // =========================================================================

    public function get(): Collection
    {
        $sql = $this->compileSql();
        $this->resetQuery();
        return $this->executeQueryAndFetch($sql);
    }

    public function first(): ?stdClass
    {
        $this->queryLimit = 1;
        return $this->get()->first();
    }

    public function paginate(int $perPage = 15, ?int $page = null): LengthAwarePaginator
    {
        if (empty($this->queryTable)) {
            throw new Exception("Nessuna tabella specificata per la paginazione.");
        }

        $page = $page ?: (int) request()->input('page', 1);
        if ($page < 1) {
            $page = 1;
        }

        $countSql = "SELECT COUNT(*) AS totale FROM {$this->queryTable}";
        if (!empty($this->queryJoins)) {
            $countSql .= " " . implode(' ', $this->queryJoins);
        }
        if (!empty($this->queryWheres)) {
            $countSql .= " WHERE " . implode(' AND ', $this->queryWheres);
        }

        $countResult = $this->executeQueryAndFetch($countSql)->first();
        $total = $countResult ? (int) $countResult->totale : 0;

        $this->queryLimit = $perPage;
        $offset = ($page - 1) * $perPage;

        $sql = $this->compileSql() . " OFFSET {$offset}";

        $this->resetQuery();
        $items = $this->executeQueryAndFetch($sql);

        return new LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    /**
     * Metodo INSERT riscritto per concatenare direttamente i valori escaped nel comando SQL
     */
    public function insert(array $values): bool
    {
        if (empty($values)) {
            return true;
        }

        if (empty($this->queryTable)) {
            throw new Exception("Nessuna tabella specificata per l'inserimento.");
        }

        if (!is_array(reset($values))) {
            $values = [$values];
        }

        $columns = array_keys($values[0]);
        $sanitizedColumns = array_map(fn($col) => preg_replace('/[^a-zA-Z0-9_]/', '', $col), $columns);
        $columnsString = implode(', ', $sanitizedColumns);

        // Poiché i prepared statements falliscono, eseguiamo i singoli comandi inserendo i valori pre-elaborati
        foreach ($values as $record) {
            $escapedRowValues = [];
            foreach ($columns as $column) {
                $val = $record[$column] ?? null;
                $escapedRowValues[] = $this->escapeValue($val);
            }

            $valuesString = implode(', ', $escapedRowValues);
            $sql = "INSERT INTO {$this->queryTable} ({$columnsString}) VALUES ({$valuesString})";

            $this->execute($sql);
        }

        $this->resetQuery();
        return true;
    }

    /**
     * Inserisce uno o più record all'interno della tabella selezionata tramite un'unica query cumulativa (Bulk Insert).
     *
     * @param array $values
     * @return bool
     * @throws Exception
     */
    // INFO: non valido con questa versione di vertica 10.1
    /* public function insert(array $values): bool */
    /* { */
    /*     if (empty($values)) { */
    /*         return true; */
    /*     } */
    /**/
    /*     if (empty($this->queryTable)) { */
    /*         throw new Exception("Nessuna tabella specificata per l'inserimento."); */
    /*     } */
    /**/
    /*     // Se viene passato un array singolo (un solo record), lo trasformiamo in una lista di record */
    /*     if (!is_array(reset($values))) { */
    /*         $values = [$values]; */
    /*     } */
    /**/
    /*     // Estrae le chiavi (colonne) dal primo record per definire la struttura */
    /*     $columns = array_keys(reset($values)); */
    /*     $sanitizedColumns = array_map(fn($col) => preg_replace('/[^a-zA-Z0-9_]/', '', $col), $columns); */
    /*     $columnsString = implode(', ', $sanitizedColumns); */
    /**/
    /*     // Array che conterrà i blocchi di valori formattati, es: ["(1, 2025, 'Y 2026')", "(2, 2026, 'Y 2027')"] */
    /*     $rowsSql = []; */
    /**/
    /*     foreach ($values as $record) { */
    /*         $escapedRowValues = []; */
    /*         foreach ($columns as $column) { */
    /*             // Prende il valore o imposta null se la chiave non esiste nel record corrente */
    /*             $val = $record[$column] ?? null; */
    /*             $escapedRowValues[] = $this->escapeValue($val); */
    /*         } */
    /**/
    /*         // Unisce i valori della riga racchiudendoli tra parentesi tonde */
    /*         $rowsSql[] = "(" . implode(', ', $escapedRowValues) . ")"; */
    /*     } */
    /**/
    /*     // Combina tutte le righe separate da una virgola */
    /*     $allValuesString = implode(', ', $rowsSql); */
    /**/
    /*     // Costruisce la query finale di Bulk Insert */
    /*     $sql = "INSERT INTO {$this->queryTable} ({$columnsString}) VALUES {$allValuesString}"; */
    /**/
    /*     // Esegue l'unica macro-istruzione SQL su Vertica */
    /*     $this->execute($sql); */
    /**/
    /*     $this->resetQuery(); */
    /*     return true; */
    /* } */


    /**
     * Metodo UPDATE riscritto per concatenare i dati direttamente nel SET e nel WHERE
     */
    public function update(array $values): bool
    {
        if (empty($values) || empty($this->queryTable)) {
            return false;
        }

        $sets = [];
        foreach ($values as $column => $value) {
            $sanitizedColumn = preg_replace('/[^a-zA-Z0-9_]/', '', $column);
            $escapedValue = $this->escapeValue($value);
            $sets[] = "{$sanitizedColumn} = {$escapedValue}";
        }

        $sql = "UPDATE {$this->queryTable} SET " . implode(', ', $sets);

        if (!empty($this->queryWheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->queryWheres);
        }

        $this->resetQuery();
        return $this->execute($sql);
    }

    /**
     * Elimina definitivamente la tabella corrente dal database Vertica.
     * Supporta l'opzione "IF EXISTS" (predefinita su true).
     *
     * @param bool $ifExists
     * @return bool
     * @throws Exception
     */
    public function drop(bool $ifExists = true): bool
    {
        if (empty($this->queryTable)) {
            throw new Exception("Nessuna tabella specificata per l'operazione di DROP.");
        }

        $existsString = $ifExists ? "IF EXISTS" : "";
        $sql = "DROP TABLE {$existsString} {$this->queryTable}";

        $this->resetQuery();
        return $this->execute($sql);
    }

    /**
     * Metodo DELETE che lavora sulle stringhe WHERE già renderizzate
     */
    public function delete(): bool
    {
        if (empty($this->queryTable)) {
            return false;
        }

        $sql = "DELETE FROM {$this->queryTable}";

        if (!empty($this->queryWheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->queryWheres);
        }

        $this->resetQuery();
        return $this->execute($sql);
    }

    /**
     * Restituisce la stringa SQL grezza compilata con lo stato corrente del Builder.
     * Utile per fare log o ispezionare la query prima di eseguirla.
     *
     * @return string
     */
    public function dumpSql(): string
    {
        return $this->compileSql();
    }

    /**
     * Interrompe l'esecuzione dello script (Die and Dump) mostrando la stringa SQL corrente.
     * Replica il comportamento del metodo ->dd() del Query Builder di Laravel.
     *
     * @return void
     */
    public function ddSql(): void
    {
        dd($this->dumpSql());
    }

    // =========================================================================
    // SEZIONE: RAW SQL E UTILITY INTERNE
    // // =========================================================================
    public function rawSelect(string $sql): Collection
    {
        return $this->executeQueryAndFetch($sql);
    }


    /*** Rimosso odbc_prepare: esegue la stringa SQL direttamente tramite odbc_exec*/
    public function execute(string $sql): bool
    {
        $result = @odbc_exec($this->connection, $sql);
        if (!$result) {
            throw new Exception("Errore esecuzione comando Vertica: " . odbc_errormsg($this->connection) . " | SQL: " . $sql);
        }
        @odbc_free_result($result);
        return true;
    }

    public function hasTable(string $schema, string $table): bool
    {
        $schemaEscaped = str_replace("'", "''", $schema);
        $tableEscaped = str_replace("'", "''", $table);
        $sql = "SELECT table_name FROM v_catalog.tables WHERE table_schema = '{$schemaEscaped}' AND table_name = '{$tableEscaped}'";
        return !$this->rawSelect($sql)->isEmpty();
    }

    public static function session(callable $callback)
    {
        $instance = new self();
        try {
            return $callback($instance);
        } finally {
            $instance->close();
        }
    }
    public function close(): void
    {
        if ($this->connection) {
            @odbc_close($this->connection);
            $this->connection = null;
        }
    }

    // =========================================================================// METODI PROTETTI DI COMPILAZIONE E PULIZIA// =========================================================================

    protected function compileSql(): string
    {
        $columns = implode(', ', $this->queryColumns);
        $sql = "SELECT {$columns} FROM {$this->queryTable}";
        if (!empty($this->queryJoins)) {
            $sql .= " " . implode(' ', $this->queryJoins);
        }
        if (!empty($this->queryWheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->queryWheres);
        }
        if (!empty($this->queryOrderBys)) {
            $sql .= " ORDER BY " . implode(', ', $this->queryOrderBys);
        }
        if ($this->queryLimit !== null) {
            $sql .= " LIMIT {$this->queryLimit}";
        }
        return $sql;
    }

    /*** Rimosso odbc_prepare: esegue direttamente la stringa SQL già formattata*/
    protected function executeQueryAndFetch(string $sql): Collection
    {
        $result = @odbc_exec($this->connection, $sql);
        if (!$result) {
            throw new Exception("Errore esecuzione query Vertica: " . odbc_errormsg($this->connection) . " | SQL: " . $sql);
        }
        $rows = [];
        while ($row = odbc_fetch_object($result)) {
            $rows[] = $row;
        }
        @odbc_free_result($result);
        return collect($rows);
    }

    protected function resetQuery(): void
    {
        $this->queryTable = '';
        $this->queryColumns = ['*'];
        $this->queryJoins = [];
        $this->queryWheres = [];
        $this->queryOrderBys = [];
        $this->queryLimit = null;
    }

    protected function sanitizeOperator(string $operator): string
    {
        $allowed = ['=', '<', '>', '<=', '>=', '<>', 'LIKE', 'NOT LIKE', 'IS', 'IS NOT'];
        $operator = strtoupper(trim($operator));
        return in_array($operator, $allowed) ? $operator : '=';
    }

    /*** Funzione centralizzata per l'escaping dei valori (Preso dal tuo metodo originale)*/
    protected function escapeValue($value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (is_bool($value)) {
            return $value ? 'TRUE' : 'FALSE';
        }
        return is_numeric($value) ? (string)$value : "'" . str_replace("'", "''", $value) . "'";
    }
}

### Prontuario per l'aggiornamento dell'applicazione

/* Ecco come mappare i vecchi utilizzi al nuovo standard senza fare confusione:

   // NUOVO: Restituisce una Collection (se ti serve un array puro aggiungi ->toArray())
   $utenti = VerticaOdbcHelper::open()->rawSelect("SELECT * FROM utenti");
 */

/*
 * // NUOVO: Sostituito con select() identico a Laravel
$dati = VerticaOdbcHelper::open()
    ->table('analytics.visite')
    ->select(['id', 'ip', 'user_id'])
    ->where('id', '>', 500)
    ->get();
*/

/*
 * // NUOVO: Estrae direttamente l'oggetto o null senza passare da array_first o collection
$utente = VerticaOdbcHelper::open()
    ->table('public.utenti')
    ->where('email', '=', 'test@example.com')
    ->first();

if ($utente) {
    echo $utente->nome;
}
 */

/* INFO: ESEMPI DI UTILIZZO */

// Inserimento di un singolo record
/* VerticaOdbcHelper::open() */
/* ->table('public.logs') */
/* ->insert([ */
/*     'utente_id'  => 42, */
/*     'azione'     => 'login', */
/*     'creato_il'  => now()->toDateTimeString() */
/* ]); */

/* Inserimento multiplo (Bulk Insert): */
/*     VerticaOdbcHelper::open() */
/* ->table('public.logs') */
/* ->insert([ */
/*     ['utente_id' => 1, 'azione' => 'click', 'creato_il' => now()->toDateTimeString()], */
/*     ['utente_id' => 2, 'azione' => 'view',  'creato_il' => now()->toDateTimeString()], */
/*     ['utente_id' => 3, 'azione' => 'close', 'creato_il' => now()->toDateTimeString()], */
/* ]); */

/*
 * ### 💡 Esempi pratici delle nuove funzionalità

#### 1. Utilizzo di `whereIn`
```php
$utenti = VerticaOdbcHelper::open()
    ->table('public.utenti')
    ->whereIn('stato', ['attivo', 'sospeso'])
    ->where('ruolo', '=', 'editor')
    ->get();

2. Modifica (update) e Cancellazione (delete)
    // Aggiorna lo stato dei log vecchi
VerticaOdbcHelper::open()
    ->table('public.logs')
    ->where('creato_il', '<', now()->subDays(30)->toDateTimeString())
    ->update(['archiviato' => true, 'note' => 'Auto-archiviato']);

// Elimina i log obsoleti
VerticaOdbcHelper::open()
    ->table('public.logs')
    ->where('archiviato', '=', true)
    ->delete();

3. Gestione sicura delle transazioni con il metodo di callback
try {
    VerticaOdbcHelper::open()->transaction(function($db) {
        $db->table('public.account')->where('id', '=', 1)->update(['bilancio' => 500]);
        $db->table('public.trasferimenti')->insert([
            'da_account' => 1,
            'importo' => 500,
            'data' => now()->toDateTimeString()
        ]);
    });
} catch (Exception $e) {
    // La transazione è già stata annullata (rollback) automaticamente qui
    Log::error("Transazione fallita: " . $e->getMessage());
}
Utilizzo di una singola connessione
    Soluzione 1: Riutilizzare la stessa istanza (L'approccio più semplice)Invece di chiamare ::open() prima di ogni singola query, assegna l'helper a una variabile. I metodi terminali (come get(), update(), delete(), insert()) richiamano internamente il metodo $this->resetQuery(), che ripulisce i filtri e la tabella senza chiudere la connessione.

                               // Apre la connessione UNA sola volta
$db = VerticaOdbcHelper::open();

// Prima query
$utenti = $db->table('public.utenti')->where('attivo', '=', 1)->get();

// Seconda query (la connessione è la stessa, i filtri precedenti sono resettati)
$db->table('public.logs')->insert([
    'azione' => 'lettura_utenti',
    'data' => now()->toDateTimeString()
]);

// Chiudi esplicitamente alla fine se non hai più bisogno dell'helper
$db->close();





Sì, per come è strutturato il codice adesso, ogni volta che chiami VerticaOdbcHelper::open(), viene creata e aperta una nuova connessione ODBC fisica (tramite il costruttore __construct), che rimane attiva fino a quando l'istanza non viene distrutta dal Garbage Collector di PHP o non chiami esplicitamente $helper->close().
Se esegui tre query di fila invocando ogni volta ::open(), aprirai e chiuderai tre connessioni distinte verso Vertica. Questo approccio è molto inefficiente, poiché l'handshake di rete e l'autenticazione ODBC verso un data warehouse come Vertica possono essere operazioni lente e costose.
Ecco le soluzioni e i metodi migliori che puoi usare per ottimizzare la gestione delle connessioni.
------------------------------
## Soluzione 1: Riutilizzare la stessa istanza (L'approccio più semplice)
Invece di chiamare ::open() prima di ogni singola query, assegna l'helper a una variabile. I metodi terminali (come get(), update(), delete(), insert()) richiamano internamente il metodo $this->resetQuery(), che ripulisce i filtri e la tabella senza chiudere la connessione.

// Apre la connessione UNA sola volta
$db = VerticaOdbcHelper::open();

// Prima query
$utenti = $db->table('public.utenti')->where('attivo', '=', 1)->get();

// Seconda query (la connessione è la stessa, i filtri precedenti sono resettati)
$db->table('public.logs')->insert([
    'azione' => 'lettura_utenti',
    'data' => now()->toDateTimeString()
]);

// Chiudi esplicitamente alla fine se non hai più bisogno dell'helper
$db->close();

------------------------------
## Soluzione 2: Utilizzare il metodo session() (Già presente nel tuo Helper)
Il tuo codice include già un ottimo pattern nel metodo statico session(callable $callback). Questo metodo è perfetto quando devi lanciare una serie di query all'interno di un blocco isolato di codice.
Apre la connessione all'inizio, ti passa l'istanza e garantisce la chiusura automatica della connessione nel blocco finally, anche se una query dovesse lanciare un errore.

VerticaOdbcHelper::session(function ($db) {
    // La connessione si apre qui

    $record = $db->table('analytics.visite')->where('id', '=', 10)->first();

    if ($record) {
        $db->table('analytics.report')... // seconda query
    }

    // La connessione viene chiusa AUTOMATICAMENTE qui (o in caso di Exception)
});

------------------------------
## Soluzione 3: Implementare il Pattern Singleton (Consigliato per Laravel)
Se vuoi poter invocare l'helper in punti diversi del tuo codice (es. in due Controller differenti o tra un Middleware e un Controller) durante la stessa identica richiesta HTTP senza riaprire la connessione, puoi trasformare l'helper in un Singleton modificando il metodo open().
Sostituisci il metodo open() e aggiungi una proprietà statica nel tuo file in questo modo:

    /** @var self|null */
    /* protected static ?self $instance = null; */

/**
 * Restituisce sempre la stessa istanza di connessione per la richiesta HTTP corrente.
 */
    /* public static function open(): self */
    /* { */
    /*     if (static::$instance === null || !is_resource(static::$instance->connection)) { */
    /*         static::$instance = new self(); */
    /*     } */
    /*     return static::$instance; */
    /* } */

/*    Se applichi questa modifica, puoi chiamare VerticaOdbcHelper::open() ovunque nel codice: la prima chiamata istanzierà la connessione, mentre le chiamate successive riutilizzeranno silenziosamente la connessione già aperta
 *
 *      Soluzione 4: Connessioni Persistenti (Ottimizzazione lato PHP)
 *      Se vuoi che le connessioni a Vertica rimangano aperte anche tra richieste HTTP diverse (evitando di ricollegarsi ad ogni caricamento pagina), puoi modificare il costruttore per usare odbc_pconnect (connessione persistente) al posto di odbc_connect.Nel costruttore della tua classe, cambia la riga di connessione così
 *
 *      // Sostituisci odbc_connect con odbc_pconnect
$this->connection = @odbc_pconnect($dsn, $user, $password);

          Nota: Usa le connessioni persistenti con cautela, poiché mantengono i canali occupati sul server Vertica anche quando l'utente ha finito di navigare sul sito
     */

// utilizzo drop
/*
 * // Elimina la tabella se esiste (comportamento di default)
VerticaOdbcHelper::open()->table('decisyon_cache.WB_YEARS')->drop();

// Elimina la tabella forzando l'errore se non esiste
VerticaOdbcHelper::open()->table('decisyon_cache.WB_YEARS')->drop(false);
 */

// utilizzo dumpSql
/*
 * // Esempio con dumpSql() per i log
$helper = VerticaOdbcHelper::open()
    ->table('public.utenti')
    ->where('stato', '=', 'attivo')
    ->orderBy('creato_il', 'DESC');

Log::info("Esecuzione query: " . $helper->dumpSql());
$risultati = $helper->get();


// Esempio con ddSql() per interrompere lo script e vedere l'SQL a schermo
VerticaOdbcHelper::open()
    ->table('analytics.visite')
    ->where('anno', '=', 2026)
    ->whereIn('paese', ['IT', 'FR'])
    ->limit(10)
    ->ddSql();
// Lo script si ferma qui e stampa:
// "SELECT * FROM analytics.visite WHERE anno = 2026 AND paese IN ('IT', 'FR') LIMIT 10"
 */
