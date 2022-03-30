ENV ?= dev
AWS_PROFILE ?= defra-dev-sandpit

deploy:
	aws cloudformation deploy --capabilities CAPABILITY_NAMED_IAM --template-file resources.yaml --stack-name xws-$(ENV) --profile $(AWS_PROFILE)

syncAlerts:
	aws s3 sync ./alerts s3://xws-$(ENV)-files/alerts --profile $(AWS_PROFILE) --acl public-read --exclude ".DS_Store"

syncAreas:
	aws s3 sync ./areas s3://xws-$(ENV)-files/areas --profile $(AWS_PROFILE) --acl public-read --delete --exclude ".DS_Store"

uploadProcessAlertLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-$(ENV)-process-alert --zip-file "fileb://./process-alert/function.zip"

uploadProcessSubscriptionLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-$(ENV)-process-subscription --zip-file "fileb://./process-subscription/function.zip"

uploadSendMessagesLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-$(ENV)-send-messages --zip-file "fileb://./send-messages/function.zip"

delete:
	aws cloudformation delete-stack --stack-name xws-$(ENV) --profile $(AWS_PROFILE)

echo:
	echo $(ENV)
