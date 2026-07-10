# Lego requests — accessibility gaps

These are hub (`@esa/ecology`) gaps surfaced during the SMAQMD air-exchange tool
accessibility pass. They are NOT Lighthouse failures and are NOT fixed by editing
`node_modules/@esa/ecology` (guard-hub-writes blocks spoke sessions from touching
the hub). They are filed here as lego-request notes for the next hub sprint.

---

## 1. `esa-text-field` — `aria-describedby` linking shadow input to help/error text

**Gap:** The shadow input is not associated with the help-text or error-text slots via
`aria-describedby`. Screen readers announce the label but skip the help text, which
carries important contextual information (e.g., "Use the highest air flow, or the
lowest CADR if three are listed.").

**Request:** In `esa-text-field`'s shadow DOM, give the help-text and error-text
containers stable IDs and set `aria-describedby` on the `<input>` to point to them
(only including IDs for slots that are populated).

---

## 2. `esa-text-field` — `inputmode` / `min` / `step` not forwarded to the shadow input

**Gap:** The spoke sets `inputmode="decimal"` as a host attribute, but it is not
forwarded to the shadow `<input>`, so mobile keyboards do not switch to the numeric
layout. Similarly, any `min` or `step` attributes on the host are inert.

**Request:** Forward `inputmode`, `min`, `step`, and `pattern` from the host element
to the shadow `<input>` (observe them in `attributeChangedCallback` or reflect them
in `observedAttributes`).

---

## 3. `esa-alert-box` — no `role` / live-region hook

**Gap:** `esa-alert-box` renders as a styled presentational box with no ARIA role.
Verdict changes (pass / fail) that toggle alert boxes in and out of the DOM are not
announced to screen readers, even when the box is made visible.

**Request:** Add `role="status"` (or `role="alert"` for error/warning variants) to
the host or its shadow root, so dynamically inserted alert boxes are announced. A
variant-to-role map (info/success → `status`, warning/error → `alert`) would be
the correct granularity.

**Spoke workaround in use:** A separate visually-hidden `<p aria-live="polite"
data-announce>` in the result card is written by a 600 ms debounced one-sentence
summary in `recompute()`. This avoids chatter during drag gestures and is
documented in the caption ("or type, to resize it").
