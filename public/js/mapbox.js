export const displayMap = locations => {
	
	mapboxgl.accessToken = 'pk.eyJ1Ijoid2hvaXNhYm9uIiwiYSI6ImNrbXAwMzdoczI5cXQyb2w4ODZxM3UzYjkifQ.3IHdIgc38r-Dr7U5qsWTeg';
	
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/whoisabon/ckmp24lvx3tem17s22da3708e',
		// center: [-118.3406, 34.8358],
		zoom: 7,
		//interactive: false,
		scrollZoom: false
	});

	const bounds = new mapboxgl.LngLatBounds();

	locations.forEach(loc => {

		const el = document.createElement('div');
		el.className = 'marker';

		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom'
		}).setLngLat(loc.coordinates).addTo(map);

		new mapboxgl.Popup({
			offset: 30
		}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

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
}