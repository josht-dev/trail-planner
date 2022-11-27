// *****Global Function Object*****
const globalFunc = {
    // Save user search history to localStorage function
    loadLocal: function() {
        return JSON.parse(localStorage.getItem('trailPlanner'));
    },
    // Retrieve user search history from localStorage function
    saveLocal: function() {
        localStorage.setItem('trailPlanner', JSON.stringify(searchHistoryObj));
    },
    // Use the location address or name as a parameter when calling getLocation()
    getLocation: function(loc) {
        let geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${loc}&format=json&apiKey=${geoapifyApiKey}`;

        // Fetch lat/lon data from geoapify API
        fetch(geocodingUrl, {method: 'GET'})
            .then(response => {return response.json();})
            .then(data => {
                // Function to trim extra decimals from lat/lon
                const trimDecimals = num => {
                    let dotIndex = num.toString().indexOf('.');
                    let trimmedNum = num.toString().slice(0, dotIndex + 5);
                    return Number(trimmedNum);
                };
                // Get the results obj from the array
                let resultObj = data.results[0];
                let lat = trimDecimals(resultObj.lat);
                let lon = trimDecimals(resultObj.lon);

                // Save data to serachHistoryObj
                searchHistoryObj[data.results[0].place_id] = {
                    name: data.query.text,
                    lat: lat,
                    lon: lon,
                    bbox: resultObj.bbox
                };

                // Save the new data to localStorage
                this.saveLocal();
            })
        //
    },
    /* Use the latitude/longitude to get the NWS (National Weather Service) grid points
    id is the location key saved in the localStorage obj */
    getNWSPoints: function(lat, lon, id = 0, htmlId) {
        const locUrl = `https://api.weather.gov/points/${lat},${lon}`;

        // Get the location grid url the api uses for weather
        fetch(locUrl, {method: 'GET', headers: headers})
            .then(response => {return response.json();})
            .then(data => {
                // If id = 0, don't save data
                if (id) {
                    // Save location data
                    searchHistoryObj.id.forecastUrl = data.properties.forecast;
                    searchHistoryObj.id.forecastHourlyUrl = data.properties.forecastHourly;
                    // Get the location weather
                    this.getWeather(data.properties.forecast, id);
                } else {
                    this.getWeather(data.properties.forecast, 0, htmlId);
                }
            })
        //
    },
    /* Use NWS weather forecasts url for the location's grid points
    id is the location key saved in the localStorage obj */
    getWeather: function(url, id = 0, htmlId) {
        // Get the weather forecast for the location
        fetch(url, {method: 'GET', headers: headers})
            .then(response => {return response.json();})
            .then(data => {
                // If id = 0, don't save data
                if (id) {
                    // Save weather data
                    searchHistoryObj.id.rawWeatherData = data.properties.periods;

                    // TO DO - Update html weather dashboard
                    //this.updateWeatherHtml('weather-dashboard', id);
                    
                } else {
                    this.updateWeatherHtml(htmlId, 0, data.properties.periods[0])
                }  
            })
        //  
    },
    // Pass the html section container, an id if this is from searchHistoryObj, and the weather data to add
    updateWeatherHtml: function(htmlId, id = 0, weatherData) {
        // Check if this is updated the weather dashboard or dev picks
        if (htmlId === 'weather-dashboard') {

            // TO DO - Update the html weather dashboard

        } else {
            const pickContainer = document.getElementById(htmlId);
            const tempContainer = pickContainer.getElementsByClassName("temp");
            const windContainer = pickContainer.getElementsByClassName("wind");
            const iconContainer = pickContainer.getElementsByClassName("icon");
            // Set the text that comes in with wind speed to uppercase
            let windSpeed = weatherData.windSpeed;
            windSpeed = windSpeed.toUpperCase();

            // Add the html content
            tempContainer[0].children[0].textContent = `${weatherData.temperature} ${weatherData.temperatureUnit}`;
            windContainer[0].children[0].textContent = windSpeed;
            iconContainer[0].children[0].setAttribute("src", weatherData.icon);
        }
    }
}

// ***** Youtube Search and video section *****
// TODO: Investigate potential cookie issue: // some internal error occurs shortly after video begins playing https://issuetracker.google.com/issues/229013699

const youtubeSearchApi = 'https://www.googleapis.com/youtube/v3/search?&key=AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ&type=video&q='
const youtubeApiKey = 'AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ'
// TODO: add search button to submit search criteria
/*
let ytSearchBtn = document.getElementById("")

ytSearchBtn.addEventListener('click', function() {
    // TODO: add input box to enter search criteria
    let searchCriteria = document.getElementById("searchCriteria").value
    console.log(searchCriteria)
    fetch('https://www.googleapis.com/youtube/v3/search?&key=AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ&type=video&q=' + searchCriteria)
    .then(function (response){
        return response.json();
    }).then(function(data){
        console.log(data)
        let videoId = data.items[0].id.videoId
        console.log(videoId)
        // TODO: create Iframe element in html to hold found hike video
        const iFrame = document.getElementById("videoPlayer").setAttribute('src','https://www.youtube.com/embed/' + videoId)
    })
})
*/

// *****Global Variables*****
const geoapifyApiKey = '035e16b84ace4340b1c953b2f690fc7e';
/* An example of the data stored in the searchHistoryObj
{
    id: {
        name: 'location name/address?'
        lat: 0,
        lon: 0,
        bbox: {},
        forecastUrl: '', 
        forecastHourlyUrl: '', 
        rawWeatherData: []
    },
    id: {
        name: 'location name/address?'
        lat: 0,
        lon: 0,
        bbox:{}, 
        forecastUrl: '', 
        forecastHourlyUrl: '', 
        rawWeatherData: []
    }
}
*/
const searchHistoryObj = (localStorage['trailPlanner']) ? globalFunc.loadLocal() : {};
// National Weather Service API requested headers
const headers = new Headers({
    'Accept': 'application/geo+json',
    'User-Agent': '(https://josht-dev.github.io/trail-planner, toasterrage@gmail.com, class-project)'
});
// Hold the latitude/longitude for dev pick hike locations
const devPicksObj = {
    // Location lat/lon for dev pick locations
    'dev-josh-pick': {lat: 39.4289, lon: -105.0682}
}


// *****Run Code Below at Load*****

// Loop through the devPicksObj to set the current weather for each location
for (let key in devPicksObj) {
    // Get the html elements
    //const weatherUrl = globalFunc.getNWSPoints(devPicksObj[key].lat, devPicksObj[key].lon);
    //const weatherData = globalFunc.getWeather('https://api.weather.gov/gridpoints/BOU/58,47/forecast', 0, key);
    globalFunc.getNWSPoints(devPicksObj[key].lat, devPicksObj[key].lon, 0, key);
}


// TO DO - Validate address information better
// TO DO - Look into google advert/tracking 'bocked by client' console errors
// TO DO - Check the response header for if the points address expired
// TO DO - Add ability to view the hourly forecast from National Weather Service
// TO DO - Set up autocomplete from geoapify address autocomplete API
// TO DO - Use bbox get location map from openstreetmaps API