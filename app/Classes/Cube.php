<?php

namespace App\Classes;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class Cube
{
  const SELECT = "SELECT\n";
  const FROM = "\nFROM\n";
  const GROUPBY = "\nGROUP BY\n";
  const WHERE = "\nWHERE\n";
  public $results = [];
  private $select_clause;
  public $datamart_fields = array();
  private $from_clause = array(); // utilizzata al posto di FROM_baseTable
  private $where_clause = array(); // utilizzata al posto di WHERE_baseTable
  private $where_time_clause = array(); // utilizzata al posto di WHERE_timeDimension
  private $report_metrics = array(); // da utilizzare al posto di $this->_metrics_base
  private $report_filters = array(); // utilizzato al posto di $filters_baseTable
  private $groupby_clause = array();
  private $with_clause = "";

  // private $_metrics_base_datamart;
  // da sostituire con...
  private $datamart_baseMeasures = array();

  private $_columns = array();
  private $_sql = "";
  private $sql_datamart = "";
  // private $FROM_baseTable = array();
  private $baseTableNames = array();
  private $FROM_metricTable = array();
  private $WHERE_metricTable = array(), $WHERE_timingFn = array();
  // private $WHERE_baseTable = array();
  // private $WHERE_timeDimension = array();
  private $segmented = array();
  // private $filters_baseTable = array();
  private $_metrics_base;
  private $_metrics_advanced_datamart = array();
  private $cm = array(); // composite metrics
  public $queries = [];

  function __construct($process)
  {
    $this->process = $process;
    $this->report_id = $this->process->{"id"};
    $this->facts = $this->process->{"facts"};
    $this->datamart_id = $this->process->{"datamartId"};
    $this->datamart_name = "WEB_BI_{$this->report_id}_{$this->datamart_id}";
    // il report deve necessariamente contenere almeno un livello dimensionale
    // ...quindi $this->process->{fields} sarà sempre presente
    $this->fields = $this->process->{"fields"};
  }

  public function __set($prop, $value)
  {
    $this->$prop = $value;
  }

  public function __get($value)
  {
    return $this->$value;
  }


  /* Creazione di un array contenenti le colonne da inserire nella creazione
    del datamart, sia nella clausola SELECT che in GROUPBY
    array:4 [
      0 => "'sid_id'"
      1 => "'sid'"
      2 => "'sede_id'"
      3 => "'sede'"
    ]
  */
  public function datamartFields()
  {
    // dd($this->fields);
    foreach ($this->fields as $column) {
      $this->datamart_fields[] = "{$column->name}_id";
      $this->datamart_fields[] = $column->name;
    }
    // dd($this->datamart_fields);
  }

  // Creazione della clausola SELECT e dell'array _columns
  /* es.:
    SELECT\n
    CodSedeDealer_765.Descrizione AS sede_id,
    CodSedeDealer_765.Descrizione AS sede_ds
  */
  public function select()
  {
    // $fieldList = array();
    $name_key = NULL;
    // dd($this->fields);
    // per ogni tabella
    foreach ($this->fields as $column) {
      // dd($column);
      foreach ($column->field as $key => $value) {
        // key: id/ds
        $name_key = "{$column->name}_{$key}";
        $sql = implode("", $value->sql); // alias_tabella.nome_campo[_id]
        // $fieldList[$name_key] = ($key === "ds") ? "{$sql} AS {$column->name}" : "{$sql} AS {$name_key}";
        $this->select_clause[$name_key] = ($key === "ds") ? "{$sql} AS {$column->name}" : "{$sql} AS {$name_key}";

        // questo viene utilizzato nella clausola ON della LEFT JOIN
        // WARN: al posto di _columns[], in createDatamart(), può essere utilizzato $this->datamart_fields[]
        // $this->_columns[] = "{$column->name}_id";
        if (property_exists($this, 'sql_info')) {
          $this->sql_info->{'SELECT'}->{$name_key} = "{$sql} AS {$name_key}";
        }
      }
    }
    // dd($fieldList);
    // $this->select_clause = self::SELECT . implode(",\n", $fieldList);
    // dd($this->sql_info);
    // dd($this->select_clause);
    // dd($this->_columns);
  }

  // Definizione del calcolo delle misure
  public function metrics()
  {
    // metriche di base
    // $metrics_base = array();
    // $metrics_base_datamart = array();

    $this->report_metrics = [];
    // dd($this->baseMetrics);
    foreach ($this->baseMetrics as $value) {
      // dd($value);
      $metric = "\nNVL({$value->aggregateFn}({$value->SQL}), 0) AS '{$value->alias}'";
      $this->report_metrics[] = $metric;
      // $metrics_base[] = $metric;
      if (property_exists($this, 'sql_info')) {
        $this->sql_info->{'METRICS'}->{$value->alias} = $metric;
      }
      // TODO: da provare senza la baseTableName
      // $metrics_base_datamart[] = "\nNVL({$value->aggregateFn}({$this->baseTableName}.'{$value->alias}'), 0) AS '{$value->alias}'";
      $this->datamart_baseMeasures[] = "\nNVL({$value->aggregateFn}('{$value->alias}'), 0) AS '{$value->alias}'";
    }
    // dd($this->report_metrics);

    // viene utilizzata in createDatamart()
    // $this->datamart_baseMeasures = implode(", ", $metrics_base_datamart);
    // dd($this->sql_info);
    // dd($this->datamart_baseMeasures);
  }

  /*
  * il metodo 'from' viene invocato per creare la baseTable e, successivamente, per
  * aggiungere nella FROM, una tabella appartenente a una metrica filtrata
	* che, al suo interno, avrà un filtro appartenente a una tabella NON inclusa nella baseTable
    es.:
			array:4 [
				aliasTable => "automotive_bi_data.Azienda AS Azienda_997"
				aliasTable => "automotive_bi_data.CodSedeDealer AS CodSedeDealer_765"
				aliasTable => "automotive_bi_data.DocVenditaIntestazione AS DocVenditaIntestazione_055"
				aliasTable => "automotive_bi_data.DocVenditaDettaglio AS DocVenditaDettaglio_560"
			]
	*/
  public function from($from)
  {
    // dd($from);
    $this->from_clause = []; // azzero la FROM che può variare in base alla Fact in ciclo
    foreach ($from as $alias => $prop) {
      // dd($alias, $prop);
      $this->from_clause[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
      if (property_exists($this, 'sql_info')) {
        $this->sql_info->{'FROM'}->{$alias} = "{$prop->schema}.{$prop->table} AS {$alias}";
      }
    }
    // dd($this->from_clause);
  }

  /*
	* Utilizzo della stessa logica di FROM
	* @param joins = "token_join" : ['table.field', 'table.field']
  * es.:
  * Azienda_997.id = CodSedeDealer_765.id_Azienda \n
  * AND CodSedeDealer_765.id = DocVenditaIntestazione_055.id_CodSedeDealer \n
  * AND DocVenditaIntestazione_055.NumRifInt = DocVenditaDettaglio_560.NumRifInt \n
  * AND DocVenditaIntestazione_055.id_Azienda = DocVenditaDettaglio_560.id_Azienda
	*/
  public function where($joins)
  {
    // dd($joins);
    /* TODO: metto in join le tabelle incluse nella FROM_baseTable.
      Valutare quale approccio può essere migliore in base ai tipi di join che si dovranno implementare in futuro
    */
    // NOTE : caso in qui viene passato tutto l'object
    // $this->WHERE_baseTable = [];
    $this->where_clause = [];
    $this->where_time_clause = [];
    foreach ($joins as $token => $join) {
      // il token è l'identificativo della join
      // var_dump($join);
      // qui utilizzo la proprietà SQL con implode(' = ', $join->SQL)
      if ($join->alias === 'WEB_BI_TIME') {
        $this->where_time_clause[$token] = implode(" = ", $join->SQL);
        if (property_exists($this, 'sql_info')) {
          // in questo caso imposto nella prop 'WHERE-TIME' anzichè nella 'WHERE'. In questo
          // modo, se nelle metriche filtrate, presente una timingFn non ho problemi di
          // sovrapposizione delle JOIN con la WEB_BI_TIME.
          $this->sql_info->{'WHERE-TIME'}->{$token} = implode(" = ", $join->SQL);
        }
      } else {
        $this->where_clause[$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
        if (property_exists($this, 'sql_info')) $this->sql_info->{'WHERE'}->{$token} = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
      }
    }
    // dd($this->sql_info);

    // NOTE: caso in qui viene passato, a joins, solo la proprietà SQL
    //
    /* foreach ($joins as $token => $join) {
      // dd($token, $join);
      $this->WHERE_baseTable[$token] = implode(" = ", $join);
    } */
    // dd($this->where_clause, $this->where_time_clause);
  }

  // definisco i filtri del report
  public function filters($filters)
  {
    // dd($filters);
    foreach ($filters as $filter) {
      // dd($filter);
      $this->report_filters[$filter->name] = implode(" ", $filter->sql);
      if (property_exists($this, 'sql_info')) {
        $this->sql_info->{'AND'}->{$filter->name} = implode(" ", $filter->sql);
      }
    }
    // dd($this->report_filters);
    // dd($this->sql_info);
  }

  // Qui viene utilizzata la stessa logica del metodo select()
  public function groupBy()
  {
    // dd($groups);
    // $fieldList = array();
    $this->groupby_clause = [];
    $name_key = NULL;
    foreach ($this->fields as $column) {
      foreach ($column->field as $key => $value) {
        $name_key = "{$column->name}_{$key}";
        $sql = implode("", $value->sql); // alias_tabella.nome_campo[_id]
        $this->groupby_clause[$name_key] = $sql;
        if (property_exists($this, 'sql_info')) {
          $this->sql_info->{'GROUP BY'}->{$name_key} = $sql;
        }
        ($key === "id") ? array_push($this->segmented, $name_key) : array_push($this->segmented, $column->name);
      }
    }
    // $this->_groupBy .= implode(",\n", $fieldList);
    // dd($this->_groupBy);
    // dd($this->segmented);
    if (count($this->segmented) > 40) {
      $segmented = implode(",\n", $this->segmented);
      // $this->_groupBy .= "\nSEGMENTED BY HASH({$segmented}) ALL NODES";
      $this->groupby_clause['SEGMENTED'] = "\nSEGMENTED BY HASH({$segmented}) ALL NODES";
    }
    // dd($this->_groupBy);
    // dd($this->groupby_clause);
  }

  public function baseTable()
  {
    // creo una TEMP_TABLE su cui, successivamente, andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
    // dd($this->_select);
    // $this->_sql = $this->_select;
    $sql_string = self::SELECT . implode(",\n", $this->select_clause);
    // dd($sql_string);
    // se ci sono metriche a livello di report le aggiungo
    // se un report contiene solo metriche filtrate non avrà metriche di base
    // dd(is_null($this->report_metrics));
    if (!is_null($this->report_metrics)) $sql_string .= "," . implode(", ", $this->report_metrics);
    $sql_string .= self::FROM . implode(",\n", $this->from_clause);
    $sql_string .= self::WHERE . implode("\nAND ", array_merge($this->where_clause, $this->where_time_clause));
    if (!is_null($this->report_filters)) $sql_string .= "\nAND " . implode("\nAND ", $this->report_filters);
    $sql_string .= self::GROUPBY . implode(",\n", $this->groupby_clause);
    $comment = "/*\nCreazione tabella BASE :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
    // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $sql_string;";
    // var_dump($sql);
    // dd($sql);
    // $result = DB::connection('vertica_odbc')->raw($sql);
    // devo controllare prima se la tabella esiste, se esiste la elimino e poi eseguo la CREATE TEMPORARY...
    $result = "";
    if (property_exists($this, 'sql_info')) {
      $this->results[] = ["raw_sql" => nl2br($sql), "format_sql" => $this->sql_info];
    } else {
      // elimino la tabella temporanea, se esiste, prima di ricrearla
      // La elimino anche in caso di errore nella creazione della tabella temporanea (WEB_BI_BASE_TABLE....)
      $this->dropTemporaryTables($this->baseTableName);
      // try {
      $result = DB::connection('vertica_odbc')->statement($sql);
      dd($result);
      // } catch (Exception $e) {
      // dd("ERrore gestito: {$e}");
      // $this->dropTemporaryTables($this->baseTableName);
      // throw new Exception("Errore elaborazione richiesta", $e->getCode());
      // throw new Exception("Errore elaborazione richiesta", $e->getMessage());
      // }
    }
    return $result;
  }

  // Aggiunta di tabelle "provenienti" dalle metriche filtrate
  private function setFromMetricTable($from, $tableName)
  {
    $this->FROM_metricTable = array();
    foreach ($from as $alias => $prop) {
      $this->FROM_metricTable[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
      // TODO: da testare con una metrica filtrata contenente la prop 'from'
      if (property_exists($this, 'sql_info')) {
        $this->json_info_advanced[$tableName]->{'FROM'}->{$alias} = "{$prop->schema}.{$prop->table} AS {$alias}";
      }
    }
  }


  // Imposto la WHERE in base alle metriche filtrate
  private function setWhereMetricTable($joins, $tableName)
  {
    $this->WHERE_metricTable = array();
    // dd($joins);
    foreach ($joins as $token => $join) {
      // dd($token, $join);
      if ($join->alias === 'WEB_BI_TIME') {
        $this->WHERE_metricTable[$token] = implode(" = ", $join->SQL);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'WHERE'}->{$token} = implode(" = ", $join->SQL);
        }
      } else {
        $this->WHERE_metricTable[$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'WHERE'}->{$token} = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
        }
      }
    }
    // dd($this->WHERE_metricTable);
    // dd($this->json_info_advanced);
  }


  /*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica filtrata.
		Stessa logica del Metodo filters()
	*/
  private function setFiltersMetricTable($filters, $tableName)
  {
    $this->filters_metricTable = [];
    foreach ($filters as $token => $filter) {
      // dd($token, $filter);
      // TODO: aggiungere le altre funzioni temporali
      $timingFunctions = ['last-year', 'last-month'];
      // dd($timingFunctions, $token);
      if (in_array($token, $timingFunctions)) {
        /* è una funzione temporale.
          Aggiungo, alla WHERE la condizione per applicare il filtro last-year.
          Da valutare se utilizzare (MapJSONExtractor(WEB_BI_TIME.last))['year']::DATE = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE
          ...oppure (WEB_BI_TIME.trans_ly) = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE.
        */
        // dd($filter->joins);
        /* foreach ($filter->joins as $join) {
          // dd($join);
          $this->WHERE_timingFn[$token] = implode(" = ", $join->SQL);
        } */
        $this->WHERE_timingFn[$token] = implode(" = ", $filter->SQL);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'AND'}->{$token} = implode(" = ", $filter->SQL);
          // $this->json_info_advanced[$tableName]->{'AND'}->{$filter->alias} = implode(" = ", $filter->SQL);
          // elimino la prop 'WHERE-TIME' da json_info_advanced perchè la metrica filtrata
          // contiene una funzione temporale, quindi non può coesistere insieme ad un altra relazione
          // con la WEB_BI_TIME
          unset($this->json_info_advanced[$tableName]->{'WHERE-TIME'});
        }
        // $this->WHERE_timingFn[$token] = implode(" = ", $filter->sql);

        // $this->WHERE_timingFn[$token] = "WEB_BI_TIME_055.trans_ly = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE";
        // dd($this->WHERE_timingFn);
        // dd("(MapJSONExtractor({$filter->table}.{$filter->field}))['$filter->func']::DATE");
      } else {
        // dd($filter->SQL, $this->filters_metricTable, $this->filters_baseTable);
        // se il filtro che si sta per aggiungere non è presente nè nei filtri "base_table" nè in quelli "metric_table" lo aggiungo
        /* if (!in_array($filter->SQL, $this->filters_metricTable) && !in_array($filter->SQL, $this->filters_baseTable))
          $this->filters_metricTable[] = $filter->SQL; */
        $this->filters_metricTable[$filter->name] = implode(" ", $filter->sql);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'AND'}->{$filter->name} = implode(" = ", $filter->sql);
        }
      }
    }
    // dd($this->filters_metricTable);
    // dd($this->json_info_advanced);
  }


  /* creo i datamart necessari per le metriche filtrate */
  public function createMetricDatamarts()
  {
    foreach ($this->groupMetricsByFilters as $groupToken => $m) {
      $arrayMetrics = [];
      $tableName = "WEB_BI_TMP_METRIC_{$this->reportId}_{$groupToken}";
      if (property_exists($this, 'sql_info')) {
        $this->json_info_advanced[$tableName] = (object) [
          "SELECT" => $this->sql_info->{'SELECT'},
          "METRICS" => (object)[],
          "FROM" => clone $this->sql_info->{'FROM'},
          "WHERE" => clone $this->sql_info->{'WHERE'},
          "WHERE-TIME" => clone $this->sql_info->{'WHERE-TIME'},
          "AND" => clone $this->sql_info->{'AND'},
          "GROUP BY" => $this->sql_info->{'GROUP BY'}
        ];
      }
      // dd($this->json_info_advanced);
      // dd($m);
      foreach ($m as $metric) {
        unset($this->_sql);
        // dd($metric);
        $arrayMetrics[$metric->alias] = "NVL({$metric->aggregateFn}({$metric->SQL}), 0) AS '{$metric->alias}'";
        if (property_exists($this, 'sql_info')) {
          // TODO: testare con un alias contenente spazi
          $this->json_info_advanced[$tableName]->{'METRICS'}->{"$metric->alias"} = "NVL({$metric->aggregateFn}({$metric->SQL}), 0) AS '{$metric->alias}'";
          // dd($this->json_info_advanced);
        }
        // dd($arrayMetrics);
        // _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
        $this->_metrics_advanced_datamart[$tableName][$metric->alias] = "\nNVL({$metric->aggregateFn}({$metric->alias}), 0) AS {$metric->alias}";
        // aggiungo i filtri presenti nella metrica filtrata ai filtri già presenti sul report
        $this->setFiltersMetricTable($metric->filters, $tableName);
        // dd($this->json_info_advanced);
        // per ogni filtro presente nella metrica
        foreach ($metric->filters as $filter) {
          if (property_exists($filter, 'from')) $this->setFromMetricTable($filter->from, $tableName);
          // dd($this->json_info_advanced);
          // aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
          // se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
          // dd($filter->joins);
          (property_exists($filter, 'joins')) ? $this->setWhereMetricTable($filter->joins, $tableName) : $this->WHERE_metricTable = array();
        }
        // dd($this->filters_baseTable, $this->filters_metricTable, $this->WHERE_timingFn);
      }
      // dd($arrayMetrics);
      // dd($this->_metrics_advanced_datamart);
      // creo il datamart, passo a createMetricTable il nome della tabella temporanea e l'array di metriche che lo compongono
      if (property_exists($this, 'sql_info')) {
        $sqlFilteredMetrics[] = $this->createMetricTable($tableName, $arrayMetrics);
        unset($this->json_info_advanced[$tableName]);
      } else {
        $this->createMetricTable($tableName, $arrayMetrics, false);
      }
    }
    if (property_exists($this, 'sql_info')) return $sqlFilteredMetrics;
  }

  private function createMetricTable($tableName, $metrics)
  {
    // dd('createMetricTable');
    $this->fromFilteredMetric = NULL;
    $this->_sql = "{$this->_select},\n" . implode(",\n", $metrics);
    $this->_sql .= "\nFROM\n" . implode(",\n", array_merge($this->FROM_baseTable, $this->FROM_metricTable));
    // nella metrica adv, se è presente una funzione temporale NON devo aggiungere la condizione WHERE_timeDimension
    // dd($this->WHERE_timingFn);
    if (count($this->WHERE_timingFn) === 0) {
      $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timeDimension, $this->WHERE_metricTable));
    } else {
      // Sono presenti delle funzioni temporali, per cui non posso mettere la WHERE_timeDimension
      $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timingFn, $this->WHERE_metricTable));
    }
    $this->WHERE_timingFn = array();
    // aggiungo i filtri del report e i filtri contenuti nella metrica
    $this->_sql .= "\nAND " . implode("\nAND ", array_merge($this->filters_baseTable, $this->filters_metricTable));
    $this->_sql .= "\n$this->_groupBy";
    $comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($metrics)) . "\n*/\n";

    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->_sql);";
    var_dump($sql);
    // TODO: eliminare la tabella temporanea come fatto per baseTable
    if (property_exists($this, 'sql_info')) {
      $result = ["raw_sql" => nl2br($sql), "format_sql" => $this->json_info_advanced];
    } else {
      // elimino la tabella temporanea, se esiste, prima di ricrearla
      // La elimino anche in caso di errore nella creazione della tabella temporanea
      $this->dropTemporaryTables($tableName);
      try {
        $result = DB::connection('vertica_odbc')->statement($sql);
      } catch (Exception $e) {
        // dd("Errore gestito: {$e}");
        $this->dropTemporaryTables($tableName);
        throw new Exception("Errore elaborazione richiesta", $e->getCode());
      }

      /* versione precedente, senza dropIfExists
       * if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($tableName)) {
        // dd('la tabella già esiste, la elimino');
        $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
        if (!$drop) {
          // null : tabella eliminata, ricreo la tabella temporanea
          $result = DB::connection('vertica_odbc')->statement($sql);
        }
      } else {
        // dd('la tabella non esiste');
        $result = DB::connection('vertica_odbc')->statement($sql);
      } */
      // } catch (Exception $e) {
      // dd('ERrore gestito');
      // $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$this->baseTableName;");
      // throw new Exception("Errore elaborazione richiesta", 1);
      // }
    }
    // dd($sql);
    return $result;
  }

  private function dropTemporaryTables($table)
  {
    if (Schema::connection('vertica_odbc')->hasTable($table)) {
      // tabella esiste
      Schema::connection('vertica_odbc')->drop("decisyon_cache.$table");
    }
  }

  private function with_clause()
  {
    // dd($this->queries);
    $union_sql = [];
    foreach ($this->queries as $table => $fields) {
      $union_sql[] = self::SELECT;
      $union_sql[] = implode(",\n", $fields);
      $union_sql[] = self::FROM . "{$table}\n";
    }
    // dd(implode("", $union_sql));
    $sql = implode("", $union_sql);
    $this->with_clause = "WITH distinct_fields AS ($sql)\n";
    // dd($this->with_clause);
  }

  public function datamart()
  {
    $this->with_clause();
    $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamart_name}\n*/\n";
    $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamart_name} INCLUDE SCHEMA PRIVILEGES AS ";
    $sql .= self::SELECT;
    $fields = [];
    foreach ($this->datamart_fields as $field) {
      $fields[] = "\tdistinct_fields.{$field}";
    }
    $sql .= implode(",\n", $fields);
    if (property_exists($this, "baseMetrics")) $sql .= "," . implode(",", $this->datamart_baseMeasures);
    $sql .= self::FROM . "distinct_fields";
    $joinLEFT = "";
    $ONClause = [];
    foreach ($this->queries as $k => $v) {
      $joinLEFT .= "\nLEFT JOIN decisyon_cache.{$k}\n\tON ";
      foreach ($v as $field) {
        $ONClause[] = "distinct_fields.'$field' = $k.'$field'";
      }
      $joinLEFT .= implode("\nAND ", $ONClause);
      unset($ONClause);
    }
    $sql .= $joinLEFT;
    $sql_final = $this->with_clause . $sql;
    // dd($sql_final);
    if (property_exists($this, 'sql_info')) {
      // dd($sql_final);
      return nl2br($sql_final);
    } else {
      dd("PROCESS");
      // se il datamart già esiste lo elimino prima di ricrearlo
      $this->dropTemporaryTables($this->datamartName);
      try {
        DB::connection('vertica_odbc')->statement($sql_final);
        // elimino la temp table decisyon_cache.$this->baseTableName
        /* $this->dropTemporaryTables($this->baseTableName);

        if (count($this->_metrics_advanced_datamart) !== 0) {
          foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
            $this->dropTemporaryTables($tableName);
          }
        } */
        return $this->reportId;
      } catch (Exception $e) {
        // dd("ERrore gestito: {$e}");
        $this->dropTemporaryTables($this->datamartName);
        if (count($this->_metrics_advanced_datamart) !== 0) {
          foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
            $this->dropTemporaryTables($tableName);
          }
        }
        throw new Exception("Errore elaborazione richiesta", $e->getCode());
      }
    }
  }

  public function createDatamart()
  {
    // dd($this->baseTableNames, $this->baseTableName);
    // dd($this->_metricTable);
    $sql = '';
    // $this->datamart_fields : [colonna_1_id, colonna_1, colonna_2_id, colonna_2,...]
    $this->with_clause();
    dd('stop');

    $table_fields = array();
    // dd($this->datamart_fields);
    foreach ($this->queries as $base_table_name) {
      $table_fields[$base_table_name] = $this->datamart_fields;
    }
    dd($table_fields);
    $this->_fieldsSQL = implode(",", $table_fields);
    // dd($this->_fieldsSQL);
    if (!empty($this->_metrics_advanced_datamart)) {
      // dd('metriche filtrate presenti');
      // _metrics_advanced_datamart : "\n{$metric->aggregateFn}($tableName.'{$metric->alias}') AS '{$metric->alias}'"
      // sono presenti metriche filtrate
      $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamartName}\n*/\n";
      $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS ";
      dd($sql);
      $sql .= "\n(SELECT{$this->_fieldsSQL}";
      $leftJoin = null;

      if (property_exists($this, 'baseMetrics') && $this->_metrics_base_datamart) $sql .= ", $this->_metrics_base_datamart";
      if (property_exists($this, 'filteredMetrics')) {
        $ONClause = array();
        $ONConditions = NULL;
        foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
          $sql .= "," . implode(",", $aliasM);
          $leftJoin .= "\nLEFT JOIN\ndecisyon_cache.$tableName\nON ";
          foreach ($this->_columns as $columnAlias) {
            // creo : ON W_AP_base_3.sede = W_AP_metric_3_1.sede
            $ONClause[] = "{$this->baseTableName}.'{$columnAlias}' = {$tableName}.'{$columnAlias}'";
          }
          $ONConditions = implode("\nAND ", $ONClause);
          unset($ONClause);
          $leftJoin .= $ONConditions;
        }
      }
      /*
        QUERY CHE GENERA IL DATAMART
            select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto` FROM W_AP_base_3
            LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
            LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
            con metriche composte
            select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto`, (W_AP_base_3.aliasMetric + W_AP_base_3.aliasMetric) AS 'alias' FROM W_AP_base_3
            LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
            LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
        ;
      */

      // dd(property_exists($this, 'compositeMetrics'));
      if (property_exists($this, 'compositeMetrics')) {
        // dd($this->compositeMetrics);
        foreach ($this->compositeMetrics as $cm) {
          $this->cm[] = "NVL(" . implode(" ", $cm->SQL) . ",0) AS {$cm->alias}";
        }
        $sql .= ",\n";
        $sql .= implode(",\n", $this->cm);
      }
      $sql .= "\nFROM\ndecisyon_cache.$this->baseTableName";
      $sql .= "$leftJoin\nGROUP BY $this->_fieldsSQL);";
    } else {
      // non sono presenti metriche filtrate
      // dd("NON sono presenti metriche avanzate");
      $s = "SELECT $this->_fieldsSQL";
      if (property_exists($this, 'baseMetrics')) $s .= ", $this->_metrics_base_datamart";
      // dd(property_exists($this, 'compositeMetrics'));
      if (property_exists($this, 'compositeMetrics')) {
        // sono presenti metriche composte
        // dd($this->compositeMetrics);
        foreach ($this->compositeMetrics as $cm) {
          $this->cm[] = "NVL(" . implode(" ", $cm->SQL) . ",0) AS {$cm->alias}";
        }
        $s .= ",\n";
        $s .= implode(",\n", $this->cm);
      }
      // $s .= "\nFROM decisyon_cache.$this->baseTableName";
      $s .= "\nFROM " . implode(",\n", $this->baseTableNames);
      dd($s);
      $s .= "\nGROUP BY $this->_fieldsSQL";
      $sql = "/*Creazione DATAMART finale :\n{$this->datamartName}\n*/\nCREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS\n($s);";
    }

    if (property_exists($this, 'sql_info') || property_exists($this, 'sql_info')) {
      dd($sql);
      return nl2br($sql);
    } else {
      // se il datamart già esiste lo elimino prima di ricrearlo
      $this->dropTemporaryTables($this->datamartName);
      try {
        DB::connection('vertica_odbc')->statement($sql);
        // elimino la temp table decisyon_cache.$this->baseTableName
        $this->dropTemporaryTables($this->baseTableName);

        if (count($this->_metrics_advanced_datamart) !== 0) {
          foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
            $this->dropTemporaryTables($tableName);
          }
        }
        return $this->reportId;
      } catch (Exception $e) {
        // dd("ERrore gestito: {$e}");
        $this->dropTemporaryTables($this->datamartName);
        if (count($this->_metrics_advanced_datamart) !== 0) {
          foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
            $this->dropTemporaryTables($tableName);
          }
        }
        throw new Exception("Errore elaborazione richiesta", $e->getCode());
      }
      // TODO: Intercettare l'errore in caso di tabella non creata, in caso di errore bisogna eliminare
      // le temp table relative a $this->reportId
      // if (!$result) {
      //   // elimino anche le tabelle temporanee delle metriche filtrate
      //   if (count($this->_metrics_advanced_datamart) !== 0) {
      //     foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
      //       //dd($tableName);
      //       $dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
      //     }
      //   }
      //   // dd($this->_metricTable);
      //   // ritorno il nome della FX in modo da poter mostrare un anteprima dei dati
      //   // dd($sql);
      //   // return $this->datamartName;
      //   return $this->reportId;
      // }

      /* gestione precedente senza l'utilizzo di dropIfExists()

      // if (Schema::connection('vertica_odbc')->hasTable($this->datamartName)) {
      //   // if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($this->datamartName)) {
      //   // dd('la tabella già esiste, la elimino');
      //   // echo "Elimino la tabella : {$this->datamartName}";
      //   // dd($drop);
      //   // $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.{$this->datamartName};");
      //   // $drop = null -> tabella eliminata correttamente
      //   $result = (!$drop) ? DB::connection('vertica_odbc')->statement($sql) : "Errore nella cancellazione della tabella";
      //   // if (!$drop) {
      //   //   // null : tabella eliminata, ricreo di nuovo il datamart
      //   //   $result = DB::connection('vertica_odbc')->statement($sql);
      //   // } else {
      //   //   $result = "Errore : tabella non eliminata";
      //   // }
      // } else {
      //   // dd('Datamart non presente, lo creo');
      //   $result = DB::connection('vertica_odbc')->statement($sql);
      // }
      // TODO: Intercettare l'errore in caso di tabella non creata, in caso di errore bisogna eliminare
      // le temp table relative a $this->reportId

      // if (!$result) {
      //   // TODO: aggiungere un controllo sulla drop delle tabelle temporanee
      //   $dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$this->baseTableName;");
      //   // elimino anche le tabelle temporanee delle metriche filtrate
      //   if (count($this->_metrics_advanced_datamart) !== 0) {
      //     foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
      //       //dd($tableName);
      //       $dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
      //     }
      //   }
      //   // dd($this->_metricTable);
      //   // ritorno il nome della FX in modo da poter mostrare un anteprima dei dati
      //   // dd($sql);
      //   // return $this->datamartName;
      //   return $this->reportId;
      // }
      // */
    }
  }
} // End Class
