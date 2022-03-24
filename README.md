## flood-xws-resources

Default $ENV is "dev"

### Create geojson TA files
`$ DATABASE_URL=<Enter DB URL> cd bin && ./create-target-areas && cd ..`

### Deploy the stack
`$ make deploy`

or

`$ ENV=test make deploy`

### Sync static alert files to S3
`$ make syncAlerts`

### Sync target areas to S3
`$ make syncAreas`

### Upload the process alert lambda
`$ make uploadProcessAlertLambda`

### Upload the send messages lambda
`$ make uploadSendMessagesLambda`

Note: Currently need to manually configure the send-messages lambda ENVARS for Gov UK Notify

### Delete the stack
`$ make delete`


## flood-xws-data-hub

S3 Bucket static file-based public API

### S3 Static hosted website

Setting up a [static website in S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html) using a custom domain that is registered with Route 53.

The domains are (TBD)

https://dev.xws.com

https://tst.xws.com

https://pp.xws.com

https://xws.com


### Bucket file structure

* alerts
  * alerts.rss (The RSS feed)
  * alerts.atom (The RSS atom feed)
  * alerts.json (The json feed)
  * items (All alert files go in here)
    * {guid}.xml
  * assets (The files for alert feed styling found in this repo go here)
    * alert-style.xsl
    * draw-shapes.js
    * favicon.ico
    * rss-style.xsl
    * xws.png
* areas
  * ea-area.json
  * ea-owner.json
  * target-area-category.json
  * target-area-type.json
  * target-area-view.json
  * target-area.json
  * target-areas/{code}.json