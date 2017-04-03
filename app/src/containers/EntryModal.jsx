import React, { Component } from 'react';
import axios from 'axios';
import { Button, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress, geocodeByPlaceId } from 'react-places-autocomplete';
import { connect } from 'react-redux';
import GOOGLE_API_KEY from '../../../config.js';

const qs = require('qs');

class EntryModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      formTitle: "",
      formAuthor: "",
      formBody: "",
      address: '',
      contributorID: '',
    }
    // function binds
    this.close = this.close.bind(this);
    this.handleInputchange = this.handleInputchange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.getQueryParams = this.getQueryParams.bind(this);

    this.itinID = Number(this.getQueryParams('itinID'));
  }

  close() {
    this.setState({showModal: false}, () => {
      this.props.resetFlag();
    });
  }
  
  getQueryParams(param) {
    var query = window.location.hash.substring(1);
    var vars = query.split("?");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == param){return pair[1];}
    }
    return(false);
  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      let authID = this.props.profile.user_id
      let email = this.props.profile.email;
      let id = authID.split('|');
      axios.get(`http://localhost:3000/users?email=${email}`)
        .then((res) => {
          let tmp = res.data[0]["id"]
          this.setState({
            contributorID: tmp
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  handleInputchange(e) {
    const name = e.target.name;
    const val = e.target.value;
    
    const obj = {};
    obj[name] = val;
    this.setState((prevState, props) => {
      return obj;
    });
  }

  // functions for location search bar
  onChange = (address) => {
    this.setState({ address })
  }

  handleFormSubmit = (event) => {
    event.preventDefault()
    const { address } = { address: this.state.address }

    geocodeByAddress(address,  (err, { lat, lng }) => {
      if (err) { console.log('Error', err) } 
      const key = GOOGLE_API_KEY
      let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
      //axios call to google maps api with lat and lng
      axios
        .get(url)
        .then((response) => {
          // formatting object that gets sent to the database + gets updated to app state
          let locationToDatabase = { 
            title: this.state.formTitle,
            body: this.state.formBody,
            lat: lat,
            lng: lng,
            name: address,
            address: response.data.results[0].formatted_address,
            contributorID: this.state.contributorID,
            itinID: this.itinID
          };

          axios
            .post('http://localhost:3000/entries', qs.stringify(locationToDatabase))
            .then((response) => {
              this.props.newEntryAdded(locationToDatabase);
            })
            .catch((err) => {
              if (err) {console.log(err)}
            })
        })
        .catch((err) => {
          if (err) {console.log(err)}
        })
    })
    this.close();
  }

  render() {
    // cssClasses and myStyles is req'd for styling location search bar
    const cssClasses = {
      root: 'form-group',
      input: 'form-control',
      autocompleteContainer: 'my-autocomplete-container'
    }
    const myStyles = {
      input: { width: '100%' },
      autocompleteContainer: { backgroundColor: 'green' },
      autocompleteItem: { color: 'black' },
      autocompleteItemActive: { color: 'blue' }
    }

    const AutocompleteItem = ({ formattedSuggestion }) => (
      <div>
        <strong>{ formattedSuggestion.mainText }</strong>{' '}
        <small>{ formattedSuggestion.secondaryText }</small>
      </div>
    )

    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>Add New Activity</Modal.Header>
        <Modal.Body>
          <form>
            <FormGroup>
              <ControlLabel>Title</ControlLabel>
              <FormControl 
                name="formTitle" 
                onChange={this.handleInputchange} 
                componentClass="input" 
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Location</ControlLabel>
              <PlacesAutocomplete
                value={this.state.address}
                onChange={this.onChange}
                autocompleteItem={AutocompleteItem}
                classNames={cssClasses}
                styles={myStyles}
                placeholder={"Search Places..."}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl 
                name="formBody" 
                onChange={this.handleInputchange} 
                componentClass="textarea" 
              />
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="btn btn-primary" 
            onClick={this.handleFormSubmit}
          >Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  const { isAuthenticated, profile, error } = state.auth
  return {
    isAuthenticated,
    profile
  }
}

export default EntryModal = connect(mapStateToProps)(EntryModal)



