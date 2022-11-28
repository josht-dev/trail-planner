// *****Global Function Object*****
const globalFunc = {
    // Save user search history to localStorage function
    loadLocal: function () {
        return JSON.parse(localStorage.getItem('trailPlanner'));
    },
    // Retrieve user search history from localStorage function
    saveLocal: function () {
        localStorage.setItem('trailPlanner', JSON.stringify(searchHistoryObj));
    },
    // Use the location address or name as a parameter when calling getLocation()
    getLocation: function (loc) {
        let geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${loc}&format=json&apiKey=${geoapifyApiKey}`;

        // Fetch lat/lon data from geoapify API
        fetch(geocodingUrl, { method: 'GET' })
            .then(response => { return response.json(); })
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

                // Proceed to get the weather from the nation weather service api
                this.getNWSPoints(lat, lon, data.results[0].place_id, 'weather-dashbord');
            })
        //
    },
    /* Use the latitude/longitude to get the NWS (National Weather Service) grid points
    id is the location key saved in the localStorage obj */
    getNWSPoints: function (lat, lon, id = 0, htmlId) {
        const locUrl = `https://api.weather.gov/points/${lat},${lon}`;

        // Get the location grid url the api uses for weather
        fetch(locUrl, { method: 'GET', headers: headers })
            .then(response => { return response.json(); })
            .then(data => {
                // If id = 0, don't save data
                if (id) {
                    // Save location data
                    searchHistoryObj[id].forecastUrl = data.properties.forecast;
                    searchHistoryObj[id].forecastHourlyUrl = data.properties.forecastHourly;
                    // Save the new data to localStorage
                    this.saveLocal();
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
    getWeather: function (url, id = 0, htmlId) {
        /* API has occasional response.status 500 codes, the accepted
        procedure is to try again a few times*/
        let retries = 0;

        const fetchWeather = () => {
            // Get the weather forecast for the location
            fetch(url, { method: 'GET', headers: headers })
                .then(response => {
                    if (response.status == 500) {
                        throw new Error(`Could not retrieve weather. Code: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // If id = 0, don't save data
                    if (id) {
                        // Save weather data
                        searchHistoryObj[id].rawWeatherData = data.properties.periods;

                        // Save the new data to localStorage
                        this.saveLocal();

                        // TODO: - Update html weather dashboard
                        this.updateWeatherHtml('weather-dashboard', id);

                    } else {
                        this.updateWeatherHtml(htmlId, 0, data.properties.periods[0])
                    }
                })
                .catch((error) => {
                    // TO DO - Change console.log to modal
                    //console.log(error);
                    if (retries < 3) {
                        retries++;
                        fetchWeather();
                    }
                })
            //          
        }
        fetchWeather();
    },
    // Pass the html section container, an id if this is from searchHistoryObj, and the weather data to add
    updateWeatherHtml: function (htmlId, id = 0, weatherData) {
        // Check if this is updated the weather dashboard or dev picks
        if (htmlId === 'weather-dashboard') {

            // TODO: - Update the html weather dashboard
            // Location Posting
            const searchLocationNameEl = document.getElementById("searchLocationName")
            let searchLocationName = searchHistoryObj[id].name
            console.log(searchLocationName)
            const locationNameArray = searchLocationName.split(", ")
            console.log(locationNameArray)
            searchLocationNameEl.textContent = locationNameArray[0]
            // Temp Reading
            const currentWeatherTempEl = document.getElementById("currentWeatherTemp")
            let currentTempReading = searchHistoryObj[id].rawWeatherData[0].temperature
            currentWeatherTempEl.textContent = " Current Temp(F): " + currentTempReading

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
    },
    devSlideBtn: function(num) {
        devPickSlides[devSlideIndex].classList.toggle('hidden');
        
        // Wrap around to index 0 if at end of collection
        if (num > 0 && devSlideIndex === devPickSlides.length - 1) {
            // Move to index 0
            devSlideIndex = 0;
            devPickSlides[devSlideIndex].classList.toggle('hidden');
        } else if (num < 0 && devSlideIndex === 0) {
            // Move to last index
            devSlideIndex = devPickSlides.length - 1;
            devPickSlides[devSlideIndex].classList.toggle('hidden');
        } else {
            // Proceed normally
            devSlideIndex = (num > 0) ? devSlideIndex + 1 : devSlideIndex - 1;
            devPickSlides[devSlideIndex].classList.toggle('hidden');
        }
    },
    weatherCardBtn: function(num) {
        futureWeatherCards[futureWeatherIndex].classList.toggle('hidden');
        
        // Wrap around to index 0 if at end of collection
        if (num > 0 && futureWeatherIndex === futureWeatherCards.length - 1) {
            // Move to index 0
            futureWeatherIndex = 0;
            futureWeatherCards[futureWeatherIndex].classList.toggle('hidden');
        } else if (num < 0 && futureWeatherIndex === 0) {
            // Move to last index
            futureWeatherIndex = futureWeatherCards.length - 1;
            futureWeatherCards[futureWeatherIndex].classList.toggle('hidden');
        } else {
            // Proceed normally
            futureWeatherIndex = (num > 0) ? futureWeatherIndex + 1 : futureWeatherIndex - 1;
            futureWeatherCards[futureWeatherIndex].classList.toggle('hidden');
        }
    }
}

// ***** Youtube Search and video section *****
// TODO: Investigate potential cookie issue: // some internal error occurs shortly after video begins playing https://issuetracker.google.com/issues/229013699

const youtubeSearchApi = 'https://www.googleapis.com/youtube/v3/search?&key=AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ&type=video&q='
const youtubeApiKey = 'AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ'

const ytSearchBtn = document.getElementById("ytSearchBtn")

ytSearchBtn.addEventListener('click', function() {
    const searchCriteria = document.getElementById("searchCriteria").value
    // makes youtube search based on input from user in searchCriteria box / TODO: Set up sort of category filter to outdoors
    fetch('https://www.googleapis.com/youtube/v3/search?&key=AIzaSyBjhy93wQO68VuHasrO7AfQdIaRb2CVfWQ&type=video&q=' + searchCriteria)
    .then(function (response){
        return response.json();
    }).then(function(YTdata){
        console.log(YTdata)
        // TODO: randomize video played out of first 5(?) results?
        let videoId = YTdata.items[0].id.videoId
        // using yt search data, sets videoID to be played in youtube Player container
        const iFrame = document.getElementById("videoPlayer").setAttribute('src','https://www.youtube.com/embed/' + videoId)
    })
})

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
    'dev-josh-pick': { lat: 39.4289, lon: -105.0682 },
    'dev-dylan-pick': { lat: 38.5607, lon: -109.5764 },
    'dev-christian-pick': { lat: 46.6568, lon: -92.3711 }
}
// Location search input/button
const btnLocSearch = document.getElementById("loc-search");
btnLocSearch.addEventListener('click', function (event) {
    event.preventDefault();
    let searchVal = this.previousElementSibling.firstElementChild.firstElementChild.value;
    
    // Validate search input was not blank
    if (searchVal) {
        let saved = false;
        let savedKey = 0;

        // Check for previously saved search
        for (let key in searchHistoryObj) {
            let val = searchHistoryObj[key].name;
            if (searchVal.toLowerCase() === val.toLowerCase()) {
                saved = true;
                savedKey = key;
                break;
            }
        }
        // If search was previously saved, skip geocoding
        if (saved) {
            globalFunc.getWeather(searchHistoryObj[savedKey].forecastUrl, savedKey, 'weather-dashboard');
        } else {
            // Use geocoding to get the lat/loc
            globalFunc.getLocation(searchVal);
        }
    }
})
// Track some indexes for dev pick slides and future weather cards
let devSlideIndex = 0;
let futureWeatherIndex = 0;
// Hold the dev pick slides in a live html collection
const devPickSlides = document.getElementsByClassName("dev-pick-container");
// Hold the future weather cards in a live html collection
const futureWeatherCards = document.getElementsByClassName("future-weather");

// *****Autocomplete Address Code*****
/* Autocomplete code was originally provided by the geoapify api tutorial at
    https://www.geoapify.com/tutorial/address-input-for-address-validation-and-address-verification-forms-tutorial*/
function addressAutocomplete(containerElement, callback, options) {
    const MIN_ADDRESS_LENGTH = 3;
    const DEBOUNCE_DELAY = 300;

    // create container for input element
    const inputContainerElement = document.createElement("div");
    inputContainerElement.setAttribute("class", "input-container");
    containerElement.appendChild(inputContainerElement);

    // create input element
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("placeholder", options.placeholder);
    // Add bootstrap classes to input from tutorial
    inputElement.classList.add('form-control', 'me-2');
    inputContainerElement.appendChild(inputElement);

    // add input field clear button
    const clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
        e.stopPropagation();
        inputElement.value = '';
        callback(null);
        clearButton.classList.remove("visible");
        closeDropDownList();
    });
    inputContainerElement.appendChild(clearButton);

    /* We will call the API with a timeout to prevent unneccessary API activity.*/
    let currentTimeout;
    /* Save the current request promise reject function. To be able to cancel the promise when a new request comes */
    let currentPromiseReject;
    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    let focusedItemIndex;

    /* Process a user input: */
    inputElement.addEventListener("input", function (e) {
        const currentValue = this.value;

        /* Close any already open dropdown list */
        closeDropDownList();

        // Cancel previous timeout
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }

        // Cancel previous request promise
        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true
            });
        }

        if (!currentValue) {
            clearButton.classList.remove("visible");
        }

        // Show clearButton when there is a text
        clearButton.classList.add("visible");

        // Skip empty or short address strings
        if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
            return false;
        }

        /* Call the Address Autocomplete API with a delay */
        currentTimeout = setTimeout(() => {
            currentTimeout = null;

            /* Create a new promise and send geocoding request */
            const promise = new Promise((resolve, reject) => {
                currentPromiseReject = reject;
                var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(currentValue)}&filter=countrycode:us&format=json&limit=5&apiKey=${geoapifyApiKey}`;

                fetch(url)
                    .then(response => {
                        currentPromiseReject = null;

                        // check if the call was successful
                        if (response.ok) {
                            response.json().then(data => resolve(data));
                        } else {
                            response.json().then(data => reject(data));
                        }
                    });
            });

            promise.then((data) => {
                // here we get address suggestions
                currentItems = data.results;

                /*create a DIV element that will contain the items (values):*/
                const autocompleteItemsElement = document.createElement("div");
                autocompleteItemsElement.setAttribute("class", "autocomplete-items");
                inputContainerElement.appendChild(autocompleteItemsElement);

                /* For each item in the results */
                data.results.forEach((result, index) => {
                    /* Create a DIV element for each element: */
                    const itemElement = document.createElement("div");
                    /* Set formatted address as item value */
                    itemElement.innerHTML = result.formatted;
                    autocompleteItemsElement.appendChild(itemElement);

                    /* Set the value for the autocomplete text field and notify: */
                    itemElement.addEventListener("click", function (e) {
                        inputElement.value = currentItems[index].formatted;
                        callback(currentItems[index]);
                        /* Close the list of autocompleted values: */
                        closeDropDownList();
                    });
                });
            }, (err) => {
                if (!err.canceled) {
                    console.log(err);
                }
            });
        }, DEBOUNCE_DELAY);
    });

    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function (e) {
        var autocompleteItemsElement = containerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            var itemElements = autocompleteItemsElement.getElementsByTagName("div");
            if (e.keyCode == 40) {
                e.preventDefault();
                /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== itemElements.length - 1 ? focusedItemIndex + 1 : 0;
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 38) {
                e.preventDefault();

                /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
                focusedItemIndex = focusedItemIndex !== 0 ? focusedItemIndex - 1 : focusedItemIndex = (itemElements.length - 1);
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 13) {
                /* If the ENTER key is pressed and value as selected, close the list*/
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    closeDropDownList();
                }
            }
        } else {
            if (e.keyCode == 40) {
                /* Open dropdown list again */
                var event = document.createEvent('Event');
                event.initEvent('input', true, true);
                inputElement.dispatchEvent(event);
            }
        }
    });

    function setActive(items, index) {
        if (!items || !items.length) return false;

        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("autocomplete-active");

        // Change input value and notify
        inputElement.value = currentItems[index].formatted;
        callback(currentItems[index]);
    }

    function closeDropDownList() {
        const autocompleteItemsElement = inputContainerElement.querySelector(".autocomplete-items");
        if (autocompleteItemsElement) {
            inputContainerElement.removeChild(autocompleteItemsElement);
        }

        focusedItemIndex = -1;
    }

    function addIcon(buttonElement) {
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        svgElement.setAttribute('viewBox', "0 0 24 24");
        svgElement.setAttribute('height', "24");

        const iconElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        iconElement.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
        iconElement.setAttribute('fill', 'currentColor');
        svgElement.appendChild(iconElement);
        buttonElement.appendChild(svgElement);
    }

    /* Close the autocomplete dropdown when the document is clicked. 
      Skip, when a user clicks on the input field */
    document.addEventListener("click", function (e) {
        if (e.target !== inputElement) {
            closeDropDownList();
        } else if (!containerElement.querySelector(".autocomplete-items")) {
            // open dropdown list again
            var event = document.createEvent('Event');
            event.initEvent('input', true, true);
            inputElement.dispatchEvent(event);
        }
    });
}
addressAutocomplete(document.getElementById("autocomplete-container"), (data) => {
    /* Commented out tutorial code, left for future debugging
    console.log("Selected option: ");
    console.log(data);
    */
}, {
    placeholder: "Enter an address here"
});
// *****END Autocomplete Address Code*****

// *****Run Code Below at Load*****
// Loop through the devPicksObj to set the current weather for each location
for (let key in devPicksObj) {
    // Get the location weather and add to html
    globalFunc.getNWSPoints(devPicksObj[key].lat, devPicksObj[key].lon, 0, key);
}

// TO DO - Look into google advert/tracking 'blocked by client' console errors
// TO DO - Check the response header for if the points forecast url expired
// TO DO - Add ability to view the hourly forecast from National Weather Service
// TO DO - Use bbox get location map from openstreetmaps API