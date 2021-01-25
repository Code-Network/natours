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
  style: 'put your style mapbox cdn here',
  scrollZoom: false,
  // center: [-118.11349, 34.111745],
  // zoom: 1
  // interactive: true,
  // trackResize: true,
  pitch: 45
});

/*
    TODO:
     -- Create a bound var that automatically figures out the position
     of the map based on our tour location points
     -- Put all the locations for a certain tour on the map and figure out which
     portion of the map to display in order to fit all the tour coordinates.
     -- LatLngBounds() is the area that will be displayed on the map.
 */
const bounds = new mapboxgl.LngLatBounds();

// Extend LatLngBounds with all the locations in our locations array
locations.forEach(loc => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup to display location
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
