## CF flood-xws-alert-resources

Default $ENV is "dev"

### Deploy the stack
`$ make deploy`

or

`$ ENV=test make deploy`

### Upload S3 files
`$ make uploadfiles`

### Upload the process alert lambda
`$ make uploadProcessAlertLambda`

### Delete the S3 files
`$ make deletefiles`

### Delete the stack
`$ make delete`
