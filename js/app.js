// a map of all motor vehicle crashes where people were killed in the past year
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
    // alert("Retrieved " + data.length + " records from the dataset!");
    console.log(data);
    console.log(data.features)
    console.log(data.features[0].geometry.coordinates[0])
    console.log(data.features[0].properties.number_of_persons_killed)
    console.log(data.features[0].properties)

    mapboxgl.accessToken = 'pk.eyJ1IjoicHNwYXVzdGVyIiwiYSI6ImNsZ2JxN3p4djAyZDkzZ3BmOGR1ZTVhcWQifQ.499a8nIbNZgnjPf0qIGx8g';
    const NYC_COORDINATES = [-74.00214, 40.71882]

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/light-v11', // style URL
        center: NYC_COORDINATES, // starting position [lng, lat]
        zoom: 10, // starting zoom
        bearing: 0,
        pitch: 0
    });


    //maybe actually use the GEOJSON?
    // think about a cluster layout
    // data.features.forEach(function (fatalCrash) {
    //     if (fatalCrash.geometry === null) return
    //     // create the popup
    //     const popup = new mapboxgl.Popup({ offset: 25 }).setText(
    //         `${fatalCrash.properties['number_of_pedestrians_killed']} pedestrian(s) was(were) killed by a ${fatalCrash.properties['vehicle_type_code1']} due to ${fatalCrash.properties['contributing_factor_vehicle_1']}`
    //     );

    //     // map center point and add geometry
    //     new mapboxgl.Marker({
    //         color: "#00000"
    //     })
    //         .setLngLat([fatalCrash.geometry.coordinates[0], fatalCrash.geometry.coordinates[1]])
    //         .setPopup(popup)
    //         .addTo(map);
    // })

    map.on('load', function () {

        console.log(map.getStyle().layers)


        map.addSource('my-points', {
            type: 'geojson',
            data: data
        })

        map.addLayer({
            id: 'circle-my-points',
            type: 'circle',
            source: 'my-points',
            paint: {
                'circle-opacity': 0.6,
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
            .setHTML(`${e.features[0].properties.number_of_persons_killed} ${singPlural} ${verb} killed by a ${e.features[0].properties.vehicle_type_code1.toLowerCase()} due to ${e.features[0].properties.contributing_factor_vehicle_1.toLowerCase()}`)
            .addTo(map)
    });

    map.on('mousemove', 'circle-my-points', (event) => {
        map.getCanvas().style.cursor = 'pointer';
    })

    map.on('mouseleave', 'circle-my-points', (e) => {
        map.GetCanvas().style.cursor - ''
    })

});





