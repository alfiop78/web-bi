<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<link rel="icon" href="/favicon.png" type="image/png" />
        <title>mapping</title>
        <link rel="stylesheet" href="{{ asset('/css/md-dialogs.css') }}">
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
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@200;400;500;600&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Barlow', sans-serif;
            }
        </style>
    </head>
    <body class="antialiased">
        <small id="tooltip" class="tooltip"></small>

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
                    <div class="vers-status"><i class="material-icons"></i></div>
                    <div class="vers-status-descr"></div>
                    <div class="vers-actions">
                        {{-- Elimina Sviluppo/Produzione --}}
                        <span class="popupContent" data-delete><i data-id="btn-delete" class="material-icons md-warning">clear</i></span>
                        {{-- Sovrascrivi copia in Sviluppo --}}
                        <span class="popupContent" data-download hidden><i data-id="btn-download" class="material-icons md-warning">download</i></span>
                        {{-- Sovrascrivi copia in Produzione --}}
                        <span class="popupContent" data-upgrade hidden><i data-id="btn-upgrade-production" class="material-icons md-warning">upgrade</i></span>
                        {{-- Salva in Produzione --}}
                        <span class="popupContent" data-upload hidden><i data-id="btn-upload-local-object" class="material-icons md-warning">upload</i></span>
                    </div>
                </div>
            </section>
        </template>

        <template id="tmpl-hierarchy-tables">
            <div class="schema-table">
                <span schema></span>
                <span table></span>
            </div>
        </template>

        <template id="tmpl-hierarchy-list">
            <div class="hierarchies">
                <h6></h6>
                <div class="hierarchy">
                    <div class="tables"></div>
                    <button data-id="dimension-edit" type="button" name="dimensionEdit" class="md-button">modifica</button>
                </div>
                {{-- <div class="mini-card-buttons">
                    
                </div> --}}
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
                        <legend>Lista Oggetti</legend>
                        <nav id="nav-objects">
                            <a href="#" id="navBtnCubes">Cubi</a>
                            <a href="#" id="navBtnDimensions">Dimensioni</a>
                            <a href="#" id="navBtnMetrics">Metriche</a>
                            <a href="#" id="navBtnFilters">Filtri</a>
                            <a href="#" id="navBtnProcesses">Processi</a>
                        </nav>
                    </fieldset>
                    <fieldset class="auto-grid">
                        <legend>Lista elementi sincronizzati dal DB</legend>
                        <div class="search-filter">
                            <div class="md-field">
                                {{-- data-element-search indica gli elementi dove questa input deve effettuare la ricerca --}}
                                <input type="search" id="search-db" value="" data-element-search="versioning-db-search" data-search-type="generic-search" autocomplete="off" autofocus/>
                                <label for="search-db" class="">Ricerca</label>
                            </div>
                            {{-- <input type="checkbox" value="Elementi in locale" checked> --}}
                            <label class="pure-material-switch">
                                <input type="checkbox" id="chk-local-db-switch" class="js-push-btn">
                                <span>Visualizza solo elementi in locale</span>
                            </label>
                        </div>
                        
                        <section data-versioning-elements>
                            {{-- @php  --}}
                                {{-- $arrayDim = json_decode($dimensions, true); //array, ogni elementi dell'array è una dimensione --}}
                            {{-- @endphp --}}
                            <div class="versioning-status-header">
                                <div>Nome</div>
                                <div>Stato</div>
                                <div>Descr. Stato</div>
                                <div>Azione</div>
                            </div>
                            <div data-id="versioning-content" class="versioning-content overflow-y" data-object="dimensions" hidden> {{-- l'attributo data-object deve corrispondere al risultato della query restituita da BidimensionController, BIcubesController, ecc...--}}
                                {{-- qui viene popolato tramite template --}}
                                {{-- non posso utilizzare qui il confronto tra localStorage / DB. Devo farlo in javascript --}}
                                {{-- @foreach($arrayDim as $key => $dimension)
                                    @php
                                        $jsonDimension = json_decode($dimension['json_value']);
                                    @endphp
                                    <div class="versioning-status">
                                        <div class="vers-title">{{ $jsonDimension->{'name'} }}<span>({{ $jsonDimension->{'lastTableInHierarchy'} }})</span></div>
                                        <div class="vers-status"><i class="material-icons">done</i></div>
                                    </div>
                                @endforeach --}}
                            </div>

                            <div data-id="versioning-content" class="versioning-content overflow-y" data-object="cubes" hidden></div>
                            <div data-id="versioning-content" class="versioning-content overflow-y" data-object="metrics" hidden></div>
                            <div data-id="versioning-content" class="versioning-content overflow-y" data-object="filters" hidden></div>
                            <div data-id="versioning-content" class="versioning-content overflow-y" data-object="processes" hidden></div>
                        </section>
                        {{-- <section data-cubes>
                            <h5 class="upper">cubi</h5>
                            <div class="versioning-status-header">
                                <div>Title</div>
                                <div>Status</div>
                                <div>Descr. Status</div>
                                <div>Action</div>
                            </div>
                            <div data-id="versioning-content" class="versioning-content overflow-y"></div>
                        </section> --}}
                    </fieldset>
                </section>

                <div class="dialog-buttons">
                    <button type="button" name="cancel" class="md-button">chiudi</button>
                    <!-- <button id="btnSaveColumn" type="button" name="save" class="md-button" disabled>salva</button> -->
                    {{-- <button id="btnVersioninDone" type="button" name="done" class="md-button">fatto</button> --}}
                </div>
                
            </section>
        </dialog>

        <dialog id="dialog-column-map" class="medium-dialog">
            <div id="abs-popup-dialog" class="absolute-popup" hidden></div>
            <section>
                <h4>Imposta ID - Descrizione colonna</h4>
            </section>
            <div class="columns-map">
                <div class="id-ds">
                    <div>
                        <span id="column-id">ID</span>
                        {{-- <div id="textarea-column-id-formula" contenteditable="true">
                            <strong><span contenteditable="true"></span></strong>
                        </div> --}}
                        <textarea id="textarea-column-id-formula" rows="10" placeholder="ID Formula" autocomplete="off" autofocus required minlength="1" readonly></textarea>
                        <div class="buttons-sql-formula">
                            <i id="edit-sql-formula-column-id" class="material-icons md-18" data-tooltip="Modifica" data-tooltip-position="bottom">edit</i>
                        </div>
                    </div>
                    <div>
                        <span id="column-ds">DESCRIZIONE</span>
                        <textarea id="textarea-column-ds-formula" rows="10" placeholder="Description Formula" autocomplete="off" required minlength="1" readonly></textarea>
                        <div class="buttons-sql-formula">
                            <i id="edit-sql-formula-column-ds" class="material-icons md-18" data-tooltip="Modifica" data-tooltip-position="bottom">edit</i>
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
        </dialog>

        <dialog id="cube-name" class="dialog-save">
            <section>
                <h4>Nome Cubo</h4>
            </section>
            <div class="dialog-save-name">

                <div class="md-field">
                    <input type="text" id="cubeName" value=""/>
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
                        <ul id="ul-fields" class="dialog-overflow-list"></ul>
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

        <template id="cardLayout">
            <div class="cardLayout">
                <section class="cardTable" name data-schema data-alias data-value>
                    <section options-hier>
                        <div>
                            <i class="material-icons md-18" data-tooltip="Incrementa ordine gerarchico" data-tooltip-position="left" hier-order-plus>keyboard_arrow_up</i>
                            <span class="hierarchy-order"></span>
                            <i class="material-icons md-18" hier-order-minus data-tooltip="Decrementa ordine gerarchico" data-tooltip-position="left">keyboard_arrow_down</i>
                        </div>
                    </section>
                    <div class="title">
                        <div class="title-alias"><h6></h6><div class="subtitle"></div></div>
                        <i data-id="closeTable" class="material-icons md-18" data-tooltip="Chiudi" data-tooltip-position="bottom">close</i>
                    </div>
                    <div class="md-field">
                        <input type="search" value="" data-element-search/>
                        <label for="searchColumns" class="">Ricerca</label>
                    </div>
                    <ul data-id="columns" hidden></ul>
                    <div class="info" hidden></div>
                </section>
                <section options>
                    <i class="material-icons md-18" columns data-tooltip="Colonne" data-tooltip-position="right">view_list</i>
                    <i class="material-icons md-18" metrics data-tooltip="Metriche" data-tooltip-position="right" hidden>show_chart</i>
                    <i class="material-icons md-18" composite-metrics data-tooltip="Crea metrica composta" data-tooltip-position="right" hidden>addchart</i>
                    <i class="material-icons md-18" join data-tooltip="Crea relazione" data-tooltip-position="right">insert_link</i>
                    <i class="material-icons md-18" join-left data-tooltip="Left join" data-tooltip-position="right">flip</i>
                    <i class="material-icons md-18" join-right data-tooltip="Right join" data-tooltip-position="right">flip</i>
                    <i class="material-icons md-18" join-remove data-tooltip="Rimuovi relazione" data-tooltip-position="right">link_off</i>
                </section>
            </div>
        </template>

        {{-- <template id="el">
            <section data-element-search="tables" data-label data-searchable="true">
                <div class="element card" id="" draggable="true" label=""></div>
            </section>
        </template> --}}

        <template id="templateList">

            <section data-element-search data-label data-sublist-table-card data-searchable="true">
                <span class="sublist">
                    <span generic class="selectable"></span>
                    <i data-id="column-icon" class="material-icons md-18">view_list</i>
                    <i data-id="hierarchy-icon" class="material-icons md-18">insert_link</i>
                    <i data-id="metric-icon" class="material-icons md-18">show_chart</i>
                </span>
            </section>

            <section data-element-search data-label data-sublist-draggable data-searchable="true">
                <span class="sublist">
                    {{-- <span generic class="selectable"></span> --}}
                    <div generic id draggable="true">
                        <span table></span>
                    </div>
                </span>
            </section>

            <section data-element-search data-label data-sublist-generic data-searchable="true">
                <span class="sublist">
                    <span generic></span>
                </span>
            </section>

        </template>

        <main>
            <div id="drawer">

                <section class="account"><h5>user</h5><i class="material-icons md-light">person</i></section>

                <nav id="nav-schema">
                    {{-- {{dd($schemes)}} --}}
                    @foreach($schemes as $schema)
                        @if ($schema['SCHEMA_NAME'] === 'automotive_bi_data')
                            {{-- l'if è stata creata per selezionare uno schema di default, utilizzando l'attr 'selected'. Al momento non serve --}}
                            {{-- <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}" selected>{{ $schema['SCHEMA_NAME'] }}</a> --}}
                            <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
                        @else
                            <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
                        @endif
                    @endforeach
                </nav>
            </div>

            <header>
                <div class="nav-button"> <!-- codelab-nav-button-->
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
                                <i id="openTableList" class="material-icons md-24 md-inactive" data-tooltip="Lista tabelle" data-tooltip-position="bottom">storage</i>
                                <i id="openDimensionList" class="material-icons md-24 md-inactive" data-tooltip="Lista Dimensioni" data-tooltip-position="bottom">schema</i>
                                <i id="cube" class="material-icons md-24 md-inactive" data-tooltip="Definisci cubo" data-tooltip-position="bottom">space_dashboard</i>
                                <span class="h-separator"></span>
                                <i class="material-icons md-24 md-inactive" data-tooltip="Nuova dimensione" data-tooltip-position="bottom">dashboard_customize</i>
                                <i id="saveCube" class="material-icons md-24 md-inactive" data-tooltip="Salva cubo" data-tooltip-position="bottom">save</i>
                                <i id="saveOpenedCube" class="material-icons md-24" data-tooltip="Aggiorna cubo" data-tooltip-position="bottom" hidden>save</i>
                                <i id="definedCube" class="material-icons md-24 md-inactive" data-tooltip="Lista Cubi definiti" data-tooltip-position="bottom">folder_open</i>
                                <span class="h-separator"></span>
                                <i id="versioning-status" class="material-icons md-24 md-inactive" data-tooltip="" data-open-abs-window data-tooltip-position="bottom">cached</i>
                            </div>
                        </div>

                        <div class="lists">
                            <div class="absList" id="tableList" hidden>
                                <div class="md-field">
                                    <input type="search" id="tableSearch" data-element-search="tables" autocomplete="off" />
                                    <label for="tableSearch" class="">Ricerca</label>
                                </div>
                                <ul id="tables"></ul>
                            </div>
                        </div>

                        <div class="lists">
                            <div class="absList" id="cubesList" hidden>
                                <div class="md-field">
                                    <input type="search" id="cubeSearch" data-element-search="cubes" autocomplete="off"/>
                                    <label for="cubeSearch" class="">Ricerca</label>
                                </div>
                                <ul id="cubes"></ul>
                            </div>
                        </div>

                        <div class="lists">                            
                            <div class="absList" id="dimensionList" hidden>
                                <div class="md-field">
                                    <input type="search" id="dimensionSearch" data-element-search="dimensions" autocomplete="off"/>
                                    <label for="dimensionSearch" class="">Ricerca</label>
                                </div>
                                <ul id="dimensions">
                                {{--    @php 
                                        $arrayDim = json_decode($dimensions, true); //array, ogni elementi dell'array è una dimensione 
                                    @endphp
                                    @foreach($arrayDim as $key => $dimension)
                                        @php
                                            $jsonDimension = json_decode($dimension['json_value']);
                                        @endphp
                                        <div class="element dimensions" data-source-db>
                                            <h5 label="{{ $jsonDimension->{'name'} }}">{{ $jsonDimension->{'name'} }}</h5>
                                            <div id="miniCard-db" class="miniCard"><h6>{{ $jsonDimension->{'lastTableInHierarchy'} }}</h6></div>
                                        </div>
                                    @endforeach --}}
                                </ul>
                            </div>
                        </div>
                        {{-- TODO: appartiene alla struttura gerarchica sulla destra, da rivedere ed eliminare --}}
                        <template id="tmpl-hier-table">
                            <div class="hier table dropzoneHier" data-schema draggable="true" label></div>
                        </template>

                        <section class="wrapper">
                            {{-- div 1 --}}
                            <div id="drop">
                                <div id="drop-zone" class="dropzone"><span>Trascina qui le tabelle da mappare</span></div>
                            </div>
                            <template id="tmpl-hierarchies">
                                {{-- TODO: da rinominare l'attr in data-hier-active --}}
                                <section data-id="hierarchies" data-hier-id="0" class="section-content" data-active>
                                    <h6></h6>

                                    <div data-hier-id></div>
                                    <div data-hier-last-table></div>

                                    <section class="hierButtons">
                                        <button data-id="hierarchyDelete" type="button" name="" class="md-button" disabled>elimina</button>
                                        <button data-id="hierarchySave" type="button" name="" class="md-button" disabled>salva</button>
                                    </section>
                                </section>
                            </template>
                            
                            {{-- div 2 --}}
                            <div id="box-hierarchy">
                                <div id="hierarchiesContainer">
                                    
                                </div>
                                {{-- <button id="hierarchyDelete" type="button" name="" class="md-button" disabled>elimina</button>
                                <button id="hierarchySave" type="button" name="" class="md-button" disabled>salva</button> --}}
                                <div class="bottom-position">
                                    <button id="hierarchyNew" type="button" name="" class="md-button" disabled>nuova</button>
                                    <button id="saveDimension" type="button" name="" class="md-button" disabled>salva dimensione</button>
                                </div>
                            </div>
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
