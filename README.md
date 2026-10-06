# ModelMetric Lab — SEO + monetization MVP

A lightweight static site for learning SEO by running a real content-and-tool website. The niche is AI/ML developer calculations: token estimation, LLM API cost planning, classification metrics, and GPU VRAM sizing.

The UI bundles Outfit for the interface and ComicShannsMono Nerd Font for formulas and code, so the typography works without external font requests.

## Why this niche
- Strong fit with a technical/AI learning audience.
- Tools provide clear utility and long-tail search targets.
- Guides create informational content around each tool.
- Changing facts are kept as user inputs rather than embedded as stale provider pricing.

## Replace before launch
1. Replace `https://modelmetric.vercel.app` in canonical tags, JSON-LD, `robots.txt`, and `sitemap.xml` if the deployment domain changes.
2. Replace the contact placeholder.
3. Review and adapt the privacy policy to your real services, hosting, analytics, and ad setup.
4. After AdSense approval, add the exact `ads.txt` line Google gives you; never publish the example publisher ID.
5. Connect Google Search Console and submit `/sitemap.xml`.
6. Add a real favicon/site icon, Open Graph metadata, and a simple 404 page.

## Deployment checklist
- Deploy this folder to Vercel as a static site with no build command.
- Replace `https://modelmetric.vercel.app` with the final HTTPS domain in HTML canonical tags, JSON-LD, `robots.txt`, and `sitemap.xml` if needed.
- Enable Web Analytics in the Vercel project dashboard; the static pages load Vercel's `/_vercel/insights/script.js` endpoint.
- Replace `hello@example.com` on `contact.html` with a monitored public address.
- Review `privacy.html` against the analytics, advertising, hosting, and consent services actually enabled.
- Add the exact `ads.txt` publisher line only after AdSense approval.
- Run `node test.js` before each deployment.

## SEO learning loop (12 weeks)
### Weeks 1–2: technical foundation
- Deploy on a real domain with HTTPS.
- Verify Search Console and Analytics.
- Check indexing with `site:yourdomain.com` and URL Inspection.
- Validate canonical tags, internal links, sitemap, robots.txt, mobile layout, and page speed.

### Weeks 3–5: topical authority
Publish 2–3 genuinely useful guides per week, each mapped to one intent. Expand the four clusters:
- token budgeting
- LLM API cost
- model evaluation
- model memory / VRAM

Add original examples, diagrams, edge cases, and links among tools and guides.

### Weeks 6–8: SEO experiments
- Test title wording and search-result CTR.
- Improve internal links based on pages getting impressions.
- Add comparison pages only when they add original analysis.
- Earn links from developer communities, student projects, GitHub README references, and relevant technical sites without spam.

### Weeks 9–12: monetization + pruning
- Apply for AdSense once the site is substantial, polished, navigable, and policy-ready.
- Use a compliant CMP for relevant EEA/UK/Switzerland traffic before personalized advertising.
- Add ads conservatively after approval; protect tool usability and page experience.
- Prune or consolidate pages that get no impressions and have weak standalone value.

## Reality check
Three-month AdSense approval is plausible but not guaranteed. Three-month meaningful revenue is dependent on traffic volume, geography, niche demand, ad auction conditions, and page monetization. The KPI for month one should be indexed pages and Search Console impressions; month two should be queries/clicks and returning users; month three should be revenue per 1,000 sessions plus organic growth.
