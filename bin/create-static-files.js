const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { Client } = require('pg')
const writeFile = promisify(fs.writeFile)
const { alertTypes } = require('flood-xws-common/data')

async function writeStaticFiles () {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  const data = await client.query(`
    SELECT id, name FROM xws_area.category;
    SELECT id, name, full_name, "group" FROM xws_area.ea_area;
    SELECT id, name, ea_area_id FROM xws_area.ea_owner;
    SELECT code, name, description, ea_owner_id, ea_area_id, river_sea, type_id, category_id, parent_area_code, local_authority_name, quick_dial_code FROM xws_area.area;
    SELECT code, name, description FROM xws_area.area;
    SELECT id, name FROM xws_area.type;
  `)

  await writeFile(path.join(__dirname, '../areas/target-area-category.json'), JSON.stringify(data[0].rows, null, 2))
  await writeFile(path.join(__dirname, '../areas/ea-area.json'), JSON.stringify(data[1].rows, null, 2))
  await writeFile(path.join(__dirname, '../areas/ea-owner.json'), JSON.stringify(data[2].rows, null, 2))
  await writeFile(path.join(__dirname, '../areas/target-area.json'), JSON.stringify(data[3].rows))
  await writeFile(path.join(__dirname, '../areas/target-area-view.json'), JSON.stringify(data[4].rows))
  await writeFile(path.join(__dirname, '../areas/target-area-type.json'), JSON.stringify(data[5].rows, null, 2))
  await writeFile(path.join(__dirname, '../alerts/alert-type.json'), JSON.stringify(alertTypes, null, 2))

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
  writeStaticFiles()
}

run()
