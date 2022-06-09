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

		{{-- <small id="tooltip" class="tooltip"></small> --}}

		<dialog id="dialog-column">
			<small id="dialog-popup" class="popupToast"></small>
			<section>
				<h4>Seleziona le colonne da includere nel report</h4>

				<div class="stepLayout">

					<section class="sectionLists">
						{{-- <h5>tabelle</h5><h6>subtitle</h6> --}}
						<div id="parent-list-columns">
							<h5>colonne</h5>
							{{-- <div class="md-field">
								<input type="search" data-element-search="search-columns" id="dialog-columns-search-column" value autocomplete="off" />
								<label for="dialog-columns-search-column" class="">Ricerca</label>
							</div> --}}
							{{-- <ul id="list-columns-fact" class="fact-table"></ul>
							<ul id="list-columns" class="full-overflow-list-columns"></ul> --}}
						</div>
					</section>

					<section class="sectionLists">
						<h5>SQL</h5><h6>Aggiungere un alias per la colonna</h6>
						<div class="md-field">
							<input type="text" id="columnAlias" name="columnAlias" autocomplete="off" />
							<label for="columnAlias" class="">Alias</label>
							<p class="helper"></p>
						</div>

						<div class="md-field">
							<textarea id="columnSQL" name="columnSQL" rows="10" cols="50" placeholder="es.: CONCAT(tabella.campo,'-',tabella.campo)"></textarea>
						</div>
					</section>

				</div>

				<div class="dialog-buttons">
					<button type="button" name="cancel" class="md-button">annulla</button>
					<button id="btnColumnDone" type="button" name="done" class="md-button" disabled>fatto</button>
				</div>
			</section>
		</dialog>

		<dialog id="dialog-save-report" class="dialog-save">
			<div class="dialog-save-name">

				<div class="md-field">
					<input type="text" id="reportName" value="" autocomplete="off"/>
					<label for="reportName" class="">Titolo Report</label>
					<p class="helper"></p>
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
						<ul id="ul-fact" class="fact-table"></ul>
						<ul id="ul-tables" class="full-overflow-list-columns"></ul>
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
							<input type="text" id="filterName" name="filterName" autocomplete="off" />
							<label for="filterName" class="">name</label>
							<p class="helper"></p>
						</div>
						<button type="button" class="button-icon material-icons" id="search-field-values" data-tooltip="Visualizza valori" data-tooltip-position="bottom" data-field-name>search</button>
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
							<label for="search-aggregate-functions" class="">Ricerca</label>
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
								<p class="helper"></p>
							</div>
						</div>
						<div class="md-field">
							<textarea id="metricSQLFormula" name="metricSQL" rows="8" cols="25" placeholder="SQL"></textarea>
						</div>
						<button id="metric-filtered" type="button" name="metric-filtered" class="md-button">Imposta filtri</button>
						<button id="btnMetricSave" type="button" name="save" class="md-button" disabled>salva</button>
					</section>

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
								<p class="helper"></p>
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
							<div class="buttons">
								<button type="button" id="btnProcessReport" class="button-icon material-icons md-18" data-tooltip="Crea datamart" data-tooltip-position="bottom">table_rows</button>
								{{-- <i id="btnDuplicateReport" class="material-icons md-18" data-tooltip="Duplica report" data-tooltip-position="bottom">content_copy</i> --}}
							</div>
						</div>

						<div class="lists">
							<div class="absList large" id="reportProcessList" hidden>
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
								<div>
									<div class="h-content">
										<div class="v-content selectable">
											<span column class="highlight"></span>
											<small table></small>
											<small hier></small>
										</div>
										<i class="material-icons md-18">edit</i>
									</div>
								</div>
							</section>

							{{-- lista filtri esistenti --}}
							<section class="data-item" data-element-search data-label data-sublist-filters hidden>
								<div>
									<div class="h-content">
										<div class="selectable v-content filters-color">
											<span filter class="highlight filters-color"></span>
											<small table></small>
											<small></small>
										</div>
										<i class="material-icons md-18">edit</i>
									</div>
								</div>
							</section>

							{{-- lista metriche esistenti --}}
							<section class="data-item" data-element-search data-label data-sublist-metrics hidden>
								<div>
									<div class="h-content">
										<div class="selectable v-content metrics-color">
											<span metric class="highlight metrics-color"></span>
											<small table></small>
											<small cube></small>
											{{-- TODO: qui, sulle metriche filtrate potrei visualizzare un popup con l'elenco dei filtri. --}}
										</div>
										<i class="material-icons md-18">edit</i>
									</div>
								</div>
							</section>

							{{-- metriche composite --}}
							<section class="data-item" data-element-search data-label data-sublist-composite-metrics hidden>
								<div>
									<div class="h-content">
										<div class="selectable v-content">
											<span metric class="highlight metrics-color"></span>
											{{-- TODO: per le metriche composte, visualizzarne, nel popup, l'elenco dei cubi utilizzati dalle metriche all'interno della formula --}}
											<div class="smalls">
												
											</div>
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
										<button type="button" data-edit class="button-icon material-icons md-18" data-tooltip="Modifica" data-tooltip-position="bottom">edit</button>
										<button type="button" data-copy class="button-icon material-icons md-18" data-tooltip="Duplica" data-tooltip-position="bottom">content_copy</button>
										{{-- <span class="h-separator"></span> --}}
										<button type="button" data-schedule class="button-icon material-icons md-18 md-highlight" data-tooltip="Esegui" data-tooltip-position="bottom">schedule_send</button>
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
													<div class="parent-ul">
														<h5>Cubi</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-cube" id="search-cube" value autocomplete="off" />
															<label for="search-cube" class="">Ricerca</label>
														</div>
														<div class="relative-ul">
															<ul id="ul-cubes" class="absolute"></ul>
														</div>
													</div>
													{{-- dimension-list --}}
													<div class="parent-ul">
														<h5>Dimensioni</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-dimension" id="search-dimension" value autocomplete="off" />
															<label for="search-dimension" class="">Ricerca</label>
														</div>
														<div class="relative-ul">
															<ul id="ul-dimensions" class="absolute"></ul>
														</div>
													</div>
													{{-- gerarchie --}}
													<div class="parent-ul-hierarchies">
														<h5>gerarchie</h5>
														<div class="md-field">
															<input type="search" data-element-search="search-hierarchy" id="search-hierarchy" value autocomplete="off" data-type-search="nested"/>
															<label for="search-hierarchy" class="">Ricerca</label>
														</div>
														<div class="relative-ul">
															<ul id="ul-fact-tables" class="absolute"></ul>
														</div>
														<div class="relative-ul">
															<ul id="ul-hierarchies" class="absolute"></ul>
														</div>
													</div>
												</div>
											</div>
										</section>
									  
										<section class="step" data-step="2">
											<div class="pageContent">
												<h5>Seleziona gli elementi per comporre il Report</h5>
												<div class="v-grid">
													<div class="addElementsReport">
														<section class="columns parent-ul-columns">
															<div class="md-field">
																<input type="search" data-element-search="search-columns" id="search-columns" value autocomplete="off" />
																<label for="search-columns" class="">Ricerca</label>
															</div>
															<div class="relative-ul">
																<ul id="ul-columns-fact" class="absolute"></ul>
															</div>
															<div class="relative-ul">
																<ul id="ul-columns" class="absolute"></ul>
															</div>
														</section>
														<section class="filters parent-ul-filters">
															<div class="btn-add">
																<span>Crea filtro</span>
																<button type="button" id="btn-add-filters" class="button-icon material-icons md-32">add</button>
															</div>
															<div class="parent-ul-filters">
																<div class="md-field">
																	<input type="search" data-element-search="search-exist-filters" id="search-exist-filters" value autocomplete="off" />
																	<label for="search-exist-filters" class="">Ricerca</label>
																</div>
																<div class="relative-ul">
																	<ul id="ul-exist-filters" class="absolute"></ul>
																</div>
															</div>
														</section>
														{{-- metrics --}}
														<section class="metrics parent-ul-metrics">
															<div class="btn-add">
																<span>Crea metrica</span>
																<button type="button" id="btn-add-metrics" class="button-icon material-icons md-32">add</button>
															</div>
															<div class="parent-ul-metrics">
																<div class="md-field">
																	<input type="search" data-element-search="search-exist-metrics" id="search-exist-metrics" value autocomplete="off" />
																	<label for="search-exist-metrics" class="">Ricerca</label>
																</div>
																<div class="relative-ul">
																	<ul id="ul-exist-metrics" class="absolute"></ul>
																</div>
															</div>
														</section>
														{{-- composite --}}
														<section class="composite-metrics parent-ul-metrics">
															<div class="btn-add">
																<span>Crea metrica composta</span>
																<button type="button" id="btn-add-composite-metrics" class="button-icon material-icons md-32">add</button>
															</div>
															<div class="parent-ul-metrics">
																<div class="md-field">
																	<input type="search" data-element-search="search-exist-composite-metrics" id="search-exist-composite-metrics" value autocomplete="off" />
																	<label for="search-exist-composite-metrics" class="">Ricerca</label>
																</div>
																<div class="relative-ul">
																	<ul id="ul-exist-composite-metrics" class="absolute"></ul>
																</div>
															</div>															
														</section>
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
