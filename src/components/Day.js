import React from 'react';
import styles from './Day.module.css';
import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import Task from './Task';
import moment from 'moment';
import {DropTarget} from 'react-dnd';

/* DAY COMPONENT
 * Renders a div containing a number and color bar based on the relative number of tasks for that day
 * Props: date -- the number that the component should display
 *        task_density -- a number between 0 and 1 inclusive specifying the relative density of tasks for the day
 *        onClick -- calendar fucntion that is called when day is clicked
 */

class Day extends React.Component {
    constructor (props) {
        super(props);
    }

    render () {
      console.log('this.props ', this.props)
        const { connectDropTarget, components } = this.props;
        console.log('dropped components ', components)
        return (
          connectDropTarget(
            <div id={styles.day_container} onClick={() => this.props.onClick(this.props.date)}>
                <p>{this.props.date}</p>
                <div id={styles.color_bar} style={{backgroundColor: this.props.task_density}}/>
            </div>
          )
        );
    }
}

// spec component of DropTarget type Day
// describes how DropTarget reacts to drag and drop events
const spec = {
  drop(props, monitor, component){
      const item = monitor.getItem()
      console.log(monitor.getDropResult());
      props.onDrop(item, props.date)
      return item;
  }
}

// collect component of DropTarget type Day
// returns a plain object of the props to inject into Day component
const collect = (connect, monitor)=>{
return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
};
}

export default DropTarget('form-elements', spec, collect)(Day);
