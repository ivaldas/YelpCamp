mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	// style: 'mapbox://styles/mapbox/light-v10',
	center: campground.geometry.coordinates,
	zoom: 9,
	projection: 'globe'
});

map.addControl(new mapboxgl.NavigationControl());

map.on('style.load', () => {
	map.setFog({});
});

new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${campground.title}</h><p>${campground.location}</p>`))
	.addTo(map);
