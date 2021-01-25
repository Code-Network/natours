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

mapboxgl.accessToken = 'Put your access token here';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'style mapbox cdn'
  // center: [-118.11349, 34.111745]
  // zoom: 10,
  // interactive: true,
  // trackResize: true,
  // pitch: 45
});

/*
    TODO:
     -- Create a bound var that automatically figures out the position
     of the map based on our tour location points
     -- Put all the locations for a certain tour on the map and figure out which
     portion of the map to display in order to fit all the tour coordinates.
     -- LatLngBounds() is the area that will be displayed on the map.
 */
const bounds = new mapboxgl.LatLngBounds();

// Extend LatLngBounds with all the locations in our locations array
locations.forEach(loc => {
  /*  Add marker from .marker class in our CSS file
       .marker {
           background-image: url('../img/pin.png');
           background-size: cover;
           width: 32px;
           height: 40px;
           cursor: pointer;
       }

   */
  const el = document.createElement('div');
  el.className = 'marker;';
});
