-- liquibase formatted sql

-- changeset kalsara Magamage:classifier-script-v3-changeset1
CREATE TYPE platform AS ENUM ('JIRA', 'OUTLOOK', 'PINAL');

-- changeset kalsara Magamage:classifier-script-v3-changeset2
CREATE TABLE public."integration_status" (
    id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    platform platform,
    is_connect BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_id VARCHAR(50) DEFAULT NULL,
    token TEXT DEFAULT NULL,
    CONSTRAINT integration_status_pkey PRIMARY KEY (id)
);

-- changeset kalsara Magamage:classifier-script-v3-changeset3
INSERT INTO public."integration_status" (platform, is_connect, subscription_id, token)
VALUES
    ('JIRA', FALSE, NULL, NULL),
    ('OUTLOOK', FALSE, NULL, NULL),
    ('PINAL', FALSE, NULL, NULL);

-- changeset kalsara Magamage:classifier-script-v3-changeset4
CREATE TABLE public."jira" (
    id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    input_id TEXT DEFAULT NULL,
    anonym_text TEXT DEFAULT NULL,
    corrected BOOLEAN NOT NULL DEFAULT FALSE,
    predicted_labels TEXT[] DEFAULT NULL,
    corrected_labels TEXT[] DEFAULT NULL,
    CONSTRAINT jira_pkey PRIMARY KEY (id)
);

CREATE TABLE public."outlook" (
    id int8 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    input_id TEXT DEFAULT NULL,
    anonym_text VARCHAR(50) DEFAULT NULL,
    corrected BOOLEAN NOT NULL DEFAULT FALSE,
    primary_folder_id TEXT DEFAULT NULL,
    parent_folder_ids TEXT[] DEFAULT NULL,
    CONSTRAINT outlook_pkey PRIMARY KEY (id)
);
