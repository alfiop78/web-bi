<?php

namespace App\Classes;

use Illuminate\Support\Facades\DB;
use Exception;

class Cube
{
  private $SELECT, $_fields = array(), $_columns = array(), $_sql;
  private $FROM_baseTable = array();
  private $FROM_metricTable = array();
  private $WHERE_metricTable = array(), $WHERE_timingFn = array();
  private $WHERE_baseTable = array(), $WHERE_timeDimension = array();
  private $groupBy;
  private $segmented = array();
  private $filters_baseTable = array();
  private $reportId;
  private $_metrics_base, $_metrics_base_datamart;
  private $_metrics_advanced_datamart = array();
  private $_composite_sql_formula;
  private $_composite_metrics = array();
  private $cm = array();

  public function __get($value)
  {
    return $this->$value;
  }

  public function __set($prop, $value)
  {
    $this->$prop = $value;
  }

  public function sheetFields()
  {
    // verrà creato un array con l'elenco delle colonne da inserire nella creazione del datamart, sia nella clausola SELECT che in quella GROUP BY
    /*
			array:4 [
				0 => "'sid_id'"
				1 => "'sid_ds'"
				2 => "'sede_id'"
				3 => "'sede_ds'"
			]
		*/
    // dd($this->baseColumns);
    // field contiene un object con {token_colonna : {proprietà della colonna}}
    foreach ($this->baseColumns as $column) {
      // dd($column);
      // ... per ogni colonna
      // all'interno delle tabelle ci sono i token che corrispondo ognuno a una colonna id-ds
      foreach ($column->field as $key => $value) {
        // key : id/ds
        $this->_fields[] = "{$column->name}_{$key}";
        // $table_field = implode("", $value->sql);
        // $this->_fields[] = "{$table_field}_{$key}";
      }
    }
    // dd($this->_fields);
    /* array:2 [
      0 => "descrizione_id"
      1 => "descrizione_ds"
    ] */
  }

  public function select($columns)
  {
    $fieldList = array();
    $this->SELECT = "SELECT\n";
    // dd($columns);
    foreach ($columns as $column) {
      if (property_exists($column, 'sql')) {
        foreach ($column->sql as $fieldType => $field) {
          $fieldList["{$column->name}_{$fieldType}"] = implode($field) . " AS {$column->name}_{$fieldType}"; // $fieldType : id/ds
          $this->_columns[] = "{$column->name}_id"; // questo viene utilizzato nella clausola ON della LEFT JOIN
        }
      }
    }
    // dd($fieldList);
    foreach ($fieldList as $name => $field) {
      $this->json__info->columns->{$name} = (object)[
        "sql" => $field
      ];
    }
    $this->SELECT .= implode(",\n ", $fieldList);
    // dd($this->SELECT);
    /*
		es.:
			SELECT\n
      CodSedeDealer_765.Descrizione AS sede_id,
      CodSedeDealer_765.Descrizione AS sede_ds
		*/
    // var_dump($this->_columns);
  }

  public function sheetSelect($columns)
  {
    $fieldList = array();
    $this->SELECT = "SELECT\n";
    // dd($columns);
    // per ogni tabella
    foreach ($columns as $column) {
      // ... per ogni colonna
      // dd($column);
      foreach ($column->field as $key => $value) {
        // key: id/ds
        // $fieldList["{$column->name}_{$key}"] = "{$column->tableAlias}.{$value->field} AS {$column->name}_{$key}"; // $fieldType : id/ds
        $fieldList["{$column->name}_{$key}"] = implode("", $value->sql) . " AS {$column->name}_{$key}"; // $fieldType : id/ds
        $this->_columns[] = "{$column->name}_id"; // questo viene utilizzato nella clausola ON della LEFT JOIN
      }
    }
    // dd($fieldList);
    $this->SELECT .= implode(",\n ", $fieldList);
    // dd($this->SELECT);
    /*
		es.:
			SELECT\n
      CodSedeDealer_765.Descrizione AS sede_id,
      CodSedeDealer_765.Descrizione AS sede_ds
		*/
    // var_dump($this->_columns);
  }

  /*
	* il metodo from verrà invocato per creare la baseTable e, successivamente, verrà invocato per aggiungere, nella FROM, una tabella appartenente a una metrica filtrata
	* che, al suo interno, avrà un filtro appartenente a una tabella NON inclusa nella baseTable
	*/
  public function sheetFrom($from)
  {
    // dd($from);
    foreach ($from as $alias => $prop) {
      $this->FROM_baseTable[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
    }
    // dd($this->FROM_baseTable);
    /* foreach ($this->FROM_baseTable as $tableName => $sql) {
      $this->json__info->from->{$tableName} = (object)[
        "sql" => $sql
      ];
    } */
    /* es.:
			array:4 [
				aliasTable => "automotive_bi_data.Azienda AS Azienda_997"
				aliasTable => "automotive_bi_data.CodSedeDealer AS CodSedeDealer_765"
				aliasTable => "automotive_bi_data.DocVenditaIntestazione AS DocVenditaIntestazione_055"
				aliasTable => "automotive_bi_data.DocVenditaDettaglio AS DocVenditaDettaglio_560"
			]
		*/
  }


  // creo elenco delle colonne da aggiungere alle tabelle temporanee (base e metric)
  public function fields()
  {
    // verrà creato un array con l'elenco delle colonne da inserire nella creazione del datamart, sia nella clausola SELECT che in quella GROUP BY
    /*
			array:4 [
				0 => "'sid_id'"
				1 => "'sid_ds'"
				2 => "'sede_id'"
				3 => "'sede_ds'"
			]
		*/
    // dd($this->baseColumns);
    foreach ($this->baseColumns as $object) {
      if (property_exists($object, 'sql')) {
        foreach ($object->sql as $token => $field) {
          $this->_fields[] = "{$object->name}_{$token}";
        }
      }
    }
    // dd($this->_fields);
  }

  public function groupBy($groups)
  {
    $fieldList = array();
    $this->groupBy = "GROUP BY\n";
    foreach ($groups as $column) {
      if (property_exists($column, 'sql')) {
        foreach ($column->sql as $fieldType => $field) {
          /* $fieldImploded = implode($field);
          $fieldList["{$column->name}"] = $fieldImploded;
          var_dump($fieldList); */
          $fieldList["{$column->name}_{$fieldType}"] = implode($field); // $fieldType : id/ds
        }
      }
    }
    // dd($fieldList);
    foreach ($fieldList as $name => $field) {
      $this->json__info->groupBy->{$name} = (object)[
        "sql" => $field
      ];
    }
    $this->groupBy .= implode(",\n", $fieldList);
    // dd($this->groupBy);
  }

  public function sheetGroupBy($groups)
  {
    $fieldList = array();
    $this->groupBy = "GROUP BY\n";
    foreach ($groups as $column) {
      foreach ($column->field as $key => $value) {
        // $fieldList["{$column->name}_{$key}"] = "{$column->tableAlias}.{$value->field}"; // $fieldType : id/ds
        $fieldList["{$column->name}_{$key}"] = implode("", $value->sql);
        // $fieldList[$column->name] = "{$column->tableAlias}.{$value->field}"; // $fieldType : id/ds
        array_push($this->segmented, "{$column->name}_{$key}");
      }
    }
    // dd($fieldList);
    $this->groupBy .= implode(",\n", $fieldList);
    // dd($this->groupBy);
    // dd($this->segmented);
    if (count($this->segmented) > 48) {
      $segmented = implode(",\n", $this->segmented);
      $this->groupBy .= "\nSEGMENTED BY HASH({$segmented}) ALL NODES";
    }
    // dd($this->groupBy);
  }

  /*
	* il metodo from verrà invocato per creare la baseTable e, successivamente, verrà invocato per aggiungere, nella FROM, una tabella appartenente a una metrica filtrata
	* che, al suo interno, avrà un filtro appartenente a una tabella NON inclusa nella baseTable
	*/
  public function from($from)
  {
    foreach ($from as $tableName => $sql) {
      // if (!in_array($table, $this->FROM_baseTable)) $this->FROM_baseTable[] = $table;
      $this->FROM_baseTable[$tableName] = $sql;
    }
    // dd($this->FROM_baseTable);
    foreach ($this->FROM_baseTable as $tableName => $sql) {
      $this->json__info->from->{$tableName} = (object)[
        "sql" => $sql
      ];
    }
    /* es.:
			array:4 [
				0 => "automotive_bi_data.Azienda AS Azienda_997"
				1 => "automotive_bi_data.CodSedeDealer AS CodSedeDealer_765"
				2 => "automotive_bi_data.DocVenditaIntestazione AS DocVenditaIntestazione_055"
				3 => "automotive_bi_data.DocVenditaDettaglio AS DocVenditaDettaglio_560"
			]
		*/
  }

  private function setSheetFromMetricTable($from)
  {
    /* $this->FROM_metricTable = array();
    // dd($from);
    foreach ($from as $table) {
      if ((!in_array($table, $this->FROM_metricTable)) && (!in_array($table, $this->FROM_baseTable))) $this->FROM_metricTable[] = $table;
    } */
    $this->FROM_metricTable = array();
    foreach ($from as $alias => $prop) {
      $this->FROM_metricTable[$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";
    }
    // dd($this->FROM_baseTable, $this->FROM_metricTable);
  }


  private function setFromMetricTable($from)
  {
    $this->FROM_metricTable = array();
    foreach ($from as $table) {
      if ((!in_array($table, $this->FROM_metricTable)) && (!in_array($table, $this->FROM_baseTable))) $this->FROM_metricTable[] = $table;
    }
    //dd($this->FROM_baseTable, $this->FROM_metricTable);
  }

  /*
	* Utilizzo della stessa logica di FROM
	* @param joins = "token_join" : ['table.field', 'table.field']
	*/
  public function where($joins)
  {
    // dd($joins);
    foreach ($joins as $token => $join) {
      // var_dump($join);
      $relation = implode(" = ", $join);
      // var_dump($join);
      /* le join relative alla TIME le inserisco in un altro array e non in WHERE_baseTable, altrimenti verrà aggiunta
        la join riguardante la time anche sulle metriche filtrate
      */
      // if (!in_array($join, $this->WHERE_baseTable)) $this->WHERE_baseTable[$token] = $relation;
      if ($token === 'time') {
        // if (!in_array($token, $this->WHERE_timeDimension)) $this->WHERE_timeDimension[$token] = $relation;
        $this->WHERE_timeDimension[$token] = $relation;
        foreach ($this->WHERE_timeDimension as $token => $value) {
          $this->json__info->where->{$token} = (object)[
            "sql" => $value
          ];
        }
      } else {
        // if (!in_array($token, $this->WHERE_baseTable)) $this->WHERE_baseTable[$token] = $relation;
        $this->WHERE_baseTable[$token] = $relation;
        foreach ($this->WHERE_baseTable as $token => $value) {
          $this->json__info->where->{$token} = (object)[
            "sql" => $value
          ];
        }
      }
    }
    // dd($this->WHERE_baseTable, $this->WHERE_timeDimension);
    /*
		es.:
			WHERE\n
			Azienda_997.id = CodSedeDealer_765.id_Azienda \n
			AND CodSedeDealer_765.id = DocVenditaIntestazione_055.id_CodSedeDealer \n
			AND DocVenditaIntestazione_055.NumRifInt = DocVenditaDettaglio_560.NumRifInt \n
			AND DocVenditaIntestazione_055.id_Azienda = DocVenditaDettaglio_560.id_Azienda
		*/
  }

  /*
	* Utilizzo della stessa logica di FROM
	* @param joins = "token_join" : ['table.field', 'table.field']
	*/
  public function sheetWhere($joins)
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
    /* foreach ($joins as $token => $join) {
      // dd($token, $join);
      $this->WHERE_baseTable[$token] = implode(" = ", $join);
    } */
    // dd($this->WHERE_baseTable, $this->WHERE_timeDimension);
    /*
			WHERE\n
      es.:
			Azienda_997.id = CodSedeDealer_765.id_Azienda \n
			AND CodSedeDealer_765.id = DocVenditaIntestazione_055.id_CodSedeDealer \n
			AND DocVenditaIntestazione_055.NumRifInt = DocVenditaDettaglio_560.NumRifInt \n
			AND DocVenditaIntestazione_055.id_Azienda = DocVenditaDettaglio_560.id_Azienda
		*/
  }

  private function setWhereMetricTable($joins)
  {
    $this->WHERE_metricTable = array();
    // dd($joins);
    foreach ($joins as $token => $join) {
      $relation = implode(" = ", $join);
      // TODO:da testare con le metriche filtrate andando a selezionare una metrica contenente un filtro che appartiene a una join già inserita in baseTable
      // if (!in_array($join, $this->WHERE_metricTable) && !in_array($join, $this->WHERE_baseTable)) $this->WHERE_metricTable[] = $relation;
      if (!in_array($token, $this->WHERE_metricTable) && !in_array($token, $this->WHERE_baseTable)) $this->WHERE_metricTable[$token] = $relation;
    }
    // dd($this->WHERE_metricTable);
  }

  private function setSheetWhereMetricTable($joins)
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


  public function filters($filters)
  {
    // definisco i filtri del report
    // dd($filters);
    // $and = "\nAND ";
    // test creazione json da utilizzare per sql_info
    foreach ($filters as $filter) {
      // dd($filter); // filter_name => alias_table.field = value
      // $this->filters_baseTable .= $and.$filter->SQL;
      // if (!in_array($filter->formula, $this->filters_baseTable)) $this->filters_baseTable[] = $filter->formula;
      // NOTE: in un array associativo non è necessario verificare se la key esiste, il valore viene sovrascritto.
      $this->filters_baseTable[$filter->name] = $filter->formula;
    }
    // dd($this->filters_baseTable);

    foreach ($this->filters_baseTable as $name => $formula) {
      // echo "<br /><span>$name</span><br />\nAND $formula";
      $this->json__info->filters->{$name} = (object)[
        "sql" => "AND $formula"
      ];
    }
    // dd($this->json__info);
    /*
      es.:
      AND Azienda_997.id = 473\n
      AND DocVenditaDettaglio_560.DataDocumento >= 20220601
    */
  }

  // definisco i filtri del report
  public function sheetFilters($filters)
  {
    // dd($filters);
    foreach ($filters as $filter) {
      // dd($filter);
      // $this->filters_baseTable[$filter->name] = "{$filter->workBook->tableAlias}.{$filter->field} " . implode(" ", $filter->sql);
      $this->filters_baseTable[$filter->name] = implode(" ", $filter->sql);
    }
    // dd($this->filters_baseTable);
  }

  /*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica filtrata.
		Stessa logica del Metodo filters()
	*/
  private function setSheetFiltersMetricTable($filters)
  {
    $this->filters_metricTable = [];
    foreach ($filters as $token => $filter) {
      // dd($filter);
      $timingFunctions = ['last-year', 'last-month', 'altre funzioni temporali...'];
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

  /*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica filtrata.
		Stessa logica del Metodo filters()
	*/
  private function setFiltersMetricTable($filters)
  {
    $this->filters_metricTable = [];
    foreach ($filters as $token => $filter) {
      // dd($token, $filter);
      $timingFunctions = ['last-year', 'year', 'r0f4im9'];
      if (in_array($token, $timingFunctions)) {
        /* è una funzione temporale.
          Aggiungo, alla WHERE la condizione per applicare il filtro last-year.
          Da valutare se utilizzare (MapJSONExtractor(WEB_BI_TIME.last))['year']::DATE = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE
          ...oppure (WEB_BI_TIME.trans_ly) = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE.
        */
        $this->WHERE_timingFn[$token] = implode(" = ", $filter->join);
        // $this->WHERE_timingFn[$token] = "WEB_BI_TIME_055.trans_ly = TO_CHAR(DocVenditaDettaglio_730.DataDocumento)::DATE";
        // dd($this->WHERE_timingFn);
        // dd("(MapJSONExtractor({$filter->table}.{$filter->field}))['$filter->func']::DATE");
      } else {
        // dd($filter->SQL, $this->filters_metricTable, $this->filters_baseTable);
        // se il filtro che si sta per aggiungere non è presente nè nei filtri "base_table" nè in quelli "metric_table" lo aggiungo
        if (!in_array($filter->SQL, $this->filters_metricTable) && !in_array($filter->SQL, $this->filters_baseTable))
          $this->filters_metricTable[] = $filter->SQL;
      }
    }
  }

  public function metrics()
  {
    // metriche di base
    $metrics_base = array();
    $metrics_base_datamart = array();
    // dd($this->baseMetrics);
    foreach ($this->baseMetrics as $metricName => $metric) {
      // dd($metric);
      if ($metric->metric_type === 1 || $metric->metric_type === 3) {
        // metrica composta di base oppure metrica composta di base con filtri
        // per queste metriche la prop 'field' contiene la formula es.: DocVenditaDettaglio_560.PrzMedioPond * DocVenditaDettaglio_560.Quantita
        $metrics_base[] = "\nNVL({$metric->formula->aggregateFn}({$metric->formula->field}), 0) AS '{$metric->formula->alias}'";
        // SUM(DocVenditaDettaglio_560.PrzMedioPond * DocVenditaDettaglio_560.Quantita) AS 'alias'
      } else {
        // $metrics_base è utilizzato in baseTable()
        $metrics_base[] = "\nNVL({$metric->formula->aggregateFn}({$metric->formula->tableAlias}.{$metric->formula->field}), 0) AS '{$metric->formula->alias}'";
      }
      // $metrics_base_datamart è utilizzato in createDatamart(), conterrà la tabella temporanea invece della tabella di origine
      // if ($metric->show_datamart === 'true') $metrics_base_datamart[] = "\nNVL({$metric->aggregateFn}({$this->baseTableName}.'{$metric->alias}'), 0) AS '{$metric->alias}'";
      $metrics_base_datamart[] = "\nNVL({$metric->formula->aggregateFn}({$this->baseTableName}.'{$metric->formula->alias}'), 0) AS '{$metric->formula->alias}'";
      // verifico se la metrica in ciclo è presente in una metrica composta
      if (property_exists($this, 'compositeMetrics')) $this->buildCompositeMetrics($this->baseTableName, $metric);
    }
    $this->_metrics_base = implode(", ", $metrics_base);
    $this->_metrics_base_datamart = implode(", ", $metrics_base_datamart);
    // dd($this->_metrics_base);
    // dd($this->_metrics_base_datamart);
  }

  public function sheetMetrics()
  {
    // metriche di base
    $metrics_base = array();
    $metrics_base_datamart = array();
    // dd($this->sheetBaseMetrics);
    foreach ($this->sheetBaseMetrics as $value) {
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

  private function buildCompositeMetrics($tableName, $metricObject)
  {
    // $nestedComposite = array();
    // converto la formula delle metriche composte da : ( metric_name * metric_name) -> (WEB_BI_TMP_BASE_*.metric_alias * WEB_BI_TMP_BASE_*.metric_alias)
    // verifico se, tra le metriche che compongono la composta, ci sono metriche di base o avanzate (filtrate)
    foreach ($this->compositeMetrics as $token => $metric) {
      // dd($token);
      // if ($metric->token === 'ixzormyn9gl') dd($metric);
      /* formula->metrics_alias
                {
                    +"venduto": {
                        +"token": "j4ltl3spu5m"
                        +"alias": "venduto"
                    }
                    +"costo": {
                        +"token": "iah28jfj7s"
                        +"alias": "costo"
                    }
                }
            */
      // per ogni metrica che compone la composta vado a sostituire la formula prendendola dalla metrica originale.
      // il nome della metrica contenuto nella formula verrà sostituito da nome_tabella.metric_alias
      // echo $name;
      // print_r($metric->metrics_alias);
      foreach ($metric->formula->metrics_alias as $metricName => $metricAlias) {
        // la prop 'metrics_alias' : {metric_name : {token : ...., alias : metric_alias}
        if ($metricObject->name === $metricName) {
          // echo $metricName;
          // la metrica passata come argomento è inclusa nella formula della metrica composta
          foreach ($metric->formula->formula_sql as $key => $sqlItem) {
            // la formula composta come array è ad es.: [ "(", "przmedio(nome_metrica)", "*", "quantita(nome_metrica)", ")"]
            // ciclo ogni elemento per sostituire il nome della metrica con la formula contenuta in aggregateFn
            $aggregate = $metricObject->formula->aggregateFn;
            if ($sqlItem === $metricName) {
              // se l'elemento in ciclo è il nome di una metrica lo sostituisco con : SUM(table_name.alias) lasciando invariati gli elementi parentesi, operatori, ecc...
              $metric->formula->formula_sql[$key] = "NVL($aggregate($tableName.'$metricAlias->alias'), 0)";
            }
          }
        }
      }
      // aggiungo la formula della metrica composta
      $this->_composite_sql_formula[$metric->name] = ['alias' => $metric->formula->alias, 'formula' => $metric->formula->formula_sql];
    }
    // dd($this->_composite_sql_formula);
  }

  private function createCompositeMetrics()
  {
    // verifico se le metrica composta, in ciclo, è presente in altre metriche composte.
    // dd($this->compositeMetrics);
    foreach ($this->compositeMetrics as $cMetric) {
      // dd($this->_composite_sql_formula);
      // in _composite_sql_formula sono già state aggiunte metriche composte provenienti dall'elaborazione delle metriche di base/avanzate
      foreach ($this->_composite_sql_formula as $metricName => $alias_formula) {
        // $alias_formula contiene 2 array, uno ha l'alias della metrica composta già definita in buildCompositeMetrics, l'altro array contiene la formula, già definita allo stesso modo
        // se, nelle metriche composte già definite (in _composite_sql_formula), ne è presente qualcuna che si trova anche in un'altra metrica allora ne recupero la formula
        if (property_exists($cMetric->formula->metrics_alias, $metricName)) {
          // la metrica composta è presente anche in un'altra metrica composta
          foreach ($cMetric->formula->formula_sql as $key => $sql_item) {
            // sostituisco il nome della metrica con la sua formula prendendola data _composite_sql_formula.
            if ($sql_item === $metricName) {
              $cMetric->formula->formula_sql[$key] = implode(" ", $alias_formula['formula']);
              $this->_composite_sql_formula[$cMetric->name] = ['alias' => $cMetric->formula->alias, 'formula' => $cMetric->formula->formula_sql];
            }
          }
        }
      }
    }
    // dd($this->compositeMetrics);
    // dd($this->_composite_sql_formula);
  }

  public function sheetBaseTable($mode)
  {
    // creo una TEMP_TABLE su cui, successivamente, andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
    // dd($this->SELECT);
    $this->_sql = $this->SELECT;
    // se ci sono metriche a livello di report le aggiungo
    // se un report contiene solo metriche filtrate non avrà metriche di base
    if (!is_null($this->_metrics_base)) {
      // dd('_metrics_base ' . $this->_metrics_base);
      $this->_sql .= ", $this->_metrics_base";
    }
    $this->_sql .= "\nFROM\n" . implode(",\n", $this->FROM_baseTable);
    $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timeDimension));
    if (count($this->filters_baseTable)) $this->_sql .= "\nAND " . implode("\nAND ", $this->filters_baseTable);
    $this->_sql .= "\n$this->groupBy";
    // $this->_sql .= "\n$this->groupBy LIMIT 20";
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

  public function baseTable($mode)
  {
    // creo una TEMP_TABLE su cui, successivamente andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
    $this->_sql = $this->SELECT;
    // se ci sono metriche a livello di report le aggiungo
    // se un report contiene solo metriche filtrate non avrà metriche di base
    if (!is_null($this->_metrics_base)) {
      // dd('_metrics_base ' . $this->_metrics_base);
      $this->_sql .= ", $this->_metrics_base";
    }
    $this->_sql .= "\nFROM\n" . implode(",\n", $this->FROM_baseTable);
    $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_timeDimension));
    if (count($this->filters_baseTable)) $this->_sql .= "\nAND " . implode("\nAND ", $this->filters_baseTable);
    $this->_sql .= "\n$this->groupBy";
    $comment = "/*\nCreazione tabella BASE :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
    //dd($this->_sql);
    // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $this->_sql;";
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
        $result = DB::connection('vertica_odbc')->statement($sql);
        // dd('la tabella non esiste');
      }
    }
    return $result;
  }

  /* creo i datamart necessari per le metriche filtrate */
  public function sheetCreateMetricDatamarts($mode)
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
        $this->setSheetFiltersMetricTable($metric->filters);
        // per ogni filtro presente nella metrica
        foreach ($metric->filters as $filter) {
          if (property_exists($filter, 'from')) $this->setSheetFromMetricTable($filter->from);
          // aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
          // se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
          // dd($filter->joins);
          (property_exists($filter, 'joins')) ? $this->setSheetWhereMetricTable($filter->joins) : $this->WHERE_metricTable = array();
        }
        // dd($this->filters_baseTable, $this->filters_metricTable, $this->WHERE_timingFn);
      }
      // dd($arrayMetrics);
      // dd($this->_metrics_advanced_datamart);
      // creo il datamart, passo a createMetricTable il nome della tabella temporanea e l'array di metriche che lo compongono
      if ($mode === 'sql') {
        $sqlFilteredMetrics[] = $this->sheetCreateMetricTable($tableName, $arrayMetrics, $mode);
      } else {
        $this->sheetCreateMetricTable($tableName, $arrayMetrics, null);
      }
    }
    if ($mode === 'sql') return $sqlFilteredMetrics;
  }

  /* creo i datamart necessari per le metriche filtrate */
  public function createMetricDatamarts($mode)
  {
    foreach ($this->groupMetricsByFilters as $groupToken => $m) {
      $arrayMetrics = [];
      $tableName = "WEB_BI_TMP_METRIC_{$this->reportId}_{$groupToken}";
      foreach ($m as $metric) {
        unset($this->_sql);
        // var_dump($metric);
        if ($metric->metric_type === 3) {
          // metrica composta a livello cubo filtrata (es. : prezzo * quantita impostato sul cubo con filtro)
          $arrayMetrics[$metric->formula->alias] = "NVL({$metric->formula->aggregateFn}({$metric->formula->field}), 0) AS '{$metric->formula->alias}'";
        } else {
          // metrica filtrata
          $arrayMetrics[$metric->formula->alias] = "NVL({$metric->formula->aggregateFn}({$metric->formula->tableAlias}.{$metric->formula->field}), 0) AS '{$metric->formula->alias}'";
        }
        // var_dump($arrayMetrics);
        // _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
        // TODO: aggiungere documentazione per _metrics_advanced_datamart
        $this->_metrics_advanced_datamart[$tableName][$metric->formula->alias] = "\nNVL({$metric->formula->aggregateFn}($tableName.'{$metric->formula->alias}'), 0) AS '{$metric->formula->alias}'";
        // verifico se sono presenti metriche composte che contengono la metrica in ciclo, stessa logica utilizzata per le metriche di base
        if (property_exists($this, 'compositeMetrics')) $this->buildCompositeMetrics($tableName, $metric);

        // aggiungo la FROM inclusa nella metrica filtrata alla FROM_baseTable
        $this->setFromMetricTable($metric->FROM);
        // dd($this->FROM_baseTable, $this->FROM_metricTable);
        // aggiungo i filtri presenti nella metrica filtrata ai filtri già presenti sul report
        $this->setFiltersMetricTable($metric->filters);
        // dd($this->filters_baseTable);
        // aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
        // se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
        (property_exists($metric, 'WHERE')) ? $this->setWhereMetricTable($metric->WHERE) : $this->WHERE_metricTable = array();
        // dd($this->WHERE_baseTable);
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

  // creo la tabella temporanea che contiene metriche filtrate
  /*
	* @param $metric : SUM(tableAlias.field) AS 'alias'
	*/
  private function createMetricTable($tableName, $metrics, $mode)
  {
    // dd($filters);
    $this->fromFilteredMetric = NULL;
    $this->_sql = "{$this->SELECT},\n" . implode(",\n", $metrics);
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
    $this->_sql .= "\n$this->groupBy";
    //dd($this->_sql);
    $comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($metrics)) . "\n*/\n";

    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->_sql);";
    // TODO: eliminare la tabella temporanea come fatto per baseTable
    dd($sql);
    if ($mode === 'sql') {
      $result = $sql;
    } else {
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
    }
    /* vecchio metodo, senza MyVerticaGrammar.php
        $table = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE TABLE_NAME='$tableName' AND SCHEMA_NAME='decisyon_cache';");
        // dd($tables);
        if ($table) DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
        */
    return $result;
  }

  private function sheetCreateMetricTable($tableName, $metrics, $mode)
  {
    // dd('sheetCreateMetricTable');
    $this->fromFilteredMetric = NULL;
    $this->_sql = "{$this->SELECT},\n" . implode(",\n", $metrics);
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
    $this->_sql .= "\n$this->groupBy";
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

  public function sheetCreateDatamart($mode)
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

      if (property_exists($this, 'sheetBaseMetrics') && $this->_metrics_base_datamart) $sql .= ", $this->_metrics_base_datamart";
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
      if (property_exists($this, 'sheetBaseMetrics')) $s .= ", $this->_metrics_base_datamart";
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

  // creo il datamart finale, mettendo insieme, base table con metric table (LEFT JOIN)
  public function createDatamart($mode)
  {
    // dd($this->_metricTable);
    // TODO: commentare tutta la logica
    $table_fields = array();
    foreach ($this->_fields as $field) {
      $table_fields[] = "\n$this->baseTableName.$field";
    }
    $this->_fieldsSQL = implode(",", $table_fields);
    if (!is_null($this->_metrics_advanced_datamart)) {
      // _metrics_advanced_datamart : "\n{$metric->aggregateFn}($tableName.'{$metric->alias}') AS '{$metric->alias}'"
      // sono presenti metriche filtrate
      $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamartName}\n*/\n";
      $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS ";
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

      if (property_exists($this, 'compositeMetrics')) {
        $this->createCompositeMetrics();
        foreach ($this->_composite_sql_formula as $alias_formula) {
          // dd($alias_formula['formula']);
          $this->_composite_metrics[] = "NVL(" . implode(" ", $alias_formula['formula']) . ", 0) AS '{$alias_formula["alias"]}'";
        }
        $sql .= ",\n";
        // dd($this->_composite_metrics);
        $sql .= implode(",\n", $this->_composite_metrics);
        // dd($this->_composite_metrics);
      }
      $sql .= "\nFROM\ndecisyon_cache.$this->baseTableName";
      $sql .= "$leftJoin\nGROUP BY $this->_fieldsSQL);";
    } else {
      $s = "SELECT $this->_fieldsSQL";
      if (property_exists($this, 'baseMetrics')) $s .= ", $this->_metrics_base_datamart";
      if (property_exists($this, 'compositeMetrics')) {
        $this->createCompositeMetrics();
        // sono presenti metriche composte
        foreach ($this->_composite_sql_formula as $alias_formula) {
          $this->_composite_metrics[] = implode(" ", $alias_formula['formula']) . " AS '{$alias_formula["alias"]}'";
        }
        $s .= ",\n";
        $s .= implode(", ", $this->_composite_metrics);
      }
      $s .= "\nFROM decisyon_cache.$this->baseTableName";
      $s .= "\nGROUP BY $this->_fieldsSQL";
      // dd($s);
      $sql = "/*Creazione DATAMART finale :\n{$this->datamartName}\n*/\nCREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS\n($s);";
    }
    // dd($sql);
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
        return $this->datamartName;
      }
    }
  }
} // End Class
