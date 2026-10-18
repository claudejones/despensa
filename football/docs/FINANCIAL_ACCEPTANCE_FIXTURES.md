# Financial validation fixtures — NFL Intelligence

These cases are **acceptance requirements**. They are not a record of executed automated tests.

| Case | Input | Expected |
|---|---|---|
| Single settled win | Stake $2, gross proceeds $3.95, fees $0 | Realized net +$1.95 |
| Single settled loss | Stake $2, proceeds $0 | Realized net −$2.00 |
| Two-ticket shared exposure | Giants single $2 → $3.95; Giants + Chiefs combo $2 → $5.00 | Both win +$4.95; Giants win/Chiefs lose −$0.05; Giants lose −$4.00 |
| Half-position sale | Stake $6; sell 50% of original position for $7.32 | Realized cost basis $3.00, realized net +$4.32, open cost basis $3.00 |
| Remaining position sale | After above, sell remaining 50% for $1.00 | Total proceeds $8.32, total realized net +$2.32, open $0 |
| Partial sale with fee | Stake $6; sell 50% for $7.32, sale fee $0.20 | Realized net +$4.12, open cost basis $3.00 |
| Invalid sale | Blank proceeds | Must reject; never silently treat as $0 |
| Invalid percentage | 0%, 101%, nonnumeric | Must reject |
| Quote immutability | Ticket already purchased | Original stake and payout cannot be edited |
| Week selection | Change from Week 6 to Week 5, reload | Week 5 remains selected |
| Office pool toggle | Select NYG, select NYG again | Selection clears |
| Office pool export | Two games selected | Only two explicit WINNER entries, records and kickoff times |
| Missing weekly JSON | Week without published file | Show missing-data message, never fabricate data |

## Known gaps to resolve
- The current UI records fees on tickets but partial-sale fee entry and exact aggregation are incomplete.
- Closing a ticket with prior partial sales requires a single consistent proceeds convention (total proceeds vs final settlement only); otherwise double-counting or omitted proceeds is possible.
- Existing imported tickets may lack `week` and `events`; migrations must preserve them and not silently assign the wrong week.
- Browser-based acceptance tests are required before production publication.
