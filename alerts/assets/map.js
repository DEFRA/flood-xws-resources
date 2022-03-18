;(function () {
  function map (target, code) {
    const ol = window.ol
    const vectorSource = new ol.source.Vector({
      url: `../../areas/target-areas/${code}.json`,
      format: new ol.format.GeoJSON()
    })

    const styleFunction = function (feature) {
      const type = feature.getGeometry().getType()

      if (type === 'Point') {
        return new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: '/assets/icon-map-marker.png'
          })
        })
      }

      // const props = feature.getProperties()
      // const categoryId = props.category_id
      // const isFWA = categoryId === 'fwa'

      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          // color: 'rgba(11, 12, 12, 1)',
          color: 'rgba(29, 112, 184, 1)',
          // color: isFWA ? 'rgba(227, 0, 15, 1)' : 'rgba(242, 134, 2, 1)',
          width: 2
        }),
        fill: new ol.style.Fill({
          // color: 'rgba(255, 221, 2, 0.2)',
          color: 'rgba(29, 112, 184, 0.2)' //,
          // color: isFWA ? 'rgba(227, 0, 15, 0.1)' : 'rgba(242, 134, 2, 0.1)'
        })
      })
    }

    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      projection: 'EPSG:4326',
      style: styleFunction
    })

    const osm = new ol.layer.Tile({
      source: new ol.source.OSM()
    })

    const extent = ol.proj.transformExtent([
      -5.75447,
      49.93027,
      1.799683,
      55.84093
    ], 'EPSG:4326', 'EPSG:3857')

    const view = new ol.View({
      center: [0, 0],
      zoom: 2,
      extent
    })

    const map = new ol.Map({
      target: target,
      view: view,
      layers: [osm].concat(vectorLayer),
      controls: ol.control.defaults({ attribution: false }).extend([
        new ol.control.FullScreen()
      ])
    })

    vectorSource.once('change', function (e) {
      if (vectorSource.getState() === 'ready') {
        const ext = vectorSource.getExtent()
        const view = map.getView()
        view.fit(ext, map.getSize())

        // if (ext[0] === ext[2]) { // Point
        //   view.setZoom(12)
        // }
      }
    })

    // [0, 0, 700000, 1300000]
    map.on('singleclick', function (evt) {
      console.log(evt.coordinate.map(function (p) {
        return Math.round(p)
      }))
    })
  }

  window.XWS = { map }
})()
