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
        let geocodingUrl = `https://api.geoapify.com/v1/geocode/search?name=${loc}&format=json&apiKey=${geoapifyApiKey}`;

        // Fetch lat/lon data from geoapify API
        fetch(geocodingUrl, {method: 'GET'})
            .then(response => {
                console.log(response);
                return response.json();})
            .then(data => {

                console.log(data);

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
        lon: 0
    },
    id: {
        name: 'location name/address?'
        lat: 0,
        lon: 0
    }
}
*/
const searchHistoryObj = (localStorage['trailPlanner']) ? globalFunc.loadLocal() : {};

/* REMOVE LATER - Left for testing purposes of the localStorage code
//searchHistoryObj['id2'] = {name: 'test2 name'};
console.log(searchHistoryObj);
*/

// REMOVE LATER - Testing geocoding api
globalFunc.getLocation('carpenter peak trail colorado');


// TO DO - Set up autocomplete from geoapify address autocomplete API
// TO DO - Use bbox get location map from openstreetmaps API