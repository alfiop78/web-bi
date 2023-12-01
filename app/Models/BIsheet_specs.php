<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BIsheet_specs extends Model
{
  use HasFactory;
  protected $table = 'bi_sheet_specifications';
  protected $primaryKey = 'token';
  protected $keyType = 'string';
  // protected $fillable = ['options->enabled',];
  // con l'utilizzo di incrementing la primaryKey non viene convertita in Int
  public $incrementing = false;
}
