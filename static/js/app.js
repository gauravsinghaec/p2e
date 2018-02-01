// These are the neighborhood locations that will be shown to the user.
// Normally we'd have these in a database instead.

/*
$.getJSON(locationURL , function( data ) {
		console.log(data);
	}).done(function() {
    	console.log( "second success" );
    }).fail(function() {
    	// $nytHeaderElem.text("Restaurant Data Could Not Be Loaded");
    	console.log( "error" );
    }).always(function() {
    	console.log( "complete" );
});    
*/

var locationURL = 'https://p2e.herokuapp.com/location.json';
$.ajax({
	type: "GET",
	url: locationURL,
	headers: {
      'Content-Type': 'application/json',
  	}
	}).done(function(response) {
	var intialLocationsFromServer = response['Places'];
// var intialLocationsFromServer =  [
// 	{
// 		title: 'Amer Fort, Jaipur', 
// 		location: {lat: 26.996471, lng: 75.876472}
// 	},
// 	{
// 		title: 'Jodhpur, Rajasthan', 
// 		location: {lat: 26.263863, lng: 73.008957}                  
// 	},
// 	{
// 		title: 'Pushkar, Rajasthan', 
// 		location: {lat: 26.489679, lng: 74.550941}                  
// 	},
// 	{
// 		title: 'Jaipur, Rajasthan', 
// 		location: {lat: 26.922070, lng: 75.778885}
// 	},
// 	{
// 		title: 'Jaisalmer, Rajasthan', 
// 		location: {lat: 26.911661, lng: 70.922928}                  
// 	},
// 	{
// 		title: 'Ajmer, Rajasthan', 
// 		location: {lat: 26.449896, lng: 74.639915}                  
// 	},
// 	{
// 		title: 'Udaipur, Rajasthan', 
// 		location: {lat: 24.571270, lng: 73.691544}                 
// 	},               
// 	{
// 		title: 'Pokharan, Rajasthan', 
// 		location: {lat: 26.920542, lng: 71.916550}                  
// 	},
// 	{
// 		title: 'Pali, Rajasthan', 
// 		location: {lat: 25.771315, lng: 73.323685}                  
// 	}               
// ];

var Place = function(data){
	this.title = data.title;
	this.position = data.location;
};

var ViewModel = function(){
	var self = this;
	//Create an onclick event to open list view of location.
	//when user click on hamburger menu on mobile
	/*
	var menu = $('#menu');
	var drawer = $('.listview');
	menu.on('click', function(e) {
		drawer.toggleClass('open');
		e.stopPropagation();
	});
	*/
	this.setMenuIcon = ko.observable(false);
	this.showMenuIcon = function(){
		self.setMenuIcon(!self.setMenuIcon());
		console.log(self.setMenuIcon());
	};

	//KO observable for Location Listview
	this.locationList = ko.observableArray([]);
	
	//KO observable for input filter
	this.filterInputText = ko.observable('');
	
	//Initial load in Location list observables using locations MODEL data
	intialLocationsFromServer.forEach(function(place){
		self.locationList.push(new Place(place));
	});
	
	//Callback function for real time text Filter event
	//It shows the filtered marker and filtered list
	this.filterLocationList = function(){
		// var filter = $('#filter-text').val().toUpperCase();
		var filter = self.filterInputText().toUpperCase();
		self.filterWithinLocationList(filter);
		return true;
	};

	//Modular funtion to filter marker on map and location list
	self.filterWithinLocationList = function (inputText){
		for (var i = 0; i < self.markers.length; i++) {
			var refText=self.markers[i].title.toUpperCase();
			if (refText.indexOf(inputText) != -1) {
				self.markers[i].setMap(map);
			} else {
				self.markers[i].setMap(null);
			}
		}
		self.locationList([]);
		intialLocationsFromServer.forEach(function(place){
			var refText=place.title.toUpperCase();
			if (refText.indexOf(inputText) != -1) {
				self.locationList.push(new Place(place));
			}                                    
		});              
	};

	//Callback function for onclick event if a place is selected from the list.
	//It animates the marker and opens an infowindow on it with wiki link data (if available).
	this.selectThisLocation = function(){
		// self.currentLocation(this);
		// $('#filter-text').val(this.title);
		self.filterInputText(this.title);
		self.searchWithinLocationList(this);
	};

	//Modular funtion to filter only the selected place from location list
	self.searchWithinLocationList = function(place){
		for (var i = 0; i < self.markers.length; i++) {
			if (place.title == self.markers[i].title) {
				self.markers[i].setAnimation(google.maps.Animation.BOUNCE);
				populateInfoWindow(self.markers[i], largeInfowindow);
			} else {
				self.markers[i].setAnimation(null);
			}
		}
	};

	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	var populateInfoWindow = function(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			if(infowindow.marker){
				infowindow.marker.setAnimation(null);
			}
			marker.setAnimation(google.maps.Animation.BOUNCE);
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick',function(){
				infowindow.marker = null;
				marker.setAnimation(null);
				self.filterInputText('');
			});

			ajaxCallForWikiData(marker, infowindow);

		}
	};            

	//This function is used to make AJAX call to Wiki API and populate infowindow with data
	// also it shows error message in infowindow if API call fails 
	var ajaxCallForWikiData = function(marker, infowindow) {
		var address = marker.title;
		var wikiurl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+address + '&format=json&callback=wikiCallback';
		
		var wikilink ;           
		var wikilinkdata;                  
		var wikiElemItem ='';
		
		//AJAX call to retrieve data from Wikipedia   
		$.ajax({
			url: wikiurl,
			dataType: 'jsonp'
		}).done(function(response) {
			var addresswikilist = response[1];				
			for (var i=0;i<addresswikilist.length;i++)    {
				wikilinkdata = addresswikilist[i];
				wikilink  = 'http://en.wikipedia.org/wiki/'+ wikilinkdata ;
				wikiElemItem += '<li><a target ="_blank" href="'+wikilink+ '">' +wikilinkdata+ '</a>'+'</li>';
			}
			infowindow.setContent('<h5>' + 'Relevant Wikipedia Links' + '</h5>' + wikiElemItem);
		}).fail(function() {
			infowindow.setContent('<div>' + marker.title + '</div>' +
			'<div>No Wiki Link Found</div>');
		});               
	};

	// Create a new blank array for all the listing markers.
	self.markers = [];
	/* Moved the code to initMap function under inline JavaScript in index.html
	// Constructor creates a new map - only center and zoom are required.
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 26.996471, lng: 75.876472},
		zoom: 10
	});

	self.largeInfowindow = new google.maps.InfoWindow();
	*/
	var bounds = new google.maps.LatLngBounds();

	// The following group uses the location array to create an array of markers on initialize.
	var markerClick = function(){
		populateInfoWindow(this, largeInfowindow);
	};
	for (var i = 0; i < this.locationList().length; i++) {
		// Get the position from the location array.
		var position = self.locationList()[i].position;
		// console.log(Number(position.lat));
		position.lat = Number(position.lat);
		position.lng = Number(position.lng);
		var title = self.locationList()[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// Push the marker to our array of markers.
		self.markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', markerClick);
		bounds.extend(self.markers[i].position);
	}
	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);
};

ko.applyBindings(new ViewModel());

}).fail(function(response) {
		console.log(response)
});
