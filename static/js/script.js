function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

async function addUser() {
  let code = getUrlParameter("code");
  let scope = getUrlParameter("scope");
  let state = getUrlParameter("state");

  // verify parameters are present
  if (!(code && scope && state)) {
    return false;
  }

  try {
    var result = await $.ajax({
      url: "/.netlify/functions/add-user",
      type: "GET",
      data: {
        "code": code,
        "scope": scope,
        "state": state
      },
      dataType: "json"
    });

  } catch (err) {
    return false;
  }

  return result;
}
