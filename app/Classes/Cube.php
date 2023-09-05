<?php

namespace App\Classes;

use Illuminate\Support\Facades\DB;
use Exception;

class Cube
{
  private $_select, $_groupBy, $_fields = array(), $_columns = array(), $_sql;
  private $FROM_baseTable = array();
  private $FROM_metricTable = array();
  private $WHERE_metricTable = array(), $WHERE_timingFn = array();
  private $WHERE_baseTable = array(), $WHERE_timeDimension = array();
  private $segmented = array();
  private $filters_baseTable = array();
  private $reportId;
  private $_metrics_base, $_metrics_base_datamart;
  private $_metrics_advanced_datamart = array();
  private $cm = array();

  public function __get($value)
  {
    return $this->$value;
  }

  public function __set($prop, $value)
  {
    $this->$prop = $value;
  }

  /* Creazione di un array contenenti le colonne da inserire nella creazione
    del datamart, sia nella clausola SELECT che in GROUPBY
    array:4 [
      0 => "'sid_id'"
      1 => "'sid_ds'"
      2 => "'sede_id'"
      3 => "'sede_ds'"
    ]
  */
  public function fields()
  {
    // dd($this->baseColumns);
    // field contiene un object con {token_colonna : {proprietà della colonna}}
    foreach ($this->baseColumns as $column) {
      // dd($column);
      // ... per ogni colonna
      // all'interno delle tabelle ci sono i token che corrispondo ognuno a una colonna id-ds
      foreach ($column->field as $key => $value) {
        // key : id/ds
        $this->_fields[] = "{$column->name}_{$key}";
      }
    }
    // dd($this->_fields);
  }

  // Creazione della clausola SELECT e dell'array _columns
  /* es.:
    SELECT\n
    CodSedeDealer_765.Descrizione AS sede_id,
    CodSedeDealer_765.Descrizione AS sede_ds
  */
  public function select($columns)
  {
    $fieldList = array();
    $this->_select = "SELECT\n";
    // dd($columns);
    // per ogni tabella
    foreach ($columns as $column) {
      // ... per ogni colonna
      // dd($column);
      foreach ($column->field as $key => $value) {
        // key: id/ds
        $fieldList["{$column->name}_{$key}"] = implode("", $value->sql) . " AS {$column->name}_{$key}"; // $fieldType : id/ds
        // questo viene utilizzato nella clausola ON della LEFT JOIN
        $this->_columns[] = "{$column->name}_id";
      }
    }
    // dd($fieldList);
    $this->_select .= implode(",\n ", $fieldList);
    // dd($this->_select);
    // var_dump($this->_columns);
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
    foreach ($from as $alias => $prop) {
      $this->FROM_baseTable[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
    }
  }

  // Qui viene utilizzata la stessa logica del metodo select()
  public function groupBy($groups)
  {
    $fieldList = array();
    $this->_groupBy = "GROUP BY\n";
    foreach ($groups as $column) {
      foreach ($column->field as $key => $value) {
        $fieldList["{$column->name}_{$key}"] = implode("", $value->sql);
        array_push($this->segmented, "{$column->name}_{$key}");
      }
    }
    // dd($fieldList);
    $this->_groupBy .= implode(",\n", $fieldList);
    // dd($this->_groupBy);
    // dd($this->segmented);
    if (count($this->segmented) > 48) {
      $segmented = implode(",\n", $this->segmented);
      $this->_groupBy .= "\nSEGMENTED BY HASH({$segmented}) ALL NODES";
    }
    // dd($this->_groupBy);
  }

  // Aggiunta di tabelle "provenienti" dalle metriche filtrate
  private function setFromMetricTable($from)
  {
    $this->FROM_metricTable = array();
    foreach ($from as $alias => $prop) {
      $this->FROM_metricTable[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
    }
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
    foreach ($joins as $token => $join) {
      // il token è l'identificativo della join
      // var_dump($join);
      // qui utilizzo la proprietà SQL con implode(' = ', $join->SQL)
      if ($join->alias === 'WEB_BI_TIME') {
        $this->WHERE_timeDimension[$token] = implode(" = ", $join->SQL);
      } else {
        $this->WHERE_baseTable[$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
      }
    }

    // NOTE: caso in qui viene passato, a joins, solo la proprietà SQL
    //
    /* foreach ($joins as $token => $join) {
      // dd($token, $join);
      $this->WHERE_baseTable[$token] = implode(" = ", $join);
    } */
    // dd($this->WHERE_baseTable, $this->WHERE_timeDimension);
  }

  // Imposto la WHERE in base alle metriche filtrate
  private function setWhereMetricTable($joins)
  {
    $this->WHERE_metricTable = array();
    // dd($joins);
    foreach ($joins as $token => $join) {
      // dd($token, $join);
      if ($join->alias === 'WEB_BI_TIME') {
        $this->WHERE_metricTable[$token] = implode(" = ", $join->SQL);
      } else {
        $this->WHERE_metricTable[$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
      }
    }
    // dd($this->WHERE_metricTable);
  }

  // definisco i filtri del report
  public function filters($filters)
  {
    // dd($filters);
    foreach ($filters as $filter) {
      // dd($filter);
      $this->filters_baseTable[$filter->name] = implode(" ", $filter->sql);
    }
    // dd($this->filters_baseTable);
  }

  /*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica filtrata.
		Stessa logica del Metodo filters()
	*/
  private function setFiltersMetricTable($filters)
  {
    $this->filters_metricTable = [];
    foreach ($filters as $token => $filter) {
      // dd($filter);
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
      }
    }
    // dd($this->filters_metricTable);
  }

  // Definizione del calcolo delle misure
  public function metrics()
  {
    // metriche di base
    $metrics_base = array();
    $metrics_base_datamart = array();
    // dd($this->baseMeasures);
    foreach ($this->baseMeasures as $value) {
      // dd($value);
      // $metrics_base[] = "\nNVL({$value->formula->aggregateFn}({$value->workBook->tableAlias}.{$value->formula->field}), 0) AS '{$value->formula->alias}'";
      // $metrics_base_datamart[] = "\nNVL({$value->formula->aggregateFn}({$this->baseTableName}.'{$value->formula->alias}'), 0) AS '{$value->formula->alias}'";
      $metrics_base[] = "\nNVL({$value->aggregateFn}({$value->SQL}), 0) AS '{$value->alias}'";
      // TODO: da provare senza la baseTableName
      $metrics_base_datamart[] = "\nNVL({$value->aggregateFn}({$this->baseTableName}.'{$value->alias}'), 0) AS '{$value->alias}'";
    }
    $this->_metrics_base = implode(", ", $metrics_base);
    $this->_metrics_base_datamart = implode(", ", $metrics_base_datamart);
    // dd($this->_metrics_base);
    // dd($this->_metrics_base_datamart);
  }

  public function baseTable($mode)
  {
    // creo una TEMP_TABLE su cui, successivamente, andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
    // dd($this->_select);
    $this->_sql = $this->_select;
    // se ci sono metriche a livello di report le aggiungo
    // se un report contiene solo metriche filtrate non avrà metriche di base
    if (!is_null($this->_metrics_base)) {
      // dd('_metrics_base ' . $this->_metrics_base);
      $this->_sql .= ", $this->_metrics_base";
    }
    $this->_sql .= "\nFROM\n" . implode(",\n", $this->FROM_baseTable);
    $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timeDimension));
    if (count($this->filters_baseTable)) $this->_sql .= "\nAND " . implode("\nAND ", $this->filters_baseTable);
    $this->_sql .= "\n$this->_groupBy";
    // $this->_sql .= "\n$this->_groupBy LIMIT 20";
    $comment = "/*\nCreazione tabella BASE :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
    // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $this->_sql;";
    // var_dump($sql);
    // dd($sql);
    // $result = DB::connection('vertica_odbc')->raw($sql);
    // devo controllare prima se la tabella esiste, se esiste la elimino e poi eseguo la CREATE TEMPORARY...
    /* il metodo getSchemaBuilder() funziona con mysql, non con vertica. Ho creato MyVerticaGrammar.php dove c'è la sintassi corretta per vertica (solo alcuni Metodi ho modificato) */
    if ($mode === 'sql') {
      $result = $sql;
    } else {
      if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($this->baseTableName)) {
        // dd('la tabella già esiste, la elimino');
        $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.{$this->baseTableName};");
        if (!$drop) {
          // null : tabella eliminata, ricreo la tabella temporanea
          $result = DB::connection('vertica_odbc')->statement($sql);
        }
      } else {
        // Tabella non esistente
        // dd('la tabella non esiste');
        $result = DB::connection('vertica_odbc')->statement($sql);
      }
    }
    // dd($sql);
    return $result;
  }

  /* creo i datamart necessari per le metriche filtrate */
  public function createMetricDatamarts($mode)
  {
    foreach ($this->groupMetricsByFilters as $groupToken => $m) {
      $arrayMetrics = [];
      $tableName = "WEB_BI_TMP_METRIC_{$this->reportId}_{$groupToken}";
      // dd($m);
      foreach ($m as $metric) {
        unset($this->_sql);
        // dd($metric);
        $arrayMetrics[$metric->alias] = "NVL({$metric->aggregateFn}({$metric->SQL}), 0) AS '{$metric->alias}'";
        // dd($arrayMetrics);
        // _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
        $this->_metrics_advanced_datamart[$tableName][$metric->alias] = "\nNVL({$metric->aggregateFn}({$metric->alias}), 0) AS {$metric->alias}";
        // aggiungo i filtri presenti nella metrica filtrata ai filtri già presenti sul report
        $this->setFiltersMetricTable($metric->filters);
        // per ogni filtro presente nella metrica
        foreach ($metric->filters as $filter) {
          if (property_exists($filter, 'from')) $this->setFromMetricTable($filter->from);
          // aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
          // se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
          // dd($filter->joins);
          (property_exists($filter, 'joins')) ? $this->setWhereMetricTable($filter->joins) : $this->WHERE_metricTable = array();
        }
        // dd($this->filters_baseTable, $this->filters_metricTable, $this->WHERE_timingFn);
      }
      // dd($arrayMetrics);
      // dd($this->_metrics_advanced_datamart);
      // creo il datamart, passo a createMetricTable il nome della tabella temporanea e l'array di metriche che lo compongono
      if ($mode === 'sql') {
        $sqlFilteredMetrics[] = $this->createMetricTable($tableName, $arrayMetrics, $mode);
      } else {
        $this->createMetricTable($tableName, $arrayMetrics, null);
      }
    }
    if ($mode === 'sql') return $sqlFilteredMetrics;
  }

  private function createMetricTable($tableName, $metrics, $mode)
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
      // dd($this->WHERE_timingFn);
      $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timingFn, $this->WHERE_metricTable));
    }
    $this->WHERE_timingFn = array();
    // aggiungo i filtri del report e i filtri contenuti nella metrica
    $this->_sql .= "\nAND " . implode("\nAND ", array_merge($this->filters_baseTable, $this->filters_metricTable));
    $this->_sql .= "\n$this->_groupBy";
    $comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($metrics)) . "\n*/\n";

    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->_sql);";
    // var_dump($sql);
    // TODO: eliminare la tabella temporanea come fatto per baseTable
    if ($mode === 'sql') {
      $result = $sql;
    } else {
      // try {
      if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($tableName)) {
        // dd('la tabella già esiste, la elimino');
        $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
        if (!$drop) {
          // null : tabella eliminata, ricreo la tabella temporanea
          $result = DB::connection('vertica_odbc')->statement($sql);
        }
      } else {
        // dd('la tabella non esiste');
        $result = DB::connection('vertica_odbc')->statement($sql);
      }
      // } catch (Exception $e) {
      // dd('ERrore gestito');
      // $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$this->baseTableName;");
      // throw new Exception("Errore elaborazione richiesta", 1);
      // }
    }
    // dd($sql);
    return $result;
  }

  public function createDatamart($mode)
  {
    // dd($this->_metricTable);
    // TODO: commentare tutta la logica
    $table_fields = array();
    foreach ($this->_fields as $field) {
      $table_fields[] = "\n$this->baseTableName.$field";
    }
    $this->_fieldsSQL = implode(",", $table_fields);
    // dd($this->_fieldsSQL);
    // WARN: qui è presente del codice ripetuto nell'if che verifica se ci sono metriche filtrate
    // dd(!empty($this->_metrics_advanced_datamart));
    if (!empty($this->_metrics_advanced_datamart)) {
      // dd('metriche filtrate presenti');
      // _metrics_advanced_datamart : "\n{$metric->aggregateFn}($tableName.'{$metric->alias}') AS '{$metric->alias}'"
      // sono presenti metriche filtrate
      $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamartName}\n*/\n";
      $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS ";
      $sql .= "\n(SELECT{$this->_fieldsSQL}";
      $leftJoin = null;

      if (property_exists($this, 'baseMeasures') && $this->_metrics_base_datamart) $sql .= ", $this->_metrics_base_datamart";
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
      $s = "SELECT $this->_fieldsSQL";
      if (property_exists($this, 'baseMeasures')) $s .= ", $this->_metrics_base_datamart";
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
      $s .= "\nFROM decisyon_cache.$this->baseTableName";
      $s .= "\nGROUP BY $this->_fieldsSQL";
      $sql = "/*Creazione DATAMART finale :\n{$this->datamartName}\n*/\nCREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS\n($s);";
    }
    /* vecchio metodo, prima di MyVerticaGrammar.php
      $FX = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE TABLE_NAME='FX_$this->reportId' AND SCHEMA_NAME='decisyon_cache';");
      // dd($FX);
      if ($FX) DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.FX_$this->reportId;");
    */
    if ($mode === 'sql') {
      return $sql;
    } else {
      if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($this->datamartName)) {
        // dd('la tabella già esiste, la elimino');
        $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.{$this->datamartName};");
        if (!$drop) {
          // null : tabella eliminata, ricreo di nuovo il datamart
          $result = DB::connection('vertica_odbc')->statement($sql);
        } else {
          $result = "Errore : tabella non eliminata";
        }
      } else {
        // dd('Datamart non presente, lo creo');
        $result = DB::connection('vertica_odbc')->statement($sql);
      }
      // TODO: Intercettare l'errore in caso di tabella non creata, in caso di errore bisogna eliminare
      // le temp table relative a $this->reportId

      if (!$result) {
        // TODO: aggiungere un controllo sulla drop delle tabelle temporanee
        $dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$this->baseTableName;");
        // elimino anche le tabelle temporanee delle metriche filtrate
        if (count($this->_metrics_advanced_datamart) !== 0) {
          foreach ($this->_metrics_advanced_datamart as $tableName => $aliasM) {
            //dd($tableName);
            $dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
          }
        }
        // dd($this->_metricTable);
        // ritorno il nome della FX in modo da poter mostrare un anteprima dei dati
        // dd($sql);
        return $this->datamartName;
      }
    }
  }
} // End Class
