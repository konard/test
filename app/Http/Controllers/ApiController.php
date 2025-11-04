<?php

namespace App\Http\Controllers;

use App\Models\Region;
use App\Models\CorruptionCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class ApiController extends Controller
{
    /**
     * Get region statistics for heat map
     */
    public function regionStats(): JsonResponse
    {
        // Cache for 1 hour
        $stats = Cache::remember('region_stats', 3600, function () {
            return Region::select('id', 'name', 'geojson')
                ->withCount('corruptionCases')
                ->get()
                ->map(function ($region) {
                    return [
                        'id' => $region->id,
                        'name' => $region->name,
                        'geojson' => $region->geojson,
                        'cases_count' => $region->corruption_cases_count,
                    ];
                });
        });

        return response()->json($stats);
    }

    /**
     * Get statistics for charts
     */
    public function statistics(): JsonResponse
    {
        // Cache for 1 hour
        $data = Cache::remember('statistics_charts', 3600, function () {
            // 1. Cases by year
            $byYear = DB::table('corruption_cases')
                ->select(DB::raw('YEAR(date) as year'), DB::raw('COUNT(*) as total'))
                ->groupBy('year')
                ->orderBy('year')
                ->get();

            // 2. Top 5 regions
            $topRegions = DB::table('corruption_cases')
                ->join('regions', 'corruption_cases.region_id', '=', 'regions.id')
                ->select('regions.name', DB::raw('COUNT(*) as total'))
                ->groupBy('regions.id', 'regions.name')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            // Anonymize regions with less than 10 cases if user is not authenticated
            if (!Auth::check() || !Auth::user()->can('view_sensitive_data')) {
                $topRegions = $topRegions->filter(function ($region) {
                    return $region->total >= 10;
                });
            }

            // 3. Violation types
            $byViolationType = DB::table('corruption_cases')
                ->select('violation_type', DB::raw('COUNT(*) as total'))
                ->groupBy('violation_type')
                ->get();

            // 4. By status
            $byStatus = DB::table('corruption_cases')
                ->select('status', DB::raw('COUNT(*) as total'))
                ->groupBy('status')
                ->get();

            return [
                'by_year' => $byYear,
                'top_regions' => $topRegions,
                'by_violation_type' => $byViolationType,
                'by_status' => $byStatus,
            ];
        });

        return response()->json($data);
    }

    /**
     * Clear statistics cache
     */
    public function clearCache(): JsonResponse
    {
        Cache::forget('region_stats');
        Cache::forget('statistics_charts');

        return response()->json(['message' => 'Cache cleared successfully']);
    }
}
