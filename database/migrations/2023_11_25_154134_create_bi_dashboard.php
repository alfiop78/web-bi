<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBiDashboard extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('bi_dashboards', function (Blueprint $table) {
      $table->string('token')->primary();
      $table->string('name');
      $table->boolean('published')->default(false);
      $table->longText('json_value');
      $table->foreignId('connectionId')->constrained('bi_db_connections'); // FK -> bi_db_connections
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
    Schema::dropIfExists('bi_dashboards');
  }
}
