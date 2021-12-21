## CF flood-xws-alert-resources

Default $ENV is "dev"

### Deploy the stack
`$ make deploy`

or

`$ ENV=test make deploy`

### Upload S3 files
`$ make uploadfiles`

### Package up lambda code
`$ pushd process-alert; npm run package; popd`

### Upload the process alert lambda
`$ make uploadProcessAlertLambda`

### Package up lambda code
`$ pushd alert-notification; npm run package; popd`

### Upload the alert notification lambda
`$ make uploadAlertNotificationLambda

### Delete the S3 files
`$ make deletefiles`

### Delete the stack
`$ make delete`
