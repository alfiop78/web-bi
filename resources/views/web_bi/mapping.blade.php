<!DOCTYPE html>
<html lang="it">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
  <link rel="icon" href="/favicon.png" type="image/png" />
  <title>mapping</title>
  <link rel="stylesheet" href="{{ asset('/css/md-dialogs.css') }}">
  <link rel="stylesheet" href="{{ asset('/css/md-tooltip.css') }}">
  <link rel="stylesheet" type="text/css" href="/css/md-layout.css" />
  <link rel="stylesheet" type="text/css" href="/css/material-icons.css" />
  <link rel="stylesheet" type="text/css" href="/css/md-loader.css" />
  <link rel="stylesheet" type="text/css" href="/css/md-controls.css" />
  <link rel="stylesheet" type="text/css" href="/css/md-drawer.css" />
  <link rel="stylesheet" type="text/css" href="/css/md-inputs.css" />
  <link rel="stylesheet" type="text/css" href="/css/timeline.css" />
  <link rel="stylesheet" type="text/css" href="/css/md-lists.css" />
  <link rel="stylesheet" href="{{ asset('css/index.css') }}">
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <script src="/js/Application.js"></script>
  <script src="/js/lib.js"></script>
  <script src="/js/Storage.js"></script>
  <script src="/js/Cube.js"></script>
</head>

<body class="antialiased">

  <div class="abs-window" hidden>
    <div id="warning-elements" hidden>
      <small>Elementi presenti in ambiente di Produzione / Sviluppo.<br>La copia in Sviluppo è diversa da quella in Produzione</small>
      <p data-text-singular hidden>&Eacute; presente <strong>1</strong> elemento in conflitto</p>
      <p data-text-plural hidden>Sono presenti <strong></strong> elementi in conflitto</p>
    </div>
    <div id="attention-elements" hidden>
      <small>Elementi presenti in ambiente di Sviluppo.<br>Questi elementi, una volta terminata la fase di Sviluppo, potranno essere "versionati" in Produzione.</small>
      <p data-text-singular hidden>&Eacute; presente <strong>1</strong> nuovo elemento in locale, (non sincronizzato)</p>
      <p data-text-plural hidden>Sono presenti <strong></strong> nuovi elementi in locale (non sincronizzato)</p>
    </div>
    <div id="done-elements" hidden>
      <small>Elementi non presenti in ambiente di Sviluppo.<br>Questi elementi vengono sincronizzati automaticamente dal DB</small>
      <p data-text-singular hidden>&Eacute; stato scaricato <strong>1</strong> nuovo elemento in locale</p>
      <p data-text-plural hidden>Sono stati scaricati <strong></strong> nuovi elementi in locale</p>
    </div>
    <div id="sync-elements" hidden>
      <small>Elementi già sincronizzati</small>
      <p data-text-singular hidden>&Eacute; presente <strong>1</strong> elemento già sincronizzato</p>
      <p data-text-plural hidden>Sono presenti <strong></strong> elementi già sincronizzati</p>
    </div>
  </div>

  {{-- template utilizzato per popolare sia le dimensioni che i cubi --}}
  <template id="versioning-db">
    <section data-searchable="true">
      <div class="versioning-status">
        <div class="vers-title">
          <div class="name" data-name></div>
          <div data-created-at>
            <span>Creazione</span>
            <span data-created-at></span>
          </div>
          <div data-updated-at>
            <span>Aggiornamento</span>
            <span data-updated-at></span>
          </div>
        </div>
        <div class="vers-status"><button data-status type="button" class="button-icon material-icons md-18"></i></div>
        <div class="vers-status-descr"></div>
        <div class="vers-actions">
          {{-- Elimina Sviluppo/Produzione --}}
          <button type="button" data-id="btn-delete" tooltip="Elimina" flow="bottom" class="button-icon material-icons md-18 md-warning">clear</button>
          {{-- Sovrascrivi copia in Sviluppo --}}
          <button type="button" data-id="btn-download" tooltip="Download" flow="bottom" class="button-icon material-icons md-18" disabled>download</button>
          {{-- <span class="popupContent" data-download hidden><i data-id="btn-download" class="material-icons md-warning">download</i></span> --}}
          {{-- Sovrascrivi copia in Produzione --}}
          <button type="button" data-id="btn-upgrade-production" tooltip="Aggiorna" flow="bottom" class="button-icon material-icons md-18" disabled>upgrade</button>
          {{-- <span class="popupContent" data-upgrade hidden><i data-id="btn-upgrade-production" class="material-icons md-warning">upgrade</i></span> --}}
          {{-- Salva in Produzione --}}
          <button type="button" data-id="btn-upload-local-object" tooltip="Upload" flow="bottom" class="button-icon material-icons md-18" disabled>upload</button>
          {{-- <span class="popupContent" data-upload hidden><i data-id="btn-upload-local-object" class="material-icons md-warning">upload</i></span> --}}
        </div>
      </div>
    </section>
  </template>

  <template id="tmpl-hierarchy-tables">
    <div class="schema-table">
      <span schema></span>
      <span class="highlight" table></span>
    </div>
  </template>

  <template id="tmpl-hierarchy-list">
    <div class="hierarchies">
      <h6></h6>
      <div class="hierarchy">
        <div class="tables"></div>
        <div class="self-end">
          <button data-id="dimension-edit" type="button" class="button-icon material-icons md-18" tooltip="Modifica" flow="left">edit</button>
        </div>
      </div>
      {{-- <div class="mini-card-buttons"> </div> --}}
    </div>
  </template>

  <template id="tmpl-dimension-list">
    <section data-element-search="dimensions" data-searchable="true" data-sublist-dimensions>
      <div class="element dimensions">
        <div class="mini-card">
          <h5></h5> {{-- titolo della dimensione --}}
          <div data-dimension-tables>
            {{-- elenco tabelle contenute nella dimensione --}}
          </div>
          <button data-id="dimension-use" type="button" name="dimensionUse" class="md-button">utilizza</button>
        </div>
      </div>
    </section>
  </template>

  <template id="tmpl-cube-list">
    <section data-element-search="cubes" data-label>
      <div class="element">
        <li id="" label=""></li>
      </div>
    </section>
  </template>

  <dialog id="versioning">
    <section class="versioning-sections">
      <div class="dialog-title-info">
        <h4>Sincronizzazione elementi</h4>
        <span class="dialog-info">
          <span>Ultima sincronizzazione : </span>
          <span data-dialog-info></span>
        </span>
      </div>
      <section class="versioning-grid">
        <fieldset>
          <legend>Elementi</legend>
          <nav id="nav-objects">
            <a href="#" id="navBtnCubes" data-object-type="cubes" data-selected>Cubi</a>
            <a href="#" id="navBtnDimensions" data-object-type="dimensions">Dimensioni</a>
            <a href="#" id="navBtnMetrics" data-object-type="metrics">Metriche</a>
            <a href="#" id="navBtnFilters" data-object-type="filters">Filtri</a>
            <a href="#" id="navBtnProcesses" data-object-type="processes">Processi</a>
          </nav>
        </fieldset>
        <fieldset class="auto-grid">
          <legend>Lista elementi sincronizzati dal DB</legend>
          <div class="search-filter">
            <div class="md-field">
              {{-- data-element-search indica gli elementi dove questa input deve effettuare la ricerca --}}
              <input type="search" id="search-db" value="" data-element-search="versioning-db-search" data-search-type="generic-search" autocomplete="off" autofocus />
              <label for="search-db" class="">Ricerca</label>
            </div>
            <label class="pure-material-switch">
              <input type="checkbox" id="chk-local-db-switch" class="js-push-btn">
              <span>Visualizza solo elementi in locale</span>
            </label>
          </div>

          <section data-versioning-elements>
            {{-- l'attributo data-object deve corrispondere al risultato della query restituita da BidimensionController, BIcubesController, ecc...--}}
            <ul data-object="cubes" class="custom-scrollbar"></ul>
            <ul data-object="dimensions" class="custom-scrollbar" hidden></ul>
            <ul data-object="filters" class="custom-scrollbar" hidden></ul>
            <ul data-object="metrics" class="custom-scrollbar" hidden></ul>
            <ul data-object="processes" class="custom-scrollbar" hidden></ul>
          </section>
        </fieldset>
      </section>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">chiudi</button>
      </div>

    </section>
  </dialog>

  <dialog id="dialog-hierarchies-map">
    <section class="dialog-sections">
      <h4>Imposta relazione con tabella TIME</h4>
      <div class="flex-h">
        <div>
          <h6>Seleziona il campo da mettere in relazione</h6>
          <ul id="time-fields">
            <li data-field="date" data-fn="handlerTimeField" data-selected>DATE <small>Es.: 2023-12-31</small></li>
            <li data-field="month_id" data-fn="handlerTimeField">MONTH <small>Es.: 202312</small></li>
            <li data-field="year" data-fn="handlerTimeField">YEAR <small>Es.: 2023</small></li>
          </ul>
        </div>
        <div>
          <h6>Join</h6>
          <div class="flex-v">
            <span data-join-operator="=">&#61;</span>
            <span data-join-operator=">">&gt;</span>
            <span data-join-operator="<">&lt;</span>
            <span data-join-operator=">=">&gt;=</span>
            <span data-join-operator="<=">&lt;=</span>
            <span data-join-operator="<>">&lt;&gt;</span>
          </div>
        </div>
        <div id="composite-field-formula" data-content-editable contenteditable="true"></div>
      </div>
      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnHierarchyMap" type="button" name="done" class="md-button">ok</button>
      </div>
  </dialog>

  <dialog id="dialog-column-map" class="medium-dialog">
    <div id="abs-popup-dialog" class="absolute-popup" hidden></div>
    <section class="dialog-sections">
      <h4>Imposta ID - Descrizione colonna</h4>
      <div class="columns-map">
        <div class="id-ds">
          <div>
            <span id="column-id">ID</span>
            {{-- <div id="textarea-column-id-formula" contenteditable="true">
                                <strong><span contenteditable="true"></span></strong>
                            </div> --}}
            <textarea id="textarea-column-id-formula" rows="10" placeholder="ID Formula" autocomplete="off" autofocus required minlength="1" readonly></textarea>
            <div class="buttons-sql-formula">
              <i id="edit-sql-formula-column-id" class="material-icons md-18" tooltip="Modifica" flow="bottom">edit</i>
            </div>
          </div>
          <div>
            <span id="column-ds">DESCRIZIONE</span>
            <textarea id="textarea-column-ds-formula" rows="10" placeholder="Description Formula" autocomplete="off" required minlength="1" readonly></textarea>
            <div class="buttons-sql-formula">
              <i id="edit-sql-formula-column-ds" class="material-icons md-18" tooltip="Modifica" flow="bottom">edit</i>
            </div>
          </div>
        </div>

        <div>
          <div class="md-field">
            <input type="search" id="search" data-element-search="search" autocomplete="off" />
            <label for="tableSearch" class="">Ricerca</label>
          </div>
          <ul id="ul-column-map" hidden></ul>
        </div>

      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnColumnsMap" type="button" name="done" class="md-button">ok</button>
      </div>
    </section>

  </dialog>

  <dialog id="cube-name" class="dialog-save">
    <section>
      <h4>Nome Cubo</h4>
    </section>
    <div class="dialog-save-name">

      <div class="md-field">
        <input type="text" id="cubeName" value="" />
        <label for="cubeName" class="">Nome</label>
      </div>
      <textarea id="textarea-cube-comment" rows="10" placeholder="Aggiungi un commento per il Cubo"></textarea>

    </div>

    <div class="dialog-buttons">
      <button type="button" name="cancel" class="md-button">annulla</button>
      <button id="btnCubeSaveName" type="button" name="done" class="md-button">Salva</button>
    </div>

  </dialog>

  <dialog id="dimension-name" class="dialog-save">
    <section>
      <h4>Nome dimensione</h4>
      <div class="dialog-save-name">

        <div class="md-field">
          <input type="text" id="dimensionName" value="" autofocus autocomplete="off" />
          <label for="dimensionName" class="">Nome</label>
        </div>
        <textarea id="textarea-dimension-comment" rows="10" placeholder="Aggiungi qui un commento per la dimensione"></textarea>

      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnDimensionSaveName" type="button" name="done" class="md-button">Salva</button>
      </div>
    </section>

  </dialog>

  <dialog id="hierarchy-name" class="dialog-save">
    <section>
      <h4>Nome gerarchia</h4>
      <div class="dialog-save-name">

        <div class="md-field">
          <input type="text" id="hierarchyName" value="" autofocus autocomplete="off" />
          <label for="hierarchyName" class="">Nome Gerarchia</label>
        </div>
        <textarea id="textarea-hierarchies-comment" rows="10" placeholder="Aggiungi qui un commento per questa gerarchia"></textarea>

      </div>

      <div class="dialog-buttons">
        <button type="button" name="cancel" class="md-button">annulla</button>
        <button id="btnHierarchySaveName" type="button" name="done" class="md-button">Salva</button>
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
            <ul id="ul-fields" class="absolute"></ul>
          </div>
        </section>

        <section class="sectionLists parent-formula">
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
          <div id="composite-metric-formula" contenteditable="false"></div>
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

  <template id="cardLayout">
    <div class="cardLayout">
      <section class="cardTable" data-name data-schema data-alias>
        <section options-hier>
          <div>
            <button type="button" class="button-icon material-icons-round md-18 md-pad-4 md-dark" tooltip="Incrementa ordine gerarchico" flow="left" hier-order-plus>keyboard_arrow_up</button>
            <span data-value="" class="hierarchy-order"></span>
            <button type="button" class="button-icon material-icons-round md-18 md-pad-4 md-dark" hier-order-minus tooltip="Decrementa ordine gerarchico" flow="left">keyboard_arrow_down</button>
          </div>
        </section>
        <div class="title">
          <div class="title-alias" data-id>
            <h6></h6>
            <div class="subtitle"></div>
          </div>
          <div class="buttons-card-action">
            <button type="button" data-id data-close-card class="button-icon material-icons-round md-pad-4 md-18" tooltip="Chiudi" flow="bottom">close</button>
            <button type="button" data-id data-minimize-card class="button-icon material-icons-round md-pad-4 md-18" tooltip="Minimizza" flow="bottom">expand_less</button>
            <button type="button" data-id data-expand-card class="button-icon material-icons-round md-pad-4 md-18" tooltip="Espandi" flow="bottom" hidden>expand_more</button>
          </div>
        </div>
        <ul data-id="columns" class="custom-scrollbar" hidden></ul>
        <div class="info" hidden></div>
      </section>
      <section options data-mode="default">
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" columns tooltip="Colonne" flow="right">view_list</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" metrics tooltip="Metriche" flow="right">show_chart</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" composite-metrics tooltip="Crea metrica composta" flow="right">addchart</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" join tooltip="Crea relazione" flow="right">insert_link</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" join-left tooltip="Left join" flow="right">join_left</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" join-right tooltip="Right join" flow="right">join_right</button>
        <button type="button" class="button-icon material-icons-round md-pad-4 md-18" time tooltip="DateTime" data-fn="handlerDateTime" flow="right">history</button>
      </section>
      <div class="md-field">
        <input type="search" value="" data-element-search />
        <label for="searchColumns" class="">Ricerca</label>
      </div>
    </div>
  </template>

  <template id="templateList">

    <section data-element-search data-label data-sublist-table-card data-searchable="true">
      <span class="sublist">
        <span generic class="selectable"></span>
        <i data-id="column-icon" class="material-icons-round md-18">view_list</i>
        <i data-id="hierarchy-icon" class="material-icons-round md-18">insert_link</i>
        <i data-id="metric-icon" class="material-icons-round md-18">show_chart</i>
      </span>
    </section>

    <section class="data-item" data-element-search data-label data-sublist-draggable data-searchable="true">
      <div>
        <div class="selectable h-content" generic id draggable="true">
          <div class="v-content">
            <span table></span>
          </div>
          <i class="material-icons md-18">star_outline</i>
        </div>
      </div>
    </section>

    <section class="data-item" data-element-search data-label data-sublist-cubes data-searchable="true">
      <div>
        <div class="h-content">
          <div class="selectable v-content">
            <span generic class="highlight"></span>
            <span table class="no-highlight"></span>
          </div>
          <i class="material-icons md-18">edit</i>
        </div>
      </div>
    </section>

    <section data-element-search data-label data-sublist-generic data-searchable="true">
      <span class="sublist">
        <span generic></span>
      </span>
    </section>

    {{-- lista generica --}}
    <section class="data-item list" data-element-search data-label data-sublist-gen hidden>
      <div class="selectable" data-label>
        <div class="h-content">
          <div class="v-content">
            <span data-item></span>
          </div>
        </div>
      </div>
    </section>

    {{-- lista fields --}}
    <section class="data-item list" data-element-search data-label data-sublist-fields data-searchable>
      <div class="selectable" data-label>
        <div class="h-content">
          <div class="v-content ellipsis">
            <span class="ellipsis" data-item></span>
          </div>
          <i data-id="column-icon" class="material-icons-round md-pad-4 md-18">view_list</i>
          <i data-id="hierarchy-icon" class="material-icons-round md-pad-4 md-18">insert_link</i>
          <i data-id="metric-icon" class="material-icons-round md-pad-4 md-18">show_chart</i>
        </div>
      </div>
    </section>

  </template>

  <template id="tmpl-span">
    <div>
      <span data-id></span>
      <span data-table></span>
    </div>
  </template>

  <main>
    <div id="drawer">

      <section class="account">
        <h5>user</h5><i class="material-icons md-light">person</i>
      </section>

      <nav id="nav-schema">
        {{-- {{ dd($schemes) }} --}}
        @foreach($schemes as $schema)
        <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
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
    <div id="container" data-page="1">
      <div id="content">
        <div id="body">
          {{-- <canvas id="canvas"></canvas> --}}

          <div class="actions">
            <div class="buttons">
              <button id="btn-schema-list" data-window-name="list-schema" class="button-icon material-icons-round md-24" type="button" tooltip="Schemi Database" flow="bottom" open>storage</button>
              <button id="btn-open-table-list" class="button-icon material-icons-round md-24" type="button" tooltip="Lista tabelle" flow="bottom" disabled>storage</button>
              <button id="btn-open-dimension-list" type="button" class="button-icon material-icons-round md-24" tooltip="Lista Dimensioni" flow="bottom" disabled>schema</button>
              <button id="btn-new-cube" type="button" class="button-icon material-icons-round md-24" tooltip="Definisci cubo" flow="bottom" disabled>space_dashboard</button>
              <span class="h-separator"></span>
              <button id="btn-save-cube" type="button" class="button-icon material-icons-round md-24" tooltip="Salva cubo" flow="bottom" disabled>save</button>
              <button id="btn-save-opened-cube" type="button" class="button-icon material-icons-round md-24" tooltip="Aggiorna cubo" flow="bottom" disabled hidden>save</button>
              <button id="btn-defined-cube" type="button" data-window-name="list-defined-cubes" class="button-icon material-icons-round md-24" tooltip="Lista Cubi definiti" flow="bottom" disabled>folder_open</button>
              <span class="h-separator"></span>
              <button id="btn-versioning" type="button" class="button-icon material-icons-round md-24" tooltip="Esegui sincronizzazione" flow="bottom">cached</button>
              <button id="btn-versioning-status" type="button" class="button-icon material-icons-round md-24" tooltip="" data-open-abs-window flow="bottom" disabled>cached</button>
              <span class="h-separator"></span>
              <button id="btn-time-dimension" type="button" class="button-icon material-icons-round md-24" tooltip="Creazione tabella TIME" flow="bottom">date_range</button>
            </div>
          </div>

          <section class="wrapper">
            {{-- div 1 --}}
            <div class="absList" id="tableList" hidden>
              <div class="md-field">
                <input type="search" id="tableSearch" data-element-search="tables" autocomplete="off" />
                <label for="tableSearch" class="">Ricerca</label>
              </div>
              <div class="relative-ul">
                <ul id="tables" class="absolute custom-scrollbar"></ul>
              </div>
            </div>
            {{-- dimensioni --}}
            <div class="absList large-list" id="dimensionList" hidden>
              <div class="md-field">
                <input type="search" id="dimensionSearch" data-element-search="dimensions" autocomplete="off" />
                <label for="dimensionSearch" class="">Ricerca</label>
              </div>
              <div class="relative-ul">
                <ul id="dimensions" class="absolute custom-scrollbar"></ul>
              </div>
            </div>

            <div id="drop">
              <div id="list-schema" class="absolute-window" data-window-name="list-schema">
                <div class="relative-ul">
                  <ul class="custom-scrollbar">
                    {{-- {{ dd($schemes) }} --}}
                    @foreach($schemes as $schema)
                    <section data-element-search data-fn="schemaSelected" data-schema="{{ $schema['SCHEMA_NAME'] }}" data-label data-sublist-generic data-searchable="true">
                      <span class="sublist">
                        <span generic>{{ $schema['SCHEMA_NAME']}}</span>
                      </span>
                    </section>
                    @endforeach
                  </ul>
                </div>
              </div>
              <div class="absolute-window" data-window-name="list-defined-cubes">
                <div class="md-field">
                  <input type="search" id="cubeSearch" data-element-search="cubes" autocomplete="off" />
                  <label for="cubeSearch" class="">Ricerca</label>
                </div>
                <div class="relative-ul">
                  <ul id="cubes" class="custom-scrollbar"></ul>
                </div>
              </div>
              <div id="drop-zone" class="dropzone" data-mode-insert="after"><span>Trascina qui le tabelle da mappare</span></div>
              <div id="hierarchies">
                <section class="hierarchies"></section>
                <div id="btn-arrow-open-close">
                  <button type="button" id="toggle-hierarchy-struct" class="button-icon material-icons md-24" disabled>arrow_circle_left</button>
                </div>
              </div>
              <div id="drop-zone-buttons">
                <div class="drop-zone-buttons">
                  <button id="btnNewHierarchy" type="button" class="button-icon material-icons-round md-pad-4 md-18 md-dark" tooltip="Nuova gerarchia" flow="right">add</button>
                  <button id="btnSaveHierarchy" class="button-icon material-icons-round md-pad-4 md-18 md-dark md-sienna" type="button" tooltip="Salva gerarchia" flow="right" disabled>ballot</button>
                  <button id="btn-save-dimension" class="button-icon material-icons-round md-pad-4 md-18 md-dark" type="button" tooltip="Salva dimensione" flow="right" disabled>save</button>
                </div>
              </div>
            </div>
            <template id="tmpl-hierarchies">
              <section data-id="hierarchies" data-hier-token="0" class="section-content">
                <h6></h6>
                <div class="hierarchy-detail"></div>
              </section>
            </template>

          </section>

        </div>

      </div>

      <div id="controls">
        <div id="fabs">
          <button id="mdc-back" class="button dense raised">home</button>
          <div class="spacer"></div>
          <button id="mdc-report" class="button dense raised">report</button>
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
  <script type="text/javascript" src="/js/init.js" async></script>
  <script type="text/javascript" src="/js/init_versioning.js" async></script>
</body>

</html>
