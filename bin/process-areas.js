const fs = require('fs')
const faa = require('./faa.json').features
const fwa = require('./fwa.json').features

const all = faa.concat(fwa).map(feature => feature.properties)

fs.writeFileSync('../static/target-areas.json', JSON.stringify(all, null, 2))
