# UmbracoCms.Plugins.Rsvp

An event RSVP plugin for Umbraco 13 and Umbraco 17 with capacity management, waitlisting, and cancellation.


<!-- screenshot:start -->

![Rsvp dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Rsvp/docs/screenshots/01-dashboard.png)

![Rsvp property editor](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Rsvp/docs/screenshots/02-property-editor.png)

![Rsvp data type](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Rsvp/docs/screenshots/03-data-type.png)

![Rsvp on the front end](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Rsvp/docs/screenshots/04-front-end.png)

<!-- screenshot:end -->

## Features

- Create and manage events with capacity limits and registration deadlines
- Attendee registration with Confirmed / Waitlisted / Cancelled statuses
- Automatic waitlist promotion when a confirmed attendee cancels
- Duplicate registration prevention (unique index on EventId + Email)
- U17 backoffice dashboard with attendee management (Lit 3 web component)
- U13 backoffice dashboard (AngularJS)
- Razor view component for embedding registration forms in Umbraco templates
- EF Core with SQL Server (schema: `rsvp`)

## Targets

| Framework | Umbraco | EF Core |
|-----------|---------|---------|
| net8.0    | 13.12.0 | 8.0.20  |
| net10.0   | 17.3.4  | 10.0.7  |

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET    | `/umbraco/api/rsvp/getevents` | List all events |
| GET    | `/umbraco/api/rsvp/getevent?id={id}` | Get event with attendees |
| POST   | `/umbraco/api/rsvp/createevent` | Create an event |
| PUT    | `/umbraco/api/rsvp/updateevent?id={id}` | Update an event |
| DELETE | `/umbraco/api/rsvp/deleteevent?id={id}` | Delete an event |
| POST   | `/umbraco/api/rsvp/register` | Register an attendee |
| GET    | `/umbraco/api/rsvp/getattendees?eventId={id}` | List attendees for event |
| POST   | `/umbraco/api/rsvp/cancelregistration?attendeeId={id}` | Cancel a registration |

## Usage in Templates

```cshtml
@* A fixed event: *@
@await Component.InvokeAsync("Rsvp", new { eventId = 1 })

@* Or the one chosen on this page with the Event property editor: *@
@await Component.InvokeAsync("Rsvp", new { eventId = Model.Value<int>("event") })
```

## Building the Client

```bash
cd client
npm install
npm run build
```

## Database Schema

Tables in the `rsvp` schema:
- `RsvpEvents` - Event definitions
- `RsvpAttendees` - Attendee registrations (unique index on EventId + Email)

## Attendee Status Values

| Value | Meaning |
|-------|---------|
| 0 | Confirmed |
| 1 | Waitlisted |
| 2 | Cancelled |

## Changelog

### 2.4.0 — 2026-08-23

The Razor view behind `@await Component.InvokeAsync(...)` is now compiled into the package. It was previously carried as a loose file that nothing packed, so the component threw "view not found" on every install and the front-end usage shown in this README could not have worked.

The view also still referenced the package's pre-rename namespace, so it would not have compiled even had it shipped. That is fixed, and the view is now built with the project — a broken view fails the build instead of failing a visitor's request.

### 2.3.0 — 2026-08-23
- A content editor can choose which event a page shows. The view component takes a numeric id, so until now putting an event on a page meant knowing that id and writing it into a template by hand — there was no way to pick one.

### 2.2.3 — 2026-08-22
- Registering for an event works. It returned 500 while saving the registration anyway: the response carried the attendee, which carried the event, which carried the attendees, and the serializer looped. From that point the event listing returned 500 too, for everyone — so one registration took the plugin down.
- Event listings no longer carry the people who registered. GetEvents and GetEvent are deliberately open so a front end can show what is on, and they were returning every attendee's name, e-mail and phone number to anyone who asked — the same disclosure that was closed on GetAttendees, reachable by another route. They now carry counts and spaces remaining; the attendee list stays behind GetAttendees, which requires backoffice access.
- A request body that cannot be read is answered with 400 and a reason, instead of a 500 from a null reference.

### 2.2.2 — 2026-08-21
- Dashboard now sends the backoffice token with its API calls. On Umbraco 17 those calls were arriving unauthenticated and coming back 401, which the dashboard rendered as an empty state rather than an error.
- A failed request now raises a notification instead of leaving the dashboard looking like there is simply no data.
- The plugin's tables are created on startup. They were never created before, so anything touching them failed on a fresh install.
- Runs on SQLite as well as SQL Server. It previously assumed SQL Server and failed with "Keyword not supported: 'cache'" on the database Umbraco's installer offers by default.
