const fs = require('fs');
const path = require('path');
const Utils = require('./Utils.js');
const nodemailer = require('nodemailer');

module.exports = async function checkCalendar() {
  try {
    const reminders = await Utils.getReminders();

  } catch (ex) {
  }
};

