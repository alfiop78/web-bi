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
			$table->dateTime('sheet_created_at')->after('workbookId')->default(now());
			$table->dateTime('sheet_updated_at')->after('sheet_created_at')->default(now());
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
