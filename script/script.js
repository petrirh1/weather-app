const defaultLanguage = "en";
var iconColor = "#555c64";

window.addEventListener("load", () => {
    let long;
    let lat;
    let lang;
    let location = document.querySelector(".location");
    let temperature = document.querySelector(".temperature");
    let temperatureDescription = document.querySelector(".temperature-description");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                long = position.coords.longitude;
                lat = position.coords.latitude;

                // get user"s preferred language
                lang =
                    (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
                    navigator.language || // All browsers
                    navigator.userLanguage; // IE <= 10

                lang = shortenLangCode(lang);

                const key = "200de6c63566b3052efa4017421cb685";
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&lang=${lang}&units=metric&APPID=${key}`;

                fetch(url)
                    .then(response => {
                        if (response.ok) {
                            // turn spinner animation off
                            spinner.style.display = "none";
                            return response.json();
                        } else {
                            throw Error(`Request rejected with status ${response.status}`);
                        }
                    })
                    .then(function (data) {
                        var { name } = data;
                        let { temp } = data.main;
                        let { description, id } = data.weather[0];

                        temp = Math.round(temp) + "°";
                        location.textContent = name;
                        document.title = "Weather in " + name;
                        temperature.textContent = temp;
                        temperatureDescription.textContent = description;
                        setIcon(getIcon(id), document.querySelector(".icon"));
                    });
            },
            error => {
                if (error.code == 1) {
                    console.error("PERMISSION_DENIED");
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

var date = new Date();

function getTime() {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // array of variables
    return [hours, minutes];
}

function shortenLangCode(lang) {
    if (lang.includes("-")) {
        lang = lang.substring(0, lang.indexOf("-"));
    }
    return lang;
}

function setIcon(id, iconID) {
    const skycons = new Skycons({ "color": iconColor, "resizeClear": true });
    skycons.play();
    return skycons.set(iconID, Skycons[id]);
}

function getIcon(id) {
    let time = getTime();

    let hours = time[0];

    if (id >= "200" && id <= "531") {
        id = "RAIN";
    } else if (id == "611") {
        id = "SLEET";
    } else if (id >= "600" && id <= "622") {
        id = "SNOW";
    } else if (id >= "701" && id <= "781") {
        id = "FOG";
    } else if (id == "800") {
        if (hours >= 21 || hours <= 6) {
            id = "CLEAR_NIGHT";
        } else {
            id = "CLEAR_DAY";
        }
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

// theme selector
var checkbox = document.querySelector("input[name=theme]");
setThemeOnLoad();

checkbox.addEventListener("change", function () {
    let value;

    if (this.checked) {
        trans();
        document.documentElement.setAttribute("data-theme", "dark");
        value = "dark";
    } else {
        trans();
        document.documentElement.setAttribute("data-theme", "light");
        value = "light";
    }

    localStorage.setItem("data-theme", value);
});

// get previously applied theme
function setThemeOnLoad() {
    let theme = localStorage.getItem("data-theme");

    if (theme == "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        // set toggle state
        checkbox.checked = true;
    } else {
        document.documentElement.setAttribute("data-theme", "light");
    }
}

function isMobile() {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ) {
        return true;
    }
    return false;
}

function scaleDown() {
    let icon = document.querySelector(".icon");

    if (isMobile() && mobile.matches) {
        icon.setAttribute("width", "256");
        icon.setAttribute("height", "256");
        icon.classList.add("scale");
    } else {
        icon.classList.remove("scale");
        icon.setAttribute("width", "90");
        icon.setAttribute("height", "90");
    }
}

// change fadeIn animation delays
function animationDelay(mobile) {
    let icon = document.querySelector(".icon");
    let tempInfo = document.querySelector(".temp-info");

    if (mobile.matches) {
        tempInfo.classList.remove("delay-50");
        tempInfo.classList.add("delay-75");
        icon.classList.remove("delay-75");
        icon.classList.add("delay-50");
    } else {
        tempInfo.classList.remove("delay-75");
        tempInfo.classList.add("delay-50");
        icon.classList.remove("delay-50");
        icon.classList.add("delay-75");
    }
    scaleDown();
}

var mobile = window.matchMedia("(max-width: 600px)");
animationDelay(mobile);
mobile.addListener(animationDelay);

// theme transition
let trans = () => {
    document.documentElement.classList.add("transition");
    window.setTimeout(() => {
        document.documentElement.classList.remove("transition");
    }, 1000);
}

tippy("#toggle", {
    content: "Switch between light and dark mode",
    theme: "even-darker",
    animateFill: false,
    touch: "false",
    touchHold: "false",
    placement: "bottom-end",
    distance: 30,
    arrow: true,
    arrowType: "round",
    animation: "shift-away",
    delay: 250,
    duration: 200,
});