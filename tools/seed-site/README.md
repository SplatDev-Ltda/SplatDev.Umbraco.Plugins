# seed-site

Builds a small but real website, members and backoffice users in a disposable Umbraco
install, so the plugins in this repository have something to work against.

An empty baseline limits every check made on it. Before this existed, the SEO dashboard
reported a single page, the analytics plugins had nothing to count, and the member
notification rules could not fire because there was nobody to sign in.

## Running it

**Writes content. Point it at a disposable install only.**

```bash
cd test-environments/Umbraco17.Baseline && dotnet run &     # binds 0.0.0.0:5000

cd tools/seed-site && npm install
BASE_URL=http://127.0.0.1:5000 \
  UMB_USER=admin@splatdev.com \
  UMB_PASS="$(python3 -c "import json;print(json.load(open('../../test-environments/Umbraco17.Baseline/appsettings.json',encoding='utf-8-sig'))['Umbraco']['CMS']['Unattended']['UnattendedUserPassword'])")" \
  node seed.mjs
```

`SEED_MEMBER_PASSWORD` overrides the password given to the seeded members
(default `SeedMember123!`).

## What it creates

| | |
| --- | --- |
| Templates | Seed Home, Seed Content Page, Seed Blog Post |
| Document types | `seedHome` (allowed at root), `seedContentPage`, `seedBlogPost`, each with title, meta description and body text |
| Content | Home → About, Contact, Blog → three posts, all published |
| Member groups | Customers, Security Team |
| Members | four, spread across both groups |
| Backoffice users | two, in the editor and writer groups |

Two pages are left **without a meta description** on purpose — Contact and one blog post —
so the SEO dashboard has something real to flag rather than reporting a uniformly healthy
site.

## It is idempotent

Everything already present is reused and reported as such, so a second run after a partial
failure finishes the job instead of duplicating it or stopping at the first "already
exists".

That took some getting right, and the reasons are worth knowing if you extend it:

* the document-type and template **trees report names, not aliases**, so a lookup by alias
  silently finds nothing;
* `groups` on a member takes group **ids**. Passing names fails the whole model bind and
  surfaces as *"The createRequestModel field is required"*, which says nothing about groups;
* a document type whose template creation failed earlier carries an empty `allowedTemplates`,
  and content creation then fails with *"Template not allowed"* — which reads as a permission
  problem rather than the missing association it is. The seeder repairs that on a later run;
* a parent must name what may sit beneath it. Blog is a content page, so content pages have
  to allow blog posts, or every post is refused as *"Operation not permitted"*.

## Front-end URLs

Umbraco assigns the pages URLs (`/home/`, `/about/`, `/blog/washed-vs-natural/`) and the
backoffice plugins read them, but **the baseline does not serve them over HTTP** — that is
true of the content it already shipped with too, not something this introduces. Everything
here is aimed at what the backoffice can see.
