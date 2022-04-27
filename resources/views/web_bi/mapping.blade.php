<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<link rel="icon" href="/favicon.png" type="image/png" />
        <title>mapping</title>
        <link rel="stylesheet" href="{{ asset('css/index.css') }}">
        <link rel="stylesheet" href="{{ asset('/css/md-dialogs.css') }}">
        <link rel="stylesheet" type="text/css" href="/css/md-layout.css" />
		<link rel="stylesheet" type="text/css" href="/css/material-icons.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-loader.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-controls.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-drawer.css" />
		<link rel="stylesheet" type="text/css" href="/css/md-inputs.css" />
        <link rel="stylesheet" type="text/css" href="/css/timeline.css" />
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
		<script src="/js/Application.js"></script>
		<script src="/js/lib.js"></script>
		<script src="/js/Storage.js"></script>
		<script src="/js/Cube.js"></script>
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@200;400;500;600&display=swap" rel="stylesheet">
        <!-- Styles -->

        <style>
            body {
                font-family: 'Barlow', sans-serif;
            }
        </style>
    </head>
    <body class="antialiased">
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

        <template id="tmpl-hierarchy-list">
            <div class="hierarchies">
                <h6></h6>
                <div class="tables"></div>
                <div class="mini-card-buttons">
                    <button data-id="dimension-use" type="button" name="dimensionUse" class="md-button">utilizza</button>
                    <button data-id="dimension-edit" type="button" name="dimensionEdit" class="md-button">modifica</button>
                </div>
            </div>
        </template>

        {{-- template tmpl-dimension --}}
        <template id="tmpl-dimension-list">
            <section data-element-search="dimensions">
                <div class="element dimensions">
                    <div class="mini-card">
                        <h5></h5> {{-- titolo della dimensione --}}
                        <div data-dimension-tables>
                            {{-- elenco tabelle contenute nella dimensione --}}
                            
                        </div>
                        {{-- <div class="mini-card-buttons">
                            <button data-id="dimension-use" type="button" name="dimensionUse" class="md-button">utilizza</button>
                            <button data-id="dimension-edit" type="button" name="dimensionEdit" class="md-button">modifica</button>
                        </div> --}}
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

        <template id="cardLayout">
            <div class="cardLayout">
                <section class="cardTable" name data-schema data-alias data-value>
                    <section options-hier>
                        <div>
                            <i class="material-icons md-18" hier-order-plus>keyboard_arrow_up</i>
                            <span class="hierarchy-order"></span>
                            <i class="material-icons md-18" hier-order-minus>keyboard_arrow_down</i>
                        </div>
                    </section>
                    <div class="title">
                        {{-- <h6></h6> --}}
                        <div class="title-alias"><h6></h6><div class="subtitle"></div></div>
                        <span data-id="popupCloseTable" class="popupContent"><i data-id="closeTable" class="material-icons md-18">close</i><small class="popup">Chiudi</small></span>
                    </div>
                    <div class="md-field">
                        <input type="search" value="" data-element-search/>
                        <label for="searchColumns" class="">Ricerca</label>
                    </div>
                    <ul data-id="columns" hidden></ul>
                    <div class="info" hidden></div>
                </section>
                <section options>
                    <span class="popupContent"><i class="material-icons md-18" columns>view_list</i><small class="popup">Colonna</small></span>
                    <span class="popupContent" hide><i class="material-icons md-18" metrics>show_chart</i><small class="popup">Metrica</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join>insert_link</i><small class="popup">Crea Relazione</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-left>flip</i><small class="popup">Left Join</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-right>flip</i><small class="popup">Right Join</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-remove>link_off</i><small class="popup">Rimuovi relazione</small></span>
                    {{-- <span class="popupContent"><i class="material-icons md-18" hier-order-plus data-value>add</i><small class="popup">Ordine gerarchico superiore</small></span>
                    <span class="popupContent"><i class="material-icons md-18" hier-order-minus data-value>remove</i><small class="popup">Ordine gerarchico inferiore</small></span> --}}
                </section>
            </div>
        </template>

        <template id="el">
            <section data-element-search="tables" data-label data-searchable="true">
                <div class="element card" id="" draggable="true" label=""></div>
            </section>
        </template>

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
                    <div generic id draggable="true" label>
                        <span table></span>
                    </div>
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
                        
                        <div class="actions">
                            <div class="buttons">
                                <span class="popupContent"><i id="openTableList" class="material-icons md-24 md-inactive">storage</i><small class="popup"><p>Lista tabelle</p></small></span>
                                <span class="popupContent"><i id="openDimensionList" class="material-icons md-24 md-inactive">schema</i><small class="popup"><p>Lista Dimensioni</p></small></span>
                                <span class="popupContent"><i id="cube" class="material-icons md-24 md-inactive">space_dashboard</i><small class="popup"><p>Definisci Cubo</p></small></span>
                                <span class="h-separator"></span>
                                <span class="popupContent"><i class="material-icons md-24 md-inactive">dashboard_customize</i><small class="popup"><p>Nuova dimensione</p></small></span>
                                <span class="popupContent"><i id="saveCube" class="material-icons md-24 md-inactive">save</i><small class="popup"><p>Salva Cubo</p></small></span>
                                <span class="popupContent" hide><i id="saveOpenedCube" class="material-icons md-24">save</i><small class="popup"><p>Aggiorna Cubo</p></small></span>
                                <span class="popupContent"><i id="definedCube" class="material-icons md-24 md-inactive">folder_open</i><small class="popup"><p>Lista Cubi definiti</p></small></span>
                                <span class="h-separator"></span>
                                <span class="popupContent"><i id="versioning-status" class="material-icons md-24">cached</i><small class="popup"><!-- contenuto dinamico --></small></span>
                            </div>
                            {{-- <div class="help-console">
                                <span id="guide"></span>
                            </div> --}}
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
