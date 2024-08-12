INSERT INTO "input" (
    input_id,
    inference_time_stamp,
    inference_text,
    predicted_labels,
    average_predicted_classes_probability,
    platform,
    all_class_predicted_probabilities,
    primary_folder_id
)
VALUES (
    :input_id,
    :inference_time_stamp::timestamp with time zone,
    :inference_text,
    :predicted_labels::jsonb,
    :average_predicted_classes_probability,
    :platform::platform,
    :all_class_predicted_probabilities::jsonb,
    :primary_folder_id
)
RETURNING id;
