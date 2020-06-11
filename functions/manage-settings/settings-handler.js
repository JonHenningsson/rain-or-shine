const MyUserDB = require('myuserdb');
const Settings = require('../common/settings');

async function getSettings(athleteId) {
  return new Promise(
    async (resolve, reject) => {
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
        console.log(err.message);
        reject(err);
      }
    },
  );
}

async function saveSettings(athleteId, settings) {
  return new Promise(
    async (resolve, reject) => {
      try {
        const mysettings = new Settings();
        // to-do:sanitize and make sure settings are valid
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
        console.log(err.message);
        reject(err);
      }
    },
  );
}


module.exports.getSettings = getSettings;
module.exports.saveSettings = saveSettings;
