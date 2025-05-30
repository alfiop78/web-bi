<!DOCTYPE html>
<html lang="it">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=0">
	<meta http-equiv="Cache-Control" content="no-cache,must-revalidate">
	<meta http-equiv="Pragma" content="no-cache">
	<link rel="icon" href="/logo.svg" type="image/svg" />
	<title></title>
	<!-- Icons -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,1,0" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-loader.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/wb-layout-external-url.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dialog-responsive.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/material-symbols.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-drawer.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-list-responsive.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/md-dashboards.css') }}" />
	<link rel="stylesheet" type="text/css" href="{{ asset('/css/gcontrols.css') }}" />
	<script src="{{ asset('/js/Application.js') }}"></script>
	<script src="{{ asset('/js/lib.js') }}"></script>
	<script src="{{ asset('/js/Templates.js') }}"></script>
	<script src="{{ asset('/js/Dashboards.js') }}"></script>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
	<!-- library zipcelx -->
	<script src="{{ asset('/js/libs/zipcelx-master/lib/standalone.js') }}"></script>
</head>

<body class="antialiased">
	<template id="tmpl-li">
		<li data-li data-element-search data-label data-searchable="true">
			<span></span>
		</li>
	</template>

	<template id="tmpl-actions-resource">
		<section class="resourceActions">
			<!-- <button class="material-symbols-rounded" data-fn>settings</button> -->
			<!-- <button class="material-symbols-rounded" data-fn="resourceRemove">delete</button> -->
		</section>
	</template>

	<template id="template__btn_export_XLS">
		<button type="button" data-fn value="Excel" onclick="export_datatable_XLS()">Excel</button>
	</template>

	<template id="template__options_button">
		<!-- <button type="button" id="btn__refresh" class="btn__options_main" value="Aggiorna" onclick="dashboardUpdate(this.dataset.scriptName)">Aggiorna</button> -->
		<button type="button" id="btn__refresh" class="btn__options_main" value="Aggiorna">Aggiorna</button>
	</template>

	<main>
		<div id="content" class="custom-scrollbar">

			<div id="body" class="raw" hidden>
				<div id="popover__progressBar" class="center" popover>
					<div class="progressBar">
						<label for="progressBar" hidden>Record <b id="progressTo"></b>&nbsp;di&nbsp;<b id="progressTotal"></b>&nbsp;totali</label>
						<progress id="progressBar" max="100" value="0"></progress>
					</div>
				</div>
				<div class="wrapper">
					<div class="row">
						<div class="col">
							<div id="template-layout" data-token="{{ $dashboard_token }}" data-url="{{ $url ?? '' }}" data-querystring="{{ $querystring }}" class="view"></div>
						</div>
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
	<script type="text/javascript" src="{{ asset('/js/dashboards/init.js') }}" defer></script>
	<script type="text/javascript" src="{{ asset('/js/dashboard_functions.js') }}"></script>
</body>

</html>
