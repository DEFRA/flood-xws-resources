const fs = require('fs')
const { alertTypes, areas, regions, targetAreaTypes } = require('flood-xws-common/data')

fs.writeFileSync('./static/areas.json', JSON.stringify(areas, null, 2))
fs.writeFileSync('./static/regions.json', JSON.stringify(regions, null, 2))
fs.writeFileSync('./static/target-area-types.json', JSON.stringify(targetAreaTypes, null, 2))
fs.writeFileSync('./static/alert-types.json', JSON.stringify(alertTypes, null, 2))
