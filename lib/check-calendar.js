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

const isDue = require('./isDue.js');
const Utils = require('./Utils.js');

async function sendReminders(reminders, config) {
  console.log('Processing email queue...');

  for (let i = 0; i < reminders.length; ++i) {
    const reminder = reminders[i];

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

      if (i !== reminders.length - 1) {
        const waitTime = Math.random() * 55000 + 1000;
        console.log(`Waiting ${Math.ceil(waitTime / 1000)} seconds before sending the next email...`);
        await Utils.sleep(waitTime);
      }
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
      fs.promises.readFile(path.join(__dirname, '../config.json'), 'utf8'),
    ]);

    const dueReminders = reminders.filter(isDue);

    if (dueReminders.length === 0) {
      console.log('There are no reminders due today.');
      return;
    }

    await sendReminders(dueReminders, JSON.parse(config));
  } catch (ex) {
    console.trace(ex);
    process.exit(1);
  }
};
