window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  (filterInstances) => {
    console.log('cmsfilter Successfully loaded!');

    const [filterInstance] = filterInstances;
    let listItems = filterInstance.listInstance.items;

    // Initialize the map
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXRoYW5xIiwiYSI6ImNsazIwc3V6MDBiZnozbnFtd3Q1ODdjeWUifQ.b06Fc0rBTSM8Bquhg-cDXw';
    var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/ethanq/cllombele001t01ofh6yz6evy',
      center: [144.977731, -37.823803],
      zoom: 8,
    });

    // Create an empty GeoJSON source for your locations
    map.on('load', function () {
      map.addSource('locations', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add a GeoJSON layer for your locations
      map.addLayer({
        id: 'locations-layer',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 8,
          'circle-color': 'blue',
        },
      });

      // Create arrays to store markers and popups
      var markers = [];
      var bounds = new mapboxgl.LngLatBounds(); // Initialize bounds

      // Function to filter and update the markers and popups
      function filterLocations(locations) {
        // Check if the locations array is empty
        if (locations.length === 0) {
          console.log('No locations to display.');
          return;
        }

        // Remove existing markers
        markers.forEach((marker) => marker.remove());
        markers = [];
        bounds = new mapboxgl.LngLatBounds(); // Reset bounds

        console.log('Filtered Locations:', locations); // Debugging line

        const filteredFeatures = locations.map((location) => {
          return {
            type: 'Feature',
            properties: {
              name: location.name,
            },
            geometry: {
              type: 'Point',
              coordinates: [location.lon, location.lat],
            },
          };
        });

        map.getSource('locations').setData({
          type: 'FeatureCollection',
          features: filteredFeatures,
        });

        // Create and attach popups to filtered markers
        locations.forEach((location) => {
          // Check if location.lon and location.lat are defined
          if (typeof location.lon !== 'undefined' && typeof location.lat !== 'undefined') {
            // Find the corresponding HTML element for this location
            const popupContentElement = location.element.querySelector('.pre-popup');
            if (popupContentElement) {
              console.log('Found popup content for location:', location.name); // Debugging line

              // Create a div with class 'mapboxgl-popup-content'
              const popupContentWrapper = document.createElement('div');
              popupContentWrapper.classList.add('mapboxgl-popup-content');

              // Clone and append the .pre-popup content into the 'mapboxgl-popup-content' div
              popupContentWrapper.appendChild(popupContentElement.cloneNode(true));

              var pop = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                maxWidth: 'auto',
              });

              pop.setDOMContent(popupContentWrapper);

              // Create a marker element with class 'star' for styling
              var markerElement = document.createElement('div');
              markerElement.classList.add('star');

              var mark = new mapboxgl.Marker({ element: markerElement })
                .setLngLat([location.lon, location.lat])
                .setPopup(pop)
                .addTo(map);
              markers.push(mark);

              // Extend the bounds with valid marker coordinates
              bounds.extend([location.lon, location.lat]);
            } else {
              console.log('No popup content found for location:', location.name); // Debugging line
            }
          } else {
            console.log('Skipping invalid coordinates for location:', location.name); // Debugging line
          }
        });

        // Check if the bounds object has valid values
        if (!bounds.isEmpty()) {
          console.log('Bounds:', bounds); // Debugging line

          // Fly to the bounds of the visible markers
          map.fitBounds(bounds, {
            padding: 50, // Adjust the padding as needed
            maxZoom: 15, // Set the maximum zoom level if desired
          });
        } else {
          console.log('No valid coordinates to calculate bounds.');
        }
      }

      // Filter and update the map when list items change
      filterInstance.listInstance.on('renderitems', (renderedItems) => {
        const locations = renderedItems.map((location) => {
          const name = location.element.querySelector('.location-name').innerHTML.trim();
          const lat = parseFloat(location.element.querySelector('.lat').innerHTML);
          const lon = parseFloat(location.element.querySelector('.lon').innerHTML);

          return {
            name,
            lat,
            lon,
            element: location.element,
          };
        });

        // Filter and update the map when list items change
        filterLocations(locations);
      });
    });

    // Add zoom and rotation controls to the map
    map.addControl(new mapboxgl.NavigationControl());

    // Disable map zoom when using scroll
    map.scrollZoom.disable();
  },
]);
