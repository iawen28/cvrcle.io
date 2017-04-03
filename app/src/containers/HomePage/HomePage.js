import React, { Component } from 'react';
import ReactDOM from "react-dom";
import axios from 'axios';
import NavBar from '../../components/NavBar/NavBar.js';
import { Card, Header, Icon, Image, Circular } from 'semantic-ui-react';
import { hashHistory } from 'react-router';
import { Link } from 'react-router';
import $ from 'jquery';
import { connect } from 'react-redux';
import NewItinModal from '../../components/NewItinModal.jsx'

/**
 * @description:  HomePage.js renders a unique homepage for every user after logging in
 *                Has their profile (picture + name) and their list of itineraries
 *                + receives props from redux store (for user ID)
 * @class HomePage
 * @extends {Component}
 */

 class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      itins: [],
      oid: '',
      isClicked: false,
      googleLogin: false,
      userPicture: ''
    }
    this.getUserItineraries = this.getUserItineraries.bind(this);
    this.deleteItinerary = this.deleteItinerary.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.newItinAdded = this.newItinAdded.bind(this);
    this.addNewUser = this.addNewUser.bind(this);
  }

  // gets owwner id information from redux store, then grabs list of itineraries from the database
  componentDidMount() {
    if (this.props.isAuthenticated) {
      let authID = this.props.profile.user_id;
      let email = this.props.profile.email;
      let id = authID.split('|');
      if ((id[0]).includes('google')) {
        this.setState({
          googleLogin: true
        }, function(){console.log({"googleLogin": this.state.googleLogin})});
      }
      axios.get(`http://localhost:3000/users?email=${email}`)
      .then((res) => {
        if (res.data.length === 0) {
          this.addNewUser(id[1]);
        } else if (this.state.googleLogin && (res.data.gID === 'none' || res.data.gID == null)) {
          axios.patch(`http://localhost:3000/users?email=${email}`, {
            gID: id[1],
            fbID: res.data[0].fbID
          })
        } else if (res.data.fbID === 'none') {
          axios.patch(`http://localhost:3000/users?email=${email}`, {
            fbID: id[1],
            gID: res.data[0].gID
          })
        }
        this.setState({
          oid: res.data[0]["id"],
          userPicture: res.data[0].picture
        })
      })
      .then(() => {
        this.getUserItineraries();
      })
      .catch((err) => {
        console.log(err);
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

  addNewUser(authID) { 
    let googleID = 'none';
    let facebookID = 'none';
    var that = this;
    if (this.state.googleLogin) {
      googleID = authID;
    } else {
      facebookID = authID;
    };
    let userPic = this.props.profile.picture_large || this.props.profile.picture
    this.setState({userPicture: userPic});
    axios.post(`http://localhost:3000/users`, {
      firstName: that.props.profile.given_name,
      lastName: that.props.profile.family_name,
      email: that.props.profile.email,
      gID: googleID,
      fbID: facebookID,
      picture: userPic
    })
    .then((res) => {
      console.log("Saved user");
    })
    .catch(err => console.log(err))
    this.close();
  }

  toggleModal() {
    this.setState({
      isClicked: !this.state.isClicked
    })
  }

  newItinAdded(newItin) {
    let tmp = this.state.itins
    tmp.push(newItin)
    this.setState({
      itins: tmp
    })
  }

  render() {
    return (
      <div className="itin-container container">
      {this.state.isClicked ?
        <NewItinModal
        resetFlag={this.toggleModal}
        oid={this.state.oid}
        newItinAdded={this.newItinAdded}
        /> : ""}
        <div className="col-xs-5">
        <div className="ui card profile-picture" style={{width: 325}}>
        <img className="ui image" src={this.state.userPicture} style={{ width: 325, height: 325 }} />
        <div className="content">
        <div className="header">{this.props.profile.name}</div>
        <div className="description">Welcome. Where will you be headed to next?</div>
        </div>
        </div>
        </div>
        <div className="col-xs-7 itin-list">
        <Header as='h2' icon textAlign='center'>
        <Header.Content>
        Your Itineraries
        <span className="add-itin"><button className="btn btn-primary" onClick={this.toggleModal}>New</button></span>
        </Header.Content>
        </Header>
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
      