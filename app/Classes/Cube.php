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
  private $from_clause = array();
  private $where_clause = array(); // utilizzata al posto di WHERE_baseTable
  private $where_time_clause = array(); // utilizzata al posto di WHERE_timeDimension
  private $report_metrics = array(); // da utilizzare al posto di $this->_metrics_base
  private $report_filters = array(); // utilizzato al posto di $filters_baseTable
  private $groupby_clause = array();
  private $union_clause = "";

  // private $_metrics_base_datamart;
  // da sostituire con...
  private $datamart_baseMeasures = array();
  // private $_metrics_advanced_datamart = array();
  // da sostituire con...
  private $datamart_advancedMeasures = array(); // sostituisce _metrics_advanced_datamart

  private $_columns = array();
  private $sqlAdvancedMeasures = NULL;
  // private $FROM_baseTable = array();
  private $baseTableNames = array();
  private $FROM_metricTable = array(); // Clausola FROM per le metriche avanzate
  private $WHERE_metricTable = array(); // Clausola WHERE per le metriche abanzate
  private $WHERE_timingFn = array();
  // private $WHERE_baseTable = array();
  // private $WHERE_timeDimension = array();
  private $segmented = array();
  // private $filters_baseTable = array();
  private $_metrics_base;
  private $cm = array(); // composite metrics
  private $compositeMeasures = [];
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
  public function select_new()
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
        $this->select_clause[$this->factId][$name_key] = ($key === "ds") ? "{$sql} AS {$column->name}" : "{$sql} AS {$name_key}";

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

  public function metrics_new()
  {
    // metriche di base
    // $metrics_base = array();
    // $metrics_base_datamart = array();

    $this->report_metrics = [];
    // dd($this->baseMetrics);
    foreach ($this->baseMetrics as $value) {
      // dd($value);
      $metric = "\nNVL({$value->aggregateFn}({$value->SQL}), 0) AS '{$value->alias}'";
      $this->report_metrics[$this->factId][] = $metric;
      // $metrics_base[] = $metric;
      if (property_exists($this, 'sql_info')) {
        $this->sql_info->{'METRICS'}->{$value->alias} = $metric;
      }
      // TODO: da provare senza la baseTableName
      // $metrics_base_datamart[] = "\nNVL({$value->aggregateFn}({$this->baseTableName}.'{$value->alias}'), 0) AS '{$value->alias}'";
      // $this->datamart_baseMeasures[] = "\nNVL({$value->aggregateFn}({$value->field}), 0) AS '{$value->alias}'";
      $this->datamart_baseMeasures[] = "\n{$value->alias} AS '{$value->alias}'";
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
  public function from_new()
  {
    // dd($from);
    $this->from_clause = []; // azzero la FROM che può variare in base alla Fact in ciclo
    // dd($this->process->{"from"});
    foreach ($this->process->{"from"}->{$this->fact} as $alias => $prop) {
      // dd($alias, $prop);
      $this->from_clause[$this->factId][$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
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
  public function where_new()
  {
    // dd($joins);
    // dd($this->process->{"joins"}->{$this->fact});
    /* TODO: metto in join le tabelle incluse nella FROM_baseTable.
      Valutare quale approccio può essere migliore in base ai tipi di join che si dovranno implementare in futuro
    */
    // NOTE : caso in qui viene passato tutto l'object
    // $this->WHERE_baseTable = [];
    $this->where_clause = [];
    $this->where_time_clause = [];
    foreach ($this->process->{"joins"}->{$this->fact} as $token => $join) {
      // il token è l'identificativo della join
      // dd($join);
      // qui utilizzo la proprietà SQL con implode(' = ', $join->SQL)
      if ($join->type === "TIME") {
        $this->where_time_clause[$this->factId][$token] = implode(" = ", $join->SQL);
        if (property_exists($this, 'sql_info')) {
          // in questo caso imposto nella prop 'WHERE-TIME' anzichè nella 'WHERE'. In questo
          // modo, se nelle metriche filtrate, presente una timingFn non ho problemi di
          // sovrapposizione delle JOIN con la WEB_BI_TIME.
          $this->sql_info->{'WHERE-TIME'}->{$token} = implode(" = ", $join->SQL);
        }
      } else {
        $this->where_clause[$this->factId][$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
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

  public function filters_new()
  {
    foreach ($this->process->{"filters"} as $filter) {
      $this->report_filters[$this->factId][$filter->name] = implode(" ", $filter->sql);
    }
    // dd($this->report_filters);
  }

  public function groupBy_new()
  {
    // dd($groups);
    // $fieldList = array();
    $this->groupby_clause = [];
    $name_key = NULL;
    foreach ($this->fields as $column) {
      foreach ($column->field as $key => $value) {
        $name_key = "{$column->name}_{$key}";
        $sql = implode("", $value->sql); // alias_tabella.nome_campo[_id]
        $this->groupby_clause[$this->factId][$name_key] = $sql;
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

  public function base_table_new($fact)
  {
    if (property_exists($this->process, 'baseMeasures')) $this->baseMetrics = $this->process->{"baseMeasures"}->{$fact};
    // dd($this->baseMetrics);
    $this->select_new();
    $this->metrics_new();
    $this->from_new();
    $this->where_new();
    $this->filters_new();
    $this->groupBy_new();
    $sql = NULL;
    $sql .= self::SELECT . implode(",\n", $this->select_clause[$this->factId]);
    // dd($this->report_metrics[$this->factId]);
    if (!is_null($this->report_metrics[$this->factId])) $sql .= "," . implode(", ", $this->report_metrics[$this->factId]);
    $sql .= self::FROM . implode(",\n", $this->from_clause[$this->factId]);
    $sql .= self::WHERE . implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->where_time_clause[$this->factId]));
    if (!is_null($this->report_filters[$this->factId])) $sql .= "\nAND " . implode("\nAND ", $this->report_filters[$this->factId]);
    $sql .= self::GROUPBY . implode(",\n", $this->groupby_clause[$this->factId]);
    $comment = "/*\nCreazione tabella BASE :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
    // dd($sql);
    $query = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $sql;";
    // dd($query);
    // var_dump($query);
    // elimino la tabella temporanea che sto creando, se già presente
    $this->dropTemporaryTables($this->baseTableName);
    return DB::connection('vertica_odbc')->statement($query);
  }

  // Aggiunta di tabelle "provenienti" dalle metriche avanzate
  private function setFromClause_advancedMeasure($from, $tableName)
  {
    $this->FROM_metricTable = [];
    foreach ($from as $alias => $prop) {
      $this->FROM_metricTable[$this->factId][$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
      // TODO: da testare con una metrica filtrata contenente la prop 'from'
      if (property_exists($this, 'sql_info')) {
        $this->json_info_advanced[$tableName]->{'FROM'}->{$alias} = "{$prop->schema}.{$prop->table} AS {$alias}";
      }
    }
  }

  // Imposto la WHERE in base alle metriche filtrate
  private function setWhereClause_advancedMeasure($joins, $tableName)
  {
    $this->WHERE_metricTable = array();
    // dd($joins);
    foreach ($joins as $token => $join) {
      // dd($token, $join);
      if ($join->alias === 'time') {
        $this->WHERE_metricTable[$token] = implode(" = ", $join->SQL);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'WHERE'}->{$token} = implode(" = ", $join->SQL);
        }
      } else {
        $this->WHERE_metricTable[$this->factId][$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
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
  private function setFiltersMetricTable_new($filters, $tableName)
  {
    $this->filters_metricTable = [];
    // dd($filters);
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
        $this->WHERE_timingFn[$this->factId][$token] = implode(" = ", $filter->SQL);
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
        // -----------logica precedente-----------
        // se il filtro che si sta per aggiungere non è presente nè nei filtri del report nè in quelli "metric_table"
        // lo aggiungo a filters_metricTable[]
        /* if (!in_array($filter->SQL, $this->filters_metricTable) && !in_array($filter->SQL, $this->filters_baseTable))
          $this->filters_metricTable[] = $filter->SQL; */
        // -----------logica precedente-----------
        // -----------nuova logica----------------
        // aggiungo senza verificare se già presente il codice SQL del filtro
        // perchè, essendo un array associativo, al massimo il codice SQL del filtro viene riscritto
        $this->filters_metricTable[$this->factId][$filter->name] = implode(" ", $filter->sql);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$tableName]->{'AND'}->{$filter->name} = implode(" = ", $filter->sql);
        }
      }
    }
    // dd($this->filters_metricTable);
    // dd($this->json_info_advanced);
  }

  /* creo i datamart necessari per le metriche filtrate */
  public function createMetricDatamarts_new()
  {
    foreach ($this->groupMetricsByFilters as $groupToken => $advancedMetric) {
      $groupAdvancedMeasures = [];
      $tableName = "WB_METRIC_{$this->report_id}_{$this->datamart_id}_{$this->factId}_{$groupToken}";
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
      foreach ($advancedMetric as $metric) {
        unset($this->sqlAdvancedMeasures);
        // dd($metric);
        $groupAdvancedMeasures[$this->factId][$metric->alias] = "NVL({$metric->aggregateFn}({$metric->SQL}), 0) AS '{$metric->alias}'";
        if (property_exists($this, 'sql_info')) {
          // TODO: testare con un alias contenente spazi
          $this->json_info_advanced[$tableName]->{'METRICS'}->{"$metric->alias"} = "NVL({$metric->aggregateFn}({$metric->SQL}), 0) AS '{$metric->alias}'";
          // dd($this->json_info_advanced);
        }
        // dd($groupAdvancedMeasures);
        // _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
        // TODO: probabilmente posso creare questo array nello stesso modo di datamart_baseMeasures
        // (quindi senza le keys $tablename e $metric->alias)
        $this->datamart_advancedMeasures[$tableName][$metric->alias] = "\n{$metric->alias} AS {$metric->alias}";
        // $this->datamart_advancedMeasures[$tableName][$metric->alias] = "\nNVL({$metric->aggregateFn}({$metric->alias}), 0) AS {$metric->alias}";
        // aggiungo i filtri presenti nella metrica filtrata ai filtri già presenti sul report
        $this->setFiltersMetricTable_new($metric->filters, $tableName);
        // dd($this->json_info_advanced);
        // per ogni filtro presente nella metrica avanzata...
        foreach ($metric->filters as $filter) {
          // if (property_exists($filter, 'from')) $this->setFromMetricTable($filter->from, $tableName);
          if (property_exists($filter->from, $this->fact)) $this->setFromClause_advancedMeasure($filter->from->{$this->fact}, $tableName);
          // dd($this->filters_metricTable);
          // dd($this->json_info_advanced);
          // aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
          // se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
          // dd($filter->joins);
          // (property_exists($filter, 'joins')) ? $this->setWhereMetricTable($filter->joins, $tableName) : $this->WHERE_metricTable = array();
          (property_exists($filter->joins, $this->fact)) ? $this->setWhereClause_advancedMeasure($filter->joins->{$this->fact}, $tableName) : $this->WHERE_metricTable = array();
        }
        // dd($this->report_filters, $this->filters_metricTable, $this->WHERE_timingFn);
      }
      // dd($groupAdvancedMeasures);
      // dd($this->datamart_advancedMeasures);
      // creo il datamart, passo a createMetricTable il nome della tabella temporanea e l'array di metriche che lo compongono
      if (property_exists($this, 'sql_info')) {
        $sqlFilteredMetrics[] = $this->createMetricTable_new($tableName, $groupAdvancedMeasures);
        unset($this->json_info_advanced[$tableName]);
      } else {
        $this->createMetricTable_new($tableName, $groupAdvancedMeasures, false);
      }
    }
    if (property_exists($this, 'sql_info')) return $sqlFilteredMetrics;
  }

  private function createMetricTable_new($tableName, $advancedMetrics)
  {
    // var_dump($advancedMetrics);
    $this->fromFilteredMetric = NULL;
    // dd($this->select_clause);
    // unisco gli array della clausola select con le metriche da calcolare per il gruppo di metriche
    // dd(array_merge($this->select_clause[$this->factId], $advancedMetrics[$this->factId]));
    $this->sqlAdvancedMeasures = self::SELECT;
    $this->sqlAdvancedMeasures .= implode(",\n", array_merge($this->select_clause[$this->factId], $advancedMetrics[$this->factId]));
    // dd($this->sqlAdvancedMeasures);
    // dd($this->from_clause[$this->factId], $this->FROM_metricTable[$this->factId]);
    if (array_key_exists($this->factId, $this->FROM_metricTable)) {
      // dd($this->from_clause[$this->factId], $this->FROM_metricTable[$this->factId]);
      $this->sqlAdvancedMeasures .= self::FROM . implode(",\n", array_merge($this->from_clause[$this->factId], $this->FROM_metricTable[$this->factId]));
    } else {
      // dd($this->from_clause[$this->factId]);
      $this->sqlAdvancedMeasures .= self::FROM . implode(",\n", $this->from_clause[$this->factId]);
    }
    // $this->sqlAdvancedMeasures .= self::FROM . implode(",\n", array_merge($this->from_clause, $this->FROM_metricTable));
    // dd($this->sqlAdvancedMeasures);
    // nella metrica adv, se è presente una funzione temporale NON devo aggiungere la condizione WHERE_timeDimension
    // if (count($this->WHERE_timingFn) === 0) {
    $this->sqlAdvancedMeasures .= self::WHERE;
    if (array_key_exists($this->factId, $this->where_clause)) $this->sqlAdvancedMeasures .= implode("\nAND ", $this->where_clause[$this->factId]);
    if (array_key_exists($this->factId, $this->where_time_clause)) {
      $this->sqlAdvancedMeasures .= "\nAND ";
      $this->sqlAdvancedMeasures .= implode("\nAND ", $this->where_time_clause[$this->factId]);
    }
    if (array_key_exists($this->factId, $this->WHERE_metricTable)) {
      $this->sqlAdvancedMeasures .= "\nAND ";
      $this->sqlAdvancedMeasures .= implode("\nAND ", $this->WHERE_metricTable[$this->factId]);
    }
    /* if (!array_key_exists($this->factId, $this->WHERE_timingFn)) {
    $this->sqlAdvancedMeasures .= "\nWHERE\n" . implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->where_time_clause[$this->factId], $this->WHERE_metricTable[$this->factId]));
    } else {
      // Sono presenti delle funzioni temporali, per cui non posso mettere la WHERE_timeDimension
      $this->sqlAdvancedMeasures .= "\nWHERE\n" . implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->where_time_clause[$this->factId], $this->WHERE_metricTable[$this->factId]));
    } */
    // dd($this->sqlAdvancedMeasures);
    $this->WHERE_timingFn = [];
    // aggiungo i filtri del report e i filtri contenuti nella metrica
    $this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", array_merge($this->report_filters[$this->factId], $this->filters_metricTable[$this->factId]));
    $this->sqlAdvancedMeasures .= self::GROUPBY . implode(",\n", $this->groupby_clause[$this->factId]);
    // dd($this->sqlAdvancedMeasures);
    $comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($advancedMetrics[$this->factId])) . "\n*/\n";

    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->sqlAdvancedMeasures);";
    // dd($sql);
    // var_dump($sql);
    // TODO: eliminare la tabella temporanea come fatto per baseTable
    if (property_exists($this, 'sql_info')) {
      $result = ["raw_sql" => nl2br($sql), "format_sql" => $this->json_info_advanced];
    } else {
      // elimino la tabella temporanea, se esiste, prima di ricrearla
      // La elimino anche in caso di errore nella creazione della tabella temporanea
      $this->dropTemporaryTables($tableName);
      $result = DB::connection('vertica_odbc')->statement($sql);
      $this->queries[$tableName] = $this->datamart_fields;
      // dd($this->queries);
      /* try {
        $result = DB::connection('vertica_odbc')->statement($sql);
        dd($result);
      } catch (Exception $e) {
        // dd("Errore gestito: {$e}");
        $this->dropTemporaryTables($tableName);
        throw new Exception("Errore elaborazione richiesta", $e->getCode());
      } */

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

  private function distinct_fields()
  {
    $union = [];
    // dd($this->queries);
    foreach ($this->queries as $table => $fields) {
      $sql = self::SELECT;
      $sql .= implode(",\n", $fields);
      $sql .= self::FROM . "decisyon_cache.{$table}\n";
      $union[$table] = $sql;
    }
    // dd(implode("UNION\n", $union));
    $union_sql = implode("UNION\n", $union);
    $this->union_clause = "CREATE TEMPORARY TABLE decisyon_cache.union_{$this->report_id}_{$this->datamart_id} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS\n($union_sql);";
    // dd($this->union_clause);
    // var_dump($this->union_clause);
    $this->dropTemporaryTables("union_{$this->report_id}_{$this->datamart_id}");
    DB::connection('vertica_odbc')->statement($this->union_clause);
  }

  // versione modificata con implementazione metriche avanzate
  public function datamart_new()
  {
    $this->distinct_fields();
    $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamart_name}\n*/\n";
    $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamart_name} INCLUDE SCHEMA PRIVILEGES AS ";
    $sql .= self::SELECT;
    $fields = [];
    foreach ($this->datamart_fields as $field) {
      $fields[] = "\tunion_{$this->report_id}_{$this->datamart_id}.{$field}";
    }
    $sql .= implode(",\n", $fields);
    // dd($this->datamart_baseMeasures);
    if (property_exists($this, "baseMetrics")) $sql .= "," . implode(",", $this->datamart_baseMeasures);
    // dd($this->datamart_advancedMeasures);
    if (property_exists($this, "filteredMetrics")) {
      foreach ($this->datamart_advancedMeasures as $metricAlias) {
        $sql .= "," . implode(",", $metricAlias);
      }
    }
    // dd(property_exists($this->process, "compositeMeasures"));
    if (property_exists($this->process, "compositeMeasures")) {
      $this->compositeMeasures = $this->process->{"compositeMeasures"};
      // dd($this->compositeMeasures);
      foreach ($this->compositeMeasures as $cm) {
        // $this->cm[] = "NVL(" . implode(" ", $cm->SQL) . ",0) AS {$cm->alias}";
        $this->cm[] = implode(" ", $cm->SQL) . " AS {$cm->alias}";
      }
      // dd($this->cm);
      $sql .= ",\n";
      $sql .= implode(",\n", $this->cm);
    }
    // dd($sql);
    $sql .= self::FROM . "decisyon_cache.union_{$this->report_id}_{$this->datamart_id}";
    $joinLEFT = "";
    $ONClause = [];
    foreach ($this->queries as $k => $v) {
      $joinLEFT .= "\nLEFT JOIN decisyon_cache.{$k}\n\tON ";
      foreach ($v as $field) {
        $ONClause[] = "decisyon_cache.union_{$this->report_id}_{$this->datamart_id}.'$field' = $k.'$field'";
      }
      $joinLEFT .= implode("\nAND ", $ONClause);
      unset($ONClause);
    }
    $sql .= $joinLEFT;
    // dd($sql);
    // se il datamart già esiste lo elimino prima di ricrearlo
    $this->dropTemporaryTables($this->datamart_name);
    // TODO: eliminare anche le altre tabelle temporanee, memorizzate in $this->queries
    DB::connection('vertica_odbc')->statement($sql);
    return $this->report_id;
  }
} // End Class
