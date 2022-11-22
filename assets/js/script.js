// *****Global Function Object*****
const globalFunc = {
    // Save user search history to localStorage function
    loadLocal: function() {
        return JSON.parse(localStorage.getItem('trailPlanner'));
    },
    // Retrieve user search history from localStorage function
    saveLocal: function() {
        localStorage.setItem('trailPlanner', JSON.stringify(searchHistoryObj));
    }
}

// *****Global Variables*****
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




//searchHistoryObj['id2'] = {name: 'test2 name'};
console.log(searchHistoryObj);
