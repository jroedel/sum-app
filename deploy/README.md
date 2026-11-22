# Deploying sum-app

How a merge reaches `https://app.sumatx.us`, and the one-time setup a person
does before the first deploy. Why it is built this way is in
[`docs/13-ci-cd.md`](../docs/13-ci-cd.md).

## How a deploy works

1. CI passes on `main` and keeps the static binary it built.
2. `deploy.yml` publishes that binary, with this directory's kit, as the
   prerelease `build-<first 12 of the commit>`.
3. `scripts/deploy-ci` asks the server's **receiver** (`receive.sh`) to
   `stage` the commit. The receiver downloads the release from GitHub, checks
   its sums, and runs the new binary's `-check` against the live
   `config.toml`. The live app is untouched.
4. If `main` has moved on in the meantime, the deploy says so, `discard`s,
   and stops. The newer commit's deploy follows.
5. Otherwise it asks the receiver to `activate`. The receiver stops the app,
   swaps in the new binary, starts it, and waits for `/healthz` to name the
   commit. If it doesn't, the receiver rolls back to the last good release.
   It then reinstalls the `.htaccess` and the cron watchdog.
6. The workflow checks the public site from outside.

**The deploy key can do nothing else.** On the server it is restricted to
`receive.sh`, which accepts only `stage`, `activate` or `discard` with a
commit, or `status`. The receiver fetches builds from GitHub Releases and
never accepts an uploaded file. A leaked key can therefore only redeploy a
build already published from `main`. This matters because the account also
runs drop-in forms.

## Files on the server

```
~/sum-app/                 the app's directory (700), outside public_html
  receive.sh, receive.conf the receiver and its settings: installed by make prod-install
  config.toml              the runtime config (600): installed by make secrets-install
  sum-app                  the live binary, with .prev, .last-good and .failed beside it
  run.sh, supervise.sh     from the release kit, replaced on every deploy
  sum-app.log, sum-app.pid
  deployed-commit.txt
~/public_html/app.sumatx.us/public/.htaccess   the proxy, written by every deploy
crontab: two lines ending "# sum-app" (@reboot start, and a 5-minute watchdog)
```

## First-time setup

Steps 1 and 2 can be done at any time. Steps 3 onwards need this pull request
merged and a `secrets.env` on your machine.

### 1. DNS

Add an **A record** for `app.sumatx.us` pointing at the konsoleH server's
IPv4 address, wherever sumatx.us's DNS is managed. Add an **AAAA** record
too if the server has IPv6. konsoleH shows both addresses for the account.

### 2. konsoleH

1. Using SSH or the file manager, create the directory
   `public_html/app.sumatx.us/public`. It has to exist before the panel
   offers it as a document root.
2. Add `app.sumatx.us` as an **addon domain**, with that document root.
3. In **SSL Manager**, turn on Let's Encrypt for `app.sumatx.us`. If
   sumatx.us's DNS isn't at konsoleH, the certificate is proven over HTTP
   instead. The `.htaccess` leaves `/.well-known/` alone so that this works.

That is all the Apache setup there is. konsoleH doesn't allow `ProxyPass`,
so the proxy lives in the `.htaccess`, and every deploy writes it from
`htaccess.template`.

### 3. secrets.env

```sh
cp secrets.env.example secrets.env && chmod 600 secrets.env
```

1. Fill in `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER` and `DEPLOY_SSH_PORT` from
   konsoleH → Access → SSH.
2. Set `PROD_SSH` to your own ssh host alias for the account. Your own key
   is used for setup and logs; the deploy key is never used for them.
3. Choose a port:

   ```sh
   make prod-ports          # lists free loopback ports; put one in APP_PORT
   ```
4. Mint the deploy key and pin the server's host key:

   ```sh
   make secrets-keygen
   ```

   Compare the fingerprint it prints with the one konsoleH shows.

### 4. The server

```sh
make prod-install        # the receiver, receive.conf, and the restricted key line
make secrets-install     # config.toml
```

### 5. GitHub

1. Settings → Environments: create **production**. Optionally, add yourself
   as a required reviewer.
2. Settings → Code security: turn on **secret scanning** and **push
   protection**.
3. Push the deploy secrets and variables:

   ```sh
   make secrets-push        # GitHub's lists are read back afterwards
   ```

### 6. The first deploy

Re-run the latest Deploy workflow (Actions → Deploy → Run workflow), or merge
anything. Then:

```sh
make deploy-status       # should end with "deployable"
```

### 7. The vault

Save the whole `secrets.env` as one note in your password vault.
`make secrets-check` prints a fingerprint, so you can tell when the vault
copy needs updating.

## Day to day

| | |
|---|---|
| `make prod-status` | what is live, and whether it answers |
| `make prod-logs` | the end of the log (`LINES=200` for more) |
| `make prod-restart` | stop and start the app |
| `make deploy SHA=<commit>` | redeploy a published build by hand, through the same receiver |
| `make prod-install` | after a change to `receive.sh` or `install.sh`, which deploys never touch |
| `make secrets-install` | after a change to the runtime config |

All of these are for a person at a terminal. Agents never run them
(`CLAUDE.md` §6).
