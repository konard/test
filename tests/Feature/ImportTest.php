<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test region
        Region::create([
            'name' => 'Москва',
            'geojson' => json_encode(['type' => 'Feature', 'geometry' => ['type' => 'Point', 'coordinates' => [37.6, 55.7]]]),
        ]);
    }

    public function test_import_page_requires_authentication()
    {
        $response = $this->get('/admin/import');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_import_page()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $response = $this->actingAs($user)->get('/admin/import');
        $response->assertStatus(200);
    }

    public function test_csv_import_with_valid_data()
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $user->assignRole('admin');

        $csvContent = "region,position,violation_type,date\n";
        $csvContent .= "Москва,Начальник отдела,взятка,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($user)->post('/admin/import/upload', [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('corruption_cases', [
            'region_id' => 1,
            'violation_type' => 'взятка',
        ]);
    }

    public function test_csv_import_with_invalid_region()
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $user->assignRole('admin');

        $csvContent = "region,position,violation_type,date\n";
        $csvContent .= "НесуществующийРегион,Начальник,взятка,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($user)->post('/admin/import/upload', [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('errorCount', 1);
    }

    public function test_csv_import_validates_date_format()
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $user->assignRole('admin');

        $csvContent = "region,position,violation_type,date\n";
        $csvContent .= "Москва,Начальник,взятка,15-01-2024\n"; // Invalid format

        $file = UploadedFile::fake()->createWithContent('test.csv', $csvContent);

        $response = $this->actingAs($user)->post('/admin/import/upload', [
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('errorCount', 1);
    }
}
