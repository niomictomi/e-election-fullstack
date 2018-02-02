import React, { Component } from 'react';
import { Button , Card } from 'antd';
import axios from 'axios';
import { getSavedToken, deleteToken } from './config';
import 'antd/dist/antd.css';
import './Home.css';

const authToken = getSavedToken();
class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            elections: []
        };

    }

    componentWillMount()
    {
        axios({
            method: 'post',
            url: 'https://api.artfully11.hasura-app.io/get-elections',

            config: { headers: { 'Content-Type': 'application/json' } }
        })
            .then(response => {
                console.log(response.data);




                this.setState({ elections: response.data });
            })
            .catch(error => {
               alert(`Sorry, can't fetch elections right now!`);
               console.log('Post request failed!');
            });
    }


    onLogout = () => {


        console.log('CLicked logout');
        const authToken = getSavedToken();
        if (authToken) {
            deleteToken();
        }
        else {
            alert('Please login at /auth first');
        }

    }

//Add Ant.Design components like lists etc. below
    render() {
        return (
            <div className="App" style={styles.container}>

              <div style={styles.side}>
                <p>hello</p>
              </div>

              <div>

              <h1>Welcome to E Election</h1>
              <div>
                  <Button type="primary" href="/get-credentials">Get Credentials</Button>
                  <Button type="primary" onClick={this.onLogout}>Logout</Button>
              </div>
              <div>
              <h1>All Elections</h1>
                      {this.state.elections.map(function (election) {
                          return (
                            <div style={{ background: '#ECECEC', padding: '30px' , width: 560 , marginLeft: 20 }}>
                              <Card title={`${election.state} state ${election.post} elections`}
                                extra={<a href={`/election/${election.election_id}`}>View Details</a>} style={{ width: 500 }}
                              >
                                  <br />
                                  <p>Election State: {election.state}</p>
                                  <p>Election Post: {election.post}</p>
                                  <p>Nomination Start Time: {election.nomination_start_time}</p>
                                  <p>Nomination End Time: {election.nomination_end_time}</p>
                                  <p>Election Start Time: {election.election_start_time}</p>
                                  <p>Election End Time: {election.election_end_time}</p>

                              </Card>
                              <br />
                              <br />
                            </div>
                          );
                      })}
              </div>
              </div>

            </div>
        );
    }
}

const styles={
  container:{
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  side:{
    width:'20%',
    hiegth:'100%'
  }
}

export default Home;
