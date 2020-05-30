import React from 'react';
import logo from '../../assets/logo.svg';
import './index.css';
import Button from '../../components/Button'


class LandingPage extends React.Component {

    
    render() {
        return (
            <div className="App">
            <header className="App-header">
                <div id="wrapper">
                    <img id="logo" src={logo} className="App-logo" alt="logo" />
                    <p id="title">ALACRITY</p>
                </div>
            //Logging in with google redirects the user to the usual google login page
                <p id="subtitle">YOUR PERSONAL PRODUCTIVITY TOOL</p>
                <Button text="LOGIN WITH GOOGLE" destination="http://cpen291-15.ece.ubc.ca/flask/google/login" />
            </header>
            </div>
        );
    }
}

export default LandingPage;
