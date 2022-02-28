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

      fs.writeFile(`../target-areas/${id}.json`, JSON.stringify(geojson), () => {
        console.log('id', id, ++i)
        this.emit('data', id)
      })
    }))
}

async function writeStaticData () {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  const data = await client.query(`
    SELECT id, name FROM xws_area.category;
    SELECT id, name, full_name, "group" FROM xws_area.ea_area;
    SELECT id, name, ea_area_id FROM xws_area.ea_owner;
    SELECT code, name, description FROM xws_area.area;
    SELECT id, name FROM xws_area.type;
  `)

  await writeFile(`../static/area-category.json`, JSON.stringify(data[0].rows, null, 2))
  await writeFile(`../static/ea-area.json`, JSON.stringify(data[1].rows, null, 2))
  await writeFile(`../static/ea-owner.json`, JSON.stringify(data[2].rows, null, 2))
  await writeFile(`../static/target-area.json`, JSON.stringify(data[3].rows, null, 2))
  await writeFile(`../static/area-type.json`, JSON.stringify(data[4].rows, null, 2))
  await writeFile(`../static/alert-type.json`, JSON.stringify(alertTypes, null, 2))
  return client.end()
}

// async function writeTargetAreasList () {
//   const client = new Client(process.env.DATABASE_URL)
//   await client.connect()
//   const writableStream = fs.createWriteStream('../static/target-areas.json')
//   const query = new QueryStream('select code, name, description from xws_area.area')
//   const stream = client.query(query)
  
//   // Release the client when the stream is finished
//   stream.on('end', () => client.end())

//   // Pipe query to file
//   stream.pipe(JSONStream.stringify()).pipe(writableStream)
// }

async function run () {
  writeStaticData()
  writeTargetAreas()
  // writeTargetAreasList()
}

run ()