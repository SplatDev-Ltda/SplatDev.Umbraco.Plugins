# SplatDev.Umbraco.Plugins.Forums

Discussion forums plugin for Umbraco 13 (net8.0) and Umbraco 17 (net10.0).

[![NuGet](https://img.shields.io/nuget/v/SplatDev.Umbraco.Plugins.Forums.svg)](https://www.nuget.org/packages/SplatDev.Umbraco.Plugins.Forums)

## Compatibility

| Umbraco | .NET | Package Version |
|---------|------|-----------------|
| 13.x    | 8.0  | 2.0.1           |
| 17.x    | 10.0 | 2.0.1           |

## Installation

```sh
dotnet add package SplatDev.Umbraco.Plugins.Forums
```

## Features

- Forum categories with slug-based routing and sort order
- Threaded discussions with pinning, locking and view tracking
- Reply system with moderation (approve, soft-delete, hard-delete)
- Backoffice dashboard (Umbraco 17: Lit 3 element; Umbraco 13: AngularJS)
- Full moderation controls: lock/unlock threads, pin/unpin, delete threads and replies

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/umbraco/api/forums/GetCategories` | List categories |
| GET | `/umbraco/api/forums/GetCategory?slug=` | Get category by slug |
| GET | `/umbraco/api/forums/GetThreads?categoryId=&page=&pageSize=` | Threads in category |
| GET | `/umbraco/api/forums/GetThread?slug=` | Get thread with replies |
| POST | `/umbraco/api/forums/CreateThread` | Create new thread |
| GET | `/umbraco/api/forums/GetReplies?threadId=` | Replies for thread |
| POST | `/umbraco/api/forums/AddReply` | Add reply to thread |
| POST | `/umbraco/api/forums/LockThread?threadId=&locked=` | Lock/unlock thread |
| POST | `/umbraco/api/forums/PinThread?threadId=&pinned=` | Pin/unpin thread |
| DELETE | `/umbraco/api/forums/DeleteThread?threadId=` | Delete thread |
| POST | `/umbraco/api/forums/ApproveReply?replyId=` | Approve reply |
| DELETE | `/umbraco/api/forums/DeleteReply?replyId=&hard=` | Delete reply |

## Database

Uses EF Core with SQL Server. Schema: `forums`. Run migrations:

```bash
dotnet ef migrations add InitialForums --project UmbracoCms.Plugins.Forums
dotnet ef database update --project UmbracoCms.Plugins.Forums
```

## Building the client

```bash
cd client
npm install
npm run build
```

## License

MIT © [SplatDev](https://github.com/SplatDev-Ltda)
