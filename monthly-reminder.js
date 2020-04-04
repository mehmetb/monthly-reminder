#!/usr/bin/env node

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
const yargs = require('yargs');
const checkCalendar = require('./lib/check-calendar.js');
const Utils = require('./lib/Utils.js');

let yargsOfAddCommand;

async function addReminder(commandArgs) {
  try {
    let reminders = [];

    // Try to read reminders.json
    try {
      reminders = await Utils.getReminders();
    } catch (readException) {
      // If file doesn't exist on the dist then we'll just create a new one.
      if (readException.code !== 'ENOENT') {
        throw readException;
      }
    }

    const allBits = ['name', 'date', 'subject', 'body', 'file', 'previousBusinessDay', 'nextBusinessDay'];

    // Prevents arguments with multiple occurrences:
    // $> monthly-reminder -n my-reminder -d 2 -d 25
    for (const bit of allBits) {
      if (commandArgs[bit] instanceof Array) {
        yargsOfAddCommand.showHelp();
        console.log();
        console.error(`Argument ${bit} is supplied more than once`);
        process.exit(1);
      }
    }

    const {
      name,
      date,
      body,
      file,
      previousBusinessDay,
    } = commandArgs;

    const subject = commandArgs.subject || `Reminder: ${name}`;

    let messageBody = `<h1 align="center">${name}</h1>
      <h2 align="center">You Have Been Reminded</h1>
      <hr />
      <br />
      <br />
      Reminder: <strong>${name}</strong>
      <br />
      <br />
      <em>Yours truly :),
      <br />
      Reminder Bot</em>
      `;

    if (body) {
      messageBody = body;
    } else if (file) {
      messageBody = await fs.promises.readFile(file, 'utf8');
    }

    reminders.push({
      name,
      date,
      subject,
      body: messageBody,
      nextBusinessDay: !previousBusinessDay,
    });

    await Utils.setReminders(reminders);
  } catch (ex) {
    console.trace(ex);
    process.exit(1);
  }
}

async function listReminders(reminders) {
  try {
    reminders = reminders || await Utils.getReminders();

    // Digit count of the last reminder
    const digitCount = Math.floor(Math.log10(reminders.length)) + 1;

    console.log('List of reminders:\n');

    for (let i = 0; i < reminders.length; ++i) {
      // Pad all the indexes to the right
      const index = `${i + 1}`.padStart(digitCount, ' ');
      console.log(`  ${index})  ${reminders[i].name}`);
    }
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      console.log('There are no reminders.');
    } else {
      console.trace(ex);
      process.exit(1);
    }
  }
}

async function deleteReminders() {
  try {
    const reminders = await Utils.getReminders();

    // We first list all the reminders so the user can see the indexes
    await listReminders(reminders);

    const answer = await Utils.askQuestion('Choose which reminder(s) to delete (comma-separated): ');
    const indexes = answer
      .split(',')
      .map((index) => Number(index.trim()))
      .filter((index) => !Number.isNaN(index) && index > 0);

    if (indexes.length) {
      const remainingReminders = [];

      for (let i = 0; i < reminders.length; ++i) {
        if (!indexes.includes(i + 1)) {
          remainingReminders.push(reminders[i]);
        }
      }

      await Utils.setReminders(remainingReminders);
    }
  } catch (ex) {
    if (ex.message === 'SIGCONT') {
      deleteReminders();
      return;
    }

    console.trace(ex);
    process.exit(1);
  }
}

// eslint-disable-next-line no-unused-expressions
yargs
  .usage('Usage: $0 <command> [options]')
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .command(
    'add',
    'Adds a reminder.',
    (subYargs) => {
      yargsOfAddCommand = subYargs;

      yargsOfAddCommand
        .option('name', {
          describe: 'Reminder name',
          alias: 'n',
          nargs: 1,
          type: 'string',
          requiresArg: true,
        })
        .option('date', {
          describe: 'Target date',
          alias: ['d'],
          nargs: 1,
          type: 'number',
          requiresArg: true,
        })
        .option('subject', {
          describe: 'Email subject',
          alias: ['s'],
          nargs: 1,
          type: 'string',
          requiresArg: true,
        })
        .option('body', {
          describe: 'Message body',
          alias: ['b'],
          nargs: 1,
          type: 'string',
          requiresArg: true,
          conflicts: 'file',
        })
        .option('file', {
          type: 'string',
          describe: 'Message body from file',
          alias: ['f'],
          nargs: 1,
          requiresArg: true,
          conflicts: 'body',
        })
        .option('next-business-day', {
          alias: ['nbd'],
          describe: 'When <date> is not a weekday, trigger the reminder on the next business day. '
            + 'This is the default.',
          conflicts: 'previous-business-day',
          nargs: 0,
          type: 'boolean',
        })
        .option('previous-business-day', {
          alias: ['pbd'],
          describe: 'When <date> is not a weekday, trigger the reminder on the previous business day.',
          conflicts: 'next-business-day',
          type: 'boolean',
          nargs: 0,
        })
        .option('recipient', {
          alias: ['r', 'rec'],
          describe: 'The recipient which will receive the reminder email. If not set, the defaultRecipient '
            + 'in config.json is going to be used.',
          type: 'string',
          nargs: 1,
        })
        .demandOption(['name', 'date']);
    },
    addReminder,
  )
  .command(['del', 'delete'], 'Delete reminder(s).', {}, deleteReminders)
  .command('list', 'List all reminders.', {}, () => listReminders())
  .command(['exec', 'execute'], 'Send emails for the reminders that are due today.', {}, checkCalendar)
  .strict()
  .demandCommand(1, 'Not enough arguments: need at least 1')
  .recommendCommands()
  .example('$0 add -n Bills -d 15 -s "Reminder: Pay bills" -f body.html')
  .example('$0 add -n Rent -d 21 -s "Reminder: Pay rent" -b "<h1>Pay the rent</h1>"')
  .example('$0 add -n Rent -d 21 -s "Reminder: Pay rent" -b "<h1>Pay the rent</h1>" -r someone@example.com')
  .epilog('Copyright 2020 Mehmet Baker')
  .wrap(170)
  .argv;
