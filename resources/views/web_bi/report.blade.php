<!DOCTYPE html>
<html lang="it" dir="ltr">
	<head>
		<meta charset="utf-8">
		<link rel="icon" href="/favicon.png" type="image/png" />
		<meta name="theme-color" content="#70b1bb">
		<meta name="author" content="Pietrantuono Alfio">
		<link rel="stylesheet" type="text/css" href="/css/md-layout.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-lists.css" />
		<link rel="stylesheet" type="text/css" href="/css/material-icons.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-loader.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-controls.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-drawer.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-inputs.css" />
		<link rel="stylesheet" type="text/css" href="/css/report-layout.css" />
		<link rel="stylesheet" type="text/css" href="/css/steps.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-dialogs.css" />
		<link rel="stylesheet" type="text/css" href="/css/index_report.css" />
		<script src="/js/Step.js"></script>
		<script src="/js/Query.js"></script>
		<script src="/js/Application.js"></script>
		<script src="/js/lib.js"></script>
		<script src="/js/Storage.js"></script>
		<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<title>Creazione Report</title>
	</head>
	<body>

		<small id="tooltip" class="tooltip"></small>

		<dialog id="dialog-column">
			<small id="dialog-popup" class="popupToast"></small>
			<section>
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
							<ul id="list-columns-fact" class="fact-table"></ul>
							<ul id="list-columns" class="full-overflow-list-columns"></ul>
						</div>
					</section>

					<section class="sectionLists">
						<h5>SQL</h5><h6>Aggiungere un alias per la colonna</h6>
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

		<dialog id="dialog-save-report" class="dialog-save">
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

		<dialog id="dialog-value" class="mini-dialog">
			<section>
				<h4>Ricerca valori per la colonna</h4>
				<div class="md-field">
					<input type="search" id="dialog-value-search" data-element-search="dialog-value-search" value autocomplete="off" />
					<label for="dialog-value-search" class="">Ricerca valori</label>
				</div>
				<ul id="dialog-filter-values" class="full-overflow-list-columns"></ul>
			</section>

			<div class="dialog-buttons">
				<button type="button" name="cancel" class="md-button">annulla</button>
				<button id="btnValueDone" type="button" name="value-done" class="md-button">ok</button>
			</div>
		</dialog>

		<dialog id="dialog-filter">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-table-name> {{--  data-hier-name data-dimension-name --}}
				<h4>Creazione nuovo filtro</h4>
				<div class="stepLayout">

					<section class="sectionLists">
						<h5>Tabelle</h5><h6>Seleziona la tabella</h6>
						<div class="md-field">
							<input type="search" data-element-search="search-tables" id="dialog-columns-search-table" value autocomplete="off" />
							<label for="dialog-columns-search-table" class="">Ricerca</label>
						</div>
						<ul id="list-filters-fact" class="fact-table"></ul>
						<ul id="list-tables" class="full-overflow-list-columns"></ul>
					</section>
					
					<section class="sectionLists">
						<h5>Colonna/e</h5><h6>Seleziona la colonna</h6>
						<div class="md-field">
							<input type="search" id="dialog-filter-search-field" data-element-search="dialog-filter-search-field" value autocomplete="off" />
							<label for="dialog-filter-search-field" class="">Ricerca</label>
						</div>
						<ul id="dialog-filter-fields" class="full-overflow-list-columns"></ul>						
					</section>

					<section class="sectionLists">
						<h5>SQL</h5><h6>Inserisci una formula SQL</h6>
						<div class="md-field">
							<input type="text" id="inputFilterName" name="filterName" autocomplete="off" />
							<label for="inputFilterName" class="">name</label>
						</div>
						<i class="material-icons" id="search-field-values" data-field-name>search</i>
						<div class="md-field">
							<textarea id="filterSQLFormula" name="filterSQL" rows="10" cols="33" placeholder="SQL"></textarea>
						</div>
						<button id="btnFilterSave" type="button" name="save" class="md-button" disabled="true">salva</button>
					</section>

				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnFilterDone" type="button" name="done" class="md-button">fatto</button>
				</div>
			</section>
		</dialog>

		<dialog id="dialog-metric-filter" class="mini-dialog">
			<small id="dialog-popup" class="popupToast"></small>
			<section>
				<h4>Ricerca filtri da impostare per la metrica</h4>
				<div class="md-field">
					<input type="search" id="dialog-metric-filter-search" data-element-search="search-exist-filters" value autocomplete="off" />
					<label for="dialog-metric-filter-search" class="">Ricerca</label>
				</div>
				<ul id="ul-metric-filter" class="full-overflow-list-columns"></ul>
			</section>

			<div class="dialog-buttons">
				<button type="button" name="cancel" class="md-button">annulla</button>
				<button id="btnMetricFilterDone" type="button" name="metric-filter-done" class="md-button">ok</button>
			</div>
		</dialog>

		<dialog id="dialog-metric">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-table-name>
				<h4>Creazione di una nuova metrica per il cubo <span data-cube-selected></span></h4>
				
				<div class="stepLayout">
					{{-- metriche mappate --}}
					<section class="sectionLists">
						<h5>Metriche disponibili</h5>
						<div class="md-field">
							<input type="search" data-element-search="search-available-metrics" id="search-available-metrics" value autocomplete="off" />
							<label for="search-available-metrics" class="">Ricerca</label>
						</div>
						<ul id="ul-available-metrics"></ul>
					</section>
					{{-- funzioni di aggregazione --}}
					<section class="sectionLists">
						<h5>Aggregazione</h5>{{-- <h6>Seleziona la funzione di aggregazione</h6> --}}
						<div class="md-field">
							<input type="search" id="search-aggregate-functions" data-element-search="search-aggregate-functions" value="" autocomplete="off" />
							<label for="metric-name" class="">Ricerca</label>
						</div>
						<ul id="ul-aggregation-functions" class="dialog-overflow-list">
							<section data-element-search="search-aggregate-functions" data-label="SUM" data-sublist-gen data-searchable>
								<div class="selectable" data-label="SUM" selected>
									<div class="h-content">
										<div class="v-content">
											<span item>SUM</span>
										</div>
									</div>
								</div>
							</section>

							<section data-element-search="search-aggregate-functions" data-label="COUNT" data-sublist-gen data-searchable>
								<div class="selectable" data-label="COUNT">
									<div class="h-content">
										<div class="v-content">
											<span item>COUNT</span>
										</div>
									</div>
								</div>
							</section>

							<section data-element-search="search-aggregate-functions" data-label="AVG" data-sublist-gen data-searchable>
								<div class="selectable" data-label="AVG">
									<div class="h-content">
										<div class="v-content">
											<span item>AVG</span>
										</div>
									</div>
								</div>
							</section>

							<section data-element-search="search-aggregate-functions" data-label="MAX" data-sublist-gen data-searchable>
								<div class="selectable" data-label="MAX">
									<div class="h-content">
										<div class="v-content">
											<span item>MAX</span>
										</div>
									</div>
								</div>
							</section>

							<section data-element-search="search-aggregate-functions" data-label="MIN" data-sublist-gen data-searchable>
								<div class="selectable" data-label="MIN">
									<div class="h-content">
										<div class="v-content">
											<span item>MIN</span>
										</div>
									</div>
								</div>
							</section>

						</ul>
						<label class="mdc-checkbox">
							<input id="checkbox-distinct" type="checkbox" name="distinct-checkbox"/>
							<span>DISTINCT</span>
						</label>
					</section>

					<section class="sectionLists">
						<h5>SQL</h5>
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
						<div class="md-field">
							<textarea id="metricSQLFormula" name="metricSQL" rows="8" cols="25" placeholder="SQL"></textarea>
						</div>
						<button id="metric-filtered" type="button" name="metric-filtered" class="md-button">Imposta filtri</button>
						<button id="btnMetricSave" type="button" name="save" class="md-button" disabled>salva</button>
					</section>

					{{-- <section class="sectionLists">
						<h5>Filtri disponibili</h5>
						<div class="md-field">
							<input type="search" id="searchExistsFilter_Metric" data-element-search="exist-filter-metric" value autocomplete="off" />
							<label for="searchExistsFilter_Metric" class="">Ricerca</label>
						</div>
						<ul id="exist-filter-metric"></ul>
					</section> --}}
				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnMetricDone" type="button" name="done" class="md-button">fatto</button>
				</div>
			</section>
			</div>
		</dialog>

		<dialog id="dialog-composite-metric">
			<small id="dialog-popup" class="popupToast"></small>
			<section data-table-name>
				<h4>Creazione di una nuova metrica composta per il cubo <span data-cube-selected></span></h4>
				
				<div class="stepLayout">
					{{-- metriche mappate --}}
					<section class="sectionLists">
						<h5>Metriche disponibili</h5>
						<div class="md-field">
							<input type="search" data-element-search="search-metrics" id="search-metrics" value autocomplete="off" />
							<label for="search-metrics" class="">Ricerca</label>
						</div>
						<ul id="ul-metrics"></ul>
					</section>

					<section class="sectionLists">
						<h5>SQL</h5>
						<div class="name-alias">
							<div class="md-field">
								<input type="text" id="composite-metric-name" value="" autocomplete="off" />
								<label for="composite-metric-name" class="">Nome</label>
							</div>

							<div class="md-field">
								<input type="text" id="composite-alias-metric" value="" autocomplete="off" />
								<label for="composite-alias-metric" class="">Alias</label>
							</div>
						</div>
						<div class="md-field">
							{{-- <textarea id="composite-metricSQLFormula" name="composite-metricSQL" rows="15" cols="25" placeholder="Aggiungi le metriche qui"></textarea> --}}

						</div>
						<div id="composite-metric-formula" contenteditable="false">
							
						</div>
						<button id="btnCompositeMetricSave" type="button" name="save" class="md-button" disabled>salva</button>
					</section>

				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnCompositeMetricDone" type="button" name="done" class="md-button">fatto</button>
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
							{{-- <span class="popupContent"><i id="btnProcessReport" class="material-icons md-18">table_rows</i><small class="popup">Crea FX</small></span> --}}
							<i id="btnProcessReport" class="material-icons md-18" data-tooltip="Crea datamart" data-tooltip-position="bottom">table_rows</i>
						</div>

						<div class="lists">
							<div class="absList" id="reportProcessList" hidden>
								<div class="md-field">
									<input type="search" id="searchReportProcess" data-element-search="search-process" value="" autocomplete="off" />
									<label for="searchReportProcess" class="">Ricerca</label>
								</div>
								<ul id="ul-processes"></ul>
							</div>
						</div>
	  
						<template id="templateList">

							{{-- lista column esistenti --}}
							<section class="data-item" data-element-search data-label data-sublist-columns hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											<span column class="highlight"></span>
											<small table></small>
											<small hier></small>
										</div>
									</div>
								</div>
							</section>

							{{-- lista colonne impostate nel report --}}
							<section data-element-search data-label data-sublist-columns-selected>
								<div data-label>
									<div class="h-content">
										<div class="v-content">
											<span column class="highlight"></span>
											<small table></small>
											{{-- <small hier></small> --}}
										</div>
										<i class="material-icons md-18">remove</i>
									</div>
								</div>
							</section>

							{{-- lista filtri esistenti --}}
							<section class="data-item" data-element-search data-label data-sublist-filters hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											<span filter class="highlight"></span>
											<small table></small>
											<small></small>
										</div>
										<i class="material-icons md-18">edit</i>
									</div>
								</div>
							</section>

							{{-- lista metriche esistenti --}}
							<section class="data-item" data-element-search data-label data-sublist-metrics hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											{{-- TODO: metriche composte potrei colorarle in modo diverso, cos' come le metriche filtrate --}}
											<span metric class="highlight"></span>
											<small table></small>
											<small cube></small>
											{{-- TODO: qui, sulle metriche filtrate potrei visualizzare un popup con l'elenco dei filtri, oppure, per le metriche composte, visualizzarne, nel popup, la propria formula --}}
										</div>
										<i class="material-icons md-18">edit</i>
									</div>
								</div>
							</section>

							{{-- lista reports/processes --}}
							<section class="data-item" data-element-search="search-process" data-label data-sublist-processes data-searchable>
								<div class="unselectable">
									<div class="h-content">
										<div class="v-content">
											<span data-process></span>
										</div>
										<i data-edit class="material-icons md-18" data-tooltip="Modifica Report" data-tooltip-position="bottom">edit</i>
										<i data-schedule class="material-icons md-18 md-highlight" data-tooltip="Esegui Report" data-tooltip-position="bottom">schedule_send</i>
									</div>
								</div>
							</section>

							<section class="data-item" data-element-search data-label data-sublist-available-metrics hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											<span metric class="highlight"></span>
											<small table></small>
										</div>
									</div>
								</div>
							</section>

							{{-- lista tabelle --}}
							<section class="data-item" data-element-search data-label data-sublist-tables hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											<span table class="highlight"></span>
											<small></small>
										</div>
									</div>
								</div>
							</section>

							{{-- lista generica --}}
							<section class="data-item list" data-element-search data-label data-sublist-gen hidden>
								<div class="selectable" data-label>
									<div class="h-content">
										<div class="v-content">
											<span item></span>
										</div>
									</div>
								</div>
							</section>

						</template>

						<template id="template-sublists">
							{{-- utilizzato quando ho un numero di elementi indefiniti, ad Esempio elenco gerarchie con le relative tabelle --}}
							<span></span>
							<small class="no-highlight"></small>
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
														<ul id="ul-cubes" class="full-overflow-list-columns"></ul>
													</div>
													{{-- dimension-list --}}
													<div id="parent-list-dimensions">
														<h5>Dimensioni</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-dimension" id="search-dimension" value autocomplete="off" />
															<label for="search-dimension" class="">Ricerca</label>
														</div>
														<ul id="ul-dimensions" class="full-overflow-list-columns"></ul>
													</div>
													{{-- gerarchie --}}
													<div id="parent-list-hierarchies">
														<h5>gerarchie</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-hierarchy" id="search-hierarchy" value autocomplete="off" data-type-search="nested"/>
															<label for="search-hierarchy" class="">Ricerca</label>
														</div>
														<ul id="list-fact-tables" class="fact-table"></ul>
														<div class="c">
															<ul id="ul-hierarchies" class="full-overflow-list"></ul>
														</div>														
													</div>
												</div>
											</div>
										</section>
									  
										<section class="step" data-step="2">
											<div class="pageContent">
												<h5>Report</h5>
												<div class="v-grid">
													<div class="addElementsReport">
														<div class="btn-add">
															<span>colonne</span>
															<i id="btn-add-columns" class="material-icons md-36">add</i>
														</div>															
														<div class="btn-add">
															<span>nuovo filtro</span>
															<i id="btn-add-filters" class="material-icons md-36">add</i>
														</div>
														<div class="btn-add">
															<span>metriche</span>
															<i id="btn-add-metrics" class="material-icons md-36">add</i>
														</div>
														<div class="btn-add">
															<span>metriche composte</span>
															<i id="btn-add-composite-metrics" class="material-icons md-36">add</i>
														</div>
													</div>
													{{-- elementi del report --}}
													<div class="elementsReport">
														{{-- colonne --}}
														<div>
															<div class="md-field">
																<input type="search" data-element-search="search-columns-selected" id="search-columns-selected" value autocomplete="off" />
																<label for="search-columns-selected" class="">Ricerca</label>
															</div>
															<ul id="report-columns"></ul>
														</div>
														{{-- filtri --}}
														<div>
															<div class="md-field">
																<input type="search" data-element-search="search-exist-filters" id="search-exist-filters" value autocomplete="off" />
																<label for="search-exist-filters" class="">Ricerca</label>
															</div>
															<ul id="exist-filters" class="full-overflow-list"></ul>																
														</div>
														{{-- metriche --}}
														<div>
															<div class="md-field">
																<input type="search" data-element-search="search-exist-metrics" id="search-exist-metrics" value autocomplete="off" />
																<label for="search-exist-metrics" class="">Ricerca</label>
															</div>
															<ul id="exist-metrics" class="full-overflow-list"></ul>
														</div>
														{{-- metriche composte --}}
														<div>
															<div class="md-field">
																<input type="search" data-element-search="search-exist-composite-metrics" id="search-exist-composite-metrics" value autocomplete="off" />
																<label for="search-exist-composite-metrics" class="">Ricerca</label>
															</div>
															<ul id="exist-composite-metrics" class="full-overflow-list"></ul>
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
									<div class="left-buttons">
										<button id="prev" class="md-button">Precedente</button>										
									</div>
									<div class="right-buttons">
										<button id="next" class="md-button">Successivo</button>
										<button id="save" class="md-button">Salva</button>										
									</div>
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
