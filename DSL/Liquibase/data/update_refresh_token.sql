-- Update the refresh token in the database
UPDATE integration_status
SET token = 'dmFsdWU='
WHERE platform='OUTLOOK';
