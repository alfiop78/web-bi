<?php
// TODO: creare le query con QueryBuilder

namespace App\Classes;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;
// aggiunta per utilizzare Config per la connessione a differenti db
use App\Http\Controllers\BIConnectionsController;

class Cube
{
	const SELECT = "SELECT\n";
	const FROM = "\nFROM\n";
	const GROUPBY = "\nGROUP BY\n";
	const WHERE = "\nWHERE\n";
	private $select_clause = [];
	private $from_clause = [];
	private $where_clause = [];
	private $where_time_clause = [];
	private $baseMeasures = NULL;
	private $report_metrics = [];
	private $report_filters = [];
	private $groupby_clause = [];
	private $union_clause = "";
	private $datamart_baseMeasures = [];
	private $datamart_advancedMeasures = [];
	private $sqlAdvancedMeasures = NULL;
	private $FROM_metricTable = []; // Clausola FROM per le metriche avanzate
	private $WHERE_metricTable = []; // Clausola WHERE per le metriche abanzate
	private $WHERE_timingFn = [];
	private $segmented = [];
	private $time_sql = [];
	private $sql_union_clause = [];
	private $operators = ["+", "-", "*", "/", "%"];
	public $results = [];
	public $datamart_fields = [];
	public $compositeMeasures = [];
	public $queries = [];
	// private $ifNullOperator;
	// public $ifNullOperator;

	function __construct($process)
	{
		$this->process = $process;
		$this->user_id = $this->process->{"userId"};
		$this->facts = $this->process->{"facts"};
		$this->datamart_id = $this->process->{"datamartId"};
		// $this->datamart_name = "WEB_BI_{$this->datamart_id}_{$this->user_id}";
		// il report deve necessariamente contenere almeno un livello dimensionale
		// ...quindi $this->process->{fields} sarà sempre presente
		$this->fields = $this->process->{"fields"};
		$this->hierarchiesTimeLevel = $this->process->{"hierarchiesTimeLevel"};
		BIConnectionsController::getDB();
		switch (session('db_driver')) {
			case 'odbc':
				$this->ifNullOperator = 'NVL';
				break;
			case 'mysql':
				$this->ifNullOperator = 'IFNULL';
				break;
			default:
				break;
		}
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
      1 => "'sid'"
      3 => "'sede'"
    ]
  */
	public function datamartFields()
	{
		// dd($this->fields);
		foreach ($this->fields as $token => $column) {
			// $this->datamart_fields[] = $column->name;
			$this->datamart_fields[$token] = $column->name;
		}
		// dd($this->datamart_fields);
	}

	public function selectClause()
	{
		// dump($this->fields);
		// per ogni tabella
		foreach ($this->fields as $token => $column) {
			// dd($column);
			$this->select_clause[$this->factId][$token] = "{$column->SQL} AS {$column->token}";
			// $this->select_clause[$this->factId][$token] = "{$column->SQL} AS '{$column->name}'";

			if (property_exists($this, 'sql_info')) {
				$this->sql_info->{'SELECT'}->{$token} = "{$column->SQL} AS {$column->token}";
				// $this->sql_info->{'SELECT'}->{$token} = "{$column->SQL} AS '{$column->name}'";
				// dd($this->sql_info);
			}
		}
		// dd($this->sql_info);
		// dd($this->select_clause);
	}

	public function createMetrics()
	{
		// metriche di base / base custom
		$this->report_metrics = [];
		foreach ($this->baseMeasures as $token => $value) {
			// dump($value->alias);
			$sql = [];
			if (is_array($value->SQL)) {
				// dd($value->SQL);
				// ciclo gli elementi dell'array $value->SQL per cercare i nomi delle metriche
				foreach ($value->SQL as $element) {
					// dump("element : " . $element);
					// $re = '/[^\.]*$/';
					// NOTE: REGEX cerco tutti caratteri \w dopo il punto. es.: nome_tabella.nome_campo = nome_campo
					$regex = '/[^\.]*\w$/';
					// preg_match_all($re, $str, $matches, PREG_SET_ORDER, 0);
					// preg_match($re, $str, $matches, PREG_OFFSET_CAPTURE, 0);
					preg_match($regex, $element, $matches);
					// dump($matches);
					if ($matches) {
						// FIX: 29.05.2025 L'operatore dovrebbe essere di 3 crt perchè, qui nell'else, faccio un STR_PAD_BOTH
						// quando viene trovato un operatore. nell'array che sto costruendo ($sql) gli operatori dovrebbero
						// essere tutti di 3 crt
						if (in_array(" / ", $sql)) {
							// if (in_array("/", $sql) || in_array(" / ", $sql)) {
							// la formula contiene l'operatore di divisione, imposto il CASE...WHEN
							// OPTIMIZE: 15.05.2025 Molto probabilmente il codice non raggiunge mai l'else di questo operatore ternario, qui
							// perchè il matches cerca i nomi colonna, dopo il punto, quindi è sicuramente una metrica. Anche nell'else (sotto)
							// c'è la stessa logica
							$sql[] = (in_array($matches[0], $value->metrics))
								? "CASE WHEN {$this->ifNullOperator}({$element}, 0) = 0 THEN NULL ELSE {$this->ifNullOperator}({$element}, 0) END"
								: trim($element);
						} else {
							$sql[] = (in_array($matches[0], $value->metrics)) ? "{$this->ifNullOperator}({$element}, 0)" : trim($element);
						}
					} else {
						if (is_null($element)) $element = " ";
						// dump($element);
						// aggiungo uno spazio prima/dopo se $element corrisponde a un operatore [+, -, *, /, %]
						if (in_array($element, $this->operators)) $element = str_pad($element, 3, " ", STR_PAD_BOTH);
						// dump($element);
						$sql[] = $element;
					}
				}
				// dump($sql);
				$metric = implode($sql);
				// dd($metric);
				$this->report_metrics[$this->factId][] = "\n{$value->aggregateFn}($metric) AS {$value->token}";
			} else {
				// formula non in formato array (è una formula con una sola colonna)
				$metric = "\n{$this->ifNullOperator}({$value->aggregateFn}({$value->SQL}), 0) AS {$value->token}";
				$this->report_metrics[$this->factId][] = $metric;
			}
			if (property_exists($this, 'sql_info')) $this->sql_info->{'METRICS'}->{$value->alias} = $metric;
			// verrà inserita nella creazione del datamart finale
			$this->datamart_baseMeasures[] = "{$this->ifNullOperator}({$this->baseTableName}.{$token}, 0) AS \"{$value->alias}\"";
		}
		// dd($this->report_metrics);
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
	public function fromClause()
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
		// dd($this->sql_info);
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
	public function whereClause()
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
			// qui utilizzo la proprietà SQL con implode(' = ', $join->SQL)
			if ($join->type === "TIME") {
				// dd($join);
				if (property_exists($join->from, 'datatype') && property_exists($join->to, 'datatype')) {
					// legame tra TIME e Fact
					// dd($join);
					// dd(($join->from->datatype === $join->to->datatype));
					// $join->from è relativo alla tabella della dimensione TIME, $join->to invece alla tabella collegata (Fact)
					if ($join->from->datatype === $join->to->datatype) {
						// dd(($join->from->datatype === $join->to->datatype));
						// datatype uguali tra il campo della Fact e quello della dimensione Time messo in relazione
						$this->where_time_clause[$this->factId][$join->alias] = implode(" = ", $join->SQL);
					} else {
						// datatype diversi, è necessaria la conversione del campo della tabella Fact.
						// Questo campo, nella join->SQL è posizionata all'indice [0], mentre [1] corrisponde al
						// campo della dimensione TIME
						// dd("datatype diversi");
						switch (session('db_driver')) {
							case 'odbc':
								switch ($join->from->field) {
									case 'id':
										// WB_DATE.id è di tipo DATE, converto il campo proveniente dalla Fact in DATE (non il campo WB_DATE.id)
										$join->SQL[0] = "TO_CHAR({$join->SQL[0]})::DATE";
										break;
									case 'week_id':
										// WB_DATE.week_id è di tipo INTEGER, converto in INT il campo proveniente dalla Fact
										// $join->SQL[0] = "CAST({$join->SQL[0]} AS UNSIGNED)";
										break;
									default:
										break;
								}
								break;
							case 'mysql':
								switch ($join->from->field) {
									case 'id':
										// WB_DATE.id è di tipo DATE, converto il campo proveniente dalla Fact in DATE (non il campo WB_DATE.id)
										$join->SQL[0] = "DATE_FORMAT({$join->SQL[0]}, '%Y-%m-%d')";
										break;
									case 'week_id':
										// WB_DATE.week_id è di tipo INTEGER, converto in INT il campo proveniente dalla Fact
										$join->SQL[0] = "CAST({$join->SQL[0]} AS UNSIGNED)";
										break;
									default:
										break;
								}
								break;
							default:
								break;
						}
					}
				}
				$this->where_time_clause[$this->factId][$join->alias] = implode(" = ", $join->SQL);
				// dd($join->SQL);
				// $this->where_time_clause[$this->factId][$join->alias] = implode(" = ", $join->SQL);

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
		// dd($this->where_time_clause);
		// dd($this->where_clause, $this->where_time_clause);
	}

	public function createFilters()
	{
		foreach ($this->process->{"filters"} as $filter) {
			// $this->report_filters[$this->factId][$filter->name] = implode(' ', $filter->sql);
			$this->report_filters[$this->factId][$filter->name] = $filter->SQL;

			if (property_exists($this, 'sql_info')) $this->sql_info->AND->{$filter->name} = $filter->SQL;
		}
		// dd($this->report_filters);
		// dd($this->sql_info);
	}

	public function groupByClause()
	{
		$this->groupby_clause = [];
		foreach ($this->fields as $token => $column) {
			$this->groupby_clause[$this->factId][$token] = $column->SQL;
			if (property_exists($this, 'sql_info')) {
				$this->sql_info->{'GROUP BY'}->{$token} = $column->SQL;
			}
			array_push($this->segmented, $column->name);
		}
		switch (session('db_driver')) {
			case 'odbc':
				if (count($this->segmented) > 40) {
					$segmented = implode(",\n", $this->segmented);
					$this->groupby_clause['SEGMENTED'] = "\nSEGMENTED BY HASH({$segmented}) ALL NODES";
				}
				break;
			case 'mysql':
				break;
			default:
				break;
		}
		// dd($this->groupby_clause);
	}

	/*
		* Questo Metodo crea la struttura delle query che verrà utilizzata sia per le metriche di base che per
		* quelle avanzate, se il report non contiene metriche di base questa struttura verrà sempre creata
		* per poter calcolare le metriche avanzate
	* */
	public function createBaseQuery()
	{
		// questa struttura viene utilizzata sia per le metriche di base che avanzate
		$this->selectClause();
		$this->fromClause();
		$this->whereClause();
		$this->createFilters();
		$this->groupByClause();
	}

	public function createBaseTable()
	{
		// $this->selectClause();
		// dd(!empty($this->process->baseMeasures));
		$sql = NULL;
		// dump("calcolo metriche di base");
		// dump($this->process->baseMeasures);
		if (!empty($this->process->baseMeasures)) {
			if (property_exists($this->process->baseMeasures, $this->fact)) {
				// metriche per la fact in ciclo presenti
				$this->baseMeasures = $this->process->baseMeasures->{$this->fact};
				$this->createMetrics();
			}
		}
		// dd($this->select_clause[$this->factId]);
		$sql .= self::SELECT . implode(",\n", $this->select_clause[$this->factId]);
		// aggiungo, alla clausola SELECT di $this->baseQuerySQL, le metriche di base da calcolare
		if (!empty($this->report_metrics[$this->factId])) $sql .= "," . implode(", ", $this->report_metrics[$this->factId]);
		$sql .= self::FROM . implode(",\n", $this->from_clause[$this->factId]);
		// dd(empty($this->where_clause));
		if (array_key_exists($this->factId, $this->where_time_clause)) {
			// ci sono casi in cui è presente where_time_clause ma NON where_clause
			if (array_key_exists($this->factId, $this->where_clause)) {
				$sql .= self::WHERE . implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->where_time_clause[$this->factId]));
			} else {
				$sql .= self::WHERE . implode("\nAND ", $this->where_time_clause[$this->factId]);
			}
		} elseif (!empty($this->where_clause)) {
			$sql .= self::WHERE . implode("\nAND ", $this->where_clause[$this->factId]);
		} else {
			$sql .= self::WHERE . "TRUE";
		}
		// dd($sql);
		if (!is_null($this->report_filters[$this->factId])) $sql .= "\nAND " . implode("\nAND ", $this->report_filters[$this->factId]);
		$sql .= self::GROUPBY . implode(",\n", $this->groupby_clause[$this->factId]);
		$this->queries[$this->baseTableName] = $this->datamart_fields;
		// dd($this->queries);
		$comment = "/*\nCreazione tabella per calcolo ... :\ndecisyon_cache.{$this->baseTableName}\n*/\n";
		// dump($sql);
		// dd($sql);
		// ob_flush()
		switch (session('db_driver')) {
			case 'odbc':
				$createStmt = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS ($sql);";
				break;
			case 'mysql':
				$createStmt = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.{$this->baseTableName} AS ($sql);";
				break;
			default:
				break;
		}
		// dd($this->where_clause);
		// dd($createStmt);
		// var_dump($query);
		// dump($createStmt);
		if (property_exists($this, 'sql_info')) {
			return ["raw_sql" => nl2br($createStmt), "format_sql" => $this->sql_info];
			// dd($createStmt);
			// dd($this->sql_info);
		} else {
			return DB::connection(session('db_client_name'))->statement($createStmt);
		}
	}

	// Aggiunta di tabelle "provenienti" dalle metriche avanzate
	private function setFromClause_advancedMeasure($from)
	{
		foreach ($from as $alias => $prop) {
			$this->FROM_metricTable[$this->factId][$alias] = "{$prop->schema}.{$prop->table} AS {$alias}";

			// TODO: da testare con una metrica filtrata contenente la prop 'from'
			if (property_exists($this, 'sql_info')) {
				$this->json_info_advanced[$this->datamart_name_advanced_measures]->FROM->$alias = "{$prop->schema}.{$prop->table} AS {$alias}";
			}
		}
	}

	// Imposto la WHERE in base alle metriche filtrate
	private function setWhereClause_advancedMeasure($joins)
	{
		// dd($joins);
		foreach ($joins as $token => $join) {
			// dd($token, $join);
			if ($join->alias === 'time') {
				dd("test");
				// FIX: l'esecuzione non dovrebbe mai raggiungere questo if perchè, in un filtro
				// con funzioni temporali, queste vengono impostate in setFiltersAdvancedMeasures()
				$this->WHERE_metricTable[$token] = implode(" = ", $join->SQL);

				if (property_exists($this, 'sql_info')) {
					$this->json_info_advanced[$this->datamart_name_advanced_measures]->{'WHERE'}->{$token} = implode(" = ", $join->SQL);
				}
			} else {
				$this->WHERE_metricTable[$this->factId][$token] = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
				if (property_exists($this, 'sql_info')) {
					$this->json_info_advanced[$this->datamart_name_advanced_measures]->WHERE->$token = "{$join->from->alias}.{$join->from->field} = {$join->to->alias}.{$join->to->field}";
				}
			}
		}
		// dd($this->WHERE_metricTable);
		// dd($this->json_info_advanced);
	}

	private function levelYear($timingFunction)
	{
		// ultimo livello del report YEAR
		switch ($timingFunction) {
			case "last-year":
				// metrica last-year
				$this->time_sql = [
					["WB_YEARS.previous", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.id", "WB_DATE.month_id"]
				];
				break;
			case "last-month":
				// metrica last-month
				$this->time_sql = [
					["WB_YEARS.id", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.last", "WB_DATE.month_id"]
				];
				break;
			default:
				break;
		}
	}

	// TEST: 30.09.2024 da testare
	private function levelQuarter($timingFunction)
	{
		// ultimo livello del report YEAR
		switch ($timingFunction) {
			case "last-year":
				// metrica last-year
				$this->time_sql = [
					["WB_YEARS.id", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.previous", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.id", "WB_DATE.month_id"]
				];
				break;
			case "last-month":
				// metrica last-month
				$this->time_sql = [
					["WB_YEARS.id", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.last", "WB_DATE.month_id"]
				];
				break;
			default:
				break;
		}
	}

	private function levelMonth($timingFunction)
	{
		// livello MONTH nel report
		switch ($timingFunction) {
			case "last-year":
				$this->time_sql = [
					["WB_YEARS.id", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.last", "WB_DATE.month_id"]
				];
				break;
			case "last-month":
				$this->time_sql = [
					["WB_YEARS.id", "WB_QUARTERS.year_id"],
					["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
					["WB_MONTHS.previous", "WB_DATE.month_id"]
				];
				break;
			default:
				break;
		}
	}

	/*
		aggiungo a $this->filters_metricTable i filtri presenti su una metrica avanzata.
		Stessa logica del Metodo filters()
	*/
	private function setFiltersAdvancedMeasures($filters)
	{
		$this->filters_metricTable = [];
		// dd($filters);
		foreach ($filters as $token => $filter) {
			// dd($token, $filter);
			// token : es. 'last-month'
			// nella proprietà SQL ci sono le join tra le tabelle TIME
			// TODO: aggiungere le altre funzioni temporali
			$timingFunctions = ['last-year', 'last-month', 'year-to-month'];
			// dd($timingFunctions, $token);
			if (in_array($token, $timingFunctions)) {
				/*
				 * è una funzione temporale. Aggiungo, alla WHERE, la condizione per applicare il filtro temporale.
				*/
				if ($token !== "year-to-month") {
					// creo l'SQL join della dimensione TIME in base al livello più basso presente nel report (year, quarter, month, date)
					// dd($this->hierarchiesTimeLevel);
					switch ($this->hierarchiesTimeLevel) {
						case "WB_MONTHS":
							$this->levelMonth($token);
							break;
						case "WB_QUARTERS":
							$this->levelQuarter($token);
							break;
						case "WB_YEARS":
							$this->levelYear($token);
							break;
						default:
							// non è presente nessun livello della dimensione TIME nel report
							dd("Nessun livello della dimensione TIME presente nel report");
							break;
					}
				} else {
					$this->time_sql = [
						["WB_YEARS.id", "WB_QUARTERS.year_id"],
						["WB_QUARTERS.id", "WB_MONTHS.quarter_id"],
						["WB_MONTHS.id", "WB_DATE.month_id"]
					];
				}

				// dd($this->from_clause[$this->factId]);
				// dd(array_key_exists("WB_YEARS", $this->from_clause[$this->factId]));
				if (array_key_exists("WB_YEARS", $this->from_clause[$this->factId])) {
					$this->WHERE_timingFn[$this->factId]['WB_YEARS'] = implode(" = ", $this->time_sql[0]);
					if (array_key_exists("WB_QUARTERS", $this->from_clause[$this->factId])) {
						$this->WHERE_timingFn[$this->factId]['WB_QUARTERS'] = implode(" = ", $this->time_sql[1]);
						if (array_key_exists("WB_MONTHS", $this->from_clause[$this->factId])) {
							$this->WHERE_timingFn[$this->factId]['WB_MONTHS'] = implode(" = ", $this->time_sql[2]);
						}
					}
				}
				/* WARN: 02.12.2024 non completato (da verificare) dd($this->WHERE_timingFn);
        if (property_exists($this, 'sql_info')) {
          $this->json_info_advanced[$this->datamart_name_advanced_measures]->AND->{$token} = $filter->SQL;
          // $this->json_info_advanced[$this->datamart_name_advanced_measures]->{'AND'}->{$filter->alias} = implode(" = ", $filter->SQL);
          // elimino la prop 'WHERE-TIME' da json_info_advanced perchè la metrica filtrata
          // contiene una funzione temporale, quindi non può coesistere insieme ad un altra relazione
          // con la WEB_BI_TIME
          unset($this->json_info_advanced[$this->datamart_name_advanced_measures]->{'WHERE-TIME'});
        } */
				// $this->WHERE_timingFn[$token] = implode(" = ", $filter->SQL);
				// dd($this->WHERE_timingFn);
			} else {
				// dd($filter->SQL, $this->filters_metricTable, $this->filters_baseTable);
				// aggiungo senza verificare se già presente il codice SQL del filtro
				// perchè, essendo un array associativo, al massimo il codice SQL del filtro viene riscritto
				$this->filters_metricTable[$this->factId][$filter->name] = $filter->SQL;

				if (property_exists($this, 'sql_info')) {
					$this->json_info_advanced[$this->datamart_name_advanced_measures]->AND->{$filter->name} = $filter->SQL;
				}
			}
		}
		// dd($this->filters_metricTable);
		// dd($this->WHERE_timingFn);
		// dd($this->json_info_advanced);
	}

	/* creo i datamart necessari per le metriche avanzate */
	public function createAdvancedMeasuresDatamart()
	{
		// dd($this->groupMetricsByFilters);
		$sqlFilteredMetrics = [];
		foreach ($this->groupMetricsByFilters as $groupToken => $advancedMetric) {
			$groupAdvancedMeasures = [];
			// $tableName = "WB_METRIC_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}";
			// $tableName = ($this->sheet) ?
			// 	"WB_METRIC_LOCAL_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}" :
			// 	"WB_METRIC_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}";
			if (property_exists($this, 'sheet')) {
				// elaborazione in locale, verifico se è presente lo sheet "pubblicato".
				// Se presente creo WB_METRIC_LOCAL_... per non sovrascrivere quello pubblicato
				// Se non è presente una versione pubblicata posso utilizzare WB_METRIC_...
				$this->datamart_name_advanced_measures = ($this->sheet) ?
					"WB_METRIC_LOCAL_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}" :
					"WB_METRIC_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}";
			} else {
				$this->datamart_name_advanced_measures = "WB_METRIC_{$this->datamart_id}_{$this->user_id}_{$this->factId}_{$groupToken}";
			}
			if (property_exists($this, 'sql_info')) {
				$this->json_info_advanced[$this->datamart_name_advanced_measures] = (object) [
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
			$this->FROM_metricTable = [];
			$this->WHERE_metricTable = [];
			// dd($advancedMetric);
			foreach ($advancedMetric as $value) {
				unset($this->sqlAdvancedMeasures);
				// dd($metric);
				// dump($value->SQL);
				// applico la stessa logica delle base metrics
				$sql = [];
				if (is_array($value->SQL)) {
					// ciclo la formula SQL per identificare i nomi delle colonne, queste verranno implementate con la funzione IFNULL/NVL e
					// con il CASE...WHEN, in caso di formula contenente l'operatore di divisione "/"
					foreach ($value->SQL as $element) {
						// dump("element : " . $element);
						$regex = '/[^\.]*\w$/';
						preg_match($regex, $element, $matches);
						if ($matches) {
							if (in_array("/", $sql)) {
								// la formula contiene l'operatore di divisione, imposto il CASE...WHEN
								$sql[] = (in_array($matches[0], $value->metrics)) ? "CASE WHEN {$this->ifNullOperator}({$element}, 0) = 0 THEN NULL ELSE {$this->ifNullOperator}({$element}, 0) END" : trim($element);
							} else {
								$sql[] = (in_array($matches[0], $value->metrics)) ? "{$this->ifNullOperator}({$element}, 0)" : trim($element);
							}
						} else {
							// $sql[] = trim($element);
							if (is_null($element)) $element = " ";
							if (in_array($element, $this->operators)) $element = str_pad($element, 3, " ", STR_PAD_BOTH);
							$sql[] = $element;
						}
					}
					$metric = implode($sql);
					$groupAdvancedMeasures[$this->factId][$value->token] = ($value->distinct) ?
						"{$this->ifNullOperator}({$value->aggregateFn}(DISTINCT {$metric}), 0) AS {$value->token}" :
						"{$this->ifNullOperator}({$value->aggregateFn}({$metric}), 0) AS {$value->token}";
				} else {
					// in questo caso la proprietà SQL non è un array
					$metric = ($value->distinct) ?
						"{$this->ifNullOperator}({$value->aggregateFn}(DISTINCT {$value->SQL}), 0) AS {$value->token}" :
						"{$this->ifNullOperator}({$value->aggregateFn}({$value->SQL}), 0) AS {$value->token}";
					$groupAdvancedMeasures[$this->factId][$value->token] = $metric;
				}
				if (property_exists($this, 'sql_info')) {
					// $this->json_info_advanced[$this->datamart_name_advanced_measures]->METRICS->{"$metric->token"} = "{$this->ifNullOperator}({$metric->aggregateFn}({$metric->SQL}), 0) AS {$metric->token}";
					$this->json_info_advanced[$this->datamart_name_advanced_measures]->METRICS->{"$value->token"} = $metric;
					// dd($this->json_info_advanced);
				}
				// dump($groupAdvancedMeasures);
				// _metrics_advanced_datamart verrà utilizzato nella creazione del datamart finale
				// TODO: probabilmente posso creare questo array nello stesso modo di datamart_baseMeasures
				// (quindi senza le keys $this->datamart_name_advanced_measures e $metric->alias)
				// $this->datamart_advancedMeasures[$this->datamart_name_advanced_measures][$metric->alias] = "\t{$metric->alias} AS {$metric->alias}";
				// $this->datamart_advancedMeasures[] = "{$this->datamart_name_advanced_measures}.{$metric->alias} AS {$metric->alias}";

				// metrica che verrà inserita nella creazione del datamart finale
				$this->datamart_advancedMeasures[] = "{$this->ifNullOperator}({$value->token}, 0) AS \"{$value->alias}\"";
				// aggiungo i filtri presenti nella metrica filtrata ai filtri già presenti sul report
				$this->setFiltersAdvancedMeasures($value->filters, $this->datamart_name_advanced_measures);
				// dd($this->json_info_advanced);
				// per ogni filtro presente nella metrica avanzata...
				foreach ($value->filters as $filter) {
					// if (property_exists($filter, 'from')) $this->setFromMetricTable($filter->from, $this->datamart_name_advanced_measures);
					// dd($filter);
					// le funzioni temporali non contengono la clausola FROM
					if (property_exists($filter, 'from')) {
						if (property_exists($filter->from, $this->fact)) $this->setFromClause_advancedMeasure($filter->from->{$this->fact}, $this->datamart_name_advanced_measures);
					}
					// dd($this->filters_metricTable);
					// dd($this->json_info_advanced);
					// aggiungo la WHERE, relativa al filtro associato alla metrica, alla WHERE_baseTable
					// se, nella metrica in ciclo, non è presente la WHERE devo ripulire WHERE_metricTable altrimenti verranno aggiunte WHERE della precedente metrica filtrata
					// dd($filter->joins);
					// (property_exists($filter, 'joins')) ? $this->setWhereMetricTable($filter->joins, $this->datamart_name_advanced_measures) : $this->WHERE_metricTable = array();
					if (property_exists($filter, 'joins')) {
						(property_exists($filter->joins, $this->fact)) ? $this->setWhereClause_advancedMeasure($filter->joins->{$this->fact}, $this->datamart_name_advanced_measures) : $this->WHERE_metricTable = array();
					}
				}
				// dd($this->report_filters, $this->filters_metricTable, $this->WHERE_timingFn);
			}
			// dd($groupAdvancedMeasures);
			// dd($this->datamart_advancedMeasures);
			// creo il datamart, passo a createMetricTable il nome della tabella temporanea e l'array di metriche che lo compongono
			if (property_exists($this, 'sql_info')) {
				$sqlFilteredMetrics[] = $this->createDatamartAdvancedMeasures($groupAdvancedMeasures);
				unset($this->json_info_advanced[$this->datamart_name_advanced_measures]);
			} else {
				// dd($groupAdvancedMeasures);
				$this->createDatamartAdvancedMeasures($groupAdvancedMeasures, false);
			}
		}
		if (property_exists($this, 'sql_info')) return $sqlFilteredMetrics;
	}

	/*
	 * Creazione datamart per le metriche avanzate
	 * */
	private function createDatamartAdvancedMeasures($advancedMetrics)
	{
		// dd($advancedMetrics);
		$this->fromFilteredMetric = NULL;
		// dd($this->select_clause);
		// unisco gli array della clausola select con le metriche da calcolare per il gruppo di metriche
		// dd(array_merge($this->select_clause[$this->factId], $advancedMetrics[$this->factId]));
		$this->sqlAdvancedMeasures = self::SELECT . implode(",\n", array_merge($this->select_clause[$this->factId], $advancedMetrics[$this->factId]));
		// dd($this->sqlAdvancedMeasures);
		// dd($this->from_clause[$this->factId]);
		// dd($this->FROM_metricTable[$this->factId]);
		if (array_key_exists($this->factId, $this->FROM_metricTable)) {
			// dd($this->from_clause[$this->factId], $this->FROM_metricTable[$this->factId]);
			$this->sqlAdvancedMeasures .= self::FROM . implode(",\n", array_merge($this->from_clause[$this->factId], $this->FROM_metricTable[$this->factId]));
		} else {
			// dd($this->from_clause[$this->factId]);
			$this->sqlAdvancedMeasures .= self::FROM . implode(",\n", $this->from_clause[$this->factId]);
		}
		$this->sqlAdvancedMeasures .= self::WHERE;
		// OPTIMIZE: 15.05.2025 da ottimizzare (START)
		// dd($this->sqlAdvancedMeasures);
		if (array_key_exists($this->factId, $this->WHERE_metricTable)) {
			// esistono condizioni WHERE sulle metriche avanzate
			// se esistono WHERE anche sulla base table faccio un merge con quell della metrica avanzata
			if (array_key_exists($this->factId, $this->where_clause)) {
				// $this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->WHERE_metricTable[$this->factId]));
				$this->sqlAdvancedMeasures .= implode("\nAND ", array_merge($this->where_clause[$this->factId], $this->WHERE_metricTable[$this->factId]));
			} else {
				$this->sqlAdvancedMeasures .= implode("\nAND ", $this->WHERE_metricTable[$this->factId]);
			}
		} elseif (array_key_exists($this->factId, $this->where_clause)) {
			// esiste condizione WHERE sulla tabella BASE
			$this->sqlAdvancedMeasures .= implode("\nAND ", $this->where_clause[$this->factId]);
		} else {
			// non esistono condizioni di WHERE, sia nella tabella base che nelle metriche avanzate
			$this->sqlAdvancedMeasures .= "TRUE";
		}
		// dd($this->sqlAdvancedMeasures);
		// utilizzo array_merge, verranno unite le join della TIME e, quelle con key uguale, verranno sovrascirtte
		// dal secondo array passato come argomento. In questo caso, se è prsente una metrica con timing function sovrrascive
		// le join della TIME "originale"
		switch (true) {
			case (array_key_exists($this->factId, $this->WHERE_timingFn)):
				$this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", array_merge($this->where_time_clause[$this->factId], $this->WHERE_timingFn[$this->factId]));
				break;
			case (array_key_exists($this->factId, $this->where_time_clause)):
				$this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", $this->where_time_clause[$this->factId]);
				break;
			default:
				break;
		}
		// OPTIMIZE: 15.05.2025 da ottimizzare (END)
		// dd($this->sqlAdvancedMeasures);
		$this->WHERE_timingFn = [];
		// aggiungo i filtri del report e i filtri contenuti nella metrica
		$this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", $this->report_filters[$this->factId]);
		// dd($this->sqlAdvancedMeasures);
		if (array_key_exists($this->factId, $this->filters_metricTable)) $this->sqlAdvancedMeasures .= "\nAND " . implode("\nAND ", $this->filters_metricTable[$this->factId]);
		$this->sqlAdvancedMeasures .= self::GROUPBY . implode(",\n", $this->groupby_clause[$this->factId]);
		$comment = "/*\nCreazione tabella METRIC :\n" . implode("\n", array_keys($advancedMetrics[$this->factId])) . "\n*/\n";
		switch (session('db_driver')) {
			case 'odbc':
				$createStmt = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$this->datamart_name_advanced_measures ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS \n($this->sqlAdvancedMeasures);";
				break;
			case 'mysql':
				$createStmt = "{$comment}CREATE TEMPORARY TABLE decisyon_cache.$this->datamart_name_advanced_measures AS \n($this->sqlAdvancedMeasures);";
				break;
			default:
				break;
		}
		// dd($createStmt);
		// TODO: eliminare la tabella temporanea come fatto per baseTable
		$result = null;
		if (property_exists($this, 'sql_info')) {
			$this->queries[$this->datamart_name_advanced_measures] = $this->datamart_fields;
			return ["raw_sql" => nl2br($createStmt), "format_sql" => $this->json_info_advanced];
		} else {
			// dd($this->queries);
			// Qui se l'elaborazione fallisce devo eliminare tutte le tabelle temporanee create finora (basetable, e altre metric_table ad esempio)
			// TODO: 27.09.2024 rivedere la gestione degli errori con Laravel
			try {
				$result = DB::connection(session('db_client_name'))->statement($createStmt);
				$this->queries[$this->datamart_name_advanced_measures] = $this->datamart_fields;
			} catch (\Throwable $th) {
				foreach (array_keys($this->queries) as $table) {
					Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.$table");
				}
				throw $th;
			}
		}
		// dd($sql);
		return $result;
	}

	private function distinct_fields()
	{
		$union = [];
		// dd($this->queries);
		foreach ($this->queries as $table => $fields) {
			$sql = "(" . self::SELECT;
			// dd($fields);
			$sql .= implode(",\n", array_keys($fields));
			// WARN: 25.03.2025 da valutare se utilizzare la forma table.column quando
			// viene utilizzata la stessa colonna più di una volta nel report
			/* foreach ($fields as $token => $field) {
				$sql .= "{$table}.{$token}";
			} */
			// dd($sql);
			$sql .= self::FROM . "decisyon_cache.{$table})\n";
			$union[$table] = $sql;
		}
		$union_sql = implode("UNION\n", $union);
		if (property_exists($this, 'sheet')) {
			// elaborazione in locale, verifico se è presente lo sheet "pubblicato".
			$this->union_table_name = ($this->sheet) ? "union_local_{$this->datamart_id}_{$this->user_id}" : "union_{$this->datamart_id}_{$this->user_id}";
		} else {
			$this->union_table_name = "union_{$this->datamart_id}_{$this->user_id}";
		}
		switch (session('db_driver')) {
			case 'odbc':
				$this->union_clause = "CREATE TEMPORARY TABLE decisyon_cache.{$this->union_table_name} ON COMMIT PRESERVE ROWS INCLUDE SCHEMA PRIVILEGES AS\n$union_sql;";
				break;
			case 'mysql':
				$this->union_clause = "CREATE TEMPORARY TABLE decisyon_cache.{$this->union_table_name} AS\n$union_sql;";
				break;
			default:
				break;
		}
		// dd($this->union_clause);
		// dump($this->union_clause);
		// dd($this->queries);
		// DB::connection(session('db_client_name'))->statement($this->union_clause);
		// TODO: Qui se l'elaborazione fallisce devo eliminare tutte le tabelle temporanee create finora (basetable, e altre metric_table ad esempio)
		if (property_exists($this, 'sql_info')) {
			// dd($this->union_clause);
			$this->sql_union_clause['union'] = $this->union_clause;
		} else {
			try {
				DB::connection(session('db_client_name'))->statement($this->union_clause);
			} catch (\Throwable $th) {
				foreach (array_keys($this->queries) as $table) {
					Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.$table");
				}
				throw $th;
			}
		}
	}

	/* creazione datamart finale:
		* Viene creata una query che unisce .....TODO: completare i commenti
	* */
	public function createDatamart()
	{
		$this->distinct_fields();
		$comment = "/*Creazione DATAMART :\ndecisyon_cache.{$this->datamart_name}\n*/\n";
		switch (session('db_driver')) {
			case 'odbc':
				$createStmt = "{$comment}CREATE TABLE decisyon_cache.{$this->datamart_name} INCLUDE SCHEMA PRIVILEGES AS ";
				break;
			case 'mysql':
				$createStmt = "{$comment}CREATE TABLE decisyon_cache.{$this->datamart_name} AS ";
				break;
			default:
				break;
		}
		$createStmt .= self::SELECT;
		$fields = [];
		foreach ($this->datamart_fields as $token => $alias) {
			// dd($token, $field);
			// $fields[] = "union_{$this->datamart_id}_{$this->user_id}.{$token} AS \"{$alias}\"";
			$fields[] = "{$this->union_table_name}.{$token} AS \"{$alias}\"";
		}
		// dd($fields);
		// unisco i seguenti campi :
		// - livelli dimensionali
		// - metriche di base, metriche avanzate e metriche composte
		$mergeElements = array_merge($fields, $this->datamart_baseMeasures, $this->datamart_advancedMeasures, $this->compositeMeasures);
		$createStmt .= implode(",\n", $mergeElements);
		// dd($createStmt);
		// $createStmt .= self::FROM . "decisyon_cache.union_{$this->datamart_id}_{$this->user_id}";
		$createStmt .= self::FROM . "decisyon_cache.{$this->union_table_name}";
		$joinLEFT = "";
		$ONClause = [];
		foreach ($this->queries as $table => $fields) {
			$joinLEFT .= "\nLEFT JOIN decisyon_cache.{$table}\n\tON ";
			foreach ($fields as $token => $field) {
				// $ONClause[] = "decisyon_cache.union_{$this->datamart_id}_{$this->user_id}.$token = $table.$token";
				$ONClause[] = "decisyon_cache.{$this->union_table_name}.$token = $table.$token";
			}
			$joinLEFT .= implode("\nAND ", $ONClause);
			unset($ONClause);
		}
		$createStmt .= $joinLEFT;
		// dd($createStmt);
		if (property_exists($this, 'sql_info')) {
			// dd($this->sql_union_clause);
			return [
				"union" =>  ["raw_sql" => nl2br($this->sql_union_clause['union'])],
				"datamart" => ["raw_sql" => nl2br($createStmt)]
			];
		} else {
			try {
				// elimino prima il datamart già esistente
				// if (Schema::connection(session('db_client_name'))->hasTable("WEB_BI_{$this->datamart_id}_{$this->user_id}")) {
				if (Schema::connection(session('db_client_name'))->hasTable($this->datamart_name)) {
					// TEST: 27.09.2024 verifica, in laravel viene restituito un NOTICE quando si utilizza dropIfExists() e una tabella non è presente
					// Schema::connection(session('db_client_name'))->drop("decisyon_cache.WEB_BI_{$this->datamart_id}_{$this->user_id}");
					Schema::connection(session('db_client_name'))->drop("decisyon_cache.{$this->datamart_name}");
				}
				// creazione del datamart
				// dd($createStmt);
				DB::connection(session('db_client_name'))->statement($createStmt);
				// elimino la tabella union....
				Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.{$this->union_table_name}");
				// elimino tutte le tabelle temporanee utilizzate per creare il datamart
				foreach (array_keys($this->queries) as $table) {
					Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.$table");
				}
			} catch (\Throwable $th) {
				// elimino la tabella union....
				Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.{$this->union_table_name}");
				// elimino tutte le tabelle temporanee utilizzate per creare il datamart
				foreach (array_keys($this->queries) as $table) {
					Schema::connection(session('db_client_name'))->dropIfExists("decisyon_cache.$table");
				}
				throw $th;
			}
			// return $this->datamart_id;
			return $this->datamart_name;
		}
	}
}
