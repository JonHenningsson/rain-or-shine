function getUrlParameter(n) {
  const name = n.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

async function addUser() {
  let result;
  const code = getUrlParameter('code');
  const scope = getUrlParameter('scope');
  const state = getUrlParameter('state');

  // verify parameters are present
  if (!(code && scope && state)) {
    return false;
  }

  try {
    result = await $.ajax({
      url: '/.netlify/functions/add-user',
      type: 'GET',
      data: {
        code,
        scope,
        state,
      },
      dataType: 'json',
    });
  } catch (err) {
    return false;
  }

  return result;
}

async function getSettings() {
  let result;

  try {
    result = await $.ajax({
      url: '/.netlify/functions/manage-settings',
      type: 'GET',
      dataType: 'json',
    });
  } catch (err) {
    return false;
  }

  return result;
}

async function saveSettings(settings) {
  let result;
  try {
    result = await $.ajax({
      url: '/.netlify/functions/manage-settings',
      type: 'POST',
      contentType: 'application/json',
      data: settings,
      dataType: 'json',
    });
  } catch (err) {
    return false;
  }

  return result;
}

async function logout() {
  let result;

  try {
    result = await $.ajax({
      url: '/.netlify/functions/manage-settings?logout',
      type: 'GET',
      dataType: 'json',
    });
  } catch (err) {
    return false;
  }

  return result;
}
