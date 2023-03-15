<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>mapping - new</title>
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/material-icons.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-input-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-steps-responsive.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-preview-table.css') }}" />
  <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-mapdb.css') }}" />
  <script src="{{ asset('/js/Application.js') }}"></script>
  <script src="{{ asset('/js/Step.js') }}"></script>
  <script src="{{ asset('/js/lib.js') }}"></script>
  <script src="{{ asset('/js/WBStorage.js') }}"></script>
  <script src="{{ asset('/js/WorkBooks.js') }}"></script>
  <script src="{{ asset('/js/Table.js') }}"></script>
  <script src="{{ asset('/js/DrawSVG.js') }}"></script>
</head>

<body class="antialiased">

  <template id="tmpl-li">
    <li data-li data-element-search data-label data-searchable="true">
      <span></span>
    </li>

    <li data-li-drag data-element-search data-label data-searchable="true" draggable="true">
      <i class="material-icons-round md-18">drag_handle</i>
      <span></span>
    </li>
  </template>

  <template id="tmpl-dl-element">
    <dl data-id="dt-hierarchies">
      <dt></dt>
    </dl>
  </template>

  <template id="tmpl-dd-element">
    <dd>
      <details data-id="dt-tables">
        <summary></summary>
      </details>
      <button class="new-worksheet-object" data-fn="btnMetricNew" type="button" value="crea metrica">nuova metrica</button>
    </dd>
  </template>

  <main>
    <div id="drawer">

      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav>
        <a href="#" id="mdc-back">home</a>
        {{-- {{ dd($schemes) }} --}}
        @foreach($schemes as $schema)
        <a href="#" data-fn="handlerSchema" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
        @endforeach
      </nav>

    </div>

    <header>
      <div class="nav-button">
        <!-- codelab-nav-button-->
        <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
        <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>
      </div>

      <h1 class="title">Map database</h1>
    </header>

    <template id="tmpl-join-field">
      <div class="join-field" data-active></div>
    </template>

    <template id="tmpl-columns-defined">
      <div class="column-defined">
        <i class="button-icon material-icons-round md-18">view_column</i>
        <span></span>
      </div>
    </template>

    <template id="tmpl-metrics-defined">
      <div class="metric-defined">
        <section class="formula" data-token>
          <code data-aggregate="SUM" data-fn="editAggregate">SUM</code><span>(</span><code data-field="" data-table-alias></code><span>)&nbsp;</span><code data-alias="">alias</code>
        </section>
        <i data-id="btn-set-filter" data-fn="setMetricFilter" class="button-icon material-icons-round md-18">filter_alt</i>
      </div>
    </template>

    <template id="tmpl-formula">
      <span class="markContent">
        <i class="material-icons-round md-14">cancel</i>
        <mark></mark>
        <small></small>
      </span>
    </template>

    <div id="container">
      <div id="content">
        <div id="body">
          <dialog id="dialog-workbook-open">
            <section class="dlg-grid">
              <section class="dlg-title">Apri WorkBook</section>
              <section class="dlg-content col col-1">
                <nav data-workbook-defined></nav>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-metric">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Metrica</section>
              <section class="dlg-content col col-1">
                <section>
                  <div id="textarea-metric" class="dropzone" data-content-editable contenteditable="true"></div>
                  <!--<textarea id="textarea-metric" cols="20" class="dropzone" rows="10">SUM(</textarea>-->
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveMetric" id="btn-metric-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-filters">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Filtro</section>
              <section class="dlg-content col col-2">
                <nav></nav>
                <section>
                  <div id="textarea-filter" data-content-editable></div>
                </section>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="saveFilter" id="btn-filter-save" value="salva">Salva</button>
              </section>
            </section>
          </dialog>

          <dialog id="dlg-metric-filters">
            <section class="dlg-grid">
              <section class="dlg-title">Creazione Filtro</section>
              <section class="dlg-content col col-1">
                <nav data-filters-defined></nav>
              </section>
              <section class="dlg-buttons">
                <button name="cancel" value="chiudi">Chiudi</button>
                <button data-fn="addFiltersToMetric" id="btn-filter-add" value="salva">Salva</button>
              </section>
            </section>


          </dialog>
          <div class="wrapper">
            <div id="window-join" class="absolute-window" data-x="0" data-y="0" data-open="false">
              <section class="wj-content">
                <section class="w-title">
                  <p class="title">Creazione relazione</p>
                  <button type="button" data-fn="closeWindowJoin" class="button-icon material-icons-round md-18">close</button>
                </section>
                <div class="wj-joins">
                  <section data-table-from data-table-id>
                    <div class="table"></div>
                    <div class="joins"></div>
                  </section>
                  <section data-table-to data-table-id>
                    <div class="table"></div>
                    <div class="joins"></div>
                  </section>
                </div>
                <button id="btn-add-join" data-fn="addJoin" class="button-icon material-icons-round md-18" value="Aggiungi join">add</button>
                <div class="wj-fields-list">
                  <section data-table-from>
                    <section class="list-search">
                      <div class="md-field">
                        <input type="search" id="field-from-search" data-element-search="from-fields" autocomplete="off" />
                        <label for="field-from-search" class="">Ricerca</label>
                      </div>
                      <div class="relative-ul">
                        <ul id="ul-from-fields" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                  <section data-table-to>
                    <section class="list-search">
                      <div class="md-field">
                        <input type="search" id="field-to-search" data-element-search="to-fields" autocomplete="off" />
                        <label for="field-to-search" class="">Ricerca</label>
                      </div>
                      <div class="relative-ul">
                        <ul id="ul-to-fields" class="custom-scrollbar"></ul>
                      </div>
                    </section>
                  </section>
                </div>
              </section>
            </div>

            <div class="absolute-window" id="window-columns" data-x="0" data-y="0" data-open="false">
              <section class="wc-content">
                <section class="w-title">
                  <p class="title">Definizione colonna</p>
                </section>
                <section class="define-fields">
                  <div class="textarea">
                    <textarea id="textarea-column-id-formula" data-mode="field" rows="10" placeholder="ID Formula" autocomplete="off" autofocus="" required="" minlength="1" readonly="true"></textarea>
                  </div>
                  <div class="textarea">
                    <textarea id="textarea-column-ds-formula" data-mode="field" rows="10" placeholder="DS Formula" autocomplete="off" autofocus="" required="" minlength="1" readonly="true"></textarea>
                  </div>
                </section>
                <div class="dialog-buttons">
                  <button type="button" name="cancel" class="md-button">annulla</button>
                  <button id="btn-columns-define" data-fn="saveColumn" type="button" name="done" class="md-button">SALVA</button>
                </div>
              </section>
            </div>


            <section class="steps" data-step="1">
              <!--<button type="button" id="prev" class="button-icon material-icons-round md-48" disabled tooltip="Precedente" flow="right">skip_previous</button>-->
              <div class="overflow">
                <div id="stepTranslate" data-translate-x="0">
                  <section class="step" data-step="1" selected>
                    <section class="wrapper-step">
                      <section id="canvas-area">
                        <div>
                          <section id="data-source-name" class="data-source" contenteditable="false">data source name</section>
                          <button data-fn="workBookOpen" id="btn-workbook-open" value="open">Apri</button>
                        </div>
                        <div id="translate" class="translate" data-translate-x="0" data-translate-y="0">
                          <svg id="svg" class="dropzone" data-level="0">
                            <defs>
                              <g id="table-struct" class="struct">
                                <rect x="0" y="0" />
                                <text x="18" y="20" font-family="Barlow" font-size=".85rem" font-weight="normal"></text>
                                <image id="backspace" href="{{ asset('/images/backspace.svg') }}" data-id data-fn="contextMenu" x="152" y="0" width="18" height="18">
                                </image>
                              </g>
                            </defs>
                          </svg>
                          <span id="coords"></span>
                        </div>
                      </section>
                      <section id="tables-area">
                        <section class="table-area-wrapper">
                          <section class="list-search">
                            <div class="md-field">
                              <input type="search" id="table-search" data-element-search="tables" autocomplete="off" />
                              <label for="tables-search" class="">Ricerca</label>
                            </div>
                            <div class="relative-ul">
                              <ul id="ul-tables" class="custom-scrollbar"></ul>
                            </div>
                          </section>
                          <section class="table-preview">
                            <div class="table-content">
                              <!--<table id="table-header-fixed">
                                <thead>
                                  <tr></tr>
                                </thead>
                              </table>-->
                              <table id="preview-table">
                                <thead>
                                  <tr></tr>
                                </thead>
                                <tbody></tbody>
                              </table>
                            </div>
                          </section>
                        </section>
                      </section>
                    </section>

                  </section>
                  <section class="step" data-step="2">
                    <section class="wrapper-sheet">
                      <div class="properties">
                        <section id="workbook-props"></section>
                        <section id="sheet-props">
                          <div>
                            <button data-fn="handlerFilters" id="btn-add-filters">Crea Filtro</button>
                          </div>
                          <nav id="worksheet-filters" data-filters-defined></nav>
                        </section>
                      </div>
                      <div class="report-area">
                        <section class="columns-rows">
                          <section class="sheet-elements">
                            <h5>Colonne</h5>
                            <section id="dropzone-columns" class="dropzone columns"></section>
                          </section>
                          <section class="sheet-elements">
                            <h5>Righe</h5>
                            <section id="dropzone-rows" class="dropzone rows"></section>
                          </section>
                        </section>
                        <section class="report-preview">
                          <section class="">
                            <span>report preview</span>
                            <button id="btn-sheet-preview" data-fn="process" value="Process">Process</button>
                          </section>
                        </section>
                      </div>
                    </section>
                  </section>
                </div>

              </div>
              <section class="actions">
                <button id="prev">Workbook</button>
                <button id="next">Sheet</button>
              </section>

              <!--<button type="button" id="next" class="button-icon material-icons-round md-48" tooltip="Anteprima report" flow="left">skip_next</button>-->
            </section>

          </div>

        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <!--<button id="mdc-back" class="button dense raised">home</button>
          <button id="prev" class="button dense raised">WorkBook</button>
          <div class="spacer"></div>
          <button id="next" class="button dense raised">report</button>-->
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
  <script type="text/javascript" src="{{ asset('/js/init-responsive.js') }}" async></script>
</body>

</html>
