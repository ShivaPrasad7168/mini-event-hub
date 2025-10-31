
# Add Category Field to Events

## Tasks
- [x] Create new Supabase migration to add category column to events table
- [x] Update src/types/event.ts to include category in Event and CreateEventInput interfaces
- [x] Modify backend/server.js to handle category in POST and PUT requests
- [x] Add category field to CreateEventDialog.tsx form schema and UI
- [x] Add category field to EditEventDialog.tsx form schema and UI

## Followup Steps
- [ ] Apply the new migration to update the database
- [ ] Test event creation and editing with categories
- [ ] Update display components to show category if needed
