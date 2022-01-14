ENV ?= dev
AWS_PROFILE ?= defra-dev-sandpit

deploy:
	aws cloudformation deploy --capabilities CAPABILITY_NAMED_IAM --template-file resources.yaml --stack-name xws-alert-$(ENV) --profile $(AWS_PROFILE)

uploadfiles:
	aws s3 sync ./files s3://xws-alert-$(ENV)-files/alerts/__static --profile $(AWS_PROFILE) --acl public-read

uploadProcessAlertLambda:
	aws lambda update-function-code --profile $(AWS_PROFILE) --function-name xws-alert-$(ENV)-process-alert --zip-file "fileb://./process-alert/function.zip"

delete:
	aws cloudformation delete-stack --stack-name xws-alert-$(ENV) --profile $(AWS_PROFILE)

echo:
	echo $(ENV)
