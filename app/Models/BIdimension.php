<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BIdimension extends Model
{
    use HasFactory;
    protected $table = "bi_dimensions";
    // impostando qui la primary key consente, in Eloquent, di recuperare il record senza utilizzare il metodo where (es. : metodo destroy)
    protected $primaryKey = 'name';
    // con l'utilizzo di incrementing la primaryKey non viene convertita in Int
    public $incrementing = false;
}
