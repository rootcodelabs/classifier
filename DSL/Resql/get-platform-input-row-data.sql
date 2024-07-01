SELECT corrected_labels
FROM inputs
WHERE input_id=:inputId AND platform=:platform::platform;
