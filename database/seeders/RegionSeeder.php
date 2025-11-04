<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            [
                'name' => 'Москва',
                'geojson' => json_encode([
                    'type' => 'Feature',
                    'properties' => ['name' => 'Москва'],
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [[[37.3, 55.5], [37.9, 55.5], [37.9, 56.0], [37.3, 56.0], [37.3, 55.5]]]
                    ]
                ])
            ],
            [
                'name' => 'Санкт-Петербург',
                'geojson' => json_encode([
                    'type' => 'Feature',
                    'properties' => ['name' => 'Санкт-Петербург'],
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [[[30.1, 59.8], [30.6, 59.8], [30.6, 60.1], [30.1, 60.1], [30.1, 59.8]]]
                    ]
                ])
            ],
            [
                'name' => 'Татарстан',
                'geojson' => json_encode([
                    'type' => 'Feature',
                    'properties' => ['name' => 'Татарстан'],
                    'geometry' => [
                        'type' => 'Polygon',
                        'coordinates' => [[[48.5, 54.5], [50.5, 54.5], [50.5, 56.5], [48.5, 56.5], [48.5, 54.5]]]
                    ]
                ])
            ],
        ];

        foreach ($regions as $region) {
            DB::table('regions')->insert($region);
        }
    }
}
