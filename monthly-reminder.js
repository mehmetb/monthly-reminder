const yargs = require('yargs');
const Utils = require('./Utils.js');

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

    reminders.push({
      name: commandArgs.name,
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

yargs
  .demandCommand(1)
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help')
  .command('list', 'list all reminders', {}, () => listReminders())
  .command(['delete', 'del'], 'delete reminder(s)', {}, deleteReminders)
  .command(
    'add', 
    'add a reminder', 
    (subYargs) => {
      subYargs
        .option('name', {
          describe: 'reminder name',
          alias: 'n',
        })
        .demandOption('name');
    },
    addReminder,
  )
  .argv

