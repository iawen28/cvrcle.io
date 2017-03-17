import React, { Component } from 'react';
import ReactDOM from "react-dom";
import axios from "axios";
import { Card, Modal } from 'semantic-ui-react';
import EditModal from './EditModal.jsx';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Redux from 'redux'

class ContributorEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      id: "",
      title: "",
      author: "",
      body: "",
      date: "",
      address: "",
      name: ""
    }

    this.toggleModal = this.toggleModal.bind(this);
    this.updateEntry = this.updateEntry.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.updateState();
  }

  updateState() {
    this.setState({
      id: this.props.id,
      title: this.props.title,
      author: this.props.author,
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

  updateEntry(incomingData) {
    this.setState({
      title: incomingData.title,
      body: incomingData.body,
      address: incomingData.address,
      author: incomingData.author,
      name: incomingData.name
    })
  }

  render() {
    return (
      <div className="single-entry">
        {this.state.isEditing ? 
          <EditModal resetFlag={this.toggleModal} updateEntry={this.updateEntry} data={this.state}/> :
          ""
        }
        <Card id={this.state.id} color="teal" className="entry" onClick={this.toggleModal}>
          <Card.Content>
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
            <span className="author">Contributed By: {console.log('looking for props', this.props.userSession[0].id)}</span>
            <span className="date">{this.state.date}</span>
          </Card.Content>
        </Card>
      </div>
    );
  }
}

// export default ContributorEntry;

const mapStateToProps = (state) => {
  console.log('in mapStateToProps', state.userSession)
  return {
    userSession: state.userSession
  }
}

// const mapDispatchToProps = (dispatch) => {
//   return bindActionCreators({ TestSession }, dispatch);
// }

export default connect(mapStateToProps)(ContributorEntry);
