<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBiMetricsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('bi_metrics', function (Blueprint $table) {
      // $table->id();
      $table->string('token')->primary();
      $table->string('name');
      $table->longText('json_value');
    });

    Schema::table('bi_metrics', function (Blueprint $table) {
      $table->string('workbookId', 7);
      $table->foreign('workbookId')->references('token')->on('bi_workbooks');
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('bi_metrics');
  }
}
