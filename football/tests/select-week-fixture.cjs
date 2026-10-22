// Existing acceptance scenarios use Week 6 games, prices and saved-ticket fixtures.
// Select that published week explicitly; never replace a selection made by a test.
module.exports = async function selectWeekFixture(page, week = '06') {
  await page.addInitScript(value => {
    if (!localStorage.getItem('football-selected-week-2026')) {
      localStorage.setItem('football-selected-week-2026', value);
    }
  }, week);
};
