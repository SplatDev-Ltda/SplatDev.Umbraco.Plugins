#!/usr/bin/env python3
"""QA sweep: for every plugin, does its manifest serve and does the element it names load?"""
import json, sys, urllib.request, urllib.error, pathlib, re, concurrent.futures

HOST = "https://staging-umbraco.splatdev.tech"

def get(url, timeout=20):
    try:
        r = urllib.request.urlopen(url, timeout=timeout)
        return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""
    except Exception:
        return 0, b""

# App_Plugins folder names, from the repo
folders = {}
for m in pathlib.Path(".").glob("SplatDev.Umbraco.Plugins.*/App_Plugins/*/umbraco-package.json"):
    folders[m.parent.name] = m.parts[0]

def check(item):
    folder, proj = item
    code, body = get(f"{HOST}/App_Plugins/{folder}/umbraco-package.json")
    if code != 200:
        return (folder, proj, code, "manifest not served", None)
    try:
        pkg = json.loads(body)
    except Exception:
        return (folder, proj, code, "manifest is not valid JSON", None)

    ver = pkg.get("version", "?")
    problems = []
    for ext in pkg.get("extensions", []):
        el = ext.get("element")
        if not el:
            continue
        c2, b2 = get(f"{HOST}{el}")
        if c2 != 200:
            problems.append(f"element {el} -> {c2}")
        elif len(b2) < 200:
            problems.append(f"element {el} suspiciously small ({len(b2)}b)")
        elif ext.get("type") == "dashboard":
            # A dashboard resolves from the module's default export, or from elementName
            # when there is no default. Only the absence of BOTH is a fault. Checking for
            # elementName alone flags seven working plugins: their bundles end with
            # `export { X as SomeElement, Y as default }`, which a line-based grep misses
            # because the statement spans lines.
            import re as _re
            body = b2.decode("utf-8", "replace")
            has_default = _re.search(r"export\s*\{[^}]*\bas\s+default\b", body, _re.S) \
                       or _re.search(r"export\s+default\b", body)
            if not has_default and not ext.get("elementName"):
                problems.append("no default export and no elementName — will not render")
    return (folder, proj, 200, "; ".join(problems) if problems else "", ver)

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(check, sorted(folders.items())))

ok = [r for r in results if r[2] == 200 and not r[3]]
bad = [r for r in results if r[2] != 200 or r[3]]
print(f"  {len(ok)} clean, {len(bad)} with problems, {len(results)} total\n")
for folder, proj, code, prob, ver in bad:
    print(f"  ✗ {folder:26} v{str(ver):8} {prob or ('HTTP ' + str(code))}")
