const debug = require('debug')('rain-or-shine:settings-handler');
const MyUserDB = require('myuserdb');
const Settings = require('../common/settings');

async function getSettings(athleteId) {
  return new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('getSettings');
      edebug('Attempting to get settings for athleteId: %s', athleteId);
      try {
        const udb = new MyUserDB();
        const user = await udb.getUser(athleteId);
        const mysettings = new Settings();
        const res = {
          settings: user.data.settings,
          availableSettings: mysettings.available,
        };
        resolve(res);
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );
}

async function saveSettings(athleteId, settings) {
  return new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('saveSettings');
      edebug('Attempting to update settings for athleteId: %s', athleteId);
      try {
        const mysettings = new Settings();
        const udb = new MyUserDB();
        const user = await udb.getUser(athleteId);
        if (await mysettings.isValid(settings)) {
          const res = await udb.updateSettings(user.ref, settings);
          const newSettings = res.data.settings;
          resolve(newSettings);
        } else {
          throw new Error('Unable to save settings');
        }
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );
}


module.exports.getSettings = getSettings;
module.exports.saveSettings = saveSettings;
