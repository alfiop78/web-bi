<!DOCTYPE html>
<html lang="it">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
	<meta http-equiv="Cache-Control" content="no-cache,must-revalidate">
	<meta http-equiv="Pragma" content="no-cache">
	<link rel="icon" href="/logo.svg" type="image/svg" />
	<title>{{ config('app.name', 'Laravel') }} | Versionamento</title>
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout.css') }}" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
	<!-- <link rel="stylesheet" type="text/css" href="{{ asset('/css/md-layout-responsive.css') }}" /> -->
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-control-responsive.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-versioning.css') }}" />
	<script src="{{ asset('/js/Application.js') }}"></script>
	<script src="{{ asset('/js/lib.js') }}"></script>
	<script src="{{ asset('/js/WBStorage.js') }}"></script>
	<script src="{{ asset('/js/WorkBooks.js') }}"></script>
</head>

<body class="antialiased">

	<template id="tmpl-li">
		<li class="checkInput" data-li data-element-search data-label data-searchable="true" data-sync="false">
			<input type="checkbox" />
			<div class="li-content" data-fn="showResource">
				<i class="material-symbols-rounded" data-sync-status>label</i>
				<div class="li-content-details">
					<span data-value class="text-ellipsis"></span>
				</div>
			</div>
		</li>
	</template>
	<header>
		<div class="nav-button">
			<a href="#" id="menu" onclick="App.menu()"><i class="material-symbols-rounded white">menu</i></a>
		</div>
		<h1 class="title">Sincronizzazione risorse</h1>
	</header>
	<div id="drawer" class="left-sidebar" open>
		<section class="account">
			<h5 data-uid="{{ auth()->user()->id }}">{{ auth()->user()->name }}</h5>
			<i class="material-symbols-rounded md-light">person</i>
		</section>

		<nav>
			<a href="{{ route('dashboard') }}" title="HomePage"><i class="material-symbols-rounded white">home</i><span>Home</span></a>
			<hr />
			<section class="navOverflow">
				<section class="navContent">
					<a href="{{ route('web_bi.workspace') }}" title="Workspace"><i class="material-symbols-rounded">workspaces</i><span>Workspace</span></a>
					<a href="{{ route('web_bi.dashboard_create') }}" title="Creazione Dashboard"><i class="material-symbols-rounded">dashboard_customize</i><span>Creazione Dashboard</span></a>
					<a href="{{ route('web_bi.dashboards') }}" title="Dashboards"><i class="material-symbols-rounded">dashboard</i><span>Dashboards</span></a>
				</section>
			</section>
			<hr />
			<a href="#" title="Settings"><i class="material-symbols-rounded">settings</i><span>Impostazioni</span></a>
		</nav>
	</div>

	<main data-database-id="{{session('db_id')}}">

		<div id="content" class="custom-scrollbar">

			<div id="body" class="raw menu" hidden>
				<menu class="standard onlyStatus">
					<section class="dbStatus">
						{{-- session()->forget('db_name') --}}
						<span id="db-connection-status" data-database-id="{{ session('db_id', 0) }}">
							<span id="database-name">{{ session('db_name', 'Nessun Database collegato') }}</span>
							@if (session('db_name'))
							<i id="db-icon-status" class="material-symbols-rounded">database</i>
							@else
							<i id="db-icon-status" class="material-symbols-rounded">database_off</i>
							@endif
						</span>
					</section>
					{{-- session()->forget('db_name') --}}
				</menu>
				<div class="wrapper">
					<div class="row autofit">
						<div class="card grid">
							<div class="row">
								<section class="col col-4-span">
									<h1>WorkBooks</h1>
								</section>
								<section class="col col-7-span">
									<menu class="allButtons" data-id="workbook" hidden>
										<button data-fn="uploadAll" data-type="workbook" data-upload class="button-icons material-symbols-rounded">upload</button>
										<button data-fn="downloadAll" data-type="workbook" data-download class="button-icons material-symbols-rounded">download</button>
										<button data-fn="upgradeAll" data-type="workbook" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
										<button data-fn="deleteAll" data-type="workbook" data-delete class="button-icons material-symbols-rounded danger">delete</button>
									</menu>
								</section>
							</div>
							<div class="visual">
								<section class="list-search">
									<input id="search-workbook" type="search" autocomplete="off" data-search-id="search-workbook" data-element-search="workbook" placeholder="Ricerca" />
									<div class="relative-ul" data-id="workbook" data-type="workbook">
										<ul class="elements custom-scrollbar" data-search-id="search-workbook" id="ul-workbook">
											@foreach($workbooks as $workbook)
											<li id="{{ $workbook['token'] }}" class="checkInput" data-element-search="workbook" data-label="{{ $workbook['name'] }}" data-storage="db" data-searchable="true" data-updated="{{ $workbook['updated_at'] }}" data-sync="false">
												<input type="checkbox" data-fn-reference="checkItem" data-fn data-id="{{ $workbook['token'] }}" data-type="{{ $workbook['type'] }}" />
												<div class="li-content" data-token="{{ $workbook['token'] }}" data-type="{{ $workbook['type'] }}" data-fn-reference="showResource" data-storage="db">
													<i class="material-symbols-rounded" data-sync-status>sync</i>
													<div class="li-content-details">
														<span data-value="{{ $workbook['name'] }}" class="text-ellipsis">{{ $workbook['name'] }}</span>
													</div>
												</div>
											</li>
											@endforeach
										</ul>
									</div>
								</section>
							</div>
							<div class="buttons align-center">
								<button type="button" class="btn-link link" data-select-all data-type="workbook">Select All</button>
								<button type="button" class="btn-link link" data-unselect-all data-type="workbook">Unselect All</button>
							</div>
						</div>
						<!-- Sheets -->
						<div class="card grid">
							<div class="row">
								<section class="col col-5-span">
									<h1>Sheets</h1>
								</section>
								<section class="col col-7-span">
									<menu class="allButtons" data-id="sheet" hidden>
										<button data-fn="uploadAll" data-type="sheet" data-upload class="button-icons material-symbols-rounded">upload</button>
										<button data-fn="downloadAll" data-type="sheet" data-download class="button-icons material-symbols-rounded">download</button>
										<button data-fn="upgradeAll" data-type="sheet" data-upgrade class="button-icons material-symbols-rounded danger">upgrade</button>
										<button data-fn="deleteAll" data-type="sheet" data-delete class="button-icons material-symbols-rounded danger">delete</button>
									</menu>
								</section>
							</div>
							<div class="visual">
								<section class="list-search">
									<input id="search-sheet" type="search" autocomplete="off" data-search-id="search-sheet" data-element-search="sheet" placeholder="Ricerca" />
									<div class="relative-ul" data-id="sheet" data-type="sheet">
										<ul class="elements custom-scrollbar" data-search-id="search-sheet" id="ul-sheet">
											@foreach($sheets as $sheet)
											<li id="{{ $sheet['token'] }}" data-workbook-ref="{{ $sheet['workbookId'] }}" class="checkInput" data-element-search="sheet" data-label="{{ $sheet['name'] }}" data-storage="db" data-searchable="true" data-updated="{{ $sheet['updated_at']}}" data-sync="false">
												<input type="checkbox" data-fn-reference="checkItem" data-id="{{ $sheet['token'] }}" data-type="{{ $sheet['type'] }}" />
												<div class="li-content" data-token="{{ $sheet['token'] }}" data-type="{{ $sheet['type'] }}" data-fn-reference="showResource" data-storage="db">
													<i class="material-symbols-rounded" data-sync-status>sync</i>
													<div class="li-content-details">
														<span data-value="{{ $sheet['name'] }}" class="text-ellipsis">{{ $sheet['name'] }}</span>
													</div>
												</div>
											</li>
											@endforeach
										</ul>
									</div>
								</section>
							</div>
							<div class="buttons align-center">
								<button type="button" class="btn-link link" data-select-all data-type="sheet">Select All</button>
								<button type="button" class="btn-link link" data-unselect-all data-type="sheet">Unselect All</button>
							</div>
						</div>
					</div>
					<div class="row">
						<section class="col col-12">
							<div class="details">
								<section id="info-resource" class="placeholder" data-attr="Dettaglio risorsa">
									<section id="info">
										<div id="token" class="item-resources">
											<span>Token</span>
											<span data-value></span>
										</div>
										<div id="created_at" class="item-resources">
											<span>Data Creazione</span>
											<span data-value></span>
										</div>
										<div id="updated_at" class="item-resources">
											<span>Data aggiorn.</span>
											<span data-value></span>
										</div>
										<!-- <div id="dataModel" class="item-resources">
											<span>Data Model</span>
											<span data-value></span>
										</div> -->
										<div id="note" class="item-resources">
											<span>Note</span>
											<span data-value></span>
										</div>
									</section>
								</section>

							</div>
						</section>
					</div>
				</div>
			</div>
		</div>

		<div id="console">
			<div id="fabsConsole">
				<i class="material-symbols-rounded">info</i>
				<p></p>
			</div>
		</div>
	</main>
	<div class="loader">
		<svg viewBox="0 0 32 32" width="32" height="32">
			<circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle>
		</svg>
	</div>
	<div class="right-sidebar"></div>
	<script type="text/javascript" src="{{ asset('/js/versioning.js') }}" async></script>
</body>

</html>
