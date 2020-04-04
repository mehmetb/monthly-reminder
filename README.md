## Monthly Reminders

Set a recurring reminder on a specific day of the month. If the date falls on a weekend, the alarm (actually it's an email 😅) will go off on the next weekday (or the previous weekday if you choose so).

### Table of Contents

* [Installation](#Installation)
* [Configuration](#Configuration)
* [Usage](#Usage)
  * [Adding reminders](#adding-reminders)
  * [Listing reminders](#listing-reminders)
  * [Deleting reminders](#deleting-reminders)
* [License](#License)

### Installation

You can install the package from NPM.

```bash
npm install --global monthly-reminder
```

After installing you need to add an entry to your crontab that will execute monthly-reminder daily.
And to do that, we need to know the absolute path of monthly-reminder.

```bash
$> which monthly-reminder
/usr/bin/monthly-reminder
$> ls -l /usr/bin/monthly-reminder
lrwxrwxrwx 1 root root 56 Mar 22 10:48 /usr/bin/monthly-reminder -> ../lib/node_modules/monthly-reminder/monthly-reminder.js
```

Now we have all the information we need. Run `crontab -e` and schedule a daily job:

```bash
$> crontab -e
# Make sure that you are setting the hour in your server's timezone.
# You can choose a different hour to receive the emails but the program must run daily.
0 9 * * * /usr/bin/monthly-reminder exec
```

### Configuration

You need to create a `config.json` in the monthly-reminder directory. We found that directory in the previous step:
`/usr/lib/node_modules/monthly-reminder`

Let's change the directory:

```bash
$> cd /usr/lib/node_modules/monthly-reminder
```

There is an example config that you can copy and derive. `config.json` content should be like this:

```json
{
  "nodemailer": {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "username",
      "pass": "password"
    }
  },
  "defaultRecipient": "someone@example.com"
}
```

monthly-reminder uses [Nodemailer](https://github.com/nodemailer/nodemailer) to send emails. The `nodemailer`
object in the config is passed to `createTransport` of Nodemailer without modification. You may need additional
settings to send emails from your email provider. You can find all available configuration keys in [Nodemailer
documentation](https://nodemailer.com/smtp/).

### Usage

All available commands are listed in the general help section:

```bash
$> monthly-reminder -h
```

#### Adding reminders

Set a reminder by running this command:

```bash
$> monthly-reminder add --name "Pay the Bills" --date 19 --recipient me@email.com
```

Now the reminder is set. You will be reminded to pay your bills on 19th of each month (or the next business day where
19 is a weekend).

There are a couple of other settings and customizations that you can learn more about by visiting the help section.

```bash
$> monthly-reminder add -h
```

#### Listing reminders

You can see a list of your reminders by running:

```bash
$> monthly-reminder list
```

#### Deleting reminders

The command below will first list the reminders and then prompt you to choose which one(s) to
delete. You can delete multiple reminders by separating them with commas.

```bash
$> monthly-reminder delete
```

### License

GNU General Public License v3.0 or later.

See [COPYING](COPYING) to see the full text.
