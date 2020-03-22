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
const readline = require('readline');

const REMINDER_DB_LOCATION = path.join(__dirname, 'reminders.json');

class Utils {
  /**
   * Reads reminders.json, parses it and returns the result.
   * @returns {Promise.<reminder[], Error>}
   */
  static async getReminders() {
    const fileContents = await fs.promises.readFile(REMINDER_DB_LOCATION, 'utf8');
    return JSON.parse(fileContents);
  }

  /**
   * Writes to reminders.json.
   * @param {reminder[]}
   * @returns Promise<void, Error>
   */
  static async setReminders(reminders) {
    await fs.promises.writeFile(
      REMINDER_DB_LOCATION,
      `${JSON.stringify(reminders, null, 2)}\n`,
    );
  }

  /**
   * Prompts a question and returns the input.
   * @param {string} question Prompt text
   * @returns Promise.<string, Error>
   */
  static askQuestion(question) {
    // New line
    console.log();

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Brought to foreground after a CTRL+Z
      rl.on('SIGCONT', () => {
        rl.close();
        reject(new Error('SIGCONT'));
      });

      // Received CTRL+C
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

  /**
   * Resolves after `ms` milliseconds.
   * @param {number} ms Milliseconds to wait before resolving.
   * @returns Promise.<void>
   */
  static sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

module.exports = Utils;
