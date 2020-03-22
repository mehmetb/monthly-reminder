## Monthly Reminders

The reminders will go off only on workdays. For example, if you set a reminder for 25th of each month
and 25th is a Saturday or a Sunday then the reminder will be sent on Monday as if it was scheduled to
Monday.

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
npm install monthly-reminder
```

After installing you need to add an entry to your crontab that will execute monthly-reminder daily.

```bash
0 9 * * * /path/to/monthly-remider/monthly-reminder.js exec
```

### Configuration

You need to create a `config.json` in the monthly-reminder directory. There is an example config
that you can copy and derive.

`config.json` content should be like this:

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
monthly-reminder.js -h
```

#### Adding reminders

Set a reminder by running this command:

```bash
monthly-reminder.js add --name "Pay the Bills" --date 19 --recipient me@email.com
```

Now the reminder is set. You will be reminded to pay your bills on 19th of each month (or the next business day where
19 is a weekend).

There are a couple of other settings and customizations that you can learn more about by visiting the help section.

```bash
monthly-reminder.js add -h
```

#### Listing reminders

You can see a list of your reminders by running:

```bash
monthly-reminder.js list
```

#### Deleting reminders

The command below will first list the reminders and then prompt you to choose which one(s) to
delete. You can delete multiple reminders by separating them with commas.

```bash
monthly-reminder.js delete
```

### License

GNU General Public License v3.0 or later.

See [COPYING](COPYING) to see the full text.
