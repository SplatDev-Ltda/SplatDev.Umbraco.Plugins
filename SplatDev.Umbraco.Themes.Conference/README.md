# UmbracoCms.Themes.Conference

Conference/event theme for Umbraco – schedule, speakers, venue, registration, countdown.

## Features

- Conference root with event dates, location, and registration URL
- Speakers listing with profiles, bios, social links, and session assignments
- Multi-day schedule with session types (Keynote, Workshop, Panel, Lightning Talk, Networking) and difficulty levels
- Venue page with gallery, map embed, and travel/hotel information
- Registration page with ticket tiers and early-bird deadline
- Sponsors page with Gold/Silver/Bronze tier display
- Hero section with live countdown timer
- Stats bar (attendees, speakers, sessions, sponsors)
- Bold dark-header branding with accent colour system
- Mobile-responsive layout

## Compatibility

| NuGet target    | Umbraco version |
|-----------------|-----------------|
| `net8.0`        | 13.12.0         |
| `net10.0`       | 17.3.4          |

## Installation

Install via NuGet:

```
dotnet add package UmbracoCms.Themes.Conference
```

On first startup the theme auto-installs its Umbraco schema (data types, document types, templates) via `SplatDev.Umbraco.Plugins.Yaml2Schema`. A `.done` file is written to `{ContentRoot}/config/themes/conference/` to prevent re-installation.

## Document Types

| Alias               | Description                                              |
|---------------------|----------------------------------------------------------|
| `basePage`            | Shared base page with common properties                |
| `conferenceRoot`      | Site root – holds global conference settings           |
| `conferenceHome`      | Home page with hero, countdown, stats, schedule preview |
| `speakersListing`     | Speakers index page                                    |
| `speaker`             | Individual speaker profile                             |
| `schedulePage`        | Full conference schedule                               |
| `venuePage`           | Venue details, gallery, map, travel info               |
| `registrationPage`    | Registration info and CTA                              |
| `sponsorsPage`        | Sponsor tiers listing                                  |
| `standardPage`        | Generic content page                                   |

### Element Types

| Alias                  | Description                           |
|------------------------|---------------------------------------|
| `scheduleSessionElement` | Individual session in a schedule day |
| `scheduleDayElement`    | Day container in a multi-day schedule |
| `speakerLinkElement`    | Social link for speaker profile      |
| `socialLinkElement`     | Generic social media link            |
| `venueRoomElement`      | Room within the venue                |
| `ticketTypeElement`     | Ticket tier with pricing             |
| `sponsorTierElement`    | Sponsor tier (Gold/Silver/Bronze)    |
| `sponsorElement`        | Individual sponsor listing           |

## Templates

| Template           | View File                       |
|--------------------|---------------------------------|
| ConferenceHome     | Views/ConferenceHome.cshtml     |
| SpeakersListing    | Views/SpeakersListing.cshtml    |
| Speaker            | Views/Speaker.cshtml            |
| SchedulePage       | Views/SchedulePage.cshtml       |
| VenuePage          | Views/VenuePage.cshtml          |
| RegistrationPage   | Views/RegistrationPage.cshtml   |
| SponsorsPage       | Views/SponsorsPage.cshtml       |

## Stylesheet

Include `/css/conference-theme.css` in your layout or reference it directly. Customise via CSS custom properties defined in `:root`.
