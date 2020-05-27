# Alacrity

Alacrity is a web app meant to help students manage their time. It provides an interface for students to enter their due dates, plan work sessions and rearrange those work sessions to spread the work out more evenly.

## Product Description

1. Individual user accounts with data stored in MySQL database
2. Sign-in with Google authentication
3. Single calendar view
4. Manual movement of workload around calendar
5. Automatic optimization of personal calendar using algorithm to spread work out as evenly as possible

## Technologies

1. Apache server for frontend
2. MySQL database to store user and schedule block data
3. Flask (python) backend using mod_WSGI to connect to Apache server
4. React frontend with React Bootstrap

## User Experience

The user inputs tasks as they normally would with any to-do list but also how much time the task will take and how many days they would like to work on it. The program takes this information and schedule blocks of time to work on the task ahead of the deadline. For example, let's say you have math homework due on Friday which takes total 3 hours to be completed and you want to spread it over 3 days. It will let the program schedule 1 hour blocks on Tuesday, Wednesday and Thursday in your calendar for a total of 3 hours of work before the Friday deadline. 
When the user does this with all their tasks, there is likely to be an uneven distribution of work over time. If more deadlines are on Mondays than the other days, for example, Sundays will probably have more work than Tuesdays. The program helps the user visualize this unevenness with a colour gradient graphic using red to indicate periods with lots of work and blue to indicate no work. So the user will be able to move work sessions back to even out their workload. 

*CPEN291 (Lena Kim, Alyssa Da Costa, Emily Lukas, Madeline Ferguson, Sarah Bornais, Sofia Bandeira) 
