<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleGate
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role = null): Response
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Необходима авторизация');
        }

        // Admin has access to everything
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Check role if specified
        if ($role && !$user->hasRole($role)) {
            abort(403, 'Недостаточно прав доступа');
        }

        // Check region-specific access for moderators
        if ($user->hasRole('moderator') && $request->has('region_id')) {
            $requestedRegionId = $request->input('region_id');

            if ($user->region_id != $requestedRegionId) {
                abort(403, 'Доступ только к данным вашего региона');
            }
        }

        return $next($request);
    }
}
