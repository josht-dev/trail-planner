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
    /* TO DO - fix geocoding lat/lan to only return the last 4 decimals,
        this is saved for later use if the weather url expires*/
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
    getNWSPoints: function(lat, lon, id) {
        const locUrl = `https://api.weather.gov/points/${lat},${lon}`;
        
        // Get the location grid url the api uses for weather
        fetch(locUrl, {method: 'GET', headers: headers})
            .then(response => {return response.json();})
            .then(data => {
                //console.log(data);
                // Save location data
                searchHistoryObj.id.forecastUrl = data.properties.forecast;
                searchHistoryObj.id.forecastHourlyUrl = data.properties.forecastHourly;
                // Get the location weather
                this.getWeather(data.properties.forecast, id);
            })
        //
    },
    /* Use NWS weather forecasts url for the location's grid points
    id is the location key saved in the localStorage obj */
    getWeather: function(url, id) {
        // Get the weather forecast for the location
        fetch(url, {method: 'GET', headers: headers})
            .then(response => {return response.json();})
            .then(data => {
                //console.log(data);
                // Save weather data
                searchHistoryObj.id.rawWeatherData = data.properties.periods;
                return;
            })
        //  
    }
}

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



/* REMOVE LATER - Left for testing purposes of the localStorage code
//searchHistoryObj['id2'] = {name: 'test2 name'};
console.log(searchHistoryObj);
*/

// REMOVE LATER - Testing geocoding api
//globalFunc.getLocation('carpenter peak trail colorado');
//globalFunc.getLocation('513 americana rd, co');  

// REMOVE LATER - Testing for national weather service api
//globalFunc.getNWSPoints(38.8894, -77.0352);
//globalFunc.getWeather('https://api.weather.gov/gridpoints/TOP/31,80/forecast');


// TO DO - Validate address information better
// TO DO - Check the response header for if the points address expired
// TO DO - Add ability to view the hourly forecast from National Weather Service
// TO DO - Set up autocomplete from geoapify address autocomplete API
// TO DO - Use bbox get location map from openstreetmaps API