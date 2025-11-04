<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'geojson',
    ];

    protected $casts = [
        'geojson' => 'array',
    ];

    /**
     * Get all corruption cases for this region
     */
    public function corruptionCases(): HasMany
    {
        return $this->hasMany(CorruptionCase::class);
    }

    /**
     * Get users assigned to this region
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the count of corruption cases for this region
     */
    public function getCasesCountAttribute(): int
    {
        return $this->corruptionCases()->count();
    }
}
