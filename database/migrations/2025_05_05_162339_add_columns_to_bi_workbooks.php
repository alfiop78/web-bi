<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColumnsToBiWorkbooks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('bi_workbooks', function (Blueprint $table) {
			$table->longText('svg')->after('name')->nullable(false);
			$table->longText('worksheet')->after('json_value')->default(null);
			$date = new DateTimeImmutable();
			$table->dateTime('workbook_created_at', $precision = 3)->after('connectionId')->default($date->format('Y-m-d H:i:s.v'));
			$table->dateTime('workbook_updated_at', $precision = 3)->after('workbook_created_at')->default($date->format('Y-m-d H:i:s.v'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bi_workbooks', function (Blueprint $table) {
            //
        });
    }
}
