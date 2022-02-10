## CF flood-xws-alert-resources

Default $ENV is "dev"

### Create geojson TA files
`$ cd bin && ./creategeojson && cd ..`

### Deploy the stack
`$ make deploy`

or

`$ ENV=test make deploy`

### Sync static files to S3
`$ make syncFiles`

### Sync target areas to S3
`$ make syncTargetAreas`

### Upload the process alert lambda
`$ make uploadProcessAlertLambda`

### Delete the stack
`$ make delete`




## flood-xws-alert-hosting

S3 Bucket static files for the XWS Alert Subsystem

## S3 Static hosted website

Setting up a [static website in S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html) using a custom domain that is registered with Route 53.

The domains are (TBD)

https://dev.xws.com

https://tst.xws.com

https://pp.xws.com

https://xws.com


## Bucket file structure

* alerts
  * alerts.xml (The RSS feed)
  * alerts.json (The RSS json feed)
  * items (All alert files go in here)
    * [alert-guid].xml
  * static (The files for alert feed found in this repo go here)
    * alert-style.xsl
    * draw-shapes.js
    * favicon.ico
    * rss-style.xsl
    * xws.png
* target-areas
  * TBD