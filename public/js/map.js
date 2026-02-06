
    mapboxgl.accessToken = mapToken
    const map = new mapboxgl.Map({
        container : 'map',
        center: coordinates, // starting position [lng, lat]. Default to New Delhi   listing.geometry.coordinates
        zoom: 9 // starting zoom
        });

    console.log(coordinates);

    const marker = new mapboxgl.Marker({color: "green"})
    .setLngLat(coordinates)//listing.germoetry.coordinates
    .setPopup(new mapboxgl.Popup({offset:25})
    .setHTML(
       `<h4> ${listing.location}</h4> <p>Exact location will be provided after booking</p>`
    ))
    .addTo(map);
