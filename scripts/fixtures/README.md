# Campaign playtest fixtures

Use an isolated local preview origin (for example `CHOP_PORT=4176`) and restore the JSON through Journal → Restore a save backup. These staged saves verify campaign flow; they do not prove normal-play balance.

- `campaign-ready.json`: all chapter conditions are already earned, but no contracts have been claimed. Collect six rewards in order. Starting purse 1,000; expected final purse 1,065,440. Choose either ending; expected remaining purse 65,439. Reopen the game and verify the chosen ending persists.
- For a quick second ending test, use a copy of that fixture with `gold` set to `1065440` and `campaign.claimed` set to `6`.
- `deadline.json`: 360 elapsed days and no stored ending. The deadline epilogue should appear immediately on startup. Starting a new story should return to York with 0 gold and the introduction.

Do not import these into a player's progress unless they intend to replace it. The ordinary development preview uses port 4173; port 4174 has also been used for uncached artwork checks.
