import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import Task from './Task';

import './Task.css';

const imgURL = 'https://images.emojiterra.com/twitter/v12/512px/1f7e3.png';
class Sidebar extends React.Component {
    render() {
      return(
        <div id="task-list" className="Sidebar">
            {this.props.tasksOnSelected.map((task) => (
                <ListItem key={task.name} component={task.name} id={task.id} due_date={task.due_date} num_hours={this.props.hoursMap[task.id]} />
            ))}
        </div>

      )
    }
}

const spec = {
  beginDrag(props, monitor, component) {
    const item = { ...props };
    console.log('beginDrag', item)
    return item;
  },
};

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

const ListItem = DragSource("form-elements", spec, collect)(class extends Component {

  componentDidMount() {
    const img = document.createElement('img');
    img.setAttribute('src', imgURL);
    this.props.connectDragPreview(
	<div>
	    <p>Hello</p>
	</div>
    )
  }

  render() {
    const { connectDragSource, component, id, due_date, num_hours } = this.props;
    return (
      connectDragSource(
        <div id="tsk">
          <p style={{fontWeight: "#c75946"}}>{component}</p>
          <p style={{color: "#e1e1e1"}}>Hours: {num_hours}</p>
          <p style={{color: "#e1e1e1"}}>Due: {due_date}</p>
	  <p style={{color: "red"}} onClick={ async (id) => {
                console.log(this.props.id);
                await fetch('http://cpen291-15.ece.ubc.ca/flask/delete?query=DELETE FROM time_blocks WHERE task_id = "' + this.props.id + '"&values=null', {method: 'POST'} );
                await fetch('http://cpen291-15.ece.ubc.ca/flask/delete?query=DELETE FROM tasks WHERE id = "' + this.props.id + '"&values=null', {method: 'POST'});
                window.location.reload();
          }}>
                DELETE
        </p>
        </div>
      )
    )
  }
})

export default Sidebar
