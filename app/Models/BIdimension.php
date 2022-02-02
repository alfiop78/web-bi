<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BIdimension extends Model
{
    use HasFactory;
    protected $table = "bi_dimensions";
    // impostando qui la primary key consente, in Eloquent, di recuperare il record senza utilizzare il metodo where (es. : metodo destroy)
    // https://laravel.com/docs/8.x/eloquent#primary-keys
    protected $primaryKey = 'name';
    protected $keyType = 'string';
    // con l'utilizzo di incrementing la primaryKey non viene convertita in Int
    public $incrementing = false;
}
