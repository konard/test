<?php

namespace App\Console\Commands;

use App\Models\Region;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class UpdateRegionStats extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'stats:update';

    /**
     * The console command description.
     */
    protected $description = 'Update region statistics JSON file for heat map';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating region statistics...');

        $regions = Region::with('corruptionCases')->get();
        $stats = [];

        $maxCases = 0;

        foreach ($regions as $region) {
            $casesCount = $region->corruptionCases->count();
            $maxCases = max($maxCases, $casesCount);

            $stats[$region->id] = [
                'name' => $region->name,
                'cases' => $casesCount,
                'geojson' => $region->geojson,
            ];
        }

        // Add color based on cases count
        foreach ($stats as $id => &$stat) {
            $stat['color'] = $this->getColor($stat['cases'], $maxCases);
        }

        // Save to storage
        Storage::put('public/region-stats.json', json_encode($stats, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        $this->info('Region statistics updated successfully!');
        $this->info("Total regions: " . count($stats));
        $this->info("Max cases in a region: " . $maxCases);

        return Command::SUCCESS;
    }

    /**
     * Get color based on cases count
     */
    private function getColor(int $cases, int $max): string
    {
        if ($max == 0) {
            return '#fee5d9';
        }

        $ratio = $cases / $max;

        if ($ratio > 0.75) {
            return '#de2d26';
        } elseif ($ratio > 0.5) {
            return '#fb6a4a';
        } elseif ($ratio > 0.25) {
            return '#fcae91';
        } else {
            return '#fee5d9';
        }
    }
}
