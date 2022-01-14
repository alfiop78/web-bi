<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// php artisan make:migration create_bi_processes_table --create=bi_processes
// php artisan migrate --path=/database/migrations/2022_01_14_150552_create_bi_processes_table.php
class CreateBiProcessesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bi_processes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longText('json_value');
            // TODO: created_at e updated_at non vengono popolate
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
        Schema::dropIfExists('bi_processes');
    }
}
