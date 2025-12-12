# Chop To It!

This project is a small Phaser game. A pre-commit hook automatically updates the
version displayed in `index.html` based on the current git commit count.

To enable the hook locally, run:

```bash
git config core.hooksPath .githooks
```

Once configured, the version number will update whenever you create a commit.

## Local-only API key inputs

The settings panel in `index.html` lets players stash OpenAI and Google keys in
their own browser’s `localStorage`, but the game never sends those values
anywhere. The current build runs entirely offline—aside from a visitor counter
request—and does not invoke OpenAI, Google Search, or any safety/moderation
endpoints. There is no influencer or content pipeline to run through a safety
checker yet; adding that would require new client code that actually calls
those services at runtime.
