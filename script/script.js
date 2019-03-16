window.addEventListener('load', () => {
    let long;
    let lat;
    let temperatureDescription = document.querySelector('.temperature-description');
    let temperatureDegree = document.querySelector('.temperature-degree');
    let loader = document.getElementById("loader");
    greeting();
    getCityName();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {

            // locate user's position coordinates
            long = position.coords.longitude;
            lat = position.coords.latitude;

            // this is used to avoid cross-origin requests being blocked
            const proxy = 'https://cors-anywhere.herokuapp.com/'

            // units auto parameter: automatically selects unit based on geographic location
            // exclude parameter: excludes defined data blocks from the API response
            const api = `${proxy}https://api.darksky.net/forecast/153f0348adc074e56e48179ed7d9be00/${lat},${long}?units=auto&exclude=minutely,hourly,daily,alerts,flags`;

            fetch(api)
                .then(response => {
                    // turn loader animation off
                    loader.style.display = "none";
                    return response.json();
                })
                .then(data => {
                    var { temperature, summary, icon } = data.currently;;
                    //console.log(data.currently);
                    // set DOM elements from the API
                    temperatureDegree.textContent = Math.round(temperature) + "°";
                    temperatureDescription.textContent = summary;
                    // set icon
                    setIcons(icon, document.querySelector(".icon"));
                });

        });
    } else {
        console.error("Geolocation is not supported by this browser!");
    }

    function setIcons(icon, iconID) {
        const skycons = new Skycons({ "color": "#555659" });
        // replaces letters to match with the icon name
        const currentIcon = icon.replace(/-/g, "_").toUpperCase();
        // play icon animation
        skycons.play();
        return skycons.set(iconID, Skycons[currentIcon]);
    }
});


// HERE location services platform initialization
var platform = new H.service.Platform({
    "app_id": "274SJuRdZP7VA8XcErv4",
    "app_code": "XQ0PrJ2dl0Ihg8GEG36aSA"
});


let locationCity = document.querySelector('.location-city');
var geocoder = platform.getGeocodingService();

//get city name according to coordinates, since dark sky API won't provide it
function getCityName() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            geocoder.reverseGeocode({
                mode: "retrieveAddresses",
                maxresults: 1,

                // locate user's position coordinates
                prox: position.coords.latitude + "," + position.coords.longitude
            }, data => {
                //console.log(data.Response.View[0].Result[0].Location.Address);
                locationCity.textContent = data.Response.View[0].Result[0].Location.Address.City;
            }, error => {
                console.error(error);
            });
        });
    } else {
        console.error("Geolocation is not supported by this browser!");
        locationCity.textContent = "-----";
    }
}


// create greeting based on time
function greeting() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    let greetingText = document.querySelector('.greeting');

    if (hours >= 5 && minutes >= 0 && hours <= 11 && minutes <= 59) {
        greeting = "Good Morning";
    } else if (hours >= 12 && minutes >= 0 && hours <= 15 && minutes <= 59) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }
    greetingText.textContent = greeting;
}

// call function every minute
setInterval(greeting, 60000);