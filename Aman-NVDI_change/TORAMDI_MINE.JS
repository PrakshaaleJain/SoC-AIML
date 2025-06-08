// 1. Define Region of Interest (ROI)
var region = ee.Geometry.Rectangle([86.1690, 22.7118, 86.2090, 22.7518]);
Map.centerObject(region, 13);

// 2. Load & process Landsat 5 for 2010 (Surface Reflectance)
var image2010 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(region)
  .filterDate('2010-01-01', '2010-12-31')
  .select(['SR_B3', 'SR_B4'])  // Red, NIR
  .median()
  .multiply(0.0000275).add(-0.2); // Scaling

var ndvi2010 = image2010.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI_2010');

// 3. Load & process Landsat 8 for 2025
var image2025 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(region)
  .filterDate('2025-01-01', '2025-12-31')
  .select(['SR_B4', 'SR_B5'])  // Red, NIR
  .median()
  .multiply(0.0000275).add(-0.2); // Scaling

var ndvi2025 = image2025.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI_2025');

// 4. Add NDVI layers to map
Map.addLayer(ndvi2010, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 2010');
Map.addLayer(ndvi2025, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 2025');

// 5. Compute NDVI Change (2025 - 2010)
var ndviChange = ndvi2025.subtract(ndvi2010).rename('NDVI_Change');

// 6. Visualize NDVI change
Map.addLayer(ndviChange, {min: -0.5, max: 0.5, palette: ['red', 'white', 'green']}, 'NDVI Change 2010-2025');

// 7. Sample NDVI change values in the region
var samplePoints = ndviChange.sample({
  region: region,
  scale: 30,
  numPixels: 5000,
  geometries: true
});

// 8. Export as CSV to Google Drive
Export.table.toDrive({
  collection: samplePoints,
  description: 'NDVI_Change_2010_2025_CSV',
  fileFormat: 'CSV',
  folder: 'EarthEngineExports'
});
