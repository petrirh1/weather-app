const proxy = "https://cors-anywhere.herokuapp.com/";
const yandexKey =
  "trnsl.1.1.20190320T153212Z.9abc2cfea4d80821.f1fbfc211ba2b1dd9c466e06700e74ef118bff6c";
const defaultLanguage = "en";

window.addEventListener("load", () => {
  let long;
  let lat;
  let location = document.querySelector(".location");
  let temperature = document.querySelector(".temperature");
  let temperatureDescription = document.querySelector(".temperature-description");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        // locate user's position coordinates
        long = position.coords.longitude;
        lat = position.coords.latitude;

        // get user's preferred language
        var userLanguage =
          (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
          navigator.language || // All browsers
          navigator.userLanguage; // IE <= 10

        console.log(userLanguage);

        // shortens lang code
        userLanguage = shortenLangCode(userLanguage);

        // pre translate greetings based on preferred language
        preTranslate(userLanguage);

        // get greeting
        getGreeting(createGreeting(), userLanguage);

        // check language abbreviations for OpenWeatherMap API
        userLang = abbreviation(userLanguage);

        const key = "200de6c63566b3052efa4017421cb685";
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&lang=${userLanguage}&units=metric&APPID=${key}`;

        fetch(url)
          .then(response => {
            if (response.ok) {
              // turn loader animation off
              loader.style.display = "none";
              return response.json();
            } else {
              throw Error(`Request rejected with status ${response.status}`);
            }
          })
          .then(function (data) {
            var { name } = data;
            var { temp } = data.main;
            var { description, id } = data.weather[0];
            console.log(data);

            //name = charToScandic(name);
            temp = Math.round(temp) + "°";

            console.log(name);

            // set location
            location.textContent = name;
            // set temp
            temperature.textContent = temp;
            // set temp description
            temperatureDescription.textContent = description;

            // set icon
            setIcon(getIcon(id), document.querySelector(".icon "));
          });
      },
      error => {
        if (error.code == 1) {
          console.error("PERMISSION_DENIED_BY_USER");
        } else if (error.code == 2) {
          console.error("POSITION_UNAVAILABLE");
        } else if (error.code == 2) {
          console.error("TIMEOUT");
        } else {
          console.error("AN_UNKNOWN_ERROR_OCCURED");
        }
      }
    );
  } else {
    alert("This browser does not support HTML Geolocation!");
  }
});

// new date object
var date = new Date();

// get current time in hours and minutes
function getTime() {
  var hours = date.getHours();
  var minutes = date.getMinutes();

  // returns an array of variables
  return [hours, minutes];
}

// shortens language code
function shortenLangCode(lang) {
  if (lang.includes("-")) {
    lang = lang.substring(0, lang.indexOf('-'));
  }
  return lang;
}

// this is used to convert some language abbreviations for OpenWeatherMap API
function abbreviation(lang) {
  if (lang == "cs") {
    lang = "cz";
  } else if (lang == "ko") {
    lang = "kr";
  } else if (lang == "lv") {
    lang = "la";
  } else if (lang == "sv") {
    lang = "se";
  } else if (lang == "uk") {
    lang = "ua";
  }
  return lang;
}

// replaces certain character combinations with scandic equivalent
// function charToScandic(value) {
//   value = value.replace(/ae/g, "ä");
//   value = value.replace(/oe/g, "ö");
//   return value;
// }

// checks whether local storage has specific content or not
function checkLocalStorage() {
  if (
    localStorage.getItem("0") != null &&
    localStorage.getItem("1") != null &&
    localStorage.getItem("2") != null
  ) {
    return true;
  }
  return false;
}

// set icon
function setIcon(id, iconID) {
  const skycons = new Skycons({ color: "#555659" });
  skycons.play();
  return skycons.set(iconID, Skycons[id]);
}

// this is used to convert id to corresponding icon name
function getIcon(id) {
  var time = getTime();

  // accessing an array
  var hours = time[0];

  if (id >= "200" && id <= "531") {
    id = "RAIN";
  } else if (id == "611") {
    id = "SLEET";
  } else if (id >= "600" && id <= "622") {
    id = "SNOW";
  } else if (id >= "701" && id <= "781") {
    id = "FOG";

    // switch icon based on time
  } else if (id == "800") {
    if (hours >= 21 || hours <= 6) {
      id = "CLEAR_NIGHT";
    } else {
      id = "CLEAR_DAY";
    }

    // switch icon based on time
  } else if (id >= "801" && id <= "802") {
    if (hours >= 21 || hours <= 6) {
      id = "PARTLY_CLOUDY_NIGHT";
    } else {
      id = "PARTLY_CLOUDY_DAY";
    }
  } else if (id >= "803" && id <= "804") {
    id = "CLOUDY";
  }

  return id;
}

// this functions translates all greetings beforehand
function preTranslate(language) {
  // check local storage and language
  if (!checkLocalStorage() && language != defaultLanguage) {
    const greetings = "Good Morning,Good Afternoon,Good Evening";
    const url = `${proxy}https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexKey}&text=${greetings}&lang=${language}`;

    fetch(url)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error(`Request rejected with status ${response.status}`);
      })
      .then(function (data) {
        var text = data.text[0];
        storeData(text);
      });
  }
}

// this function saves translated strings into local storage
function storeData(text) {
  // splits text into an array of strings
  var strings = text.split(",");
  console.log(strings);

  // iterates through strings and stores them in local storage as key value pairs
  try {
    strings.forEach(function (item, index) {
      localStorage.setItem(index, item);
    });
    // error handling
  } catch (e) {
    console.alert("catch: " + e); //INCOMPLETE!
  }
}

// create greeting based on time
function createGreeting() {
  var time = getTime();
  var greeting;

  // accessing an array
  var hours = time[0];
  var minutes = time[1];

  if (hours >= 5 && minutes >= 0 && hours <= 11 && minutes <= 59) {
    greeting = "Good Morning";
  } else if (hours >= 12 && minutes >= 0 && hours <= 15 && minutes <= 59) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return greeting;
}

// translate greeting to user preferred language
function getGreeting(greeting, language) {
  let greetingText = document.querySelector(".greeting");

  // if values are already being stored in local storage, use those instead
  if (checkLocalStorage()) {
    let data;

    // get corresponding greeting from local storage
    if (greeting == "Good Morning") {
      data = localStorage.getItem("0");
    } else if (greeting == "Good Afternoon") {
      data = localStorage.getItem("1");
    } else {
      data = localStorage.getItem("2");
    }

    console.log(data);
    greetingText.textContent = data;

    // incase local storage isn't available and language isn't default
  } else if (language != defaultLanguage) {
    const url = `${proxy}https://translate.yandex.net/api/v1.5/tr.json/translate?key=${yandexKey}&text=${greeting}&lang=${language}`;

    fetch(url)
      .then(function (response) {
        if (response.ok) {
          console.log(response);
          return response.json();
        } else {
          throw Error(`Request rejected with status ${response.status}`);
        }
      })
      .then(function (data) {
        var translatedGreeting = data.text[0];

        // set greeting
        greetingText.textContent = translatedGreeting;
      });
  } else {
    // if everything else fails set default greeting
    greetingText.textContent = greeting;
  }
}

// tippy tooltip
tippy('#yandex', {
  content: "Visit Yandex",
  placement: 'top',
  arrow: true,
  arrowType: 'round',
  animateFill: false,
  animation: 'shift-away',
  delay: 100,
})

tippy('#github', {
  content: "Visit project page",
  placement: 'top',
  arrow: true,
  arrowType: 'round',
  animateFill: false,
  animation: 'shift-away',
  delay: 100,
})
