<?php
namespace App\Classes;
use Illuminate\Support\Facades\DB;

class Cube {
	private $_select, $_columns = array(), $_from, $_and, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_metrics, $_compositeMetrics, $_groupBy, $_sql, $_metricTable;
	private $reportName;
	private $reportId;

	// function __construct($fact_table) {
	//   $this->fact = $fact_table;
	//   $this->connect = new ConnectDB('automotive_bi_data');
	//   $this->connect->openConnection();
	// }

	public function __get($value) {
		return $this->$value;
	}

	public function __set($prop, $value) {
		$this->$prop = $value;
	}

	public function n_select($columns) {
		$fieldList = array();
		$this->_select = "SELECT ";

		foreach ($columns as $key => $object) {
			/* var_dump($key); // il nome dato alla colonna */
			/* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
			/* var_dump($object->table); */
			foreach ($object->field as $token => $field) {
				$fieldList[] = "{$object->tableAlias}.{$field->id->field} AS '{$object->alias}_id'";
				$fieldList[] = "{$object->tableAlias}.{$field->ds->field} AS '{$object->alias}_ds'";
				// $fieldList[] = "{$object->table}.{$object->field} AS '{$object->alias}'";
				$this->_columns[] = "{$object->alias}_id"; // questo viene utilizzato nella clausola ON della LEFT JOIN
			}
		}
		$this->_select .= implode(", ", $fieldList);
		// var_dump($this->_select);
		// var_dump($this->_columns);
	}

	public function n_from($from) {
		// per ogni dimensione esistente vado a aggiungere, in this->_from, i FROM che si trovano al suo interno
		$this->_from = " FROM " . implode(", ", $from);
		// var_dump($this->_from);
	}

	public function n_where($joins) {
		$i = 0;
		// joins = "token_join" : ['table.field', 'table.field']
		foreach ($joins as $join) {
			$relation = implode(" = ", $join);
			$this->_where .= ($i === 0) ? " WHERE $relation " : " AND $relation ";
			$i++;
		}
		// var_dump($this->_where);
	}

	public function joinFact($joins) {
        // definisco la join tra l'ultima tabella della gerarchia e la FACT.
        // se è presente una sola tabella nella dimensione, la prop 'where' sarà vuota, per cui, qui, invece della AND dovrò usare la WHERE iniziale e le successive join con la AND
		$this->_ands = array();
        $this->_and = (!$this->_where) ? " WHERE " : " AND " ;
		// $this->_and = " AND ";
		foreach ($joins as $dim) {
			// var_dump($dim);
			foreach ($dim as $cube) {
				// var_dump($cube);
				foreach ($cube as $join) $this->_ands[] = implode(" = ", $join);
			}
		}
		
		$this->_and .= implode(" AND ", $this->_ands);
		// var_dump($this->_and);
	}

	public function filters($tables) {
		// definisco i filtri del report
		$and = " AND ";
		foreach ($tables as $table) {
			// var_dump($table);
			foreach ($table as $filter) {
				$this->_reportFilters .= $and.$filter;
			}
		}
		// var_dump($this->_reportFilters);
	}

	public function metrics($metrics) {
		// metriche non filtrate
		$metricsList = array();
		//var_dump($metrics);
		foreach ($metrics as $metric) {
			// var_dump($metric);
			$metricsList[] = "{$metric->SQLFunction}({$metric->tableAlias}.{$metric->field}) AS '{$metric->alias}'";
		}
		$this->_metrics = implode(", ", $metricsList);
		// dd($this->_metrics);
	}

	// metriche composte
	public function compositeMetrics($metrics) {
		$metricsList = array();
		//var_dump($metrics);
		foreach ($metrics as $metric) {
			// var_dump($metric);
			$metricsList[] = "{$metric->formula_sql} AS '{$metric->alias}'";
		}
		$this->_compositeMetrics = implode(", ", $metricsList);
		// dd($this->_compositeMetrics);
	}

	public function n_groupBy($groups) {
		$fieldList = array();
		$this->_groupBy = " GROUP BY ";

		foreach ($groups as $key => $object) {
			/* var_dump($key); // il nome dato alla colonna */
			/* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
			/* var_dump($object->table); */
			// $fieldList[] = "{$object->table}.{$object->field}";
			foreach ($object->field as $token => $field) {
				$fieldList[] = "{$object->tableAlias}.{$field->id->field}";	
				$fieldList[] = "{$object->tableAlias}.{$field->ds->field}";	
			}			
		}
		$this->_groupBy .= implode(", ", $fieldList);
		/* var_dump($this->_groupBy); */
	}

	public function baseTable() {
		// creo una TEMP_TABLE su cui, successivamente andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
		$this->_sql = $this->_select;
		// se ci sono metriche a livello di report le aggiungo
		if ($this->_metrics) {$this->_sql .= ", $this->_metrics";}
		if ($this->_compositeMetrics) {$this->_sql .= ", $this->_compositeMetrics\n";}
		$this->_sql .= $this->_from."\n";
		$this->_sql .= $this->_where."\n";
		$this->_sql .= $this->_and."\n";
		if (isset($this->_reportFilters)) {$this->_sql .= $this->_reportFilters."\n";}

		if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}
		// dd($this->_sql);
        // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
		$sql = "CREATE TEMPORARY TABLE decisyon_cache.W_AP_base_$this->reportId ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS $this->_sql;";
		// $result = DB::connection('vertica_odbc')->raw($sql);
        // devo controllare prima se la tabella esiste, se esiste la elimino e poi eseguo la CREATE TEMPORARY...
        /* il metodo getSchemaBuilder() funziona con mysql, non con vertica. Ho creato MyVerticaGrammar.php dove c'è la sintassi corretta per vertica (solo alcuni Metodi ho modificato) */

        if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable('W_AP_base_'.$this->reportId)) {
            // dd('la tabella già esiste, la elimino');
            $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.W_AP_base_$this->reportId;");
            if (!$drop) {
            	// null : tabella eliminata, ricreo la tabella temporanea
				$result = DB::connection('vertica_odbc')->statement($sql);            	
            }
        } else {
        	$result = DB::connection('vertica_odbc')->statement($sql);
            // dd('la tabella non esiste');
        }

		return $result;
	}

	public function createMetricDatamarts($filteredMetrics) {
		/* creo i datamart necessari per le metriche filtrate */
		$i = 1;
		// var_dump($filteredMetrics);
		foreach ($filteredMetrics as $metrics) {
			//echo $metrics;
			unset($this->_sql);
			$metric = "{$metrics->SQLFunction}({$metrics->tableAlias}.{$metrics->field}) AS '{$metrics->alias}'";
			$this->createMetricTable('W_AP_metric_'.$this->reportId."_".$i, $metric, $metrics->filters);
			// echo $this->createMetricTable('W_AP_metric_'.$this->reportId."_".$i, $metric, $metrics->filters);
			$this->_metricTable["W_AP_metric_".$this->reportId."_".$i] = $metrics->alias; // memorizzo qui quante tabelle per metriche filtrate sono state create
			$i++;
		}
	}

	// creo la tabella contenente le metriche filtrate
	private function createMetricTable($tableName, $metric, $filters) {
		// dd($filters);
		$this->_sql = $this->_select.", ".$metric."\n";
		$this->_sql .= $this->_from."\n";
		$this->_sql .= $this->_where."\n";
		$this->_sql .= $this->_and."\n";
		$this->_sql .= $this->_reportFilters."\n";

		foreach ($filters as $filter) {
			$this->_metricFilters .= " AND {$filter->alias}.{$filter->formula}";
		}
		// dd($this._metricFilters);

		$this->_sql .= $this->_metricFilters."\n";
		if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

		$sql = "CREATE TEMPORARY TABLE decisyon_cache.".$tableName." ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS ".$this->_sql.";";
		// return $sql;
		// dd($sql);
        if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($tableName)) {
            // dd('la tabella già esiste, la elimino');
            $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
            if (!$drop) {
            	// null : tabella eliminata, ricreo la tabella temporanea
				$result = DB::connection('vertica_odbc')->statement($sql);
            }
        } else {
        	$result = DB::connection('vertica_odbc')->statement($sql);
            // dd('la tabella non esiste');
        }
        /* vecchio metodo, senza MyVerticaGrammar.php
        $table = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE TABLE_NAME='$tableName' AND SCHEMA_NAME='decisyon_cache';");
        // dd($tables);
        if ($table) DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tableName;");
        */
		return $result;
	}

	// creo il datamart finale, mettendo insieme, base table con metric table (LEFT JOIN)
	public function createDatamart() {
		// TODO: https://dev.mysql.com/doc/refman/8.0/en/create-table-select.html Il create table può essere migliorato impostando il datatype per ogni colonna e un id univoco
		$baseTableName = "W_AP_base_".$this->reportId;
		$datamartName = "decisyon_cache.FX_".$this->reportId;
		$table = "FX_$this->reportId";
		// se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX
		// TODO: le 2 righe successive sono da spostare all'interno della if, fanno parte della logica per la creazione di un datamart con metriche filtrate
		$sql = "CREATE TABLE $datamartName INCLUDE SCHEMA PRIVILEGES AS ";
		$sql .= "(SELECT $baseTableName.*, ";
		if (isset($this->_metricTable) && count($this->_metricTable) > 0) {
			// sono presenti metriche filtrate
			$table_and_metric = array();
			$leftJoin = null;
			$ONClause = array();
			$ONConditions = NULL;
			foreach ($this->_metricTable as $metricTableName => $alias) {
				$table_and_metric[] = "$metricTableName.$alias";
				$leftJoin .= "\nLEFT JOIN decisyon_cache.$metricTableName ON ";
				foreach ($this->_columns as $columnAlias) {
					// carattere backtick con ALTGR+'
					// TODO: da testare dopo la modifica id_ds, la join, al momento viene fatta solo con i campi _id, ulteriori verifiche da fare
					$ONClause[] = "{$baseTableName}.{$columnAlias} = {$metricTableName}.{$columnAlias}";
				}
				$ONConditions = implode(" AND ", $ONClause);
				unset($ONClause);
				$leftJoin .= "$ONConditions";
			}
			/*
			QUERY CHE GENERA IL DATAMART
			select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto` FROM W_AP_base_3
							  LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
							  LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
			*/

			$tables = implode(", ", $table_and_metric); //`W_AP_metric_3_1`.`sconto`, `W_AP_metric_3_2`.`listino`

			$sql .= $tables;
			$sql .= "\nFROM decisyon_cache.$baseTableName";
			$sql .= $leftJoin.");";
			dd($sql);
		} else {
			$sql = "CREATE TABLE $datamartName INCLUDE SCHEMA PRIVILEGES AS (SELECT * FROM decisyon_cache.$baseTableName);";
		}
		/* vecchio metodo, prima di MyVerticaGrammar.php
        $FX = DB::connection('vertica_odbc')->select("SELECT TABLE_NAME FROM v_catalog.all_tables WHERE TABLE_NAME='FX_$this->reportId' AND SCHEMA_NAME='decisyon_cache';");
        // dd($FX);
        if ($FX) DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.FX_$this->reportId;");*/
        if (DB::connection('vertica_odbc')->getSchemaBuilder()->hasTable($table)) {
            // dd('la tabella già esiste, la elimino');
            $drop = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$table;");
            if (!$drop) {
            	// null : tabella eliminata, ricreo la tabella temporanea
				$result = DB::connection('vertica_odbc')->statement($sql);
            } else {
            	dd("Errore : tabella non eliminata");
            }
        } else {
        	$result = DB::connection('vertica_odbc')->statement($sql);
            // dd('la tabella non esiste');
        }

		if (!$result) {
			$dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$baseTableName;");
			// TODO: elimino le tabelle temporanee delle metriche filtrate
			// ritorno il nome della FX in modo da poter mostrare un anteprima dei dati
			return $datamartName;
		}
	}

} // End Class
