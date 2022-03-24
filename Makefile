ENV ?= dev
AWS_PROFILE ?= defra-dev-sandpit

deploy:
	aws cloudformation deploy --capabilities CAPABILITY_NAMED_IAM --template-file resources.yaml --stack-name xws-alert-$(ENV) --profile $(AWS_PROFILE)

syncAlerts:
	aws s3 sync ./alerts s3://xws-alert-$(ENV)-files/alerts --profile $(AWS_PROFILE) --acl public-read

syncAreas:
	aws s3 sync ./areas s3://xws-alert-$(ENV)-files/areas --profile $(AWS_PROFILE) --acl public-read --delete

uploadProcessAlertLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-alert-$(ENV)-process-alert --zip-file "fileb://./process-alert/function.zip"

uploadSendMessagesLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-alert-$(ENV)-send-messages --zip-file "fileb://./send-messages/function.zip"

delete:
	aws cloudformation delete-stack --stack-name xws-alert-$(ENV) --profile $(AWS_PROFILE)

echo:
	echo $(ENV)
