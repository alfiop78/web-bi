<?php
namespace App\Classes;
use Illuminate\Support\Facades\DB;

class Cube {
	private $_select, $_fields = array(), $_fieldsSQL, $_columns = array(), $_from, $_and, $_where, $_reportFilters, $_metricFilters, $_reportMetrics, $_compositeMetrics, $_compositeTables, $_groupBy, $_sql, $_metricTable;
	private $reportName;
	private $reportId;
	private $_metrics_base, $_metrics_base_datamart;
	private $_metrics_advanced_datamart = array();
	private $_composite_sql_formula;
	private $_composite_metrics = array();
	private $_datamartColumns = array();

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

	// creo elenco delle colonne da aggiungere alle tabelle temporanee (base e metric)
	public function fields() {
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

	public function select($columns) {
		$fieldList = array();
		$this->_select = "SELECT";
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
		$this->_select .= implode(", ", $fieldList);
		// dd($this->_select);
		// var_dump($this->_columns);
	}

	public function from($from) {
		// per ogni dimensione esistente vado a aggiungere, in this->_from, i FROM che si trovano al suo interno
		$this->_from = "FROM\n" . implode(",\n", $from);
		// dd($this->_from);
	}

	public function where($joins) {
		$i = 0;
		// joins = "token_join" : ['table.field', 'table.field']
		foreach ($joins as $join) {
			$relation = implode(" = ", $join);
			$this->_where .= ($i === 0) ? "WHERE\n$relation " : "\nAND $relation ";
			$i++;
		}
		// dd($this->_where);
	}

	public function joinFact($joins) {
        // definisco la join tra l'ultima tabella della gerarchia e la FACT.
        // se è presente una sola tabella nella dimensione, la prop 'where' sarà vuota, per cui, qui, invece della AND dovrò usare la WHERE iniziale e le successive join con la AND
		$this->_ands = array();
        $this->_and = (!$this->_where) ? "WHERE\n " : "AND " ;
		// $this->_and = " AND ";
		foreach ($joins as $dim) {
			// var_dump($dim);
			foreach ($dim as $cube) {
				// var_dump($cube);
				foreach ($cube as $join) $this->_ands[] = implode(" = ", $join);
			}
		}
		
		$this->_and .= implode("\nAND ", $this->_ands);
		// dd($this->_and);
	}

	public function filters($tables) {
		// definisco i filtri del report
		$and = "\nAND ";
		foreach ($tables as $table) {
			// var_dump($table);
			foreach ($table as $filter) {
				$this->_reportFilters .= $and.$filter;
			}
		}
		// var_dump($this->_reportFilters);
	}

	public function metrics() {
		// metriche di base
		$metrics_base = array();
		$metrics_base_datamart = array();
		foreach ($this->baseMetrics as $metric) {
			// print_r($metric->name);
			// TODO: devo eliminare le proprietà tableAlias e table per le metriche composte legate al cubo (metriche di primo livello definite sul cubo es.: (table.field-2 * table.field-2))
			if ( (!property_exists($metric, 'table')) && (!property_exists($metric, 'tableAlias')) ) {
				// è una metrica composta a livello di cubo
				$metrics_base[] = "\n{$metric->SQLFunction}({$metric->field}) AS '{$metric->alias}'";
			} else {
				// $metrics_base è utilizzato in baseTable()
				$metrics_base[] = "\n{$metric->SQLFunction}({$metric->tableAlias}.{$metric->field}) AS '{$metric->alias}'";
			}
			// $metrics_base_datamart è utilizzato in createDatamart(), conterrà la tabella temporanea invece della tabella di origine
			$metrics_base_datamart[] = "\n{$metric->SQLFunction}({$this->baseTable}.'{$metric->alias}') AS '{$metric->alias}'";
			// verifico se la metrica in ciclo è presente in una metrica composta
			if (property_exists($this, 'compositeMetrics')) $this->buildCompositeMetrics("W_AP_base_$this->reportId", $metric);
		}
		$this->_metrics_base = implode(", ", $metrics_base);
		$this->_metrics_base_datamart = implode(", ", $metrics_base_datamart);
		// dd($this->_metrics_base);
		// dd($this->_metrics_base_datamart);
	}

	public function groupBy($groups) {
		$fieldList = array();
		$this->_groupBy = "GROUP BY";
		foreach ($groups as $key => $object) {
			/* var_dump($key); // il nome dato alla colonna */
			/* print_r($object); // contiene l'object {table : tabella, field: campo, alias : alias, SQL : formulSQL} */
			/* var_dump($object->table); */
			foreach ($object->field as $token => $field) {
				$fieldList[] = "\n{$object->tableAlias}.{$field->id->field}";
				$fieldList[] = "{$object->tableAlias}.{$field->ds->field}";
			}			
		}
		$this->_groupBy .= implode(", ", $fieldList);
		// dd($this->_groupBy);
	}

	private function buildCompositeMetrics($tableName, $metricObject) {
		// converto la formula delle metriche composte da : ( metric_name * metric_name) -> (W_AP_base_*.metric_alias * W_AP_base_*.metric_alias)
		// verifico se, tra le metriche che compongono la composta, ci sono metriche di base o avanzate (filtrate)
		foreach ($this->compositeMetrics as $name => $metric) {
			// per ogni metrica che compone la composta vado a sostituire la formula prendendola dalla metrica originale.
			// il nome della metrica contenuto nella formula si verrà sostituito da nome_tabella.metric_alias
			// echo $name;
			// print_r($metric->metrics_alias);
			foreach ($metric->metrics_alias as $metricName => $metricAlias) {
				// la prop 'metrics_alias' : {metric_name : metric_alias}
				// print_r($this->baseMetrics);
				if ($metricObject->name === $metricName) {
					foreach ($metric->formula_sql as $key => $sqlItem) {
						$aggregate = $metricObject->SQLFunction;
						if ($sqlItem === $metricName) {$metric->formula_sql[$key] = "$aggregate($tableName.'$metricAlias')";}
					}
				}
			}
			// aggiungo l'alias della metrica composta
			$this->_composite_sql_formula[$name] = $metric->formula_sql;
			// var_dump($this->_composite_sql_formula);
			// $this->_composite_sql_formula = implode(" ", $metric->formula_sql);
		}
	}

	public function baseTable() {
		// creo una TEMP_TABLE su cui, successivamente andrò a fare una LEFT JOIN con le TEMP_TABLE contenenti le metriche
		$this->_sql = $this->_select;
		// se ci sono metriche a livello di report le aggiungo
		// se un report contiene solo metriche filtrate non avrà metriche di base
		if (!is_null($this->_metrics_base)) {$this->_sql .= ", $this->_metrics_base";}
		$this->_sql .= "\n$this->_from";
		$this->_sql .= "\n$this->_where";
		$this->_sql .= "\n$this->_and";
		if (isset($this->_reportFilters)) {$this->_sql .= "$this->_reportFilters";}
		if (!is_null($this->_groupBy)) {$this->_sql .= "\n$this->_groupBy";}
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

	public function createMetricDatamarts() {
		/* creo i datamart necessari per le metriche filtrate */
		$i = 1;
		// dd($this->filteredMetrics);
		foreach ($this->filteredMetrics as $metrics) {
			// dd($metrics);
			unset($this->_sql);
			$metric = "\n{$metrics->SQLFunction}({$metrics->tableAlias}.{$metrics->field}) AS '{$metrics->alias}'";
			$this->_metrics_advanced_datamart[] = "\n{$metrics->SQLFunction}(W_AP_metric_{$this->reportId}_{$i}.'{$metrics->alias}') AS '{$metrics->alias}'";
			// verifico se sono presenti metriche composte e sostituisco questa metrica all'interno delle metriche composte
			// echo "verifico compositeMetrics";
			// dd(property_exists($this, 'compositeMetrics'));
			if (property_exists($this, 'compositeMetrics')) $this->buildCompositeMetrics("W_AP_metric_{$this->reportId}_{$i}", $metrics);
			$this->createMetricTable('W_AP_metric_'.$this->reportId."_".$i, $metric, $metrics->filters);
			$this->_metricTable["W_AP_metric_".$this->reportId."_".$i] = $metrics->alias; // memorizzo qui quante tabelle per metriche filtrate sono state create
			$i++;
		}
	}

	// creo la tabella temporanea che contiene metriche filtrate
	private function createMetricTable($tableName, $metric, $filters) {
		// dd($filters);		
		$this->_sql = "{$this->_select},{$metric}";
		$this->_sql .= "\n$this->_from";
		$this->_sql .= "\n$this->_where";
		$this->_sql .= "\n$this->_and";
		$this->_sql .= $this->_reportFilters;
		// aggiungo i filtri della metrica
		foreach ($filters as $filter) {
			$this->_metricFilters .= "AND {$filter->alias}.{$filter->formula}";
		}
		// dd($this._metricFilters);
		$this->_sql .= "\n$this->_metricFilters";
		if (!is_null($this->_groupBy)) {$this->_sql .= "\n$this->_groupBy";}

		$sql = "CREATE TEMPORARY TABLE decisyon_cache.$tableName ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->_sql);";
		// dd($sql);
		// TODO: eliminare la tabella temporanea come fatto per baseTable
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
		$table = "FX_$this->reportId";
		//verifico se esistono metriche composte
		// dd($this->compositeMetrics);
		// $this->compositeMetrics();
		// se _metricTable ha qualche metrica (sono metriche filtrate) allora procedo con la creazione FX con LEFT JOIN, altrimenti creo una singola FX
		// dd($this->_metricTable);
		$table_fields = array();
		foreach ($this->_fields as $field) {
			$table_fields[] = "\n$this->baseTable.$field";
		}
		$this->_fieldsSQL = implode(", ", $table_fields);
		if (!is_null($this->_metricTable)) {
			// sono presenti metriche filtrate
			$sql = "CREATE TABLE $this->datamartName INCLUDE SCHEMA PRIVILEGES AS ";			
			$sql .= "\n(SELECT {$this->_fieldsSQL}";
			if (property_exists($this, 'baseMetrics')) $sql .= ", $this->_metrics_base_datamart";
			if (property_exists($this, 'filteredMetrics')) {
				$sql .= ",";
				$sql .= implode(", ", $this->_metrics_advanced_datamart);
			}
			$leftJoin = null;
			$ONClause = array();
			$ONConditions = NULL;
			foreach ($this->_metricTable as $metricTableName => $alias) {
				$leftJoin .= "\nLEFT JOIN\ndecisyon_cache.$metricTableName\nON ";
				foreach ($this->_columns as $columnAlias) {
					// carattere backtick con ALTGR+'
					// creo : ON W_AP_base_3.sede = W_AP_metric_3_1.sede
					$ONClause[] = "{$this->baseTable}.{$columnAlias} = {$metricTableName}.{$columnAlias}";
				}
				$ONConditions = implode("\nAND ", $ONClause);
				unset($ONClause);
				$leftJoin .= $ONConditions;
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
			$sql .= "\nFROM\ndecisyon_cache.$this->baseTable";
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
			$s .= "\nFROM decisyon_cache.$this->baseTable";
			$s .= "\nGROUP BY $this->_fieldsSQL";
			// dd($s);
			$sql = "CREATE TABLE $this->datamartName INCLUDE SCHEMA PRIVILEGES AS\n($s);";
		}
		// dd($sql);
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
			$dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$this->baseTable;");
			// TODO: elimino le tabelle temporanee delle metriche filtrate
			// se sono state create anche tabelle con metriche filtrate le elimino
			// echo "tabelle temporanee da eliminare";
			if ($this->_metricTable) {
				foreach ($this->_metricTable as $tempTable => $metric) {
					// dd($tempTable);
					$dropTemp = DB::connection('vertica_odbc')->statement("DROP TABLE decisyon_cache.$tempTable;");
				}
			}
			// dd($this->_metricTable);
			// ritorno il nome della FX in modo da poter mostrare un anteprima dei dati
			return $this->datamartName;
		}
	}

} // End Class
