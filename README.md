# Alacrity
Alacrity is a web app meant to help students manage their time. It provides an interface for students to enter their due dates, plan work sessions and rearrange those work sessions to spread the work out more evenly.

*UBC CPEN291 (Lena Kim, Alyssa Da Costa, Emily Lukas, Madeline Ferguson, Sarah Bornais, Sofia Bandeira)</br>

## Product Description
- Individual user accounts with data stored in MySQL database
- Sign-in with Google authentication
- Single calendar view
- Manual movement of workload around calendar
- Automatic optimization of personal calendar using algorithm to spread work out as evenly as possible

## Technologies
- Apache server for frontend
- MySQL database to store user and schedule block data
- Flask (python) backend using mod_WSGI to connect to Apache server
- React frontend with React Bootstrap

## User Experience
The user inputs tasks as they normally would with any to-do list but also how much time the task will take and how many days they would like to work on it. The program takes this information and schedule blocks of time to work on the task ahead of the deadline. For example, let's say you have math homework due on Friday which takes total 3 hours to be completed and you want to spread it over 3 days. Assuming it is currently Monday night, it will let the program schedule 1 hour blocks on Tuesday, Wednesday and Thursday in your calendar for a total of 3 hours of work before the Friday deadline.

When the user does this with all their tasks, there is likely to be an uneven distribution of work over time. If more deadlines are on Mondays than the other days, for example, Sundays will probably have more work than Tuesdays. The program helps the user visualize this unevenness with a colour gradient graphic using red to indicate periods with lots of work and blue to indicate no work. So the user will be able to move work sessions back to even out their workload.

https://youtu.be/Q_Tlrru3qZA


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
