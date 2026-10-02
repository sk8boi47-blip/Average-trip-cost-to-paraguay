# Paraguay flight price dashboard

This repository contains a static airfare dashboard. The five-year chart currently uses fictional example fares; see the data note on the page before treating the figures as factual.

## GitHub Pages deployment

The workflow in `.github/workflows/pages.yml` publishes the repository root to GitHub Pages whenever a commit reaches `main`. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. The repository must be eligible for GitHub Pages on its current plan.

## Use a custom domain

1. In **Settings → Pages**, enter the domain you own under **Custom domain** and save it.
2. At your DNS provider, add the record GitHub Pages requests for that domain. For a subdomain such as `www.example.com`, point a `CNAME` record directly to `sk8boi47-blip.github.io`. For an apex domain such as `example.com`, use the GitHub Pages `A` records listed in GitHub's domain setup instructions.
3. Wait for DNS to propagate, then enable **Enforce HTTPS** in **Settings → Pages** when GitHub offers it.

The domain can be changed later in Pages settings. Because this site deploys through a custom GitHub Actions workflow, GitHub stores the custom domain in Pages settings; a repository `CNAME` file is not needed.
