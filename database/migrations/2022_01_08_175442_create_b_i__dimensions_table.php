<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBIDimensionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // non utilizzo Schema::connection('mysql_local')->create.... perchè, in config/database.php il db impostato di default è mysql 192.168.2.7/web_bi_md
        Schema::create('bi_dimensions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longText('json_value');
            // NOTE: con la versione di mysql/mariaDB e phpMyAdmin in locale, non ci sono problemi ad inserire il json datatype
            // $table->json('json_value');
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
        Schema::dropIfExists('bi_dimensions');
    }
}
