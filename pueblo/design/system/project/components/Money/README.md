Money is the set of peso notes and coins the player pays with, and the counter they pay onto.

## When to use

- Checkout, fares, the bank: any time the player must act on a number heard or read in Spanish.

## When not to use

- Showing a score or reward. Use the coin chip for a balance.

## Anatomy

- Coin: `ocre` disc, 56 or 44 across, value in numerals.
- Note: `card` with `ocre` end bands, value in `ocre-ink`.
- Counter: a dashed zone showing what has been paid and its total.
- Wallet: what the player holds.

## Placement

In the challenge area at checkout. The amount is spoken and shown in the dialogue box above.

## States

- In the wallet.
- On the counter.

## Motion

A coin hops with the fast spatial spring when it moves.

## Do and don't

- Do: State the amount in Spanish words in the dialogue, never as numerals, so the number must be understood.
- Do: Give a wallet that allows more than one way to pay.
- Don't: Use ochre for anything that is not money.
- Don't: Copy the artwork of real banknotes.

## Accessibility

- Each coin and note is at least 44 across.
- The running total is always shown as text.

## What you provide

The wallet contents, each with `data-value`. Call `Pueblo.pay(root)`; it fires `pb-change` with the amount paid.

## Source

Pueblo original. Uses Material 3 colour roles, the corner radius scale and the Expressive springs.
