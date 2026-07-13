CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    team_size TEXT,
    revenue TEXT,
    status TEXT DEFAULT 'novo',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    gclid TEXT,
    fbclid TEXT,
    referrer TEXT,
    page_url TEXT
);

-- Grant privileges so the anon key can access it from the frontend
GRANT ALL ON TABLE leads TO anon;
GRANT ALL ON TABLE leads TO authenticated;
GRANT ALL ON TABLE leads TO service_role;
