# 12 — Forms, through drop-in forms

The app uses forms extensively: an RSVP for a branch retreat, a leadership
interest form, event sign-ups. It does **not** build its own forms. It uses
**[drop-in forms](https://github.com/jroedel/dropin-forms)**, which has been through many
iterations and already does what forms need. Proposed 2026-11-19.

## What drop-in forms already has

From its [API documentation](https://github.com/jroedel/dropin-forms/blob/main/docs/api.md):

- **Forms made by a program.** `POST /api/v1/forms` takes a form's whole
  definition as JSON, and `POST …/publish` puts it live. An MCP endpoint does
  the same for Claude.
- **Answers read by a program.** `GET /api/v1/forms/{slug}/submissions`.
- **Embedding.** A live form comes with `embed_html` to put in a page, and a
  list of sites allowed to embed it (`origins`).
- What an RSVP needs: `opens_at` and `closes_at`, `capacity` (the beds at a
  retreat), `waitlist`, `needs_approval`, and a public `listing` of who is
  coming.
- Payments through Stripe: items, a registration `fee`, and refunds.

## How the app uses it

- **Templates as JSON files in this repository.** "Branch retreat RSVP" or
  "Leadership interest" is a JSON definition kept here, like the checklists
  in [09](09-checklists-and-milestones.md). To open an RSVP, the app fills in
  the title, dates and slug, creates the form, and publishes it. The JSON
  configuration files you hope to bring into drop-in forms itself would then
  be the same format on both sides.
- **The app keeps only the slug.** An event or a page knows which form is
  its own. The answers live in drop-in forms, and nowhere else.
- **The form appears inside the app**, embedded in a page or an event
  ([07](07-pages-and-menu.md)), with `app.sumatx.us` among the form's
  `origins`.
- **One account in drop-in forms for the app**, with its own API key. A key
  *is* an account there, so the app's key reaches only the forms the app made.
  It is a runtime secret, put on the server by a person, as with Twilio
  ([02](02-architecture.md)).

## What drop-in forms would need to gain

These are changes to drop-in forms, not to this app. Each is worth deciding
there, since other projects may want it too.

1. **Trusted identity providers**: knowing who is answering ([below](#trusted-identity-providers)).
2. **Webhooks**: telling the app when someone answers
   ([below](#webhooks)). Until then the app asks for submissions every few
   minutes, which needs nothing new.
3. **JSON configuration files**, which you are already planning.

### Trusted identity providers

Decided in principle 2026-11-19. Today a person types his name and email into
each form. A member signed in to this app should not have to, and the app
needs to match an answer to a member ("who's going", "has he RSVPed").

Drop-in forms keeps a **list of trusted identity providers**, and
`app.sumatx.us` is the first. Any other project that signs identities the
same way can be added, so drop-in forms is not tied to this app.

- **The provider signs a short-lived token** when it shows a form: who the
  person is (an ID, name and email), which provider says so, which form it is
  for, and when it expires (minutes). Drop-in forms checks the signature when
  the form loads, then fills in and locks the name and email.
- **A public/private key pair, not a shared secret.** The provider signs with
  a private key that never leaves its own server. Drop-in forms holds only
  the provider's *public* key, which can check a signature but cannot make
  one. A leak on the drop-in forms side then cannot be used to pretend to be
  a member. Ed25519, which Go's standard library has, does this.
- **Each key has an ID**, so a new key can be added before the old one is
  removed, with no outage when a key is replaced.
- **A form opts in to a provider.** A provider can vouch for any email
  address, so its tokens count only on forms whose definition names it.
  Otherwise this app could answer, say, a parish picnic form as anyone. A
  form may also *require* a provider, which makes a members-only form.
- **Adding a provider** is something an administrator of drop-in forms does,
  not any account holder.

#### The token

**A standard JWT signed with EdDSA (Ed25519)** (decided 2026-11-19), so any
project can make one with an existing library. Its claims:

| Claim | | |
|---|---|---|
| `iss` | standard | the provider, `https://app.sumatx.us` |
| `kid` (header) | standard | which of the provider's keys signed it |
| `sub` | standard | the person's ID at the provider; stable, never an email |
| `aud` | standard | drop-in forms, and the form's slug |
| `iat`, `exp` | standard | issued at, and expiry a few minutes later |
| `name`, `email` | standard (OpenID) | filled in and locked on the form |
| `email_verified` | standard (OpenID) | `true`: this app's sign-in proves the address |
| `trust_level` | drop-in forms' own | 1, 2 or 3 ([below](#trust-levels)) |

#### Trust levels

Drop-in forms cannot know each provider's own words ("newcomer", "member"),
so a provider maps its people onto **three trust levels that drop-in forms
knows ahead of time** (decided 2026-11-19). They are ordered: a form can
require **at least** a level. Each provider gives the three its own labels,
which drop-in forms shows when someone builds a form for that provider.

| Trust level | In this app |
|---|---|
| 1 | a **newcomer**: signed up, and possibly a stranger ([03](03-accounts-and-access.md)) |
| 2 | **not used for now.** Reserved, perhaps for alumni |
| 3 | a confirmed **member**, a **priest moderator**, or an **alum mentor** (decided 2026-11-19) |

No form will be for priest moderators alone, so they need no level of their
own: they answer as level 3, as alum mentors do.

### Webhooks

Drop-in forms tells the app when a form it made gets an answer: a request to
an address the app registered, signed by **drop-in forms' own key**, which
the app checks with drop-in forms' public key. The address must be on the
provider's own domain, so a form cannot be made to send requests elsewhere.

### One key per job

The provider's signing key is **not** used for webhooks or for reading
submissions. Each job keeps its own credential:

| Job | Direction | Credential |
|---|---|---|
| Who is answering | app → (browser) → drop-in forms | the app's private key; drop-in forms has its public key |
| Webhooks | drop-in forms → app | drop-in forms' private key; the app has its public key |
| Making forms, reading submissions | app → drop-in forms | the existing API key (`dfa_…`) of the app's account |

A key that can vouch for any member is the most dangerous of the three. It
should do nothing else, so that it can be replaced on its own, and so that
whoever holds the API key cannot also pretend to be a member. The API key
already exists in drop-in forms, is limited to the forms its account can
reach, and is revoked from the account page. Nothing new is needed for that
job.

Filed in drop-in forms on 2026-11-19:
[#100 Trusted identity providers](https://github.com/jroedel/dropin-forms/issues/100)
and [#101 Webhooks](https://github.com/jroedel/dropin-forms/issues/101). They
belong in drop-in forms' own design documents when the work starts there.

## Two things to watch

- **Coupling.** Two projects now change together. The contract stays narrow,
  to the calls above, and the app's use of it has tests that run against a
  real drop-in forms server built for them, as stewards' browser tests do.
- **A form's `listing` is public.** Anyone with the form's address sees it.
  "Who's going" for members belongs in the app, read through the API, and
  not in a listing that shows more than a newcomer
  ([03](03-accounts-and-access.md)) or a stranger should see.

## Later: dues

Drop-in forms already takes payments through Stripe, and Stripe's checkout
offers Apple Pay on an iPhone. Paying dues ([06](06-dues.md)) could become a
form, which would cover the board's "Dues → Apple Pay" without the app
handling money itself.

## Open questions

- Who in the branch may open a form from the app: the lead of an event, the
  core team?
- Which forms the MVP needs. From the conversation so far: RSVPs to branch
  retreats, and the leadership interest form.
