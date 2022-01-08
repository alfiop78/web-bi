<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBIDimensionsTable extends Migration
{
    // pgsql non è il database di default quindi imposto qui la variabile connection (l'ho impostata anche nel Model)
    protected $connection = 'pgsql';
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bi_dimensions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('json_value');
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
        Schema::dropIfExists('b_i__dimensions');
    }
}
