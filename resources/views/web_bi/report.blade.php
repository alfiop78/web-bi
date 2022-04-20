<!DOCTYPE html>
<html lang="it" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="icon" href="/favicon.png" type="image/png" />
		<meta name="theme-color" content="#70b1bb">
		<meta name="author" content="Pietrantuono Alfio">
		<link rel="stylesheet" type="text/css" href="/css/md-layout.css" />
		<link rel="stylesheet" type="text/css" href="/css/material-icons.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-loader.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-controls.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-drawer.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-inputs.css" />
		<link rel="stylesheet" type="text/css" href="/css/report-layout.css" />
		<link rel="stylesheet" type="text/css" href="/css/index_report.css" />
		<link rel="stylesheet" type="text/css" href="/css/steps.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-dialogs.css" />
		<script src="/js/Step.js"></script>
		<script src="/js/Query.js"></script>
		<script src="/js/Application.js"></script>
		<script src="/js/lib.js"></script>
		<script src="/js/Storage.js"></script>
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<title>Creazione Report</title>
	</head>
	<body>

		<small id="popup" class="popupToast"></small>

		<dialog id="dialogTables" class="dialog-tables">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-hier-name data-dimension-name>
				<h4>Seleziona le colonne da includere nel report</h4>

				<div class="stepLayout">

					<section class="sectionLists">
						{{-- <h5>tabelle</h5><h6>subtitle</h6> --}}
						<div id="parent-list-columns">
							<h5>colonne</h5>
							<div class="md-field">
								<input type="search" data-element-search="search-columns" id="dialog-columns-search-column" value autocomplete="off" />
								<label for="dialog-columns-search-column" class="">Ricerca</label>
							</div>
							<ul id="list-columns" class="full-overflow-list-columns"></ul>
						</div>
					</section>

					<section class="sectionLists">
						<h5>SQL</h5><h6>Aggiungere un alias per la colonna</h6>
						<div class="md-field">
							<input type="text" id="columnName" name="columnName" autocomplete="off" />
							<label for="columnName" class="">Nome per la colonna</label>
						</div>
						<div class="md-field">
							<input type="text" id="columnAlias" name="columnAlias" autocomplete="off" />
							<label for="columnAlias" class="">Alias</label>
						</div>

						<div class="md-field">
							<textarea id="columnSQL" name="columnSQL" rows="10" cols="50" placeholder="es.: CONCAT(tabella.campo,'-',tabella.campo)"></textarea>
						</div>
						<button id="btnSaveColumn" type="button" name="save" class="md-button" disabled>salva</button>
					</section>

				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<!-- <button id="btnSaveColumn" type="button" name="save" class="md-button" disabled>salva</button> -->
					<button id="btnColumnDone" type="button" name="done" class="md-button">fatto</button>
				</div>
			</section>
		</dialog>

		<dialog id="dialogSaveReport">
			<div class="dialog-save-name">

				<div class="md-field">
					<input type="text" id="reportName" value=""/>
					<label for="reportName" class="">Titolo Report</label>
				</div>
			</div>

			<div class="dialog-buttons">
				<button type="button" name="cancel" class="md-button">annulla</button>
				<button id="btnReportSaveName" type="button" name="done" class="md-button">Salva</button>
			</div>

		</dialog>

		<dialog id="dialogFilter" class="dialog-filters">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-table-selected>
				<h4>Selezione filtri per la tabella <span></span></h4>
				<div class="stepLayout">

					<section class="sectionLists">
						<h5>Tabelle</h5><h6>subtitle</h6>
						<div class="md-field">
							<input type="search" data-element-search="filters-table-list" id="filter-searchTables" value autocomplete="off" />
							<label for="filter-searchTables" class="">Ricerca</label>
						</div>
						<div id="filter-fieldList-tables"><!-- qui viene inserito il template tmpl_ulList--></div>
					</section>
					
					<section class="sectionLists">
						<h5>Crea filtro</h5><h6>subtitle</h6>
						<div class="md-field">
							<input type="search" id="fieldSearch" data-element-search="search-field-db" value autocomplete="off" />
							<label for="fieldSearch" class="">Ricerca</label>
						</div>
						<div id="fieldList-filter"><!-- template ul--></div>
						
					</section>

					<section class="sectionLists">
						<h5>Modifica</h5><h6>subtitle</h6>
						<div class="md-field">
							<input type="text" id="inputFilterName" name="filterName" autocomplete="off" />
							<label for="inputFilterName" class="">Filter name</label>
						</div>
						<div class="md-field">
							<textarea id="filterSQLFormula" name="filterSQL" rows="5" cols="33" placeholder="SQL"></textarea>
						</div>
						<div class="md-field">
							<input type="search" id="searchValues" value="" autocomplete="off" />
							<label for="searchValues" class="">Ricerca valori</label>
						</div>
						<div id="filter-valueList"><!-- template ul--></div>
						
					</section>

					<section class="sectionLists">
						<h5>Filtri esistenti</h5><h6>Seleziona i filtri da aggiungere al report</h6>
						<div class="md-field">
							<input type="search" id="searchExistsFilter" data-element-search="search-exist-filters" value autocomplete="off" />
							<label for="searchExistsFilter" class="">Ricerca</label>
						</div>
						<div id="existFilters"><!-- template ul--></div>
					</section>
				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnFilterSave" type="button" name="save" class="md-button" disabled="true">salva</button>
					<button id="btnFilterDone" type="button" name="done" class="md-button">fine</button>
				</div>
			</section>
		</dialog>

		<dialog id="dialogMetric" class="dialog-metrics">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-table-selected>
				<h4>Inserisci qui la funzione per la metrica&nbsp;<span></span></h4>
				<div class="name-alias">
					<div class="md-field">
						<input type="text" id="metric-name" value="" autocomplete="off" />
						<label for="metric-name" class="">Nome</label>
					</div>

					<div class="md-field">
						<input type="text" id="alias-metric" value="" autocomplete="off" />
						<label for="alias-metrics" class="">Alias</label>
					</div>
				</div>

				<div class="stepLayout">
					<section class="sectionLists">
						<h5>Funzione di aggregazione</h5>
						<div id="sql-aggregation">
							<ul id="sql-aggregation-list" class="list middleList">
								<li label="SUM" selected>SUM</li>
								<li label="COUNT">COUNT</li>
								<li label="AVG">AVG</li>
								<li label="MAX">MAX</li>
								<li label="MIN">MIN</li>
							</ul>
						</div>
						<label class="mdc-checkbox">
							<input id="checkbox-distinct" type="checkbox" name="distinct-checkbox"/>
							<span>DISTINCT</span>
						</label>
					</section>

					<section class="sectionLists">
						<h5>Modifica</h5>
						<div class="md-field">
							<textarea id="metricSQLFormula" name="metricSQL" rows="8" cols="25" placeholder="SQL"></textarea>
						</div>
					</section>

					<section class="sectionLists">
						<h5>Filtri disponibili</h5>
						<div class="md-field">
							<input type="search" id="searchExistsFilter_Metric" value="" autocomplete="off" />
							<label for="searchExistsFilter_Metric" class="">Ricerca</label>
						</div>
						<div id="existsFilter_Metric"><!-- <ul> --></div>
					</section>
				</div>

				<!-- <div class="formulaDefine"> -->
					<!-- <section class="formula">
						<h6>SQL Function</h6><small>Scorri la lista delle funzioni di aggregazione</small>
						<div class="listContent">
					  		<ul id="function-list" class="miniList">
								<li id="SUM" label="SUM" selected>SUM</li>
								<li id="COUNT" label="COUNT">COUNT</li>
								<li id="AVG" label="AVG">AVG</li>
								<li id="MAX" label="MAX">MAX</li>
								<li id="MIN" label="MIN">MIN</li>
							</ul>
						</div>
						<label class="mdc-checkbox">
							<input id="checkbox-distinct" type="checkbox" name="distinct-checkbox"/>
							<span>DISTINCT</span>
						</label>
					</section> -->

					<!-- <section class="filters">
						<h6>Filtri disponibili</h6><small>Filtri disponibili da associare alla metrica</small>
						<div class="md-field">
							<input type="search" id="searchExistsFilter_Metric" value="" autocomplete="off" />
							<label for="searchExistsFilter_Metric" class="">Ricerca</label>
						</div>
						<div id="existsFilter_Metric">
							
						</div>
					</section> -->
				<!-- </div> -->

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnMetricDone" type="button" name="done" class="md-button" disabled>fatto</button>
				</div>
			</section>
			</div>
		</dialog>

		<main>
			<div id="drawer" close>
				<section class="account"><h5>user</h5><i class="material-icons md-light">person</i></section>
				<nav>
				</nav>
			</div>

			<header>
				<div class="nav-button"> <!-- codelab-nav-button-->
					<a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
					<a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
				</div>
				<h1 class="title">Creazione report</h1>
			</header>

			<div id="container" data-page="1">
				<div id="content">
					<div id="body" hidden>

						<div class="actions">
							<span class="popupContent"><i id="btnProcessReport" class="material-icons md-24">table_rows</i><small class="popup">Crea FX</small></span>
						</div>
						

						<div class="lists">
							<div class="absList" id="reportProcessList" hidden>
								<div class="md-field">
									<input type="search" id="searchReportProcess" value="" autocomplete="off" />
									<label for="searchReportProcess" class="">Ricerca</label>
								</div>
								<ul id="reportsProcess"></ul>
							</div>
						</div>
	  
						<!-- template con icone 'column' e 'filter' -->
						<template id="templateList">

							<section hidden data-label data-element-search data-icon-column data-icon-filter>
								<div class="element" name="">
									<li class="elementSearch" label=""></li>
									<i data-id="columns-icon" class="material-icons md-18">view_list</i>
									<i data-id="filter-icon" class="material-icons md-18">filter_alt</i>
								</div>	
							</section>

							<section hidden data-label data-element-search data-icon-edit>
								<div class="element" name="">
									<li class="elementSearch" label=""></li>
									<i id="edit-icon" class="material-icons md-18">edit</i>
								</div>	
							</section>

							<section data-label data-icon-delete>
								<div class="element" name="">
									<li class="elementSearch" label=""></li>
									<i id="delete-icon" class="material-icons md-18">delete</i>
								</div>	
							</section>

							<section data-element-search data-label data-no-icon hidden>
								<div class="element" name>
									<li class="elementSearch" label></li>
								</div>	
							</section>

							<section data-element-search data-label data-sublist hidden>
								<div class="element" name>
									<span class="sublist">
										<li class="elementSearch" label></li>
									</span>
								</div>
							</section>

							<section data-element-search data-label data-sublist-hier-table-columns hidden>
								<div class="element" name>
									<span class="sublist">
										<span hier></span>
										<span table></span>
										<span column></span>
									</span>
								</div>
							</section>

							<section data-element-search data-label data-sublist-table-filters hidden>
								<div class="element" name>
									<span class="sublist">
										<span table></span>
										<span filter></span>
									</span>
								</div>
							</section>

						</template>

						<template id="sublist-item">
							<span class="sublist-element">
								<span class="sublist-item"></span>
								<span class="icons">
									<i data-id="column-icon" class="material-icons md-18">view_list</i>
									<i data-id="filter-icon" class="material-icons md-18">filter_alt</i>									
								</span>
							</span>
						</template>

						<template id="template_ulList">
							<ul data-id="list-cubes" class="overflowList"></ul>
							<ul data-id="list-filter" class="overflowList"></ul>
							<ul data-id="list-dimensions" class="overflowList"></ul>
							<ul data-id="list-hierarchies" class="overflowList"></ul>
							<ul data-id="list-columns" class="overflowList"></ul>
							<ul data-id="list-fields" class="overflowList"></ul>
							<ul data-id="list-values" class="list middleList"></ul>
							<ul data-id="list-tables" class="overflowList"></ul>
							<ul data-id="list-metrics" class="overflowList"></ul>
						</template>

						<div class="wrapper">
							<div class="steps" data-step="1">
								<div class="overflow">
									<div id="stepTranslate" data-translate-x="0">
										<section class="step" data-step="1" selected>
											<div class="pageContent">
												<div class="h-grid">
													{{-- cube-list --}}
													<div id="parent-list-cubes">
														<h5>Cubi</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-cube" id="search-cube" value autocomplete="off" />
															<label for="search-cube" class="">Ricerca</label>
														</div>
														<ul id="list-cubes" class="overflowList"></ul>
													</div>
													{{-- dimension-list --}}
													<div id="parent-list-dimensions">
														<h5>Dimensioni</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-dimension" id="search-dimension" value autocomplete="off" />
															<label for="search-dimension" class="">Ricerca</label>
														</div>
														<ul id="list-dimensions" class="overflowList"></ul>
													</div>
												</div>
											</div>
										</section>
									  
										<section class="step" data-step="2">
											<div class="pageContent">
												<div class="h-grid">
													<div id="parent-list-hierarchies">
														<h5>gerarchie</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-hierarchy" id="search-hierarchy" value autocomplete="off" />
															<label for="search-hierarchy" class="">Ricerca</label>
														</div>
														<ul id="list-hierarchies" class="full-overflow-list"></ul>
													</div>
													<div>
														<h5>Report</h5>
														<div class="addElementsReport">
															<div class="btn-add">
																<span>colonne</span>
																<i id="btn-add-columns" class="material-icons md-36">add</i>
															</div>															
															<div class="btn-add">
																<span>filtri</span>
																<i id="btn-add-filters" class="material-icons md-36">add</i>
															</div>
															<div class="btn-add">
																<span>metriche</span>
																<i class="material-icons md-36">add</i>
															</div>
														</div>
														{{-- elementi del report --}}
														<div class="elementsReport">
															<ul id="report-columns"></ul>
															<div>
																<div class="md-field">
																	<input type="search" data-element-search="search-exist-filters" id="search-exist-filters" value autocomplete="off" />
																	<label for="search-exist-filters" class="">Ricerca</label>
																</div>
																<ul id="exist-filters"></ul>																
															</div>
															<ul id="report-metrics"></ul>
														</div>
													</div>
												</div>
											</div>
										</section>

										<section class="step" data-step="3">
											<div class="pageContent">pagina 3</div>
										</section>
									</div>

								</div>
								<div class="buttons">
									<button id="prev" class="md-button">Precedente</button>
									<button id="next" class="md-button">Successivo</button>
								</div>
							</div>
						</div>
						
					</div>
				</div>

				<div id="controls">
					<div id="fabs">
						<button id="mdcBack" class="button dense raised">home</button>
						<div class="spacer"></div>
						<button id="mdcMapping" class="button dense raised done">mapping</button>
					</div>
				</div>

				<div id="console">
					<div id="fabsConsole">
						<i class="material-icons md-18">info</i>
						<p></p>
					</div>
				</div>
			</div>
		</main>

		<div class="loader">
			<svg viewBox="0 0 32 32" width="32" height="32">
				<circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
			</svg>
		</div>
		<script type="text/javascript" src="js/init_report.js" async></script>
	</body>
</html>
