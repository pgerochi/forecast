const {ipcRenderer, shell} = require('electron')

var geocoder = new google.maps.Geocoder();
var img = document.createElement('img');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
} 

//Get the latitude and the longitude;
function successFunction(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  codeLatLng(lat, lng)
}

function errorFunction(){
    alert("Geocoder failed");
}

function initialize() {
  geocoder = new google.maps.Geocoder();
}

function codeLatLng(lat, lng) {
  var latlng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({'latLng': latlng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
      //find country name
        for (var i=0; i<results[0].address_components.length; i++) {
          for (var b=0;b<results[0].address_components[i].types.length;b++) {
           
            if (results[0].address_components[i].types[b] == "locality") {
                    //this is the object you are looking for
                    city = results[0].address_components[i];
                    document.querySelector('.city').textContent = city.long_name;
                    break;
            }
            if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
              //this is the object you are looking for
              province = results[0].address_components[i];
              document.querySelector('.province').textContent = province.long_name;
              break;
      }
          }
        }
      } else {
        console.log("No results found");
      }
    } else {
      console.log("Geocoder failed due to: " + status);
    }
  });
}

document.addEventListener('click', (event) => {
  if (event.target.href) {
    // Open links in external browser
    shell.openExternal(event.target.href)
    event.preventDefault()
  } else if (event.target.classList.contains('js-refresh-action')) {
    updateWeather()
  } else if (event.target.classList.contains('js-quit-action')) {
    window.close()
  }
})

const getGeoLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const getWeather = (position) => {
  // FIXME replace with your own API key
  // Register for one at https://darksky.net/dev/
  const apiKey = '3542a79dafa9d79ee9f25958fdfea0ab'
  const location = `${position.coords.latitude},${position.coords.longitude}`

  const url = `https://api.forecast.io/forecast/${apiKey}/${location}?units=si`

  return window.fetch(url).then((response) => {
    return response.json()
  })
}

const updateView = (weather) => {
  const currently = weather.currently
  console.log(weather.currently);
  img.src = 'assets/img/' + currently.icon + '.svg';
  document.getElementById('weatherIcon').appendChild(img)

  document.querySelector('.summary').textContent = currently.summary
  document.querySelector('.temperature').textContent = `${Math.round(currently.temperature)}`
  document.querySelector('.apparent').textContent = `${Math.round(currently.apparentTemperature)}`

  document.querySelector('.wind').textContent = `${Math.round(currently.windSpeed)} mph`
  document.querySelector('.wind-direction').textContent = getWindDirection(currently.windBearing)

  document.querySelector('.humidity').textContent = `${Math.round(currently.humidity * 100)}%`

  document.querySelector('.precipitation-chance').textContent = `${Math.round(currently.precipProbability * 100)}%`
}

const getWindDirection = (direction) => {
  if (direction < 45) return 'NNE'
  if (direction === 45) return 'NE'

  if (direction < 90) return 'ENE'
  if (direction === 90) return 'E'

  if (direction < 135) return 'ESE'
  if (direction === 135) return 'SE'

  if (direction < 180) return 'SSE'
  if (direction === 180) return 'S'

  if (direction < 225) return 'SSW'
  if (direction === 225) return 'SW'

  if (direction < 270) return 'WSW'
  if (direction === 270) return 'W'

  if (direction < 315) return 'WNW'
  if (direction === 315) return 'NW'

  if (direction < 360) return 'NNW'
  return 'N'
}

const updateWeather = () => {
  getGeoLocation().then(getWeather).then((weather) => {
    // Use local time
    weather.currently.time = Date.now()
    initialize();
    ipcRenderer.send('weather-updated', weather)
    updateView(weather)
    previousWeather = weather
  })
}

// Update initial weather when loaded
document.addEventListener('DOMContentLoaded', updateWeather)
