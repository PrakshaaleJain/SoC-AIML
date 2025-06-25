var region = ee.Geometry.Rectangle([86.3267, 22.6333, 86.3667, 22.6733]);
Map.centerObject(region, 13);

var image2010 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(region)
  .filterDate('2010-01-01', '2010-12-31')
  .select(['SR_B3', 'SR_B4'])  // Red, NIR
  .median()
  .multiply(0.0000275).add(-0.2); // Scaling

var ndvi2010 = image2010.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI_2010');

var image2025 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
  .filterBounds(region)
  .filterDate('2025-01-01', '2025-12-31')
  .select(['SR_B4', 'SR_B5'])  // Red, NIR
  .median()
  .multiply(0.0000275).add(-0.2); // Scaling

var ndvi2025 = image2025.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI_2025');

Map.addLayer(ndvi2010, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 2010');
Map.addLayer(ndvi2025, {min: 0, max: 1, palette: ['white', 'green']}, 'NDVI 2025');

var ndviChange = ndvi2025.subtract(ndvi2010).rename('NDVI_Change');

Map.addLayer(ndviChange, {min: -0.5, max: 0.5, palette: ['red', 'white', 'green']}, 'NDVI Change 2010-2025');

var samplePoints = ndviChange.sample({
  region: region,
  scale: 30,
  numPixels: 5000,
  geometries: true
});