<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BIcube extends Model
{
    use HasFactory;
    protected $table = 'bi_cubes';
    protected $primaryKey = 'name';
    protected $keyType = 'string';
    // con l'utilizzo di incrementing la primaryKey non viene convertita in Int
    public $incrementing = false;
}
