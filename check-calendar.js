/**
* Copyright 2020 Mehmet Baker
*
* This file is part of monthly-reminder.
*
* monthly-reminder is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* monthly-reminder is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with monthly-reminder. If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const Utils = require('./Utils.js');

const DAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function isDue({ name, date, nextBusinessDay }) {
  const today = new Date();
  const targetDate = new Date();

  targetDate.setDate(date);

  // Get the week day
  const targetDay = targetDate.getDay();

  if (targetDay === DAYS.SATURDAY) {
    if (nextBusinessDay) {
      targetDate.setDate(date + 2);
      console.log(`${name}'s date (${date}) was a Saturday and the next business `
        + 'day is today. Reminder email is added to the queue.');
    } else {
      targetDate.setDate(date - 1);
      console.log(`${name}'s date (${date}) is a Saturday and the previous business `
        + 'day is today. Reminder email is added to the queue.');
    }
  } else if (targetDay === DAYS.SUNDAY) {
    if (nextBusinessDay) {
      targetDate.setDate(date + 1);
      console.log(`${name}'s date (${date}) was a Sunday and the next business `
        + 'day is today. Reminder email is added to the queue.');
    } else {
      targetDate.setDate(date - 2);
      console.log(`${name}'s date (${date}) is a Sunday and the previous business `
        + 'day is today. Reminder email is added to the queue.');
    }
  }

  return today.getMonth() === targetDate.getMonth()
    && today.getDate() === targetDate.getDate();
}

async function sendReminders(reminders, config) {
  if (reminders.length === 0) return;

  for (const reminder of reminders) {
    try {
      const transporter = nodemailer.createTransport(config.nodemailer);
      const message = {
        from: 'Reminder Bot <reminder-bot@mehmetbaker.dev>',
        to: reminder.recipient || config.defaultRecipient,
        subject: reminder.subject,
        html: reminder.body,
      };

      console.log(`Sending reminder: ${reminder.name}`);
      await transporter.sendMail(message);
      console.log(`Reminder is sent: ${reminder.name}`);

      // Wait for 1 min to send the next email
      await Utils.sleep(1000);
    } catch (ex) {
      console.trace(ex);
      console.log(`Failed to send reminder: ${reminder.name}`);
    }
  }
}

module.exports = async function checkCalendar() {
  try {
    const [reminders, config] = await Promise.all([
      Utils.getReminders(),
      fs.promises.readFile(path.join(__dirname, './config.json'), 'utf8'),
    ]);

    const dueReminders = reminders.filter(isDue);
    await sendReminders(dueReminders, JSON.parse(config));
  } catch (ex) {
    console.trace(ex);
    process.exit(1);
  }
};
