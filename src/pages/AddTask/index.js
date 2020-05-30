import React from 'react';
import Button from '../../components/Button';
import star from '../../assets/star.png';
import moment from 'moment';

import './index.css';

import DatePicker from "react-datepicker";
 
import "react-datepicker/dist/react-datepicker.css";

class AddTask extends React.Component {

    constructor(props) {
        super(props);
        this.state = { task_name: '',
                       date: new Date(),
                       tot_hrs: '',
                       hrs_per_day: '1',
                       tasks: [],
                       taskBlocks: [],
                    };

        this.update_task_name = this.update_task_name.bind(this);
        this.update_tot_hrs = this.update_tot_hrs.bind(this);
        this.create_task = this.create_task.bind(this);
        this.add_blocks = this.add_blocks.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = date => {
        this.setState({
          date: date
        });
      };

    // Update the state with the task name given by the user
    async update_task_name(event) {
        await this.setState({ task_name: event.target.value});
    }

    // Update the state with the total number of hours for the task given by the user
    async update_tot_hrs(event) {
        await this.setState({ tot_hrs: event.target.value})
    }

    // creates a task in the database based on the input from the user
    create_task() {
        // if any fields weren't filled out, reset state to blank and don't submit a task
        if(this.state.task_name === '' || this.state.unformatted_date === '' || this.state.tot_hrs === '') {
            this.setState({ task_name: ''});
            this.setState({ date: ''});
            this.setState({ tot_hrs: ''});
            return;
        }

        let year = this.state.date.getFullYear();
        let month = this.state.date.getMonth();
        let day = this.state.date.getDate();

        if(!moment([year, month, day]).isValid()) { // months are 0 indexed in moment datatype
            return;
        }

        // change total hours and hours per day into floats
        var tot_hrs_num = parseFloat(this.state.tot_hrs);
        var hrs_per_day_num = parseFloat(this.state.hrs_per_day);

        // calculate number of full sized task blocks to create
        var num_blocks = Math.floor(tot_hrs_num / hrs_per_day_num);

        // check if it didn't divide perfectly, so we can create the last block with the remainder
        var extra = 0;
        if(num_blocks - tot_hrs_num / hrs_per_day_num !== 0) {
            extra = tot_hrs_num - num_blocks * hrs_per_day_num;
        }

	var formattedMonth = month + 1 < 10 ? "0" + (month + 1) : (month + 1);
	var formattedDay = day < 10 ? "0" + day : day;
	var formattedDate = year + "-" + formattedMonth + "-" + formattedDay;
        var user_id;
        // create task in database
        fetch('http://cpen291-15.ece.ubc.ca/flask/log')
            .then(response => response.json())
            .then(result => {
                user_id = (result["id"]).substring(0, 9);
                let task_query_with_spaces = 'INSERT INTO tasks (due_date, total_hours, user_id, name) VALUES (%s, %s, %s, %s)';

                let list_values = [formattedDate, tot_hrs_num, user_id, this.state.task_name];
                let values = JSON.stringify(list_values);

                let task_query = 'http://cpen291-15.ece.ubc.ca/flask/insert?query=' + task_query_with_spaces + '&values=' + values;
                console.log(task_query);

                let task_query_wo_spaces = task_query.split(" ").join("%20");

                var task_id;

                console.log(task_query_wo_spaces);
                fetch(task_query_wo_spaces)
                    .then(response => response.json())
                    .then(result => {
                        task_id = result["id"];
                        console.log("Task id: " + task_id);
                        this.add_blocks(num_blocks, task_id, hrs_per_day_num, extra);
                    })
                    .catch(() => console.log("Stuff went wrong in insert task"));
            });

    }

    // add time blocks to the database for a task
    add_blocks(num_blocks, task_id, hrs_per_day_num, extra) {
	console.log("add_blocks")
        fetch('http://cpen291-15.ece.ubc.ca/flask/select?query=SELECT%20*%20FROM%20tasks%20WHERE%20id%20=%20"' + task_id + '"&values=null')
        .then(response => response.json())
        .then(tasks => {
            var task = tasks[0];
            task.due_date = task.due_date + ' 23:59:59';
	    console.log("hi")
            console.log(task)
	    // create list of lists to submit as values to the database
            fetch('http://cpen291-15.ece.ubc.ca/flask/optimize?user_id=' + task['user_id'], {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(task) // body data type must match "Content-Type" header
            })
            .then(response => response.json())
            .then((blocks) => {
                // create time blocks
                this.setState({tasks: blocks});
                var task_blocks = [];
                for(let i = 0; i < blocks.length; i++) {
                    task_blocks[i] = [blocks[i].task_id, blocks[i].length_minutes, blocks[i].block_date];
                }

                this.setState({taskBlocks: task_blocks});
                // if we had a remainder, make a smaller block with the leftovers
                // if(extra !== 0) {
                //     task_blocks[num_blocks + 1] = [task_id, extra * 60, this.state.date];
                // }

                // Insert list of time blocks into database
                let block_query_w_spaces = 'INSERT INTO time_blocks (task_id, length_minutes, block_date) VALUES (%s, %s, %s)';
                let task_values = JSON.stringify(task_blocks);

                let block_query = 'http://cpen291-15.ece.ubc.ca/flask/insert?query=' + block_query_w_spaces + '&values=' + task_values;

                let block_query_wo_spaces = block_query.split(" ").join("%20");

                console.log(block_query_wo_spaces);
                fetch(block_query_wo_spaces)
                .then(response => response.json())
                .then(result => {
                    let block_ids = result["id"];
                    for (let block_id in block_ids) {
                        console.log(block_id);
                    }
                    // run optimization algorithm here
                    
                    // direct user back to the dashboard
                    window.location.href = "./dashboard";
                })
                .catch(() => console.log("Stuff went wrong in insert time blocks"));
            })
        });
    }

    render() {
        return (
            <div id="background">
                <div id="container">
                    <div id="form">
                        <div id = "my_header">
                            <p id="add-task-title">ADD YOUR TASK</p>
                            <div id="underline" />
                        </div>
                        <form>
                            <div className="input-group">
                                <img className="star" src={star} />
                                <div>
                                    <p className="label">1. WHAT IS THE NAME OF YOUR TASK?</p>
                                    <input type="text" placeholder="ENTER TASK HERE" onChange={this.update_task_name} />
                                </div>
                            </div>
                            <div className="input-group">
                                <img className="star" src={star} />
                                <div>
                                    <p className="label">2. WHEN IS THE DUE DATE?</p>
                                    <DatePicker
                                        selected={this.state.date}
                                        onChange={this.handleChange}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <img className="star" src={star} />
                                <div>
                                    <p className="label">3. HOW MANY HOURS IN TOTAL DO YOU WANT TO SPEND ON YOUR TASK?</p>
                                    <input type="text" placeholder="ENTER TOTAL # HOURS HERE" onChange={this.update_tot_hrs}/>
                                </div>
                            </div>
                        </form>
                        <br />
                        <button id="submit-task-button" style={{backgroundColor:'white'}} onClick={this.create_task}>SUBMIT TASK</button>
                        <br />
                        <Button text="Dashboard" destination="./dashboard" />
                        <br />
                        <br />
                    </div>
                    <div id="window"></div>
                </div>
            </div>
        );
    }
}

export default AddTask;
