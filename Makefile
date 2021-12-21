ENV ?= dev
AWS_PROFILE ?= defra-dev-sandpit

deploy:
	aws cloudformation deploy --capabilities CAPABILITY_NAMED_IAM --template-file resources.yaml --stack-name xws-$(ENV) --profile $(AWS_PROFILE)

uploadfiles:
	aws s3 sync ./files s3://xws-$(ENV)-files/alerts/__static --profile $(AWS_PROFILE) --acl public-read
	aws s3 mv s3://xws-$(ENV)-files/alerts/__static/alerts.xml s3://xws-$(ENV)-files/alerts/alerts.xml --profile $(AWS_PROFILE) --acl public-read
	aws s3 mv s3://xws-$(ENV)-files/alerts/__static/alerts.json s3://xws-$(ENV)-files/alerts/alerts.json --profile $(AWS_PROFILE) --acl public-read

uploadProcessAlertLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-$(ENV)-process-alert --zip-file "fileb://./process-alert/function.zip"

uploadAlertNotificationLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-$(ENV)-alert-notification --zip-file "fileb://./alert-notification/function.zip"

delete:
	aws cloudformation delete-stack --stack-name xws-$(ENV) --profile $(AWS_PROFILE)

echo:
	echo $(ENV)
