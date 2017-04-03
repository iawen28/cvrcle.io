import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from "axios";
import { Container, Header, Card, Message, Segment, Form } from 'semantic-ui-react';
import ContributorEntry from '../../containers/ContributorEntry.jsx';
import GoogleMap from '../../containers/map.jsx';
import AddNewEntry from '../AddNewEntry.jsx';
import NavBar from '../NavBar/NavBar.js';

/**
 * @description:  Individual itinerary view
 *                Holds the map view with markers and card list of entries
 */

class Itinerary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      newEntry: false,
      markers: [],
      itinID: '',
      itinName: '',
    };

    this.newEntryAdded = this.newEntryAdded.bind(this);
    this.getUserEntries = this.getUserEntries.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.getQueryParams = this.getQueryParams.bind(this);
    this.getItinName = this.getItinName.bind(this)

    this.itinID = Number(this.getQueryParams('itinID'));
  }
  
  // gets itineraryID from the url
  getQueryParams(param) {
    var query = window.location.hash.substring(1);
    var vars = query.split("?");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == param) { return pair[1]; }
    }
    return (false);
  }

  // request to database for the specific itinerary then
  // sets state for entries to pass down to GoogleMap and ContributorEntry
  getUserEntries() {
    axios.get('http://localhost:3000/entries?itinID=' + this.itinID)
      .then((res) => {
        this.setState({ entries: res.data })
        if (res.data.length) {
          this.createMarkers(res.data);
        } else {
          // if there are no entries in the db, map defaults to current geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              let pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              map.setCenter(pos);
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }

  componentWillMount() {
    this.getUserEntries();
    this.getItinName();
  }

  // gets the itinerary for title of the page
  getItinName() {
    axios.get('http://localhost:3000/itineraries?id=' + this.itinID)
      .then((res) => {
        this.setState({
          itinName: res.data[0].itinName
        })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  createMarkers(data) {
    // grabs existing locations from database and renders them onto the map
    data.forEach((location) => {
      let center = {
        lat: location.lat,
        lng: location.lng
      }
      // each new marker instance
      let marker = new google.maps.Marker({
        position: center,
        map: window.map,
        title: location.name
      })
      // content for infowindow
      let contentString = '<div id="content">' +
        '<div id="siteNotice">' +
        '</div>' +
        `<h5 id="firstHeading" class="firstHeading">${location.name}</h5>` +
        '<div id="bodyContent">' +
        `<p>${location.body}</p>` +
        '</div>' +
        '</div>';
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
      this.state.markers.push(marker);
      window.markerBounds.extend(center);
    })

    //resets map bounds
    window.map.fitBounds(window.markerBounds);
  }

  newEntryAdded(newLocation) {
    // resets state with the new location added to entries array
    let tmp = this.state.entries
    tmp.push(newLocation)
    this.setState({
      entries: tmp
    })
    let center = {
      lat: newLocation.lat,
      lng: newLocation.lng
    }
    window.markerBounds.extend(center)
    window.map.fitBounds(window.markerBounds);

    // new marker for the new entry
    let marker = new google.maps.Marker({
      position: center,
      map: window.map
    })
    let contentString = '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      `<h5 id="firstHeading" class="firstHeading">${newLocation.name}</h5>` +
      '<div id="bodyContent">' +
      `<p>${newLocation.body}</p>` +
      '</div>' +
      '</div>';
    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    marker.addListener('click', function () {
      infowindow.open(map, marker);
    });
    this.state.markers.push(marker);
    return marker;
  }

  deleteEntry(entry) {
    // prevent modal from popping up
    event.preventDefault();
    event.stopPropagation();
    
    let arr = this.state.entries
    arr.forEach((item, i) => {
      if (item.id === entry.id) {
        arr.splice(i, 1);
        this.state.markers[i].setMap(null);
        axios.delete(`http://localhost:3000/entries?id=${entry.id}&itinID=${this.itinID}`)
          .then(() => {
            this.setState({
              entries: arr
            })
          })
          .catch(err => console.log(err))
      }
    })
    // window.map.fitBounds(window.markerBounds);    
  }

  render() {
    return (
      <div>
        <div className="container">
          <h2 className="itin-name">{this.state.itinName}</h2>
          <div className="map-view">
            <GoogleMap locations={this.state.entries} />
            <AddNewEntry className="add-entry" data={''} newEntryAdded={this.newEntryAdded} />
          </div>
          <div className="entries">
            <div>
              <Card.Group className="existing-entries">
                {this.state.entries.length ?
                  (this.state.entries.map((entryData, i) => (
                    <ContributorEntry key={i} {...entryData} deleteEntry={this.deleteEntry} />))) :
                  <div style={{ 'margin': 'auto' }} className="text-center">No entries yet!</div>
                }
              </Card.Group>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Itinerary

