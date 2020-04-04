const DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

module.exports = function isDue({ name, date, nextBusinessDay }, today) {
  if (!(today instanceof Date)) {
    today = new Date();
  }

  const targetDate = new Date(today);

  targetDate.setDate(date);

  // Get the week day
  const targetDay = targetDate.getDay();
  let logOutput;

  if (targetDay === DAYS.SATURDAY) {
    if (nextBusinessDay) {
      targetDate.setDate(date + 2);
      logOutput = `${name}'s date (${date}) was a Saturday and the next business `
        + 'day is today. Reminder email is added to the queue.';
    } else {
      targetDate.setDate(date - 1);
      logOutput = `${name}'s date (${date}) is a Saturday and the previous business `
        + 'day is today. Reminder email is added to the queue.';
    }
  } else if (targetDay === DAYS.SUNDAY) {
    if (nextBusinessDay) {
      targetDate.setDate(date + 1);
      logOutput = `${name}'s date (${date}) was a Sunday and the next business `
        + 'day is today. Reminder email is added to the queue.';
    } else {
      targetDate.setDate(date - 2);
      logOutput = `${name}'s date (${date}) is a Sunday and the previous business `
        + 'day is today. Reminder email is added to the queue.';
    }
  }

  if (today.getMonth() === targetDate.getMonth() && today.getDate() === targetDate.getDate()) {
    console.log(logOutput);
    return true;
  }

  return false;
};
