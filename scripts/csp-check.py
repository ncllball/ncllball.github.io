"""Check the Content-Security-Policy that Sports Connect sends with ncllball.com pages.

Since Nov 2026 the policy blocks some of NCLL's own hosts (see CLAUDE.md, "Stylesheet").
This compares today's policy with what we found on 2026-11-10 and flags anything that changed.

Run:  python scripts/csp-check.py [tabid]      (default tabid 2252643)
Exit code 0 = same as known, 1 = something changed, 2 = couldn't read the policy.
"""
import fnmatch
import sys
import urllib.request

TABID = sys.argv[1] if len(sys.argv) > 1 else "2252643"
URL = f"https://www.ncllball.com/Default.aspx?tabid={TABID}"

# (directive, host, what it means for NCLL, expected allowed?) -- as found 2026-11-10, re-checked 2026-11-11
CHECKS = [
    ("style-src", "d1nzp0zz3zqzdw.cloudfront.net", "our CloudFront stylesheet (what pages link today)", True),
    ("style-src", "assets.ncllball.com", "our Cloudflare stylesheet host", False),
    ("style-src", "ncllball.github.io", "GitHub Pages as a stylesheet host", False),
    ("style-src", "use.typekit.net", "Typekit fonts stylesheet", False),
    ("style-src", "fonts.googleapis.com", "Google Fonts stylesheet", True),
    ("font-src", "fonts.gstatic.com", "Google Fonts files", True),
    ("frame-src", "ncll-assets.pages.dev", "embedding our Cloudflare Pages site", False),
    ("frame-src", "www.youtube.com", "YouTube embeds", True),
    ("frame-src", "www.youtube-nocookie.com", "YouTube no-cookie embeds", False),
    ("connect-src", "raw.githubusercontent.com", "fetching repo files from the page (CMS publishing)", False),
    ("img-src", "ncllball.github.io", "images and badges served from GitHub Pages", True),
]


def fetch_policy():
    req = urllib.request.Request(URL, method="HEAD", headers={"User-Agent": "csp-check"})
    with urllib.request.urlopen(req, timeout=30) as r:
        enforced = r.headers.get("Content-Security-Policy")
        report_only = r.headers.get("Content-Security-Policy-Report-Only")
    return enforced, report_only


def parse(policy):
    out = {}
    for part in policy.split(";"):
        bits = part.split()
        if bits:
            out[bits[0].lower()] = bits[1:]
    return out


def allows(pol, directive, host):
    sources = pol.get(directive, pol.get("default-src"))
    if sources is None:
        return True  # no rule at all = allowed
    for s in sources:
        s = s.strip("'")
        if s in ("*", "https:"):
            return True
        bare = s.split("://", 1)[-1].rstrip("/")
        if bare == host or fnmatch.fnmatch(host, bare):
            return True
    return False


def main():
    try:
        enforced, report_only = fetch_policy()
    except Exception as e:  # noqa: BLE001
        print(f"Couldn't fetch {URL}: {e}")
        return 2
    if not enforced:
        print(f"No enforced Content-Security-Policy on {URL}.")
        if report_only:
            print("There is a Report-Only policy (logged, not blocked).")
        print("CHANGED: the policy that blocked our hosts is gone or report-only now.")
        return 1

    pol = parse(enforced)
    changed = 0
    print(f"Policy on {URL} (enforced{'; report-only also present' if report_only else ''})\n")
    for directive, host, meaning, expected in CHECKS:
        now = allows(pol, directive, host)
        flag = "" if now == expected else "   <-- CHANGED (was " + ("allowed" if expected else "blocked") + ")"
        changed += now != expected
        print(f"{'ALLOWED' if now else 'blocked':8} {directive:12} {host:32} {meaning}{flag}")

    print()
    if changed:
        print(f"{changed} change(s) since 2026-11-10. If our hosts are allowed again, see CLAUDE.md 'Stylesheet'.")
        return 1
    print("Same as 2026-11-10: no change.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
