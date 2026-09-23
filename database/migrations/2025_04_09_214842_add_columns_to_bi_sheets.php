<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnsToBiSheets extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('bi_sheets', function (Blueprint $table) {
			$table->longText('json_facts')->after('json_specs')->default(null);
			$date = new DateTimeImmutable();
			$table->dateTime('sheet_created_at', $precision = 3)->after('workbookId')->default($date->format('Y-m-d H:i:s.v'));
			$table->dateTime('sheet_updated_at', $precision = 3)->after('sheet_created_at')->default($date->format('Y-m-d H:i:s.v'));
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('bi_sheets', function (Blueprint $table) {
			$table->dropColumn('json_facts');
			$table->dropColumn('sheet_created_at');
			$table->dropColumn('sheet_updated_at');
		});
	}
}
