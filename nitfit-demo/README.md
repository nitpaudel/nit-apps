# NitFit Demo

Same app as `../nitfit/`, built with `--demo`.

It fills itself with about nine weeks of invented training the first time it
opens, so every screen, graph and number has something in it.

It is completely walled off from the real app:

- its own storage box on the phone (`nitfit-demo`, not `nitfit`)
- its own service worker cache and its own manifest id
- GitHub sync is switched off entirely, so it can never write to `nitfit-data`

Nothing in here is real.
