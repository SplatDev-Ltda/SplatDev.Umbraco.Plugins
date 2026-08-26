# Deploying staging

`staging-umbraco.splatdev.tech` is an Umbraco 17 instance carrying every publishable plugin,
running as the Docker container `u17-testing-web`.
`.github/workflows/deploy-staging.yml` updates it. **Manual dispatch only** — staging is
outward-facing, so a deploy is a decision someone makes rather than something a merge
triggers.

## A deploy is an image rebuild, not a file copy

The container's only volumes are `u17_media` and `u17_plugins`; neither carries the
application, which is baked into the image. Copying published output to a directory on the
host therefore achieves nothing — the container never reads it. (The first version of this
workflow did exactly that.)

So the workflow:

1. packs every publishable plugin into a local NuGet feed, using **the same discovery rule
   as `publish.yml`** so a package that ships is a package staging gets;
2. regenerates `plugins.props` with `tools/make-plugins-props.py`, failing if any plugin it
   lists has no `.nupkg`;
3. ships that build context to the host;
4. runs `docker compose build` and recreates the service;
5. polls the site and **fails the job** if it does not come back.

`infra/testing-instances/u17/Dockerfile` builds a fresh Umbraco site from a **pinned**
`Umbraco.Templates::17.6.0` and installs the plugins from that local feed in a single
restore. Keep the pin: without it the instance silently drifted to Umbraco 18 once already
(SPL-3497), and because both are .NET 10 nothing failed loudly — plugins were simply
"verified" against the wrong major.

## Secrets it needs

Checked up front, so a missing one is a named error rather than an unreadable ssh failure.

| Secret | What it is |
| --- | --- |
| `STAGING_SSH_HOST` | hostname or IP of the staging box |
| `STAGING_SSH_USER` | the deploy user |
| `STAGING_SSH_PASSWORD` | that user's password |
| `STAGING_SRC` | absolute path of the build context on the host |

Optional:

| Name | Kind | Default | What it is |
| --- | --- | --- | --- |
| `STAGING_COMPOSE_DIR` | secret | `STAGING_SRC` | where `docker-compose.yml` lives, if not the build context |
| `STAGING_URL` | variable | `https://staging-umbraco.splatdev.tech` | what the health check polls |

**On the password.** This authenticates with `sshpass`, reading the password from the
environment rather than the command line so it stays out of the host's process list. It is
still materially weaker than a key: a reusable password that opens a shell, held by CI, and
rotated only by hand. A dedicated deploy key restricted to this one job is the better shape
if you revisit it.

## Running it

Actions → **Deploy staging** → Run workflow.

- `ref` — branch, tag or SHA to deploy (default `master`)
- `dry_run` — packs everything and reports what *would* ship without touching the host. Run
  this first.
- `no_cache` — rebuild the image from scratch. On by default; turn it off for a quick
  iteration when only plugin packages changed.

## Why the rebuild fixes the duplicate aliases

Staging logged fifteen `Extension with alias X is already registered` errors. Umbraco
discovers extensions by enumerating physical directories under `App_Plugins` at the content
root, and every plugin *also* registers its embedded manifest through an
`IPackageManifestReader` — so a site holding a real folder for a plugin gets each alias
twice.

Those folders are baked into the running image by an older, content-copying release. A
rebuild from current source produces none, because plugins now embed their assets; the
workflow's packing step would surface it if that regressed. The reader also yields to a
physical copy now, so any install still in that state is quiet regardless.

Note that `u17_plugins` mounts at `/app/wwwroot/App_Plugins`, which is **not** the directory
Umbraco scans — `wwwroot/App_Plugins` is not served at all, which is separately how
Schema2Yaml and Yaml2Schema were once unreachable. That volume is not the cause here.
