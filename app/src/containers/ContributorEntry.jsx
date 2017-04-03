import React, { Component } from 'react';
import axios from "axios";
import { Card } from 'semantic-ui-react';
import EditModal from '../components/EditModal.jsx';
import { connect } from 'react-redux'

class ContributorEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      id: "",
      title: "",
      body: "",
      date: "",
      address: "",
      name: "",
      author:""
    }
    this.toggleModal = this.toggleModal.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.updateState = this.updateState.bind(this);
    this.end = this.end.bind(this);
    this.calendar = this.calendar.bind(this);
  }

  componentDidMount() {
    this.updateState();
    if (this.props.isAuthenticated) {
      let authID = this.props.profile.user_id
      let id = authID.split('|')
      axios.get(`http://localhost:3000/users?id=${this.props.contributorID}`)
        .then((res) => {
          let tmp = res.data[0]["id"]
          this.setState({
            author: res.data[0]["firstName"] + ' ' + res.data[0]["lastName"]
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  updateState() {
    this.setState({
      id: this.props.id,
      title: this.props.title,
      body: this.props.body,
      date: this.props.date,
      address: this.props.address,
      contributorID: this.props.contributorID
    })
  }

  toggleModal() {
    this.setState({
      isEditing: !this.state.isEditing
    })
  }

  calendar() {
    var event = {
      'summary': 'example',
      'location': '800 Howard St., San Francisco, CA 94103',
      'description': 'A chance to hear more about Google\'s developer products.',
      'start': {
        'dateTime': '2017-05-28T09:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': '2017-05-28T17:00:00-07:00',
        'timeZone': 'America/Los_Angeles'
      },
      'attendees': [
        {'email': 'lpage@example.com'},
        {'email': 'sbrin@example.com'}
      ],
      'reminders': {
        'useDefault': false,
        'overrides': [
          {'method': 'email', 'minutes': 24 * 60},
          {'method': 'popup', 'minutes': 10}
        ]
      }
    };

    console.log("GAPI: ", gapi);
    gapi.auth2.getAuthInstance().signIn();
    var request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': event
    });

    request.execute(function(event) {
      console.log("GOT HERE")
      appendPre('Event created: ' + event.htmlLink);
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    })
  }

  updateEntry(incomingData) {
    this.setState({
      title: incomingData.title,
      body: incomingData.body,
      address: incomingData.address,
      name: incomingData.name
    })
  }

  end(e) {
    e.stopPropagation()
  }

  render() {
    return (
      <div className="single-entry">
        {this.state.isEditing ? 
          <EditModal resetFlag={this.toggleModal} updateEntry={this.updateEntry} data={this.state}/> 
          : "" }
        <Card id={this.state.id} color="teal" className="entry">
          <Card.Content onClick={this.toggleModal}>
            <span 
              className="remove-btn glyphicon glyphicon-remove" id={this.state.id} 
              onClick={(e) => {this.props.deleteEntry(this.state); this.end(e)}}>
            </span>
            <Card.Header> 
              {this.state.title}
            </Card.Header>
            <Card.Meta>
              {this.state.address}
            </Card.Meta>
            <Card.Description>
              {this.state.body}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <span className="author">Contributed by: {this.state.author}</span>
            <span onClick={this.calendar} className="calendarLink"> Add to Google Calendar </span>
            <span className="date">{this.state.date}</span>
          </Card.Content>
        </Card>
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

export default ContributorEntry = connect(mapStateToProps)(ContributorEntry)
