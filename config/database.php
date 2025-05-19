<?php

use Illuminate\Support\Str;

return [

	/*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for all database work. Of course
    | you may use many connections at once using the Database library.
    |
    */

	'default' => env('DB_CONNECTION', 'mysql'),

	/*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the database connections setup for your application.
    | Of course, examples of configuring each database platform that is
    | supported by Laravel is shown below to make development simple.
    |
    |
    | All database work in Laravel is done through the PHP PDO facilities
    | so make sure you have the driver for your particular database of
    | choice installed on your machine before you begin development.
    |
    */

	'connections' => [

		'sqlite' => [
			'driver' => 'sqlite',
			'url' => env('DATABASE_URL'),
			'database' => env('DB_DATABASE', database_path('database.sqlite')),
			'prefix' => '',
			'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
		],

		'mysql' => [
			'driver' => 'mysql',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST', '127.0.0.1'),
			'port' => env('DB_PORT', '3306'),
			'database' => env('DB_DATABASE', 'forge'),
			'username' => env('DB_USERNAME', 'forge'),
			'password' => env('DB_PASSWORD', ''),
			'unix_socket' => env('DB_SOCKET', ''),
			'charset' => 'utf8mb4',
			'collation' => 'utf8mb4_unicode_ci',
			'prefix' => '',
			'prefix_indexes' => true,
			'strict' => true,
			// 'engine' => null, default, l'ho modificato perchè su mysql 5.6 (lynx) ci sono errori nel'elaborazione del migrate
			'engine' => 'innodb row_format=dynamic',
			'options' => extension_loaded('pdo_mysql') ? array_filter([
				PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
			]) : [],
		],

		'mysql_local' => [
			'driver' => 'mysql',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST_LOCAL', '127.0.0.1'),
			'port' => env('DB_PORT_LOCAL', '3306'),
			'database' => env('DB_DATABASE_LOCAL', 'forge'),
			'username' => env('DB_USERNAME_LOCAL', 'forge'),
			'password' => env('DB_PASSWORD_LOCAL', ''),
			'unix_socket' => env('DB_SOCKET', ''),
			'charset' => 'utf8mb4',
			'collation' => 'utf8mb4_unicode_ci',
			'prefix' => '',
			'prefix_indexes' => true,
			'strict' => true,
			'engine' => null,
			'options' => extension_loaded('pdo_mysql') ? array_filter([
				PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
			]) : [],
		],

		'pgsql' => [
			'driver' => 'pgsql',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST_PGSQL', '127.0.0.1'),
			'port' => env('DB_PORT_PGSQL', '5432'),
			'database' => env('DB_DATABASE_PGSQL', 'forge'),
			'username' => env('DB_USERNAME_PGSQL', 'forge'),
			'password' => env('DB_PASSWORD_PGSQL', ''),
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
			'schema' => 'md_decisyon_v6',
			'sslmode' => 'prefer',
		],

		'vertica' => [
			'driver' => 'vertica',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST_VERTICA', '127.0.0.1'),
			'port' => env('DB_PORT_VERTICA', '5433'),
			'database' => env('DB_DATABASE_VERTICA', 'forge'),
			'username' => env('DB_USERNAME_VERTICA', 'forge'),
			'password' => env('DB_PASSWORD_VERTICA', ''),
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
			'schema' => 'public',
			'sslmode' => 'prefer',
		],

		/* 'vertica_odbc' => [
      'driver' => 'odbc',
      'dsn' => 'VMart251',
      'url' => env('DATABASE_URL'),
      'host' => env('DB_HOST_VERTICA', '127.0.0.1'),
      'port' => env('DB_PRT_VERTICA', '5433'),
      'database' => env('DB_DATABASE_VERTICA', 'decisyon_cache'),
      // 'username' => env('DB_USERNAME_VERTICA', ''),
      // 'password' => env('DB_PASSWORD_VERTICA', ''),
      'charset' => 'utf8',
      'prefix' => '',
      'prefix_indexes' => true,
      // 'schema' => 'public',
      // 'schema' => 'decisyon_cache',
      'schema' => ['decisyon_cache', 'automotive_bi_data'],
      'sslmode' => 'prefer',
      'options' => [
        'processor' => Illuminate\Database\Query\Processors\Processor::class,   //default
        'grammar' => [
          'query' => Illuminate\Database\Query\Grammars\Grammar::class,       //default
          'schema' => Illuminate\Database\Schema\Grammars\MyVerticaGrammar::class      // Ho creato MyVerticaGrammar.php
        ]
      ]
    ], */

		'sqlsrv' => [
			'driver' => 'sqlsrv',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST', 'localhost'),
			'port' => env('DB_PORT', '1433'),
			'database' => env('DB_DATABASE', 'forge'),
			'username' => env('DB_USERNAME', 'forge'),
			'password' => env('DB_PASSWORD', ''),
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
		],

		// connessione mysql selezionata dall'utente
		'client_mysql' => [
			'driver' => 'mysql',
			'host' => env('DB_HOST', '127.0.0.1'),
			'port' => env('DB_PORT', '3306'),
			// 'database' => env('DB_DATABASE', 'forge'),
			'database' => 'decisyon_cache',
			// 'username' => env('DB_USERNAME', 'forge'),
			// 'password' => env('DB_PASSWORD', ''),
			'unix_socket' => env('DB_SOCKET', ''),
			'charset' => 'utf8mb4',
			'collation' => 'utf8mb4_unicode_ci',
			'prefix' => '',
			'prefix_indexes' => true,
			'strict' => true,
			'engine' => null,
			'options' => extension_loaded('pdo_mysql') ? array_filter([
				PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
			]) : [],
		],

		// Connessione postgreSQL selezionata dall'utente
		'client_pgsql' => [
			'driver' => 'pgsql',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST_PGSQL', '127.0.0.1'),
			'port' => env('DB_PORT_PGSQL', '5432'),
			'database' => env('DB_DATABASE_PGSQL', 'forge'),
			'username' => env('DB_USERNAME_PGSQL', 'forge'),
			'password' => env('DB_PASSWORD_PGSQL', ''),
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
			'schema' => 'md_decisyon_v6',
			'sslmode' => 'prefer',
		],

		// Connessione vertica selezionata dall'utente
		'client_odbc' => [
			'driver' => 'odbc',
			'dsn' => 'VMart251',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST_VERTICA', '127.0.0.1'),
			'port' => env('DB_PRT_VERTICA', '5433'),
			'database' => 'decisyon_cache',
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
			'schema' => ['decisyon_cache'],
			// 'schema' => ['decisyon_cache', 'automotive_bi_data'],
			'sslmode' => 'prefer',
			'options' => [
				'processor' => Illuminate\Database\Query\Processors\Processor::class,   //default
				'grammar' => [
					'query' => Illuminate\Database\Query\Grammars\Grammar::class,       //default
					'schema' => Illuminate\Database\Schema\Grammars\MyVerticaGrammar::class      // Ho creato MyVerticaGrammar.php
				]
			]
		],

		// Connessione SQLServer selezionata dall'utente
		'client_sqlsrv' => [
			'driver' => 'sqlsrv',
			'url' => env('DATABASE_URL'),
			'host' => env('DB_HOST', 'localhost'),
			'port' => env('DB_PORT', '1433'),
			'database' => env('DB_DATABASE', 'forge'),
			'username' => env('DB_USERNAME', 'forge'),
			'password' => env('DB_PASSWORD', ''),
			'charset' => 'utf8',
			'prefix' => '',
			'prefix_indexes' => true,
		],

	],

	/*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run in the database.
    |
    */

	'migrations' => 'migrations',

	/*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as APC or Memcached. Laravel makes it easy to dig right in.
    |
    */

	'redis' => [

		'client' => env('REDIS_CLIENT', 'phpredis'),

		'options' => [
			'cluster' => env('REDIS_CLUSTER', 'redis'),
			'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_') . '_database_'),
		],

		'default' => [
			'url' => env('REDIS_URL'),
			'host' => env('REDIS_HOST', '127.0.0.1'),
			'password' => env('REDIS_PASSWORD', null),
			'port' => env('REDIS_PORT', '6379'),
			'database' => env('REDIS_DB', '0'),
		],

		'cache' => [
			'url' => env('REDIS_URL'),
			'host' => env('REDIS_HOST', '127.0.0.1'),
			'password' => env('REDIS_PASSWORD', null),
			'port' => env('REDIS_PORT', '6379'),
			'database' => env('REDIS_CACHE_DB', '1'),
		],

	],

];
