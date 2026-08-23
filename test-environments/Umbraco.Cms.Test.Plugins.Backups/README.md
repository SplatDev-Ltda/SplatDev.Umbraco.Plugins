# Backups Plugin E2E Tests

Playwright end-to-end tests for `SplatDev.Umbraco.Plugins.Backups` v3.1.0.

## Requirements

- Node.js 18+
- A running Umbraco 13 or 17 instance with the Backups plugin installed
- An admin user with access to the Settings section

## Setup

```bash
npm install
npx playwright install chromium
```

Copy and configure the example appsettings:

```bash
cp appsettings.example.json /path/to/umbraco/appsettings.Development.json
```

Edit the file and enable any cloud providers you want to test.

## Running Tests

```bash
# Against default localhost:5100
UMBRACO_ADMIN_EMAIL=admin@example.com UMBRACO_ADMIN_PASSWORD=Admin1234! npm test

# Against a specific URL
UMBRACO_URL=http://localhost:5000 UMBRACO_ADMIN_EMAIL=admin@example.com UMBRACO_ADMIN_PASSWORD=Admin1234! npm test

# Headed (visible browser)
npm run test:headed

# View HTML report
npm run test:report
```

## Test Coverage

| Suite | Tests |
|-------|-------|
| Navigation | Settings shows Backups, dashboard loads |
| API | GET all, GET cloud providers, POST create |
| Provider Configuration | Local FS validates, all 9 providers return correct response |
| Full Workflow | Create → List → Delete backup round trip |

## Screenshots

Test screenshots are saved to `test-results/` after each run.

## Cloud Provider Configuration

See `appsettings.example.json` for configuration templates for all 10 providers:

| Provider | Auth Type | Settings Keys |
|----------|-----------|---------------|
| LocalFileSystem | None | — |
| AzureBlobStorage | Connection String | `ConnectionString` |
| GoogleDrive | OAuth2 Token | `AccessToken`, `FolderName` |
| Dropbox | OAuth2 Token | `AccessToken`, `RootPath` |
| BoxNet | OAuth2 Token | `AccessToken`, `FolderId` |
| OneDrive | OAuth2 Token | `AccessToken`, `FolderPath` |
| Mega | Email/Password | `Email`, `Password`, `FolderPath` |
| Seafile | API Token | `ServerUrl`, `Token`, `LibraryId`, `FolderPath` |
| AwsS3 | Access Keys | `AccessKeyId`, `SecretAccessKey`, `Region`, `BucketName`, `Prefix` |
| Sftp | Password or Key | `Host`, `Port`, `Username`, `Password`, `PrivateKeyPath`, `RemotePath` |
