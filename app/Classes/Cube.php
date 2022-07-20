<?php

namespace App\Classes;

use Illuminate\Support\Facades\DB;

class Cube
{
  private $SELECT, $_fields = array(), $_columns = array(), $_sql;
  private $FROM_baseTable = array();
  private $FROM_metricTable = array();
  private $WHERE_metricTable = array();
  private $WHERE_baseTable = array();
  private $groupBy;
  private $filters_baseTable = array();
  private $reportId;
  private $_metrics_base, $_metrics_base_datamart;
  private $_metrics_advanced_datamart = array();
  private $_composite_sql_formula;
  private $_composite_metrics = array();

  public function __get($value)
  {
    return $this->$value;
  }

  public function __set($prop, $value)
  {
    $this->$prop = $value;
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
    foreach ($this->baseColumns as $key => $object) {
      foreach ($object->field as $token => $field) {
        $this->_fields[] = "'{$object->alias}_id'";
        $this->_fields[] = "'{$object->alias}_ds'";
      }
    }
  }

  public function select($columns)
  {
    $fieldList = array();
    $this->SELECT = "SELECT";
    foreach ($columns as $key => $object) {
      /* var_dump($key); // il nome dato alla colonna */
      /* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
      /* var_dump($object->table); */
      foreach ($object->field as $token => $field) {
        $fieldList[] = "\n{$object->tableAlias}.{$field->id->field} AS '{$object->alias}_id'";
        $fieldList[] = "{$object->tableAlias}.{$field->ds->field} AS '{$object->alias}_ds'";
        // $fieldList[] = "{$object->table}.{$object->field} AS '{$object->alias}'";
        $this->_columns[] = "{$object->alias}_id"; // questo viene utilizzato nella clausola ON della LEFT JOIN
      }
    }
    $this->SELECT .= implode(", ", $fieldList);
    // dd($this->SELECT);
    /*
		es.:
			SELECT\n
			CodSedeDealer_765.Descrizione AS 'sede_id', CodSedeDealer_765.Descrizione AS 'sede_ds'
		*/
    // var_dump($this->_columns);
  }

  /*
	* il metodo from verrà invocato per creare la baseTable e, successivamente, verrà invocato per aggiungere, nella FROM, una tabella appartenente a una metrica filtrata
	* che, al suo interno, avrà un filtro appartenente a una tabella NON inclusa nella baseTable
	*/
  public function from($from)
  {
    foreach ($from as $table) {
      if (!in_array($table, $this->FROM_baseTable)) $this->FROM_baseTable[] = $table;
    }
    // dd($this->FROM_baseTable);
    /* es.:
			array:4 [
				0 => "automotive_bi_data.Azienda AS Azienda_997"
				1 => "automotive_bi_data.CodSedeDealer AS CodSedeDealer_765"
				2 => "automotive_bi_data.DocVenditaIntestazione AS DocVenditaIntestazione_055"
				3 => "automotive_bi_data.DocVenditaDettaglio AS DocVenditaDettaglio_560"
			]
		*/
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
    foreach ($joins as $join) {
      // var_dump($join);
      $relation = implode(" = ", $join);
      // var_dump($join);
      // l'aggiungo solo se non esiste già questa relazione, da testare con le metriche filtrate andando a selezionare una metrica contenente un filtro che appartiene a una join già inserita in baseTable
      if (!in_array($join, $this->WHERE_baseTable)) $this->WHERE_baseTable[] = $relation;
    }
    // dd($this->WHERE_baseTable);
    /*
		es.:
			WHERE\n
			Azienda_997.id = CodSedeDealer_765.id_Azienda \n
			AND CodSedeDealer_765.id = DocVenditaIntestazione_055.id_CodSedeDealer \n
			AND DocVenditaIntestazione_055.NumRifInt = DocVenditaDettaglio_560.NumRifInt \n
			AND DocVenditaIntestazione_055.id_Azienda = DocVenditaDettaglio_560.id_Azienda 
		*/
  }

  private function setWhereMetricTable($joins)
  {
    $this->WHERE_metricTable = array();
    foreach ($joins as $join) {
      $relation = implode(" = ", $join);
      // l'aggiungo solo se non esiste già questa relazione, da testare con le metriche filtrate andando a selezionare una metrica contenente un filtro che appartiene a una join già inserita in baseTable
      if (!in_array($join, $this->WHERE_metricTable)) $this->WHERE_metricTable[] = $relation;
    }
  }

  public function filters($filters)
  {
    // definisco i filtri del report
    // dd($filters);
    // $and = "\nAND ";
    foreach ($filters as $filter) {
      // dd($filter); // filter_name => alias_table.field = value
      // $this->filters_baseTable .= $and.$filter->SQL;
      if (!in_array($filter->SQL, $this->filters_baseTable)) $this->filters_baseTable[] = $filter->SQL;
    }
    //dd($this->filters_baseTable);
    /*
        es.:
        AND Azienda_997.id = 473\n
        AND DocVenditaDettaglio_560.DataDocumento >= 20220601
        */
  }

  /*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica filtrata.
		Stessa logica del Metodo filters()
	*/
  private function setFiltersMetricTable($filters)
  {
    $this->filters_metricTable = [];
    foreach ($filters as $filter) {
      if (!in_array($filter->SQL, $this->filters_metricTable)) $this->filters_metricTable[] = $filter->SQL;
    }
  }

  public function metrics()
  {
    // metriche di base
    $metrics_base = array();
    $metrics_base_datamart = array();
    // dd($this->baseMetrics);
    foreach ($this->baseMetrics as $metricName => $metric) {
      var_dump($metric);
      if ($metric->metric_type === 1 || $metric->metric_type === 3) {
        // metrica composta di base oppure metrica composta di base con filtri
        // per queste metriche la prop 'field' contiene la formula es.: DocVenditaDettaglio_560.PrzMedioPond * DocVenditaDettaglio_560.Quantita
        $metrics_base[] = "\nNVL({$metric->SQLFunction}({$metric->field}), 0) AS '{$metric->alias}'";
        // SUM(DocVenditaDettaglio_560.PrzMedioPond * DocVenditaDettaglio_560.Quantita) AS 'alias'
      } else {
        // $metrics_base è utilizzato in baseTable()
        $metrics_base[] = "\nNVL({$metric->SQLFunction}({$metric->tableAlias}.{$metric->field}), 0) AS '{$metric->alias}'";
      }
      // $metrics_base_datamart è utilizzato in createDatamart(), conterrà la tabella temporanea invece della tabella di origine
      $metrics_base_datamart[] = "\nNVL({$metric->SQLFunction}({$this->baseTableName}.'{$metric->alias}'), 0) AS '{$metric->alias}'";
      // verifico se la metrica in ciclo è presente in una metrica composta
      if (property_exists($this, 'compositeMetrics')) $this->buildCompositeMetrics($this->baseTableName, $metric);
    }
    $this->_metrics_base = implode(", ", $metrics_base);
    $this->_metrics_base_datamart = implode(", ", $metrics_base_datamart);
    // dd($this->_metrics_base);
    // dd($this->_metrics_base_datamart);
  }

  public function groupBy($groups)
  {
    $fieldList = array();
    $this->groupBy = "GROUP BY";
    foreach ($groups as $key => $object) {
      /* var_dump($key); // il nome dato alla colonna */
      /* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
      /* var_dump($object->table); */
      foreach ($object->field as $token => $field) {
        $fieldList[] = "\n{$object->tableAlias}.{$field->id->field}";
        $fieldList[] = "{$object->tableAlias}.{$field->ds->field}";
      }
    }
    $this->groupBy .= implode(", ", $fieldList);
    // dd($this->_groupBy);
  }

  private function buildCompositeMetrics($tableName, $metricObject)
  {
    // converto la formula delle metriche composte da : ( metric_name * metric_name) -> (W_AP_base_*.metric_alias * W_AP_base_*.metric_alias)
    // verifico se, tra le metriche che compongono la composta, ci sono metriche di base o avanzate (filtrate)
    foreach ($this->compositeMetrics as $name => $metric) {
      //dd($metric->formula->metrics_alias);
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
          // la metrica passata come argomento è inclusa nella formula della metrica composta
          foreach ($metric->formula->formula_sql as $key => $sqlItem) {
            // la formula composta come array è ad es.: [ "(", "przmedio(nome_metrica)", "*", "quantita(nome_metrica)", ")"]
            // ciclo ogni elemento per sostituire il nome della metrica con la formula contenuta in SQLFunction
            $aggregate = $metricObject->SQLFunction;
            if ($sqlItem === $metricName) {
              // se l'elemento in ciclo è il nome di una metrica lo sostituisco con : SUM(table_name.alias) lasciando invariati gli elementi parentesi, operatori, ecc...
              $metric->formula->formula_sql[$key] = "NVL($aggregate($tableName.'$metricAlias->alias'), 0)";
            }
          }
        }
      }
      // aggiungo l'alias della metrica composta
      $this->_composite_sql_formula[$name] = $metric->formula->formula_sql;
      // var_dump($this->_composite_sql_formula);
      // $this->_composite_sql_formula = implode(" ", $metric->formula_sql);
    }
    // dd($this->_composite_sql_formula);
  }

  public function baseTable($mode)
  {
    // creo una TEMP_TABLE su cui, successivamente andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
    $this->_sql = $this->SELECT;
    // se ci sono metriche a livello di report le aggiungo
    // se un report contiene solo metriche filtrate non avrà metriche di base
    if (!is_null($this->_metrics_base)) {
      $this->_sql .= ", $this->_metrics_base";
    }
    $this->_sql .= "\nFROM\n" . implode(",\n", $this->FROM_baseTable);
    $this->_sql .= "\nWHERE\n" . implode("\nAND ", $this->WHERE_baseTable);
    if (count($this->filters_baseTable)) $this->_sql .= "\nAND " . implode("\nAND ", $this->filters_baseTable);
    $this->_sql .= "\n$this->groupBy";
    $comment = "/*\nCreazione tabella BASE :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
    //dd($this->_sql);
    // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $this->_sql;";
    //dd($sql);
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
  public function createMetricDatamarts($mode)
  {
    foreach ($this->groupMetricsByFilters as $groupToken => $m) {
      $arrayMetrics = [];
      $tableName = "WEB_BI_TMP_METRIC_{$this->reportId}_{$groupToken}";
      foreach ($m as $metric) {
        unset($this->_sql);
        if ($metric->metric_type === 3) {
          // metrica composta a livello cubo filtrata (es. : prezzo * quantita impostato sul cubo con filtro)
          $arrayMetrics[$metric->alias] = "NVL({$metric->SQLFunction}({$metric->field}), 0) AS '{$metric->alias}'";
        } else {
          // metrica filtrata
          $arrayMetrics[$metric->alias] = "NVL({$metric->SQLFunction}({$metric->tableAlias}.{$metric->field}), 0) AS '{$metric->alias}'";
        }
        // var_dump($arrayMetrics);
        // _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
        // TODO: aggiungere documentazione per _metrics_advanced_datamart
        $this->_metrics_advanced_datamart[$tableName][$metric->alias] = "\nNVL({$metric->SQLFunction}($tableName.'{$metric->alias}'), 0) AS '{$metric->alias}'";
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
    // in alcuni casi, come ad esempio le metriche filtrate che hanno dei filtri sulla FACT, non è presente la prop 'WHERE'
    if (count($this->WHERE_metricTable) !== 0) {
      $this->_sql .= "\nWHERE\n" . implode("\nAND ", array_merge($this->WHERE_baseTable, $this->WHERE_metricTable));
    } else {
      $this->_sql .= "\nWHERE\n" . implode("\nAND ", $this->WHERE_baseTable);
    }
    // aggiungo i filtri del report e i filtri contenuti nella metrica
    $this->_sql .= "\nAND " . implode("\nAND ", array_merge($this->filters_baseTable, $this->filters_metricTable));
    $this->_sql .= "\n$this->groupBy";
    //dd($this->_sql);
    $comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($metrics)) . "\n*/\n";

    $sql = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->_sql);";
    // TODO: eliminare la tabella temporanea come fatto per baseTable
    // dd($sql);
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
      // _metrics_advanced_datamart : "\n{$metric->SQLFunction}($tableName.'{$metric->alias}') AS '{$metric->alias}'"
      // sono presenti metriche filtrate
      $comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamartName}\n*/\n";
      $sql = "{$comment}CREATE TABLE decisyon_cache.{$this->datamartName} INCLUDE SCHEMA PRIVILEGES AS ";
      $sql .= "\n(SELECT{$this->_fieldsSQL}";
      $leftJoin = null;

      if (property_exists($this, 'baseMetrics')) $sql .= ", $this->_metrics_base_datamart";
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
        // dd($this->_composite_sql_formula);
        foreach ($this->_composite_sql_formula as $metric_name => $formula) {
          $this->_composite_metrics[] = implode(" ", $formula);
        }
        $sql .= ",\n";
        $sql .= implode(",\n", $this->_composite_metrics);
        // dd($this->_composite_metrics);
      }
      $sql .= "\nFROM\ndecisyon_cache.$this->baseTableName";
      $sql .= "$leftJoin\nGROUP BY $this->_fieldsSQL);";
    } else {
      /*
            creazione metrica composta nella tabella baseTable (metriche non filtrate) 2022-05-12
            SELECT W_AP_base_1652367363055.'sid_id', W_AP_base_1652367363055.'sid_ds', W_AP_base_1652367363055.'sede_id', W_AP_base_1652367363055.'sede_ds', ( SUM(W_AP_base_1652367363055.'comp-przmedio-alias') * SUM(W_AP_base_1652367363055.'comp-qta') ) AS 'composite-costo'
            FROM decisyon_cache.W_AP_base_1652367363055
            GROUP BY W_AP_base_1652367363055.'sid_id', W_AP_base_1652367363055.'sid_ds', W_AP_base_1652367363055.'sede_id', W_AP_base_1652367363055.'sede_ds');
            */
      $s = "SELECT $this->_fieldsSQL";
      if (property_exists($this, 'baseMetrics')) $s .= ", $this->_metrics_base_datamart";
      if (property_exists($this, 'compositeMetrics')) {
        // sono presenti metriche composte
        foreach ($this->_composite_sql_formula as $metric_name => $formula) {
          $this->_composite_metrics[] = implode(" ", $formula);
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
