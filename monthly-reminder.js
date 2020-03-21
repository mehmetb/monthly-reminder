const fs = require('fs');
const yargs = require('yargs');
const Utils = require('./Utils.js');

let subYargs;

async function addReminder(commandArgs) {
  try {
    let reminders = [];

    // Try to read reminders.json
    try {
      reminders = await Utils.getReminders();
    } catch (readException) {
      if (readException.code !== 'ENOENT') {
        throw readException;
      }
    }

    const allBits = ['name', 'date', 'subject', 'body', 'file', 'previousBusinessDay', 'nextBusinessDay'];

    // All arguments must be supplied once and only once
    for (const bit of allBits) {
      if (commandArgs[bit] instanceof Array) {
        subYargs.showHelp();
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

    let messageBody = `<h1 align="center">You Have Been Reminded</h1>
      <br />
      <br />
      Reminder: <strong>${name}</strong>
      <br />
      <br />
      Yours truly,
      Reminder Bot :)
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
    const digitCount = Math.floor(Math.log10(reminders.length)) + 1;

    console.log('List of reminders:\n');

    for (let i = 0; i < reminders.length; ++i) {
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

    await listReminders(reminders);

    const answer = await Utils.askQuestion('Choose which reminder(s) to delete (comma-separated): ');
    const indexes = answer
      .split(',')
      .map((index) => Number(index.trim()))
      .filter((index) => !isNaN(index) && index > 0);

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
    if (ex === 'SIGCONT') {
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
    (_subYargs) => {
      subYargs = _subYargs;

      subYargs
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
          describe: 'When <date> is not a weekday, trigger the reminder on the next business day. This is the default.',
          conflicts: 'previous-business-day',
          nargs: 0,
          type: 'boolean',
        })
        .option('previous-business-day', {
          alias: ['pbd'],
          describe: 'When <date> is not a weekday, trigger the reminder on the previous business day',
          conflicts: 'next-business-day',
          type: 'boolean',
          nargs: 0,
        })
        .demandOption(['name', 'date']);
    },
    addReminder,
  )
  .command(['del', 'delete'], 'Delete reminder(s).', {}, deleteReminders)
  .command('list', 'List all reminders.', {}, () => listReminders())
  .epilog('Copyright 2020 Mehmet Baker')
  .wrap(100)
  .argv;
