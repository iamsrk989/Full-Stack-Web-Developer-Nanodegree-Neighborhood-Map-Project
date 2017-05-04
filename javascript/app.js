var map;

var Location = function(data) {
    var self = this;
    self.id = data.id;
    self.title = data.title;
    self.location = data.location;
    self.visible = ko.observable(true);
    self.cuisine = data.Cuisine;

        var largeInfowindow = new google.maps.InfoWindow();
        // Create a marker per location, and put into markers array.
        this.marker = new google.maps.Marker({
            position: data.location,
            title: data.title,
            animation: google.maps.Animation.DROP,
            id: data.id,
            cuisine: data.Cuisine,
            map: map
        });

        // Create an onclick event to open an infowindow at each marker.
        this.marker.addListener('click', function() {
            var self = this;
            self.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                self.setAnimation(null);
            }, 500);
            populateInfoWindow(this, largeInfowindow);
        });
};

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        var zomatoApiKey = "91f02ccf04d6069f3cd447517d9f83ff"
        var zomatoUrl = 'https://developers.zomato.com/api/v2.1/restaurant?res_id='+
             marker.id + '&apikey=' + zomatoApiKey;
        $.getJSON(zomatoUrl).done(function(data) {
          var results = data;
          var Url = results.url;
          var street = results.location.address;
          var city = results.location.city;
          var cuisines = results.cuisines;
          var img = results.thumb;
          var rating = results.user_rating.aggregate_rating;

            infowindow.marker = marker;
            infowindow.close();
            infowindow.setContent( '<div align="center">' +
            '<img src="' + img + '" alt="Image">' +'<div><b>'
            + marker.title + "</b></div>" + '<div><a href="' +
            Url +'">' + Url + "</a></div>" + '<div>' + street +
            "</div>" + '<div>' + city + "</div>" +
            '<div>' + "<b>" + "Cuisines:   " + "</b>" +
            cuisines + "</div>" + '<div>' + "<b>" + "Rating: "
            + "</b>" + rating + "</div>" + "</div>");
            infowindow.open(map, marker);
            // The Marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

         }).fail(function() {
    alert("Unable to load Zomato data. Sorry For the inconvinience try again later.");
  });
    }
}

function mapLoadError() {
  alert("Google Maps is Unable to load please try again later.");
}

var appViewModel = function() {
    var self = this;

    var locations =  ko.observableArray([
      {
        id: 68553,
        title: 'Cream Center Annanagar',
        location: {lat: 13.0902261, lng: 80.2160096},
        Cuisine: 'North Indian Italian Mexican'
      },
      {
        id: 66554,
        title: 'AL Maza',
        location: {lat: 13.0837603, lng: 80.2203494},
        Cuisine: 'Arabian Mughlai North Indian Biryani'
      },
      {
        id: 65518,
        title: 'Savoury Sea Shell',
        location: {lat: 13.0875169, lng: 80.2184065},
        Cuisine: 'Arabian Chinese North Indian Biryani Kerala'
      },
      {
        id: 65343,
        title: 'McDonalds',
        location: {lat: 13.0849308, lng: 80.2174151},
        Cuisine: 'Beverages Fast Food Desserts Ice Cream Finger Food'
      },
      {
        id: 71439,
        title: 'Starbucks',
        location: {lat: 13.0850625, lng: 80.2124509},
        Cuisine: 'Cafe'
      },
      {
        id: 66013,
        title: 'Kimling Restaurant',
        location: {lat: 13.084608, lng: 80.212579},
        Cuisine: 'Chinese'
      },
      {
        id: 65285,
        title: 'KFC',
        location: {lat: 13.0853044, lng: 80.2039558},
        Cuisine: 'American Fast Food'
      },
      {
        id: 65566,
        title: 'The Cascade',
        location: {lat: 13.0839432, lng: 80.2099327},
        Cuisine: 'Seafood Chinese Asian Thai'
      },
      {
        id: 73142,
        title: 'Double Roti',
        location: {lat: 13.0822176, lng: 80.2128198},
        Cuisine: 'Cafe American Fast Food Burger'
      },
      {
        id: 65252,
        title: 'Jack N Jill',
        location: {lat: 13.0919647, lng: 80.2103473},
        Cuisine: 'Chinese North Indian Seafood'
      }
    ]);

    self.search = ko.observable('');
    self.searching = ko.observable('');
    self.markers = ko.observableArray();
    //Create a new map
    var myLocality =
    {
        zoom: 15,
        center: {lat: 13.0867772, lng: 80.214354},
        mapTypeControl: false
    };

    map = new google.maps.Map(document.getElementById('map'), myLocality);


    for (var i = 0; i < locations().length; i++) {
        var restaurant = new Location(locations()[i]);
        self.markers.push(restaurant);
    }
    //
    self.searchByName = ko.computed(function() {
        var restaurantName = self.search().toLowerCase();
        for (var i = 0; i < self.markers().length; i++) {
            if (self.markers()[i].title.toLowerCase().indexOf(restaurantName) >= 0) {
                self.markers()[i].visible(true);
                if (self.markers()[i].marker) {
                    self.markers()[i].marker.setVisible(true);
                }
            } else {
                self.markers()[i].visible(false);
                if (self.markers()[i].marker) {
                    self.markers()[i].marker.setVisible(false);
                }
            }
        }
    });

    self.searchByCusine = ko.computed(function() {
        var cuisineName = self.searching().toLowerCase();
        for (var i = 0; i < self.markers().length; i++) {
            if (self.markers()[i].cuisine.toLowerCase().indexOf(cuisineName) >= 0) {
                self.markers()[i].visible(true);
                if (self.markers()[i].marker) {
                    self.markers()[i].marker.setVisible(true);
                }
            } else {
                self.markers()[i].visible(false);
                if (self.markers()[i].marker) {
                    self.markers()[i].marker.setVisible(false);
                }
            }
        }
    });

    self.infoPopup = function (locations) {
        google.maps.event.trigger(locations.marker, 'click');
    };
    document.getElementById('show-listings').addEventListener('click', showListings);

    function showListings() {
      map.setCenter(myLocality.center);
    }
};

function initMap() {
  ko.applyBindings(new appViewModel());
}


