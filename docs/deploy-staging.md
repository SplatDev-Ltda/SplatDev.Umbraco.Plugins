# Deploying staging

`staging-umbraco.splatdev.tech` is an Umbraco 17 install carrying every publishable plugin.
`.github/workflows/deploy-staging.yml` publishes `test-environments/Umbraco17.Baseline` and
syncs it to the host. It is **manual dispatch only** — staging is outward-facing, so a
deploy is a decision someone makes rather than something a merge triggers.

## Secrets it needs

The workflow checks all four up front and fails with a named error if any is missing,
rather than dying later inside an ssh command nobody can read.

| Secret | What it is |
| --- | --- |
| `STAGING_SSH_HOST` | hostname or IP of the staging box |
| `STAGING_SSH_USER` | the deploy user |
| `STAGING_SSH_KEY` | that user's **private** key, whole file including the header line |
| `STAGING_PATH` | absolute path of the site root on the host |

Optional:

| Name | Kind | Default | What it is |
| --- | --- | --- | --- |
| `STAGING_SERVICE` | secret | `umbraco-staging` | unit name, when restarting via systemd |
| `STAGING_URL` | variable | `https://staging-umbraco.splatdev.tech` | what the health check polls |

Give the deploy user its own key, and grant it only what the deploy does: write to
`STAGING_PATH`, and restart the site. If the restart is systemd it needs a sudoers rule for
that one unit rather than general sudo.

## Running it

Actions → **Deploy staging** → Run workflow. Inputs: `ref` (default `master`), `restart`
(`docker` or `systemd`), and `dry_run`, which builds and reports what rsync *would* change
without touching the host. Run it dry the first time.

## What it deliberately does not overwrite

The publish is the application; the host owns its own state. `appsettings.json` (and any
`appsettings.*.json`), `umbraco/Data/`, `umbraco/Logs/` and `wwwroot/media/` are excluded,
so the staging connection string and database survive a deploy.

Everything else syncs with `--delete`. That matters: without it the host accumulates files
no current release ships, which is how staging came to hold stale `App_Plugins` folders.

## Why it removes App_Plugins

Every plugin embeds its `App_Plugins` content and hands Umbraco the manifest through an
`IPackageManifestReader`, so a correct publish contains no `App_Plugins` directory — the
workflow fails if one appears, because that means a package has started copying content
again.

A site that still has a real `App_Plugins/<Name>/` folder from an older content-copying
release gets that plugin's extensions registered **twice**: once from Umbraco's own scan of
physical directories, once from the embedded manifest. The backoffice logs

```
Extension with alias <X> is already registered
```

and drops one. Staging had fifteen of these, across PdfCurator, EmailTemplates, AdPreview,
ShopCart and RdpManager.

Two things fix it, and both are wanted. The reader now skips a manifest whose physical
folder exists, so the *code* is quiet on any site in that state — including installs in the
wild that this workflow will never touch. The deploy then removes the folders, which is
what actually returns the host to the intended embedded-only shape rather than just
silencing the symptom.
