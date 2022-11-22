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
const searchHistoryObj = (localStorage['trailPlanner']) ? loadLocal() : {};


// TO DO - Save user search history to localStorage
const saveLocal = () => {
    localStorage.setItem('trailPlanner', JSON.stringify(searchHistoryObj));
}
// TO DO - Retrieve user search history from localStorage
const loadLocal = () => {
    return JSON.parse(localStorage.getItem('trailPlanner'));
}