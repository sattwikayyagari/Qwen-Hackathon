CREATE TABLE concepts(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mastery_score FLOAT NOT NULL DEFAULT 0.5,
    last_reviewed TIMESTAMP NOT NULL DEFAULT NOW(),
    embedding VECTOR(384)
)