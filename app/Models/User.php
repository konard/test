<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'region_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the region assigned to this user
     */
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Check if user can view sensitive data
     */
    public function canViewSensitiveData(): bool
    {
        return $this->hasRole('admin') || $this->hasPermissionTo('view_sensitive_data');
    }
}
