<?php
namespace App\Classes;
use Illuminate\Support\Facades\DB;

class Cube {
	private $_select, $_columns = array(), $_from, $_and, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_metrics, $_groupBy, $_sql, $_metricTable;
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
			$fieldList[] = "{$object->table}.{$object->field} AS '{$object->alias}'";
			/* $fieldList[] = "{$object->table}.{$object->field} AS `{$object->alias}`"; mysql */
			$this->_columns[] = $object->alias; // questo viene utilizzato nella clausola ON della LEFT JOIN
			/*foreach ($object as $key => $value) {
				// var_dump($key);
				// var_dump($value);
				$fieldList[] = $param->table.".".$field." AS '".$param->alias."'";
				$this->_columns[] = $param->alias;
			}*/
		}
		$this->_select .= implode(", ", $fieldList);
		/* var_dump($this->_select); */
	}

	public function n_from($from) {
		// per ogni dimensione esistente vado a aggiungere, in this->_from, i FROM che si trovano al suo interno
		$this->_from = " FROM " . implode(", ", $from);
		// var_dump($this->_from);
	}

	public function n_where($joins) {
		$i = 0;
		foreach ($joins as $joinId) {
			foreach ($joinId as $join) {
				$relation = implode(" = ", $join);
				($i === 0) ? $this->_where .= " WHERE ".$relation : $this->_where .= " AND " . $relation;
				$i++;
			}
		}
		// var_dump($this->_where);
	}

	public function joinFact($joins) {
		$this->_ands = array();
		$this->_and = " AND ";
		foreach ($joins as $dim) {
			// var_dump($dim);
			foreach ($dim as $cube) {
				// var_dump($cube);
				foreach ($cube as $join)
				$this->_ands[] = implode(" = ", $join);
			}
		}
		// foreach ($joins as $join) {
		// 	$this->_ands[] = implode(" = ", $join);
		// }
		$this->_and .= implode(" AND ", $this->_ands);
		// var_dump($this->_and);
	}

	public function filters($tables) {
		/* definisco i filtri del report*/
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
			//$metricsList[] = $metric->SQLFunction."(".$metric->table.".".$metric->field.") AS '".$metric->alias."'";
			$metricsList[] = "{$metric->SQLFunction}({$metric->table}.{$metric->field}) AS '{$metric->alias}'";
			/* $metricsList[] = "{$metric->SQLFunction}({$metric->table}.{$metric->field}) AS `{$metric->alias}`"; mysql*/
		}
		$this->_metrics = implode(", ", $metricsList);
		// var_dump($this->_metrics);
	}

	public function n_groupBy($groups) {
		$fieldList = array();
		$this->_groupBy = " GROUP BY ";

		foreach ($groups as $key => $object) {
			/* var_dump($key); // il nome dato alla colonna */
			/* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
			/* var_dump($object->table); */
			$fieldList[] = "{$object->table}.{$object->field}";
		}
		$this->_groupBy .= implode(", ", $fieldList);
		/* var_dump($this->_groupBy); */
	}

	public function baseTable() {
		// TODO: creo una VIEW/TABLE senza metriche su cui, dopo, andrò a fare una left join con le VIEW/TABLE che contengono le metriche
		$this->_sql = $this->_select; //.", ".$this->_metrics."\n";
		// se ci sono metriche a livello di report le aggiungo
		if ($this->_metrics) {$this->_sql .= ", $this->_metrics\n";}
		$this->_sql .= $this->_from."\n";
		$this->_sql .= $this->_where."\n";
		$this->_sql .= $this->_and."\n";
		if (isset($this->_reportFilters)) {$this->_sql .= $this->_reportFilters."\n";}

		if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}
        // l'utilizzo di ON COMMIT PRESERVE ROWS consente, alla PROJECTION, di avere i dati all'interno della tempTable fino alla chiusura della sessione, altrimenti vertica non memorizza i dati nella temp table
		$sql = "CREATE TEMPORARY TABLE decisyon_cache.W_AP_base_".$this->reportId." ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS ".$this->_sql.";";
		// $sql = "CREATE TABLE decisyon_cache.W_AP_base_".$this->reportId." INCLUDE SCHEMA PRIVILEGES AS ".$this->_sql.";"; // funziona
		// $result = DB::connection('vertica_odbc')->raw($sql);
		// $result = DB::connection('vertica_odbc')->statement($sql); // creata vuota
		$result = DB::connection('vertica_odbc')->statement($sql);
		// $test = DB::connection('vertica_odbc')->select("SELECT * FROM decisyon_cache.W_AP_base_".$this->reportId);
		// $result = DB::connection('vertica_odbc')->statement(DB::connection('vertica_odbc')->raw($sql)); creata vuota
        // $result = $sql;

		// return $this->reportId;
		return $result;
	}

	public function createMetricDatamarts($filteredMetrics) {
		/* creo i datamart necessari per le metriche filtrate */
		$i = 1;
		// var_dump($filteredMetrics);
		foreach ($filteredMetrics as $metrics) {
			//echo $metrics;

			unset($this->_sql);
			$metric = "{$metrics->SQLFunction}({$metrics->table}.{$metrics->field}) AS `{$metrics->alias}`";
			echo $this->createMetricTable('W_AP_metric_'.$this->reportId."_".$i, $metric, $metrics->filters);
			// a questo punto metto in relazione (left) la query baseTable con la/e metriche contenenti filtri
			$this->_metricTable["W_AP_metric_".$this->reportId."_".$i] = $metrics->alias; // memorizzo qui quante tabelle per metriche filtrate sono state create
			$i++;
		}
	}

	private function createMetricTable($tableName, $metric, $filters) {
		// var_dump($filters);

		$this->_sql = $this->_select.", ".$metric."\n";
		$this->_sql .= $this->_from."\n";
		$this->_sql .= $this->_where."\n";
		$this->_sql .= $this->_and."\n";
		$this->_sql .= $this->_reportFilters."\n";

		foreach ($filters as $filter) {
			$this->_metricFilters .= " AND {$filter->formula}";
		}

		$this->_sql .= $this->_metricFilters."\n";
		if (!is_null($this->_groupBy)) {$this->_sql .= $this->_groupBy;}

		$sql = "CREATE TEMPORARY TABLE decisyon_cache.".$tableName." ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS ".$this->_sql.";";
		// return $sql;
		return DB::connection('vertica_odbc')->statement($sql);
	}

	public function createDatamart() {
		// TODO: https://dev.mysql.com/doc/refman/8.0/en/create-table-select.html Il create table può essere migliorato impostando il datatype per ogni colonna e un id univoco
		$baseTableName = "W_AP_base_".$this->reportId;
		$datamartName = "decisyon_cache.FX_".$this->reportId;
		// se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX

		$sql = "CREATE TABLE $datamartName AS ";
		$sql .= "(SELECT $baseTableName.*, ";

		if (isset($this->_metricTable) && count($this->_metricTable) > 0) {
			$table_and_metric = array();
			$leftJoin = null;
			$ONClause = array();
			$ONConditions = NULL;
			// var_dump($this->_columns);
			foreach ($this->_metricTable as $metricTableName => $alias) {
				$table_and_metric[] = "'$metricTableName'.'$alias'";
				$leftJoin .= "\nLEFT JOIN decisyon_cache.$metricTableName ON ";

				foreach ($this->_columns as $columnAlias) {
					// carattere backtick con ALTGR+'
					$ONClause[] = "'".$baseTableName."'.'".$columnAlias."' = '".$metricTableName."'.'".$columnAlias."'";
				}
				$ONConditions = implode(" AND ", $ONClause);
				unset($ONClause);
				// var_dump($ONConditions);
				$leftJoin .= "$ONConditions";
			}
			// echo $leftJoin;

			/*
			DATAMART DA GENERARE
			select W_AP_base_3.*, `W_AP_metric_3_1`.`Listino`, `W_AP_metric_3_2`.`sconto` FROM W_AP_base_3
							  LEFT JOIN W_AP_metric_3_1 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_1`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_1`.`Sede`
							  LEFT JOIN W_AP_metric_3_2 ON `W_AP_base_3`.`Cod.Sede` = `W_AP_metric_3_2`.`Cod.Sede` AND `W_AP_base_3`.`Sede` = `W_AP_metric_3_2`.`Sede`
			*/

			$tables = implode(", ", $table_and_metric); //`W_AP_metric_3_1`.`sconto`, `W_AP_metric_3_2`.`listino`

			$sql .= $tables;
			$sql .= "\nFROM decisyon_cache.$baseTableName";
			$sql .= $leftJoin.");";

		} else {
			$sql = "CREATE TABLE $datamartName INCLUDE SCHEMA PRIVILEGES AS (SELECT * FROM decisyon_cache.$baseTableName);";
		}
		// var_dump($sql);
		$res = DB::connection('vertica_odbc')->statement($sql);
		if (!$res) return $datamartName;
	}

} // End Class
