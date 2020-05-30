import React from 'react';
import styles from './Calendar.module.css';
import Day from './Day';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

/* CALENDAR COMPONENT
 * Props: month -- the number corresponding to the month that should be displayed (0 indexed)
 *        year -- the year corresponding to the month which should be displayed
 *        onDayClick -- function that calendar page calls
 *        taskDensities -- array of length equal to the number of days in the month containing
 *                         the normalized task density for each day (between 0 and 1 inclusive)
 */

class Calendar extends React.Component {
    render () {
        let calendarCells = [];

        var referenceDate = moment(new Date(this.props.year, this.props.month, 1));
        var firstDay = referenceDate.format("d");
        var numDays = referenceDate.daysInMonth();

        // Pad the beginning of the table with empty cells to account for months that
        // do not start on a Sunday
        for (let i = 0; i < firstDay; i++) {
            calendarCells.push(
                <td />
            );
        }

        // Add a day component into the table for each day of the month
        for (let day = 1; day <= numDays; day++) {
            // Choose color of color bar based on task density
            var color;
            if (this.props.taskDensities[day - 1] < 0.2) {
                color = '#4287F5'
            } else if (this.props.taskDensities[day - 1] < 0.4) {
                color = '#42F56F';
            } else if (this.props.taskDensities[day - 1] < 0.6) {
                color = '#ECF542';
            } else if (this.props.taskDensities[day - 1] < 0.8) {
                color = '#F08B3E';
            } else {
                color = '#E31919';
            }

            calendarCells.push(
                <td>
                <DndProvider backend={HTML5Backend}>
                  <Day full_date={referenceDate.add((day-1), 'days')} date={day} task_density={color} onClick={this.props.onDayClick} onDrop={this.props.onDrop} />
                </DndProvider>
                </td>
            );
        }

        let calendar = [];
        let week = [];

        calendarCells.forEach((cell, i) => {
            // If we have reached the end of a week, push the current week into the calendar
            // and start a new week
            if (i % 7 === 0) {
                calendar.push(week);
                week = [];
            }

            week.push(cell);
        });

        // Push the last, possibly incomplete, week into the calendar
        calendar.push(week);

        // Construct a table where the rows are the weeks in calendar
        let calendarTable = calendar.map((week) => <tr>{week}</tr>);

        return (
            <div id={styles.calendar_container}>
                <p id={styles.calendar_title}>{moment().month(this.props.month).format('MMMM')} {this.props.year}</p>
                <div id={styles.month_underline} />
                <table>
                    <thead>
                        <th>S</th>
                        <th>M</th>
                        <th>T</th>
                        <th>W</th>
                        <th>T</th>
                        <th>F</th>
                        <th>S</th>
                    </thead>
                    <tbody>{calendarTable}</tbody>
                </table>

                <div id={styles.legend}>
                    <p>Free</p>
                    <div id={styles.color_legend} style={{backgroundColor: '#4287F5'}} />
                    <p>Busy</p>
                </div>
            </div>
        );
    }
}

export default Calendar;
