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
        bbox: {}
    },
    id: {
        name: 'location name/address?'
        lat: 0,
        lon: 0,
        bbox:{}
    }
}
*/
const searchHistoryObj = (localStorage['trailPlanner']) ? globalFunc.loadLocal() : {};

/* REMOVE LATER - Left for testing purposes of the localStorage code
//searchHistoryObj['id2'] = {name: 'test2 name'};
console.log(searchHistoryObj);
*/

// REMOVE LATER - Testing geocoding api
//globalFunc.getLocation('carpenter peak trail colorado');
//globalFunc.getLocation('513 americana rd, co');
//console.log(searchHistoryObj);


// TO DO - Validate address information better
// TO DO - Set up autocomplete from geoapify address autocomplete API
// TO DO - Use bbox get location map from openstreetmaps API