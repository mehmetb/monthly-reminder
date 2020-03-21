const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REMINDER_DB_LOCATION = path.join(__dirname, 'reminders.json');

class Utils {
  static async getReminders() {
    const fileContents = await fs.promises.readFile(REMINDER_DB_LOCATION, 'utf8');
    return JSON.parse(fileContents);
  }

  static async setReminders(reminders) {
    await fs.promises.writeFile(
      REMINDER_DB_LOCATION, 
      `${JSON.stringify(reminders, null, 2)}\n`,
    );
  }

  static askQuestion(question) {
    // New line
    console.log();

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.on('SIGCONT', () => {
        rl.close();
        reject('SIGCONT');
      });

      rl.on('SIGINT', () => {
        console.log();
        process.exit(0);
      });

      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

module.exports = Utils;

