// a map of all motor vehicle crashes where people were killed in the past year

//grab data from open data portal
$.ajax({
    url: "https://data.cityofnewyork.us/resource/h9gi-nx95.geojson",
    type: "GET",
    async: "false",
    data: {
        "$limit": 5000,
        "$$app_token": "2CyYsCwXD8tqO7Tn1vaeQwcxz",
        "$where": "number_of_pedestrians_killed > 0 AND crash_date > '2023-01-01T00:00:00.000'"
    }
}).done(function (data) {

    mapboxgl.accessToken = 'pk.eyJ1IjoicHNwYXVzdGVyIiwiYSI6ImNsZ2JxN3p4djAyZDkzZ3BmOGR1ZTVhcWQifQ.499a8nIbNZgnjPf0qIGx8g';
    const NYC_COORDINATES = [-74.00214, 40.71882]

    //add a running total to the main text
    var count = data.features.length
    document.getElementById('count').innerHTML = count;

    //set up map
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v11', // style URL
        center: NYC_COORDINATES, // starting position [lng, lat]
        zoom: 10, // starting zoom
        bearing: 0,
        pitch: 0
    });

    //add sources and layers
    map.on('load', function () {

        map.addSource('my-points', {
            type: 'geojson',
            data: data,
            generateId: true
        })

        map.addLayer({
            id: 'circle-my-points',
            type: 'circle',
            source: 'my-points',
            paint: {
                'circle-opacity': 0.6,
                'circle-stroke-width': 1,
                'circle-stroke-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    "white", //add white outline on hover
                    ['match', //otherwise outline is the same as circle color
                        ['get', 'contributing_factor_vehicle_1'],
                        'Unsafe Speed',
                        'red',
                        'Driver Inattention/Distraction',
                        'purple',
                        'Driver Inexperience',
                        'green',
                        'Traffic Control Disregarded',
                        'gold',
                        'Oversized Vehicle',
                        'blue',
                    /*other*/ '#000000']
                ],
                'circle-color': [
                    'match',
                    ['get', 'contributing_factor_vehicle_1'],
                    'Unsafe Speed',
                    'red',
                    'Driver Inattention/Distraction',
                    'purple',
                    'Driver Inexperience',
                    'green',
                    'Traffic Control Disregarded',
                    'gold',
                    'Oversized Vehicle',
                    'blue',
                    /*other*/ '#000000'
                ]
            },
        })

        const layers = [
            'Unsafe Speed',
            'Driver Inattention/Distraction',
            'Driver Inexperience',
            'Traffic Control Disregarded',
            'Oversized Vehicle',
            'Other/Unspecified',
        ];
        const colors = [
            'red',
            'purple',
            'green',
            'gold',
            'blue',
            'black'
        ];


        // create legend
        const legend = document.getElementById('legend');

        layers.forEach((layer, i) => {
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = `${layer}`;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        });


    })

    //create popups and conditional sentence for each point
    map.on('click', 'circle-my-points', (e) => {

        // conditional logic for sentence
        var singPlural = "pedestrians"
        var verb = "were"
        if (e.features[0].properties.number_of_persons_killed === '1') {
            var singPlural = "pedestrian"
            var verb = "was"
        }


        //popups
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`${e.features[0].properties.number_of_persons_killed} ${singPlural} ${verb} killed by a ${e.features[0].properties.vehicle_type_code1.toLowerCase()} due to ${e.features[0].properties.contributing_factor_vehicle_1.toLowerCase()} at ${e.features[0].properties.crash_time} hours on ${e.features[0].properties.crash_date.substring(0, 10)}`)
            .addTo(map)
    });


    let hoveredStateId = null

    // update featurestate when the mouse moves around within the points layer
    map.on('mousemove', 'circle-my-points', (e) => {
        if (e.features.length > 0) {
            if (hoveredStateId !== null) {
                map.setFeatureState(
                    { source: 'my-points', id: hoveredStateId },
                    { hover: false }
                );
                map.getCanvas().style.cursor = 'pointer';
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
                { source: 'my-points', id: hoveredStateId },
                { hover: true }
            );
        }
    });

    // when the mouse leaves the points layer, make sure nothing has the hover featurestate
    map.on('mouseleave', 'circle-my-points', () => {
        if (hoveredStateId !== null) {
            map.setFeatureState(
                { source: 'my-points', id: hoveredStateId },
                { hover: false }
            );
            map.getCanvas().style.cursor = '';
        }
        hoveredStateId = null;
    });

});





