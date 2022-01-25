<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
		<link rel="icon" href="/favicon.png" type="image/png" />
        <title>Versionamento</title>
        {{-- <link rel="stylesheet" href="{{asset('css/index.css')}}"> --}}
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
        {{-- <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script> --}}
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

        {{-- <dialog id="versioning">
            {{ template utilizzato per popolare sia le dimensioni che i cubi --}}{{--
            <template id="versioning-db">
                <div class="versioning-status">
                    <div class="vers-title"></div>
                    <div class="vers-status"><i class="material-icons"></i></div>
                    <div class="vers-status-descr"></div>
                    <div class="vers-actions"></div>
                </div>
            </template>
            <section>
                <h4>Sincronizzazione elementi</h4>
                <fieldset>
                    <legend>Lista elementi da versionare</legend>
                    <section data-dimensions-local class="dialog-overflow">
                        <div class="versioning-status-header">
                            <div>Title</div>
                            <div>Status</div>
                            <div>Descr. Status</div>
                            <div>Action</div>
                        </div>
                        <div data-id="versioning-content" class="versioning-content overflow-y">
                        </div>
                    </section>
                    <section data-cubes-local class="dialog-overflow"></section>
                </fieldset>

                <fieldset>
                    <legend>Lista elementi sincronizzati dal DB</legend>
                    <section data-dimensions class="dialog-overflow">
                        <h5 class="upper">dimensioni</h5>
                        {{ @php  --}}
                            {{-- $arrayDim = json_decode($dimensions, true); //array, ogni elementi dell'array è una dimensione --}}
                        {{-- @endphp 
                        <div class="versioning-status-header">
                            <div>Title</div>
                            <div>Status</div>
                            <div>Descr. Status</div>
                            <div>Action</div>
                        </div>
                        <div data-id="versioning-content" class="versioning-content overflow-y">
                            {{ qui viene popolato tramite template 
                            <div class="versioning-status">
                                creato dinamicamente in app.getSyncDimensions
                            </div> --}}
                            {{-- @foreach($arrayDim as $key => $dimension)
                                @php
                                    $jsonDimension = json_decode($dimension['json_value']);
                                @endphp
                                <div class="versioning-status">
                                    <div class="vers-title">{{ $jsonDimension->{'name'} }}<span>({{ $jsonDimension->{'lastTableInHierarchy'} }})</span></div>
                                    <div class="vers-status"><i class="material-icons">done</i></div>
                                </div>
                            @endforeach 
                        </div>
                    </section>
                    <section data-cubes>
                        <h5 class="upper">cubi</h5>
                        <div class="versioning-status-header">
                            <div>Title</div>
                            <div>Status</div>
                            <div>Descr. Status</div>
                            <div>Action</div>
                        </div>
                        <div data-id="versioning-content" class="versioning-content overflow-y"></div>
                    </section>
                </fieldset>
                <div class="dialog-buttons">
                    <button type="button" name="cancel" class="md-button">annulla</button>
                   <button id="btnCubeSaveName" type="button" name="done" class="md-button">Salva</button> 
                </div>
            </section>
        </dialog> --}}

        {{-- template utilizzato per popolare sia le dimensioni che i cubi --}}
        <template id="versioning-db">
            <div class="versioning-status">
                <div class="vers-title"></div>
                <div class="vers-status"><i class="material-icons"></i></div>
                <div class="vers-status-descr"></div>
                <div class="vers-actions"></div>
            </div>
        </template>

        <main>
            <div id="drawer">

                <section class="account"><h5>user</h5><i class="material-icons md-light">person</i></section>

                <nav id="nav-schema">
                    <a href="#">Dimensioni</a>
                    <a href="#">Cubi</a>
                    <a href="#">Metriche</a>
                    <a href="#">Filtri</a>
                    <a href="#">Processi</a>
                </nav>
            </div>

            <header>
                <div class="nav-button"> <!-- codelab-nav-button-->
                  <a href="/" id="arrow-back"><i class="material-icons md-light">close</i></a>
                  <a href="#" id="menu" onclick="App.menu()"><i class="material-icons md-light">menu</i></a>

                </div>

                <h1 class="title">Versionamento</h1>
            </header>
            <div id="container" data-page="1">

                <div id="content">

                    <div id="body">
                        
                        <div class="actions">
                            <div class="buttons">
                                {{-- <span class="popupContent"><i id="openTableList" class="material-icons md-24 md-inactive">storage</i><small class="popup">Lista tabelle</small></span> --}}
                            </div>
                        </div>

                        {{-- sincronizzazione elementi --}}
                        <section id="versioning">
                            <h4>Sincronizzazione elementi</h4>
                            <fieldset>
                                <legend>Lista elementi da versionare</legend>
                                <section data-dimensions-local class="dialog-overflow">
                                    <div class="versioning-status-header">
                                        <div>Title</div>
                                        <div>Status</div>
                                        <div>Descr. Status</div>
                                        <div>Action</div>
                                    </div>
                                    <div data-id="versioning-content" class="versioning-content overflow-y">
                                    </div>
                                </section>
                                <section data-cubes-local class="dialog-overflow"></section>
                            </fieldset>

                            <fieldset>
                                <legend>Lista elementi sincronizzati dal DB</legend>
                                <section data-dimensions class="dialog-overflow">
                                    <h5 class="upper">dimensioni</h5>
                                    {{-- @php  --}}
                                        {{-- $arrayDim = json_decode($dimensions, true); //array, ogni elementi dell'array è una dimensione --}}
                                    {{-- @endphp --}}
                                    <div class="versioning-status-header">
                                        <div>Title</div>
                                        <div>Status</div>
                                        <div>Descr. Status</div>
                                        <div>Action</div>
                                    </div>
                                    <div data-id="versioning-content" class="versioning-content overflow-y">
                                        {{-- qui viene popolato tramite template --}}
                                        {{-- <div class="versioning-status">
                                            creato dinamicamente in app.getSyncDimensions
                                        </div> --}}
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
                                </section>
                                <section data-cubes>
                                    <h5 class="upper">cubi</h5>
                                    <div class="versioning-status-header">
                                        <div>Title</div>
                                        <div>Status</div>
                                        <div>Descr. Status</div>
                                        <div>Action</div>
                                    </div>
                                    <div data-id="versioning-content" class="versioning-content overflow-y"></div>
                                </section>
                            </fieldset>
                        </section>

                    </div>

                </div>

                <div id="controls">
                    <div id="fabs">
                        <button id="mdc-back" class="button dense raised">home</button>
                        <div class="spacer"></div>
                        <button id="mdc-report" class="button dense raised">report</button>
                        <button id="mdc-mapping" class="button dense raised">mapping</button>
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
        <script type="text/javascript" src="/js/init_versioning.js" async></script>
    </body>
</html>
