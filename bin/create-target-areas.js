const fs = require('fs')
const { promisify } = require('util')
const { Client } = require('pg')
const through = require('through')
const QueryStream = require('pg-query-stream')
const JSONStream = require('JSONStream')
const writeFile = promisify(fs.writeFile)
const { alertTypes } = require('flood-xws-common/data')

async function writeTargetAreas () {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  const query = new QueryStream(`SELECT
    jsonb_build_object(
      'type', 'FeatureCollection',
      'features', json_build_array(
        jsonb_build_object(
          'type', 'Feature',
          'id', code,
          'geometry', ST_AsGeoJSON(geom, 6, 1)::jsonb,
          'properties', jsonb_set(to_jsonb(xws_area.area.*) - 'geom' - 'bounding_box' - 'updated_at' - 'created_at', '{centroid}', ST_AsGeoJSON(centroid, 6)::jsonb)
        )
      )
    ) as geojson
  FROM xws_area.area`)

  const stream = client.query(query)
  
  // Release the client when the stream is finished
  stream.on('end', () => client.end())

  let i = 0
  // Stream each row to a file
  stream
    .pipe(through(function write (data) {
      const { geojson } = data
      const id = geojson.features[0].id

      fs.writeFile(`../areas/target-areas/${id}.json`, JSON.stringify(geojson), () => {
        console.log('id', id, ++i)
        this.emit('data', id)
      })
    }))
}

async function run () {
  writeTargetAreas()
}

run ()