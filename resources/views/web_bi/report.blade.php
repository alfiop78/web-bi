<!DOCTYPE html>
<html lang="it" dir="ltr">

<head>
  <meta charset="utf-8">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <meta name="theme-color" content="#70b1bb">
  <meta name="author" content="Pietrantuono Alfio">
  <link rel="stylesheet" type="text/css" href="/css/md-layout.css" />
  <link rel="stylesheet" href="{{ asset('/css/md-tooltip.css') }}">
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

  <template id="tmpl-filter-formula">
    <span class="markContent">
      <i class="material-icons-round md-14">cancel</i>
      <mark></mark>
      <small></small>
    </span>
  </template>

  <div id="absolute-window" class="absolute-window">
    <section class="window-title">
      <h5 data-object-name></h5>
      <h6 data-object-alias></h6>
    </section>
    <div class="content-window">
      <div>
        <span>Filtri</span>
        <span data-filter></span>
      </div>
    </div>
    <div class="dialog-buttons">
      <button type="button" name="cancelAbsoluteWindow" class="md-button">chiudi</button>
    </div>
  </div>

  <dialog id="dialog-sqlInfo" class="large-dialog">
    <section class="dialog-sections">
      <h4>INFO SQL</h4>

      <div class="stepLayout overflow-y">
        <section id="SQL"></section>
      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">chiudi</button>
      </div>
    </section>
  </dialog>

  <dialog id="dialog-column" class="small-dialog">
    <section class="dialog-sections">
      <h4>Seleziona le colonne da includere nel report</h4>

      <div class="stepLayout">

        <section class="sectionLists">
          <h5>SQL</h5>
          <h6>Aggiungere un alias per la colonna</h6>
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
        <input type="text" id="reportName" value="" autocomplete="off" />
        <label for="reportName" class="">Titolo Report</label>
        <p class="helper"></p>
      </div>
    </div>

    <div class="dialog-buttons">
      <button type="button" name="cancel" class="md-button">annulla</button>
      <button id="btnReportSaveName" type="button" name="done" class="md-button">Salva</button>
    </div>

  </dialog>

  <dialog id="dialog-value" class="small-dialog">
    <section class="dialog-sections">
      <h4>Ricerca valori per la colonna</h4>
      <div class="stepLayout">
        <section class="sectionLists parent-ul-base">
          <div class="md-field">
            <input type="search" id="dialog-value-search" data-element-search="dialog-value-search" value autocomplete="off" />
            <label for="dialog-value-search" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-filter-values" class="absolute"></ul>
          </div>
        </section>
      </div>
      {{-- <div class="md-field">
					<input type="search" id="dialog-value-search" data-element-search="dialog-value-search" value autocomplete="off" />
					<label for="dialog-value-search" class="">Ricerca valori</label>
				</div>
				<ul id="dialog-filter-values" class="full-overflow-list-columns"></ul> --}}
      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnValueDone" type="button" name="value-done" class="md-button">ok</button>
      </div>
    </section>


  </dialog>

  <dialog id="dialog-filter" class="large-dialog">
    <section class="dialog-sections" data-table-name>
      <h4>Creazione nuovo filtro</h4>
      <div class="stepLayout">

        <section class="sectionLists parent-ul-tables">
          <h5>Tabelle</h5>
          <h6>Seleziona la tabella</h6>
          <div class="md-field">
            <input type="search" data-element-search="search-tables" id="dialog-columns-search-table" value autocomplete="off" />
            <label for="dialog-columns-search-table" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-tables" class="absolute"></ul>
          </div>
        </section>

        <section class="sectionLists parent-ul-fields">
          <h5>Colonna/e</h5>
          <h6>Seleziona la colonna</h6>
          <div class="md-field">
            <input type="search" id="dialog-filter-search-field" data-element-search="dialog-filter-search-field" value autocomplete="off" />
            <label for="dialog-filter-search-field" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="dialog-filter-fields" class="absolute"></ul>
          </div>
        </section>

        <section class="sectionLists parent-ul-textarea">
          <h5>SQL</h5>
          <h6>Inserisci una formula SQL</h6>
          <div class="md-field">
            <input type="text" id="filterName" name="filterName" autocomplete="off" />
            <label for="filterName" class="">name</label>
            <p class="helper"></p>
          </div>
          <div>
            <button type="button" class="button-icon material-icons" id="search-field-values" tooltip="Visualizza valori" flow="bottom" data-field-name disabled>search</button>
          </div>
          {{-- <div class="md-field">
                            <textarea id="filterSQLFormula" name="filterSQL" rows="10" cols="33" placeholder="SQL"></textarea>
                        </div> --}}
          <div id="composite-filter-formula" data-content-editable></div>
          {{-- <span>Inserisci qui la formula SQL del filtro</span> --}}
          <button id="btnFilterSave" type="button" name="save" class="md-button" disabled>salva</button>
        </section>

      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnFilterDone" type="button" name="done" class="md-button">fatto</button>
      </div>
    </section>
  </dialog>

  <dialog id="dialog-metric-filter" class="small-dialog">
    <section class="dialog-sections">
      <h4>Ricerca filtri da impostare per la metrica</h4>
      <div class="stepLayout">
        <section class="sectionLists parent-ul-base">
          <div class="md-field">
            <input type="search" id="dialog-metric-filter-search" data-element-search="search-exist-filters" value autocomplete="off" />
            <label for="dialog-metric-filter-search" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-metric-filters" class="absolute"></ul>
          </div>
        </section>
      </div>
      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnMetricFilterDone" type="button" name="metric-filter-done" class="md-button">ok</button>
      </div>
    </section>
  </dialog>

  <dialog id="dialog-metric" class="large-dialog">
    <section class="dialog-sections" data-table-name>
      <h4>Creazione di una nuova metrica per il cubo <span data-cube-selected></span></h4>

      <div class="stepLayout">
        {{-- metriche mappate --}}
        <section class="sectionLists parent-ul">
          <h5>Metriche disponibili</h5>
          <div class="md-field">
            <input type="search" data-element-search="search-available-metrics" id="search-available-metrics" value autocomplete="off" />
            <label for="search-available-metrics" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-available-metrics" class="absolute"></ul>
          </div>
        </section>
        {{-- funzioni di aggregazione --}}
        <section class="sectionLists parent-ul">
          <h5>Aggregazione</h5>{{-- <h6>Seleziona la funzione di aggregazione</h6> --}}
          <div class="md-field">
            <input type="search" id="search-aggregate-functions" data-element-search="search-aggregate-functions" value="" autocomplete="off" />
            <label for="search-aggregate-functions" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-aggregation-functions" class="absolute">
              <section data-element-search="search-aggregate-functions" data-label="SUM" data-sublist-gen data-searchable>
                <div>
                  <div class="h-content">
                    <div class="selectable v-content" data-label="SUM" data-selected>
                      <span item>SUM</span>
                    </div>
                  </div>
                </div>
              </section>

              <section data-element-search="search-aggregate-functions" data-label="COUNT" data-sublist-gen data-searchable>
                <div>
                  <div class="h-content">
                    <div class="selectable v-content" data-label="COUNT">
                      <span item>COUNT</span>
                    </div>
                  </div>
                </div>
              </section>

              <section data-element-search="search-aggregate-functions" data-label="AVG" data-sublist-gen data-searchable>
                <div>
                  <div class="h-content">
                    <div class="selectable v-content" data-label="AVG">
                      <span item>AVG</span>
                    </div>
                  </div>
                </div>
              </section>

              <section data-element-search="search-aggregate-functions" data-label="MAX" data-sublist-gen data-searchable>
                <div>
                  <div class="h-content">
                    <div class="selectable v-content" data-label="MAX">
                      <span item>MAX</span>
                    </div>
                  </div>
                </div>
              </section>

              <section data-element-search="search-aggregate-functions" data-label="MIN" data-sublist-gen data-searchable>
                <div>
                  <div class="h-content">
                    <div class="selectable v-content" data-label="MIN">
                      <span item>MIN</span>
                    </div>
                  </div>
                </div>
              </section>

            </ul>
          </div>
          <label class="mdc-checkbox">
            <input id="checkbox-distinct" type="checkbox" name="distinct-checkbox" />
            <span>DISTINCT</span>
          </label>
        </section>

        <section class="sectionLists">
          <h5>SQL</h5>
          <div class="name-alias">
            <div class="md-field">
              <input type="text" id="metric-name" value="" autocomplete="off" disabled />
              <label for="metric-name" class="">Nome</label>
            </div>

            <div class="md-field">
              <input type="text" id="alias-metric" value="" autocomplete="off" disabled />
              <label for="alias-metrics" class="">Alias</label>
              <p class="helper"></p>
            </div>
          </div>
          <div class="md-field">
            <textarea id="metricSQLFormula" name="metricSQL" rows="8" cols="25" placeholder="SQL" disabled></textarea>
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
  </dialog>

  <dialog id="dialog-composite-metric" class="large-dialog">
    <section class="dialog-sections" data-table-name>
      <h4>Creazione di una nuova metrica composta per il cubo <span data-cube-selected></span></h4>

      <div class="stepLayout">
        {{-- metriche mappate --}}
        <section class="sectionLists parent-ul">
          <h5>Metriche disponibili</h5>
          <div class="md-field">
            <input type="search" data-element-search="search-metrics" id="search-metrics" value autocomplete="off" />
            <label for="search-metrics" class="">Ricerca</label>
          </div>
          <div class="relative-ul">
            <ul id="ul-metrics" class="absolute"></ul>
          </div>
        </section>

        <section class="sectionLists parent-formula">
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
          <div id="composite-metric-formula" data-content-editable></div>
          <button id="btnCompositeMetricSave" type="button" name="save" class="md-button" disabled>salva</button>
        </section>

      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnCompositeMetricDone" type="button" name="done" class="md-button">fatto</button>
      </div>
    </section>
  </dialog>

  <main>
    <div id="drawer" close>
      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>
      <nav>
      </nav>
    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
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
              <button type="button" id="btnProcessReport" class="button-icon material-icons-round md-24" tooltip="Crea datamart" flow="bottom">folder</button>
              <button type="button" id="btnNewReport" class="button-icon material-icons-round md-24" tooltip="Nuovo Report" flow="bottom">add</button>
              <button type="button" id="save" class="button-icon material-icons-round md-24" tooltip="Salva Report" flow="bottom" disabled>save</button>
              <button type="button" id="sql_process" class="button-icon material-icons-round md-24" tooltip="Visualizza SQL" flow="bottom" disabled>info</button>
            </div>
          </div>

          <template id="templateList">

            {{-- lista column esistenti --}}
            <section class="data-item" data-element-search data-label data-sublist-columns data-related-object hidden>
              <div>
                <div class="h-content">
                  <div class="v-content selectable" data-object-type="column">
                    <span column class="highlight"></span>
                    <small table></small>
                    <small hier></small>
                  </div>
                  <button class="button-icon material-icons-round md-18" data-object-token tooltip="Modifica" flow="bottom" disabled>edit</button>
                </div>
              </div>
            </section>

            {{-- lista filtri esistenti --}}
            <section class="data-item" data-element-search data-label data-related-object data-sublist-filters hidden>
              <div>
                <div class="h-content">
                  <div class="selectable v-content filters-color" data-object-type="filter">
                    <span filter class="highlight filters-color"></span>
                    <small table></small>
                    <small></small>
                  </div>
                  <button class="button-icon material-icons-round md-18" data-info-object-token tooltip="Info" flow="bottom" disabled>info</button>
                  <button class="button-icon material-icons-round md-18" data-object-token data-edit tooltip="Modifica" flow="bottom">edit</button>
                </div>
              </div>
            </section>

            {{-- lista metriche esistenti --}}
            <section class="data-item" data-element-search data-label data-related-object data-type="metric" data-sublist-metrics hidden>
              <div>
                <div class="h-content">
                  <div class="selectable v-content metrics-color" data-object-type="metric">
                    <span metric class="highlight metrics-color"></span>
                    <small table></small>
                    <small cube></small>
                  </div>
                  <button class="button-icon material-icons-round md-18" data-info-object-token tooltip="Dettaglio" flow="bottom">info</button>
                  <button class="button-icon material-icons-round md-18" data-object-token tooltip="Modifica" flow="bottom">edit</button>
                </div>
              </div>
            </section>

            {{-- metriche composite --}}
            <section class="data-item" data-element-search data-label data-sublist-composite-metrics hidden>
              <div>
                <div class="h-content">
                  <div class="selectable v-content composite-metrics-color" data-object-type="composite-metric">
                    <span metric class="highlight"></span>
                    {{-- TODO: per le metriche composte, visualizzarne, nel popup, l'elenco dei cubi utilizzati dalle metriche all'interno della formula --}}
                    <div class="smalls"></div>
                  </div>
                  <button class="button-icon material-icons-round md-18" data-info-object-token tooltip="Dettaglio" flow="bottom" disabled>info</button>
                  <button class="button-icon material-icons-round md-18" data-object-token tooltip="Modifica" flow="bottom">edit</button>
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
                  <button type="button" data-edit class="button-icon material-icons md-18" tooltip="Modifica" flow="bottom">edit</button>
                  <button type="button" data-copy class="button-icon material-icons md-18" tooltip="Duplica" flow="bottom">content_copy</button>
                  {{-- <span class="h-separator"></span> --}}
                  <button type="button" data-schedule class="button-icon material-icons md-18 md-highlight" tooltip="Esegui" flow="bottom">schedule_send</button>
                </div>
              </div>
            </section>

            <section class="data-item" data-element-search data-label data-related-object data-sublist-available-metrics hidden>
              <div class="selectable" data-label data-object-type="metric">
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
              <div class="selectable" data-label data-object-type="table">
                <div class="h-content">
                  <div class="v-content">
                    <span table class="highlight"></span>
                    <small></small>
                  </div>
                </div>
              </div>
            </section>

            {{-- lista generica --}}
            <section class="data-item list" data-element-search data-label data-sublist-gen data-related-object hidden>
              <div class="selectable" data-label data-object-type>
                <div class="h-content">
                  <div class="v-content">
                    <span item></span>
                  </div>
                </div>
              </div>
            </section>

            {{-- cube --}}
            <section class="data-item list" data-element-search="search-cube" data-label data-sublist-cube data-searchable="true">
              <div class="selectable" data-label data-object-type="cube">
                <div class="h-content">
                  <div class="v-content">
                    <span item></span>
                  </div>
                </div>
              </div>
            </section>

            {{-- dimension --}}
            <section class="data-item list" data-element-search="search-dimension" data-label data-related-object="cube" data-sublist-dimension hidden>
              <div class="selectable" data-label data-object-type="dimension">
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
            {{-- lista processi --}}
            <div class="absList large-list" id="reportProcessList" hidden>
              <div class="md-field">
                <input type="search" id="searchReportProcess" data-element-search="search-process" value="" autocomplete="off" />
                <label for="searchReportProcess" class="">Ricerca</label>
              </div>
              <div class="relative-ul">
                <ul id="ul-processes" class="absolute"></ul>
              </div>
            </div>

            <div class="absList large-list" id="reportTempProcessList" hidden>
              <div class="md-field">
                <input type="search" id="searchTempReport" data-element-search="search-temp-report" value="" autocomplete="off" />
                <label for="searchTempReport" class="">Ricerca</label>
              </div>
              <div class="relative-ul">
                <ul id="ul-temp-processes" class="absolute"></ul>
              </div>
            </div>

            <div class="steps" data-step="1">
              <button type="button" id="prev" class="button-icon material-icons-round md-48" disabled tooltip="Precedente" flow="right">skip_previous</button>
              <div class="overflow">
                <div id="hierarchies">
                  <section class="hierarchies">
                    <div class="parent-ul">
                      <h5>gerarchie</h5>
                      <div class="md-field">
                        <input type="search" data-element-search="search-hierarchy" id="search-hierarchy" value autocomplete="off" data-type-search="nested" />
                        <label for="search-hierarchy" class="">Ricerca</label>
                      </div>
                      <div class="relative-ul">
                        <ul id="ul-hierarchies" class="absolute"></ul>
                      </div>
                    </div>
                  </section>
                  <div id="btn-arrow-open-close">
                    <button type="button" id="toggle-hierarchy-struct" class="button-icon material-icons-round md-24 md-warning md-pad-2" tooltip="Apri struttura gerarchica" flow="right" disabled>arrow_circle_right</button>
                  </div>
                </div>
                <div id="stepTranslate" data-translate-x="0">
                  <section class="step" data-step="1" selected>
                    <div class="pageContent">
                      <div class="h-grid col-1">
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

                      </div>
                    </div>
                  </section>

                  <section class="step" data-step="2">
                    <div class="pageContent">
                      {{-- <h5>Seleziona gli elementi per comporre il Report</h5> --}}
                      <div class="h-grid col-3">
                        {{-- dimension-list --}}
                        <section class="parent-ul">
                          <h5>Dimensioni</h5>
                          <div class="md-field">
                            <input type="search" data-element-search="search-dimension" id="search-dimension" value autocomplete="off" />
                            <label for="search-dimension" class="">Ricerca</label>
                          </div>
                          <div class="relative-ul">
                            <ul id="ul-dimensions" class="absolute"></ul>
                          </div>
                        </section>
                        <section class="columns parent-ul">
                          <h5>Colonne</h5>
                          <div class="md-field">
                            <input type="search" data-element-search="search-columns" id="search-columns" value autocomplete="off" />
                            <label for="search-columns" class="">Ricerca</label>
                          </div>
                          <div class="relative-ul">
                            <ul id="ul-columns" class="absolute"></ul>
                          </div>
                        </section>
                        <section class="filters parent-ul-filters">
                          <h5>Filtri</h5>
                          <div class="md-field">
                            <input type="search" data-element-search="search-exist-filters" id="search-exist-filters" value autocomplete="off" />
                            <label for="search-exist-filters" class="">Ricerca</label>
                          </div>
                          <div class="relative-ul">
                            <ul id="ul-exist-filters" class="absolute"></ul>
                          </div>
                          <div class="justify-self-center">
                            <button type="button" id="btn-add-filters" class="button-icon material-icons-round md-32" tooltip="Aggiungi filtro" flow="top">add_circle</button>
                          </div>
                        </section>

                      </div>
                    </div>
                  </section>

                  <section class="step" data-step="3">
                    <div class="pageContent">
                      <div class="h-grid col-2">
                        {{-- metrics --}}
                        <section class="metrics parent-ul-metrics">
                          <h5>Metriche</h5>
                          {{-- <div class="btn-add">
															<span>Crea metrica</span>
															<button type="button" id="btn-add-metrics" class="button-icon material-icons md-32">add</button>
														</div> --}}
                          <div class="md-field">
                            <input type="search" data-element-search="search-exist-metrics" id="search-exist-metrics" value autocomplete="off" />
                            <label for="search-exist-metrics" class="">Ricerca</label>
                          </div>
                          <div class="relative-ul">
                            <ul id="ul-exist-metrics" class="absolute"></ul>
                          </div>
                          <div class="justify-self-center">
                            <button type="button" id="btn-add-metrics" class="button-icon material-icons-round md-32" tooltip="Aggiungi metrica" flow="top">add_circle</button>
                          </div>
                        </section>
                        {{-- composite --}}
                        <section class="composite-metrics parent-ul-metrics">
                          <h5>Metriche composte</h5>
                          <div class="md-field">
                            <input type="search" data-element-search="search-exist-composite-metrics" id="search-exist-composite-metrics" value autocomplete="off" />
                            <label for="search-exist-composite-metrics" class="">Ricerca</label>
                          </div>
                          <div class="relative-ul">
                            <ul id="ul-exist-composite-metrics" class="absolute"></ul>
                          </div>
                          <div class="justify-self-center"><button type="button" id="btn-add-composite-metrics" class="button-icon material-icons-round md-32" tooltip="Aggiungi metrica composta" flow="top">add_circle</button></div>
                        </section>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
              <button type="button" id="next" class="button-icon material-icons-round md-48" tooltip="Successivo" flow="left">skip_next</button>

              {{-- <div class="stepButtons right">
									<button type="button" class="button-icon material-icons md-36">info</button>
								</div> --}}
              {{-- <div class="buttons">
									<div class="left-buttons">
										<button id="prev" class="md-button">Precedente</button>										
									</div>
									<div class="right-buttons">
										<button id="next" class="md-button">Successivo</button>
										<button id="save" class="md-button">Salva</button>										
									</div>
								</div> --}}
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
