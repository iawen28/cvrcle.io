import React, { Component } from 'react';
import ReactDOM from "react-dom";
import axios from 'axios';
import NavBar from '../NavBar/NavBar.js';
import { Card, Header, Icon, Image } from 'semantic-ui-react';
import { hashHistory } from 'react-router';
import { Link } from 'react-router';
import $ from 'jquery';
import { connect } from 'react-redux';
import NewItinModal from '../NewItinModal.jsx'

class HomePage extends Component {
  constructor() {
    super();

    this.state = {
      itins: [],
      oid: '',
      isClicked: false
    }

    this.getUserItineraries = this.getUserItineraries.bind(this);
    this.deleteItinerary = this.deleteItinerary.bind(this);
    // this.addUserItinerary = this.addUserItinerary.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      let fbID = this.props.profile.user_id
      let id = fbID.split('|')
      axios.get(`http://localhost:3000/users?fbID=${id[1]}`)
        .then((res) => {
          let tmp = res.data[0]["id"]
          this.setState({
            oid: tmp
          })
        })
        .then(() => {
          this.getUserItineraries();
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  getUserItineraries() {
    axios.get(`http://localhost:3000/itineraries?ownerID=${this.state.oid}`)
      .then((res) => this.setState({ itins: res.data }))
      .catch(err => console.log(err))
  }

  deleteItinerary(e) {
    e.preventDefault();

    const id = e.target.dataset.id;
    const oid = e.target.dataset.ownerid;

    axios.delete(`http://localhost:3000/itineraries?id=${id}&ownerID=${oid}`)
      .then((res) => {
        $('#id-' + id).remove();
      })
      .catch(err => console.log(err))
  }

  toggleModal() {
    this.setState({
      isClicked: !this.state.isClicked
    })
  }

  render() {
    return (
      <div className="itin-container container">
        <div>
          <Header as='h2' icon textAlign='center'>
            <Header.Content>
              Itineraries
                <span className="add-itin"><button className="btn btn-primary" onClick={this.toggleModal}>New</button></span>
            </Header.Content>
          </Header>
        </div>
        {this.state.isClicked ?
          <NewItinModal
          /> : ""}

        {this.state.itins ? this.state.itins.map((itin) => (
          <Card id={"id-" + itin.id} color="red" href={`/#/itinerary?itinID=${itin.id}`}>
            <Card.Content>
              <span
                className="glyphicon glyphicon-remove"
                data-id={itin.id} data-ownerid={itin.ownerID}
                onClick={this.deleteItinerary}
              ></span>
              <Card.Header>{itin.itinName}</Card.Header>
            </Card.Content>
            <Card.Content extra>
              Created: {itin.created_at.substring(0, 10)}
            </Card.Content>
          </Card>
        )) : "No itineraries yet!"}
      </div>

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

export default HomePage = connect(mapStateToProps)(HomePage)