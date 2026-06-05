<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    // On autorise Laravel à remplir cette colonne
    protected $fillable = ['libelle']; 
    
    
}