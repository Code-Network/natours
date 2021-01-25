/* eslint-disable */

/*
 Get location data

 -- Ran into an error where const locations returned an
 Uncaught TypeError: Cannot read property 'dataset' of null

    because the script script(src='/js/mapbox.js')
 was integrated at the beginning of tour.pug while it
 really should be at the bottom of the tour.pug page
 because the DOM is not yet loaded in the beginning.

 -- To fix this error, we remove the script tag from tour.pug
 and put it under the footer in base.pug

 -- Note:  PUG files do not trigger a restart of our server
 */
const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

mapboxgl.accessToken = 'put your token here';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11'
});
