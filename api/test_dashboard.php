<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simular datos de prueba para el dashboard
$testData = [
    'success' => true,
    'pronosticos' => [
        [
            'filename' => 'test_pronostico.json',
            'region' => 'Cibao',
            'fecha' => '2024-01-15',
            'hora' => '14:30',
            'pronosticador' => 'Juan Pérez',
            'timestamp' => '2024-01-15 14:30:00',
            'data' => [
                'general' => [
                    'region-select' => 'Cibao',
                    'fecha' => '2024-01-15',
                    'hora' => '14:30',
                    'pronosticador' => 'Juan Pérez',
                    'condiciones' => 'Cielo parcialmente nublado',
                    'especiales' => 'Vientos moderados',
                    'maritimas' => 'Oleaje moderado'
                ],
                'table24' => [
                    [
                        'province' => 'Santiago',
                        'cells' => [
                            ['Soleado'],
                            ['Parcialmente Nublado'],
                            ['Nublado'],
                            ['25', '18']
                        ]
                    ],
                    [
                        'province' => 'La Vega',
                        'cells' => [
                            ['Nublado'],
                            ['Aguaceros'],
                            ['Lluvias'],
                            ['23', '16']
                        ]
                    ],
                    [
                        'province' => 'Puerto Plata',
                        'cells' => [
                            ['Soleado'],
                            ['Soleado'],
                            ['Parcialmente Nublado'],
                            ['27', '20']
                        ]
                    ]
                ],
                'table4872' => [
                    [
                        'province' => 'Santiago',
                        'cells' => [
                            ['Soleado', '26'],
                            ['Parcialmente Nublado', '24']
                        ]
                    ],
                    [
                        'province' => 'La Vega',
                        'cells' => [
                            ['Nublado', '22'],
                            ['Aguaceros', '20']
                        ]
                    ]
                ],
                'timestamp' => '2024-01-15 14:30:00'
            ]
        ]
    ],
    'total' => 1,
    'baseUrl' => Config::getBaseUrl(),
    'message' => 'Datos de prueba para el dashboard'
];

echo json_encode($testData);
?> 