<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class CorruptionCase extends Model
{
    use HasFactory;

    protected $fillable = [
        'region_id',
        'position_hash',
        'violation_type',
        'date',
        'status',
        'description_anon',
        'original_data',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Get the region for this case
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Hash a position for anonymization
     */
    public static function hashPosition(string $position): string
    {
        return hash_hmac('sha256', $position, config('app.anon_salt', 'default_salt'));
    }

    /**
     * Get description with anonymization check
     */
    public function getDescriptionAttribute(): string
    {
        $user = Auth::user();

        // If user can view sensitive data, return decrypted original
        if ($user && $user->can('view_sensitive_data')) {
            return $this->original_data ?? $this->description_anon;
        }

        // Otherwise return anonymized version
        return $this->description_anon;
    }

    /**
     * Anonymize description text
     */
    public static function anonymizeDescription(string $text): string
    {
        // Remove full names in format "Фамилия И.О."
        $text = preg_replace('/[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\./', 'Должностное лицо', $text);

        // Remove phone numbers
        $text = preg_replace('/\+?7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/', '[номер удален]', $text);

        // Remove email addresses
        $text = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[email удален]', $text);

        return $text;
    }
}
