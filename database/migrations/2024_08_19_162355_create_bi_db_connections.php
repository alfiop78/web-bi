<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBiDbConnections extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('bi_db_connections', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('driver');
      $table->string('host');
      $table->string('port');
      $table->string('schema');
      $table->string('username');
      $table->string('password');
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
    Schema::dropIfExists('bi_db_connections');
  }
}
