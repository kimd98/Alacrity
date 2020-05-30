import React from 'react';
import TallButton from '../../components/TallButton'
import './index.css'
import Button from '../../components/Button'

import calendar from '../../assets/calendar_icon.png';
import task from '../../assets/task_icon.png';


class Dashboard extends React.Component {

    constructor(props) {
	super(props);
        this.state = { name: "" };
    }

    componentDidMount() {
        fetch('http://cpen291-15.ece.ubc.ca/flask/log')
	        .then(response => response.json())
	    //Grabs the name of the user, using the log in credentials
	        .then(data => this.setState({ name: data.given_name }));
    }

    render() {
        return (
            <div className="App">
              <div id="header">
                <p>WELCOME BACK, {this.state.name.toUpperCase()}!</p>
              </div>
              <div id="dashboard-container">
                  <p id="dashboard-subtitle">WHAT WOULD YOU LIKE TO DO TODAY?</p>
                  <div id = "options">
                    <div class = "column">
                        <TallButton id = "dashboard-button" text="MY CALENDAR" destination="./calendar"  />
                        <img id="logo" src={calendar} alt="logo" onClick={() => window.location.href = "./calendar"} />
                    </div>
                    <div class = "column">
                      <TallButton id = "dashboard-button" text="ADD TASK" destination="./add_task"/>
                      <img id="logo" src={task} alt="logo" onClick={() => window.location.href = "./add_task"} />
                    </div>
                  </div>
                  {/* <div id="options">
                    <div id = "buttons">
                        <TallButton text="MY CALENDAR" destination="./calendar"  />
                        <TallButton text="ADD TASK" destination="./add_task"/>
                    </div>
                    <div id = "logos">
                      <img id="logo" src={calendar} alt="logo" onClick={() => window.location.href = "./calendar"} />
                      <img id="logo" src={task} alt="logo" onClick={() => window.location.href = "./add_task"} />
                    </div>
                  </div> */}
		 <div id="logout-btn">
		    <p onClick={() => window.location.href = "http://cpen291-15.ece.ubc.ca/flask/google/logout"}>LOGOUT FROM GOOGLE</p>
		</div>
              </div>
            </div>
          );
    }
}

export default Dashboard;
