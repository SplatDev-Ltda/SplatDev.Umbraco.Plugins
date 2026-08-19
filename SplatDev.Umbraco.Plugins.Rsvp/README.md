# UmbracoCms.Plugins.Rsvp

An event RSVP plugin for Umbraco 13 and Umbraco 17 with capacity management, waitlisting, and cancellation.


<!-- screenshot:start -->

![Rsvp dashboard](https://raw.githubusercontent.com/splatdevtech/SplatDev.Umbraco.Plugins/master/SplatDev.Umbraco.Plugins.Rsvp/docs/screenshots/01-dashboard.png)

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
@await Component.InvokeAsync("Rsvp", new { eventId = 1 })
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