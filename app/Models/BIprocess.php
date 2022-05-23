<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BIprocess extends Model
{
    use HasFactory;
    protected $table = 'bi_processes';
    protected $primaryKey = 'token';
    protected $keyType = 'string';
    // con l'utilizzo di incrementing la primaryKey non viene convertita in Int
    public $incrementing = false;
}
