<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BI_Dimension extends Model
{
    use HasFactory;
    protected $connection = 'pgsql';
}
