# Project instructions for Claude

This repository is one website. It is deployed to Hostinger, which copies the
whole repository into `public_html` every time `main` changes. Whatever is in
the repo root is what the public sees.

## Repository layout

- `index.html` and other pages sit in the repo root.
- `assets/css/`, `assets/js/`, `assets/images/`: styles, scripts and images.
- `assets/components/nav/`: the shared navigation menu (HTML, CSS, JS).
- `assets/css/theme.css`: this site's colours, fonts and spacing.
- `.claude/skills/frontend-design/`: Anthropic's frontend-design skill.
- `.htaccess`: blocks public access to `CLAUDE.md`, `.claude/` and `.git`.

## Technical rules

- Plain HTML, CSS and JavaScript only. No build step, no frameworks, no npm,
  because Hostinger serves the files exactly as they are in the repo.
- Use relative links so the site works in `public_html` or a subfolder.
- Keep the `.htaccess` protection in place. Never remove it.
- Optimise images before adding them (WebP where possible, sensible sizes).

## Design

- Always read and follow the frontend-design skill before building or
  changing any UI.
- Set colours and fonts only in `assets/css/theme.css`. Do not hard-code them
  elsewhere.
- Use Australian English in all page content and code comments.
- Use metric units.

## Navigation menu: strict rules

The menu has caused repeated problems, so these rules are firm:

1. Every page uses the menu in `assets/components/nav/`. Never build a new
   menu or copy menu code into a page.
2. Menu items (labels and links) are defined in one place only, inside the
   nav component's config, so adding a page means editing one list.
3. The menu must:
   - collapse into a hamburger button on mobile (under 768 px wide)
   - open and close reliably, and close when a link is tapped or Escape is
     pressed
   - stop the page behind it from scrolling while the mobile menu is open
   - highlight the current page
   - work with a keyboard, with visible focus states
   - use `aria-expanded`, `aria-controls` and a label on the hamburger button
   - stay above other page content (no overlap or hidden dropdowns)
4. Test the menu at phone, tablet and desktop widths before finishing any
   task that touches it.
5. This menu also lives in the `site-template` repository. If you fix a menu
   bug, say so clearly in the pull request so the fix can be copied to the
   template and other sites.

## Working style

- Make small, focused changes. One task per branch and pull request.
- Write a clear pull request description of what changed.
- Remember that merging to `main` publishes straight to the live site.
- If something is unclear, ask rather than guess.
