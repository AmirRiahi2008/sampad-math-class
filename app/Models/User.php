<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'is_sampad',
        'national_code',
        'phone',
        'is_register',
        'date',
    ];

    protected $casts = [
        'is_sampad' => 'boolean',
        'is_register' => 'boolean',
        'date' => 'date',
    ];
}