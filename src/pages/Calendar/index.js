import React from 'react';
import './index.css';
import Calendar from '../../components/Calendar';
import Day from '../../components/Day';
import moment from 'moment';
import Task from '../../components/Task';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button.js';

class CalendarPage extends React.Component {
    constructor(props) {
        super(props);
        this.flip = this.flip.bind(this);
        this.showTasks = this.showTasks.bind(this);
        this.updateBlocksPerDay = this.updateBlocksPerDay.bind(this);
        this.drop = this.drop.bind(this);
	this.optimize = this.optimize.bind(this);
        //this.showValidDropDates = this.showValidDropDates.bind(this);

        this.state = {
            month: moment().month(),
            year: moment().year(),
            day: moment().day(),
            date: "",
            tasksOnSelected: [],
	    hoursMap: {},
            taskDensities: new Array(40).fill(0),
            max: 0,
            min: Number.MAX_SAFE_INTEGER,
            blocksPerDay: new Array(40).fill(0),
            data: [],
            dropDay: "",
            dropItem: ""
        }

        this.updateBlocksPerDay();
    }

async optimize() {
        let log_response = await fetch('http://cpen291-15.ece.ubc.ca/flask/log');
	let log_response_json = await log_response.json();
	console.log(log_response_json);
        let user_id = (log_response_json["id"]).substring(0, 9);

        let tasks_response = await fetch('http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT * FROM tasks WHERE user_id = "' + user_id + '" ORDER BY due_date&values=null');
        let all_user_tasks = await tasks_response.json();

        if (all_user_tasks.length > 0) {
            // Delete all current time blocks
            var remove_query = 'http://cpen291-15.ece.ubc.ca/flask/delete?query=DELETE FROM time_blocks WHERE';
            for (let i = 0; i < all_user_tasks.length; i++) {
                remove_query = remove_query + ' task_id = "' + all_user_tasks[i]["id"] + '"';
                if (i !== all_user_tasks.length - 1) {
                    remove_query = remove_query + ' OR';
                } else {
                    remove_query = remove_query + '&values=null';
                }
            }

            await fetch(remove_query, { method: 'POST' });
	    
            // Add new tasks (in order of due date and optimized)
            var newBlocks = [];
            for (let i = 0; i < all_user_tasks.length; i++) {
		all_user_tasks[i]["due_date"] = all_user_tasks[i]["due_date"] + ' 23:59:59';
		all_user_tasks[i]["id"] = all_user_tasks[i]["id"] + "";
		all_user_tasks[i]["user_id"] = all_user_tasks[i]["user_id"] + "";
		all_user_tasks[i]["total_hours"] = all_user_tasks[i]["total_hours"] + "";
		console.log(JSON.stringify(all_user_tasks[i]))
                var blocksToAdd = await fetch('https://cpen291-15.ece.ubc.ca/flask/optimize?user_id=' + user_id, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(all_user_tasks[i])
                });
                newBlocks.append(blocksToAdd.json());
            }

            var task_blocks = [];  
            for (let i = 0; i < newBlocks.length; i++) {
                task_blocks[i] = [newBlocks[i].task_id, newBlocks[i].length_minutes, newBlocks[i].block_date];
            }

            let optimize_query = 'http://cpen291-15.ece.ubc.ca/flask/insert?query=INSERT INTO time_blocks (task_id, length_minutes, block_date) VALUES (%s, %s, %s)&values=' + JSON.stringify(task_blocks);
            await fetch(optimize_query);
        }
    }

    updateBlocksPerDay() {
        // Get user_id from Google Auth
        fetch('http://cpen291-15.ece.ubc.ca/flask/log')
        .then(response => response.json())
        .then(result => {
            var user_id = (result["id"]).substring(0, 9);
            // Get all tasks for given user_id
            fetch('http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT%20*%20FROM%20tasks%20WHERE%20user_id%20="' + user_id + '"&values=null')
            .then(response => response.json())
            .then(tasks => {

                if (tasks.length > 0) {
                    var query = 'http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT%20*%20FROM%20time_blocks%20WHERE';

                    for (let i = 0; i < tasks.length; i++) {
                        if (i === tasks.length - 1) {
                            query = query + '%20task_id%20="' + tasks[i].id + '"';
                        } else {
                            query = query + '%20task_id%20="' + tasks[i].id + '"%20OR';
                        }
                    }
                    query = query + '&values=null';

                    fetch(query)
                    .then(response => response.json())
                    .then(data => {
                        var numDays = moment(new Date(this.state.year, this.state.month, 1)).daysInMonth();
                        var blocksPerDay = new Array(numDays).fill(0);
                        var taskDensities = new Array(numDays).fill(0);

                        // Update blocksPerDay to contain the number of blocks on each day in the month
                        for(let i = 0; i < data.length; i++) {
                            var blockDate = data[i].block_date.split("-");
                            if(blockDate[1] == (this.state.month + 1)) {
                                blocksPerDay[blockDate[2] - 1]++;
                            }
                        }

                        this.setState({ max: 0 });
                        this.setState({ min: Number.MAX_SAFE_INTEGER });

                        // Find the maximum and minimum number of tasks on a day in the current month
                        for (let i = 0; i < blocksPerDay.length; i++) {
                            if (blocksPerDay[i] > this.state.max) {
                                this.setState({ max: blocksPerDay[i] });
                            }

                            if (blocksPerDay[i] < this.state.min) {
                                this.setState({ min: blocksPerDay[i] });
                            }
                        }

                        // Compute the task density for each day in the month
                        if (this.state.max - this.state.min > 0) {
                            for(let i = 0; i < data.length; i++) {
                                var blockDate = data[i].block_date.split("-");
                                taskDensities[blockDate[2] - 1] = (blocksPerDay[blockDate[2] - 1] - this.state.min) / (this.state.max - this.state.min);
                            }
                        }

                        this.setState({ taskDensities: taskDensities });
                    });
                }
            });
        });
    }

    // if direction is positive, flips the month forward, otherwise flips it back a month
    flip(direction) {
        var newMonth = this.state.month + direction;

        if (newMonth < 0) {
            this.setState({year: this.state.year - 1});
            this.setState({month: newMonth + 12});
        } else if (newMonth > 11) {
            this.setState({year: this.state.year + 1});
            this.setState({month: newMonth - 12});
        } else {
            this.setState({month: newMonth});
        }

        this.updateBlocksPerDay();
    }

    showTasks(day) {
        var actualDay = day < 10 ? '0' + day : day;
        var actualMonth = (this.state.month + 1) < 10 ? '0' + (this.state.month + 1) : (this.state.month + 1);
        var date = this.state.year + '-' + actualMonth + '-' + actualDay;
        this.setState({date: date});
        this.setState({day: day});

        fetch('http://cpen291-15.ece.ubc.ca/flask/log')
        .then(response => response.json())
        .then(result => {
            var user_id = (result["id"]).substring(0, 9);
            fetch('http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT%20*%20FROM%20time_blocks%20WHERE%20block_date%20=%20"' + date + '"&values=null')
            .then(response => response.json())
            .then(time_blocks => {
                // Reset tasksOnSelected to empty
                this.setState({tasksOnSelected: []});
                if (time_blocks.length > 0) {
                    // Get the task associated with each block on the given date
                    var query = 'http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT%20*%20FROM%20tasks%20WHERE';
		
		    this.setState({ hoursMap: {} });

                    for(let i = 0; i < time_blocks.length; i++) {
                        if (i === time_blocks.length - 1) {
                            query = query + '%20id%20=%20"' + time_blocks[i].task_id + '"&values=null';
                        } else {
                            query = query + '%20id%20=%20"' + time_blocks[i].task_id + '"%20OR';
                        }
			if (time_blocks[i].task_id in this.state.hoursMap) {
				this.state.hoursMap[time_blocks[i].task_id] += 1;
			} else {
				this.state.hoursMap[time_blocks[i].task_id] = 1;
			}
                    }

                    fetch(query)
                    .then(response => response.json())
                    .then(tasks => {
                        for (let i = 0; i < tasks.length; i++) {
                            if (tasks[i].user_id == user_id) {
                                this.setState({tasksOnSelected: this.state.tasksOnSelected.concat(tasks[i])});
                            }
                        }
                    });
                }
            });
        });
    }

    drop(item, day) {
        this.setState({dropItem:item});
        this.setState({dropDay:day});
	
	var month = (this.state.month + 1) < 10 ? "0" + (this.state.month + 1) : (this.state.month + 1);
	var day = this.state.dropDay < 10 ? "0" + this.state.dropDay : this.state.dropDay;
	var newDate = this.state.year + "-" + month + "-" + day;
	
	// compare the due date to the day the tasks is to be dropped on
	// if dropDay is before the deadline, update the dataabase and move the task
	if (item.due_date.split("-")[2] >= day) {
	    fetch('http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT id FROM time_blocks WHERE task_id = "' + item.id + '" AND block_date = "' + this.state.date + '" ORDER BY id LIMIT 1&values=null')
	    .then(response => response.json())
	    .then(block_id => {
		fetch('http://cpen291-15.ece.ubc.ca/flask/update?query=UPDATE time_blocks SET block_date = "' + newDate + '" WHERE id = "' + block_id[0].id + '"&values=null', {method: 'POST'})
		.then(() => {
			window.location.reload(false);
		});
	    });
	}
    }

    render() {
        return (
            <DndProvider backend={HTML5Backend}>
            <div id="container">
                
                <div id="side-bar">
                    <div id="heading" >
                        <p>TODO</p>
                        <div id="underline" />
                        <p id="date-label">{moment(new Date(this.state.year, this.state.month, this.state.day)).format('dddd')}, {moment(new Date(this.state.year, this.state.month, this.state.day)).format('MMMM')} {this.state.day}</p>
                        
                        <Sidebar tasksOnSelected={this.state.tasksOnSelected} hoursMap={this.state.hoursMap} />
			<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
				<Button id="task-btn" text="Add Task" destination="./add_task" />
				<Button id="dash-btn" text="Dashboard" destination="./dashboard" />
                	</div>
		    </div>
                </div>
                <div id="calendar-view">
                    <div class="flip-calendar" onClick={() => this.flip(-1)}>
                        <p>&lt;</p>
                    </div>
                    <Calendar month={this.state.month} year={this.state.year} onDayClick={this.showTasks} taskDensities={this.state.taskDensities} onDrop={this.drop}/>
                    <div class="flip-calendar" onClick={() => this.flip(1)}>
                        <p>&gt;</p>
                    </div>
                </div>
            </div>
            </DndProvider>
            
        );
    }

}

export default CalendarPage;
