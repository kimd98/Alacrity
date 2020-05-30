import React from 'react';
import './Task.css';
import { useRef } from 'react';
import { useDrag, useDrop, DragSource } from 'react-dnd';


/* TASK COMPONENT
 * Renders a task with a name, due date, and block length
 * Props: block_date -- date in which the task occurs
 *        name --- task name
 *        isDrag --- function to determine valid drop dates when a task is picked up
 *        due_date --- the task's due date
 *        taskID -- the id of the task
 *        length_minutes -- the length of the task block in minutes
 */

const type = "Task"; // Need to pass which type element can be draggable, its a simple string or Symbol. This is like an Unique ID so that the library know what type of element is dragged or dropped on.

const Task = ({length_minutes, block_date, taskID, name, onDrag, due_date}) => {

  const ref = useRef(null); // Initialize the reference
  const Types = {
    TASK: 'Task',
  }
/**
 * Specifies the drag source contract.
 * Only `beginDrag` function is required.
 */
  const TaskDrag = {
    beginDrag(props, monitor, component) {
      // Return the data describing the dragged item
      const item = {name: this.name, due_date: this.due_date }
      return item
    },
    endDrag(props, monitor, component) {
      if (!monitor.didDrop()) {
        // You can check whether the drop was successful
        // or if the drag ended but nobody handled the drop
        return
       }
     }
   }

  /**
   * Specifies which props to inject into your component.
   */
  function collect(connect, monitor) {
    return {
      // Call this function inside render()
      // to let React DnD handle the drag events:
      connectDragSource: connect.dragSource(),
    }
  }

  // useDrop hook is responsible for handling whether any item gets hovered or dropped on the element
  const [, drop] = useDrop({
    // Accept will make sure only these element type can be droppable on this element
    accept: type,
    hover(item) {
    }
  });

  // useDrag will be responsible for making an element draggable. It also expose, isDragging method to add any styles while dragging
  const [{ isDragging }, drag] = useDrag({
    // item denotes the element type, unique identifier (id) and the index (position)
    item: {type},
    // collect method is like an event listener, it monitors whether the element is dragged and expose that information
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  /*
    Initialize drag and drop into the element using its reference.
    Here we initialize both drag and drop on the same element (i.e., Image component)
  */
  drag(drop(ref));

  function isDrag() {
    return isDragging;
  }
  // Add the reference to the element
  return (
    <div
      id="tsk"
      ref={ref}
      onDrag={() => isDrag()} // on initial drag, do smt
      style={{ opacity: isDragging ? 0 : 1,
               width: isDragging ? "30%" : "100%"}}>
      <p>{isDragging ? "" : name}</p>
    </div>
  );
};

export default Task
