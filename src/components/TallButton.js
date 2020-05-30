import React from 'react';
import styles from './TallButton.module.css';

/* BUTTON COMPONENT
 * Renders a transparent button with a dark gray border
 * Props: text -- the text that the button should display
 *        destination -- the url that the button should redirect to when clicked
 */

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.navigate = this.navigate.bind(this);
    }

    navigate() {
        window.location.href = this.props.destination;
    }

    render() {
        return (
            <div id={styles.tall_btn} onClick={this.navigate}>
                <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Button;
