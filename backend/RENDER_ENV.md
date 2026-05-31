# Render deployment notes (backend)

## Required environment variables
- ConnectionStrings__DefaultConnection
  - Example: Host=db.<project>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<password>;SSL Mode=Require;Trust Server Certificate=true;
- Jwt__SecretKey
  - Use a long, random value (32+ chars).
- Jwt__Issuer
- Jwt__Audience
- AppSettings__FrontendUrl
- AppSettings__BackendUrl

## Common failure: "Name or service not known"
- The database host cannot be resolved from Render.
- Confirm the host name is correct (for Supabase it should be db.<project>.supabase.co).
- Verify the env var is set in the Render service and redeploy after changes.
- If you changed the database, update the host and password and redeploy.
