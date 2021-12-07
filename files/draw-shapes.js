// let mapCenterLat = 0
// let mapCenterLon = 0
// let mapCenter = ol.proj.fromLonLat([mapCenterLon, mapCenterLat])
// let mapZoom = 2
// let minLat = 90
// let maxLat = -90
// let minLon = 180
// let maxLon = -180
// const view = new ol.View({
//   center: mapCenter,
//   zoom: mapZoom
// })
// const tileLayer = new ol.layer.Tile({
//   source: new ol.source.OSM()
// })
// const map = new ol.Map({
//   target: 'map',
//   layers: [tileLayer],
//   view: view
// })
// function drawCapPolygon (capPolygon) {
//   // capPolygon format is lat,lon lat,lon lat,lon ...
//   const geomPolygon = new ol.geom.Polygon([convertVertices(capPolygon)])
//   const featurePolygon = new ol.Feature(geomPolygon)
//   featurePolygon.setStyle(new ol.style.Style({
//     fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.4)' }),
//     stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 })
//   }))
//   const vectorSource = new ol.source.Vector({
//     features: [featurePolygon]
//   })
//   const vectorLayer = new ol.layer.Vector({
//     source: vectorSource
//   })
//   map.addLayer(vectorLayer)
//   // CAP vertices are delimited by whitespace
//   const capVertices = capPolygon.split(/\s+/)
//   let vertexLatLon = []
//   let vertexLat = 0
//   let vertexLon = 0
//   for (let i = 0; i < capVertices.length; i++) {
//     vertexLatLon = capVertices[i].split(',')
//     vertexLat = parseFloat(vertexLatLon[0])
//     if (vertexLat > maxLat) { maxLat = vertexLat }
//     if (vertexLat < minLat) { minLat = vertexLat }
//     vertexLon = parseFloat(vertexLatLon[1])
//     if (vertexLon > maxLon) { maxLon = vertexLon }
//     if (vertexLon < minLon) { minLon = vertexLon }
//   }
//   setMapCenterAndZoom(capPolygon)
// }
// function convertVertices (capPolygon) {
//   // Convert from WGS84 (EPSG:4326) to Web Mercator (EPSG:3857)
//   // CAP vertices are delimited by whitespace
//   const capVertices = capPolygon.split(/\s+/)
//   let vertexLatLon = []
//   let vertexLonLat = []
//   let vertex3857 = []
//   const polygonCoords = []
//   for (let i = 0; i < capVertices.length; i++) {
//     vertexLatLon = capVertices[i].split(',')
//     vertexLonLat = [parseFloat(vertexLatLon[1]), parseFloat(vertexLatLon[0])]
//     vertex3857 = ol.proj.fromLonLat(vertexLonLat)
//     polygonCoords.push(vertex3857)
//   }
//   return polygonCoords
// }
// function drawCapCircle (capCircle) {
//   // capCircle format is lat,lon radius. The CAP
//   // center and radius are delimited by whitespace.
//   const circleCenterAndRadius = capCircle.split(/\s+/)
//   const circleRadius = parseFloat(circleCenterAndRadius[1])
//   const circleCenterLatLon = circleCenterAndRadius[0].split(',')
//   const circleCenterLat = parseFloat(circleCenterLatLon[0])
//   const circleCenterLon = parseFloat(circleCenterLatLon[1])
//   const circleLonLat = [circleCenterLon, circleCenterLat]
//   const circle3857 = ol.proj.fromLonLat(circleLonLat)
//   // A CAP circle radius is in kilometers but OpenLayers uses meters.
//   const geomCircle = new ol.geom.Circle(circle3857, circleRadius * 1000)
//   const featureCircle = new ol.Feature(geomCircle)
//   featureCircle.setStyle(new ol.style.Style({
//     fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.4)' }),
//     stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 })
//   }))
//   const vectorSource = new ol.source.Vector({
//     features: [featureCircle]
//   })
//   const vectorLayer = new ol.layer.Vector({
//     source: vectorSource
//   })
//   map.addLayer(vectorLayer)
//   // Each degree of latitude is approximately 111 kilometers long.
//   const circleDegrees = circleRadius / 111
//   // Make a circle bounding box using the radius in degrees.
//   // Prevent bounding box from overlapping pole or antimeridian.
//   let circleBoxNorth = circleCenterLat + circleDegrees
//   if (circleBoxNorth > 90) { circleBoxNorth = 90 }
//   let circleBoxSouth = circleCenterLat - circleDegrees
//   if (circleBoxSouth < -90) { circleBoxSouth = -90 }
//   let circleBoxEast = circleCenterLon + circleDegrees
//   if (circleBoxEast > 180) { circleBoxEast = 180 }
//   let circleBoxWest = circleCenterLon - circleDegrees
//   if (circleBoxWest < -180) { circleBoxWest = -180 }
//   if (circleBoxNorth > maxLat) { maxLat = circleBoxNorth }
//   if (circleBoxSouth < minLat) { minLat = circleBoxSouth }
//   if (circleBoxEast > maxLon) { maxLon = circleBoxEast }
//   if (circleBoxWest < minLon) { minLon = circleBoxWest }
//   setMapCenterAndZoom()
// }
// function setMapCenterAndZoom () {
//   mapCenterLat = minLat + ((maxLat - minLat) / 2)
//   mapCenterLon = minLon + ((maxLon - minLon) / 2)
//   mapCenter = ol.proj.fromLonLat([mapCenterLon, mapCenterLat])
//   view.setCenter(mapCenter)
//   const spanLat = maxLat - minLat
//   const spanLon = maxLon - minLon
//   let spanPercentage
//   if (spanLat > spanLon) {
//     spanPercentage = 100 * spanLat / 180
//   } else {
//     spanPercentage = 100 * spanLon / 360
//   }
//   switch (true) {
//     case (spanPercentage < 0.01):
//    mapZoom = 13
//    break
//     case (spanPercentage < 0.02):
//    mapZoom = 12
//    break
//     case (spanPercentage < 0.05):
//    mapZoom = 11
//    break
//     case (spanPercentage < 0.1):
//    mapZoom = 10
//    break
//     case (spanPercentage < 0.2):
//    mapZoom = 9
//    break
//     case (spanPercentage < 0.4):
//    mapZoom = 8
//    break
//     case (spanPercentage < 0.8):
//    mapZoom = 7
//    break
//     case (spanPercentage < 1.5):
//    mapZoom = 6
//    break
//     case (spanPercentage < 3):
//    mapZoom = 5
//    break
//     case (spanPercentage < 6.25):
//       mapZoom = 4
//    break
//     case (spanPercentage < 12.5):
//       mapZoom = 3
//    break
//     case (spanPercentage < 25):
//       mapZoom = 2
//    break
//     default:
//       mapZoom = 1
//   }
//   view.setZoom(mapZoom)
// }
