/* eslint-disable */

/*
 TODO: Wrap all map functionality into a function which will
    be exported to index.js export function displayMap that will
    take in array of locations that will be then be read
    in the index.js file;
 Note: index.js will be used to get data from the user
    interface, so, from the website, and then will delegate
    some actions into these other modules
 */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia29rb2RldiIsImEiOiJja2tjcGp3eXcwMnEyMnZvNWhiYmI2YzNnIn0.WP6FZ9ufCyuzw1L-utBMJQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kokodev/ckkcvdhlc25np17mtynej0adn',
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
};
