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
      $table->string('dsn')->nullable(); // per alcuni database (Es.: Vertica) può essere NULL
      $table->string('driver', 50);
      $table->ipAddress('host');
      $table->string('port', 10);
      $table->string('schema', 50);
      $table->string('username', 50);
      $table->string('password', 50);
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
