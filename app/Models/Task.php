<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    // definisco, nel model la proprietà connection che punta al DB locale
    protected $connection = 'mysql_local';
}
