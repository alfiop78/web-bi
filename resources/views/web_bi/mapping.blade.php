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
		<link rel="stylesheet" type="text/css" href="/css/report-layout.css" />
        <link rel="stylesheet" type="text/css" href="/css/index.css" />
        <link rel="stylesheet" type="text/css" href="/css/layouts.css" />
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
                        <span class="popupContent" data-download hidden><i data-id="btn-download" class="material-icons">download</i></span>
                        {{-- Sovrascrivi copia in Produzione --}}
                        <span class="popupContent" data-upgrade hidden><i data-id="btn-upgrade-production" class="material-icons md-done">upgrade</i></span>
                        {{-- Salva in Produzione --}}
                        <span class="popupContent" data-upload hidden><i data-id="btn-upload-local-object" class="material-icons md-done">upload</i></span>
                    </div>
                </div>
            </section>
        </template>

        <dialog id="versioning">

            <section class="versioning-sections">
                <h4>Sincronizzazione elementi</h4>                
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

        <dialog id="cube-name" class="dialog-small">
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

        <dialog id="dimension-name" class="dialog-small">
            <section>
                <h4>Nome dimensione</h4>
                <div class="dialog-save-name">

                    <div class="md-field">
                        <input type="text" id="dimensionName" value=""/>
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

        <dialog id="hierarchy-name" class="dialog-small">
            <section>
                <h4>Nome gerarchia</h4>
                <div class="dialog-save-name">

                    <div class="md-field">
                        <input type="text" id="hierarchyName" value="" autofocus/>
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
                <section class="cardTable" name="" data-schema="">
                    <div class="title">
                        <h6></h6>
                        <span data-id="popupCloseTable" class="popupContent"><i data-id="closeTable" class="material-icons md-18">close</i><small class="popup">Chiudi</small></span>
                    </div>
                    <div class="md-field">
                        <input type="search" value=""/>
                        <label for="searchColumns" class="">Ricerca</label>
                    </div>
                    <ul id="columns" hidden></ul>
                    <div class="info" hidden></div>
                </section>
                <section options>
                    <span class="popupContent"><i class="material-icons md-18" columns>view_list</i><small class="popup">Colonna</small></span>
                    <span class="popupContent" hide><i class="material-icons md-18" metrics>show_chart</i><small class="popup">Metrica</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join>insert_link</i><small class="popup">Crea Relazione</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-left>flip</i><small class="popup">Left Join</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-right>flip</i><small class="popup">Right Join</small></span>
                    <span class="popupContent"><i class="material-icons md-18" join-remove>link_off</i><small class="popup">Rimuovi relazione</small></span>
                </section>
            </div>
        </template>

        <template id="el">
            <div class="element card" id="" draggable="true" label=""></div>
        </template>

        <template id="templateListColumns">
            <div class="element" name="">
                <li></li>
                <i id="columns-icon" class="material-icons md-18">view_list</i>
                <i id="hierarchy-icon" class="material-icons md-18">insert_link</i>
                <i id="metrics-icon" class="material-icons md-18">show_chart</i>
            </div>
        </template>
        <main>
            <div id="drawer">

                <section class="account"><h5>user</h5><i class="material-icons md-light">person</i></section>

                <nav id="nav-schema">
                    {{-- {{dd($schemes)}} --}}
                    @foreach($schemes as $schema)
                        <a href="#" data-schema="{{ $schema['SCHEMA_NAME'] }}">{{ $schema['SCHEMA_NAME'] }}</a>
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
                                <span class="popupContent"><i id="openDimensionList" class="material-icons md-24">mediation</i><small class="popup"><p>Lista Dimensioni</p></small></span>
                                <span class="popupContent"><i class="material-icons md-24">dashboard_customize</i><small class="popup"><p>Nuova dimensione</p></small></span>
                                <span class="popupContent"><i id="saveCube" class="material-icons md-24">save</i><small class="popup"><p>Salva Cubo</p></small></span>
                                <span class="popupContent" hide><i id="saveOpenedCube" class="material-icons md-24">save</i><small class="popup"><p>Aggiorna Cubo</p></small></span>
                                <span class="popupContent"><i id="processCube" class="material-icons md-24">folder_open</i><small class="popup"><p>Lista Cubi definiti</p></small></span>
                                <span class="popupContent"><i id="defineCube" class="material-icons md-24 md-inactive">space_dashboard</i><small class="popup"><p>Definisci Cubo</p></small></span>
                                <span class="popupContent"><i id="versioning-status" class="material-icons md-24">cached</i><small class="popup"><!-- contenuto dinamico --></small></span>
                            </div>
                            <div class="help-console">
                                <span id="guide"></span>
                            </div>
                        </div>

                        <div class="lists">
                            <div class="absList" id="tableList" hidden>
                                <div class="md-field">
                                    <input type="search" id="tableSearch" data-search-type="search-list" autocomplete="off" />
                                    <label for="tableSearch" class="">Ricerca</label>
                                </div>
                                <ul id="tables">
                                    
                                </ul>
                            </div>
                        </div>

                        <div class="lists">
                            <div class="absList" id="cubesList" hidden>
                                <div class="md-field">
                                    <input type="search" id="cubeSearch" data-search-type="search-list" value=""/>
                                    <label for="cubeSearch" class="">Ricerca</label>
                                </div>
                                <ul id="cubes"></ul>
                            </div>
                        </div>

                        <div class="lists">
                            <template id="dimension">
                                <div class="element dimensions">
                                    <h5></h5> {{-- titolo della dimensione --}}
                                    <template id="miniCard"><div class="miniCard"><h6></h6></div></template>
                                </div>
                            </template>
                            
                            <div class="absList" id="dimensionList" hidden>
                                <div class="md-field">
                                    <input type="search" id="dimensionSearch" value=""/>
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

                        {{-- <div class="lists">
                            <div class="absList" id="dimensionList-db">
                                <div class="md-field">
                                    <input type="search" id="dimensionSearch-db" value=""/>
                                    <label for="dimensionSearch-db" class="">Ricerca</label>
                                </div>
                                <ul id="dimensions-db">
                                    <div class="element dimensions">
                                        @foreach($dimensions as $dim)
                                            <h5 label="{{ $dim->name }}">{{ $dim->name }}</h5>
                                            <div id="miniCard-db" class="miniCard"><h6>{{ $dim->name }}</h6></div>
                                        @endforeach
                                    </div>
                                </ul>
                            </div>
                        </div> --}}

                        <div id="hierarchiesContainer">
                            <section id="hierarchies" class="section-content">
                                <h5>Struttura gerarchica</h5><h6>Gerarchia 1</h6>
                                <div id="hierTables"></div>
                                <span class="before"><span class="arrow"></span></span>
                                <div class="association"><p>Associazione con la Fact Table</p></div>
                                <span class="after"><span class="arrow"></span></span>
                                <div id="hierFact">
                                    <div>
                                        <div class="hier fact">FACT TABLE</div>
                                    </div>
                                </div>
                                <div class="actions">
                                    <span class="popupContent"><i id="saveDimension" class="material-icons md-24 md-dark md-inactive" disabled>save</i><small class="popup">Salva dimensione</small></span>
                                    <span class="popupContent"><i id="hierarchySave" class="material-icons md-24">save</i><small class="popup">Salva gerarchia</small></span>
                                    <span class="popupContent"><i class="material-icons md-24">playlist_add</i><small class="popup">Nuova gerarchia</small></span>
                                </div>

                            </section>
                        </div>

                        <div id="drop">
                            <div id="drop-zone" class="dropzone">Trascina qui le tabelle da mappare</div>
                        </div>

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
