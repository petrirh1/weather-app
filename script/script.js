"use strict";

let iconColor = "#555c64";
let tempUnit;

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

                // get user's preferred language
                lang =
                    (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
                    navigator.language || // All browsers
                    navigator.userLanguage; // IE <= 10

                lang = shortenLangCode(lang);

                // set unit as metric or imperial
                setTempUnit();

                const key = "your_api_key";
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&lang=${lang}&units=${tempUnit}&APPID=${key}`;

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

                        showTempUnit();
                        temp = Math.round(temp);
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
    let date = new Date();
    let hours = date.getHours();

    if (typeof id === "number") {
        if (id >= 200 && id <= 531) {
            id = "RAIN";
        }
        else if (id == 611) {
            id = "SLEET";
        }
        else if (id >= 600 && id <= 622) {
            id = "SNOW";
        }
        else if (id >= 701 && id <= 78) {
            id = "FOG";
        }
        else if (id == 800) {
            if (hours >= 21 || hours <= 6) {
                id = "CLEAR_NIGHT";
            } else {
                id = "CLEAR_DAY";
            }
        }
        else if (id >= 801 && id <= 802) {
            if (hours >= 21 || hours <= 6) {
                id = "PARTLY_CLOUDY_NIGHT";
            } else {
                id = "PARTLY_CLOUDY_DAY";
            }
        }
        else if (id >= 803 && id <= 804) {
            id = "CLOUDY";
        } else {
            throw Error("INVALID_PARAMETER");
        }
        return id;
    }
    throw Error("INVALID_PARAMETER");
}

// toggle between celsius / fahrenheit
document.querySelector(".temp-info").addEventListener("click", function () {
    let unit = document.querySelector("#temp-unit").innerHTML;
    let temp = document.querySelector(".temperature").innerHTML;

    if (unit === "°C") {
        document.querySelector("#temp-unit").innerHTML = "°F";
        document.querySelector(".temperature").innerHTML = Math.round(temp * 9 / 5 + 32);
        localStorage.setItem("unit", "f");
    } else if (unit === "°F") {
        document.querySelector("#temp-unit").innerHTML = "°C";
        document.querySelector(".temperature").innerHTML = Math.round((temp - 32) / 1.8);
        localStorage.setItem("unit", "c");
    } else {
        localStorage.removeItem("unit");
        throw Error("UNKOWN_TYPE");
    }
});

let storedValue = localStorage.getItem("unit");

function setTempUnit() {
    if (storedValue === "f") {
        tempUnit = "imperial";
    } else if (storedValue === "c" || storedValue === null) {
        tempUnit = "metric";
    } else {
        throw Error("UNABLE_TO_SET_TEMP_UNIT");
    }
}

function showTempUnit() {
    if (storedValue === "f") {
        document.querySelector("#temp-unit").innerHTML = "°F";
    } else if (storedValue === "c" || storedValue === null) {
        document.querySelector("#temp-unit").innerHTML = "°C";
    }
}

// theme selector
let checkbox = document.querySelector("input[name=theme]");
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

function setThemeOnLoad() {
    let theme = localStorage.getItem("data-theme");

    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        // set toggle state
        checkbox.checked = true;
    } else if (theme === "light" || theme === null) {
        document.documentElement.setAttribute("data-theme", "light");
    }
}

// checks whether device is mobile
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

// scales down weather icon in order to make it crisp on high dpi devices
function scaleDown() {
    let icon = document.querySelector(".icon");

    if (isMobile() && isNarrow.matches) {
        if (icon.classList.contains("padding")) {
            icon.classList.remove("padding");
        }
        icon.setAttribute("width", "256");
        icon.setAttribute("height", "256");
        icon.classList.add("scale");
    } else if (isNarrow.matches) {
        icon.classList.add("padding");
    }
    else {
        icon.classList.remove("scale", "padding");
        icon.setAttribute("width", "90");
        icon.setAttribute("height", "90");
    }
}

/* 
* change fadeIn animation delay order for mobile
* because of different layout
*/
function animationDelay(isNarrow) {
    let icon = document.querySelector(".icon");
    let tempInfo = document.querySelector(".temp-info");

    if (isNarrow.matches) {
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

var isNarrow = window.matchMedia("(max-width: 600px)");
animationDelay(isNarrow);
isNarrow.addListener(animationDelay);

// theme transition
let trans = () => {
    document.documentElement.classList.add("transition");
    window.setTimeout(() => {
        document.documentElement.classList.remove("transition");
    }, 1000);
}

tippy("#toggle", {
    content: 'Toggle between <span class="highlight">light</span> and <span class="highlight">dark mode</span>',
    theme: "even-darker",
    animateFill: false,
    touch: "false",
    touchHold: "false",
    placement: "bottom-end",
    distance: 20,
    animation: "shift-away",
    delay: 250,
    duration: 200,
});

tippy(".temp-info", {
    content: 'Toggle between <span class="highlight">celsius</span> and <span class="highlight">fahrenheit</span>',
    theme: "even-darker",
    animateFill: false,
    touch: "false",
    touchHold: "false",
    placement: "top",
    distance: 20,
    animation: "shift-away",
    delay: 250,
    duration: 200,
});
