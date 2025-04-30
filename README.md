# Weather Forecast App

A simple weather application that displays current and weekly weather forecasts.

## Features

- Search for weather by city name
- View current weather conditions
- See 7-day forecast with temperature, humidity, and wind speed
- Get weather for your current location using browser geolocation
- Responsive design that works on mobile and desktop

## Technology Stack

- **Backend**: Node.js/Express.js
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **API**: OpenWeatherMap API
- **Testing**: Jest, SuperTest
- **Code Quality**: ESLint

## Project Structure

```
├── node_modules        # Dependencies (gitignored)
├── public              # Static frontend files
│   ├── app.js          # Frontend JavaScript
│   ├── index.html      # HTML template
│   └── styles.css      # CSS styles
├── src                 # Backend source files
│   └── weatherService.js  # Weather data service
├── tests               # Test files
│   ├── weatherService.test.js  # Unit tests for weather service
│   └── api.test.js     # Integration tests for API endpoints
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment variables template
├── .eslintrc.js        # ESLint configuration
├── index.js            # Application entry point
├── package.json        # Project configuration
└── README.md           # Project documentation
```

## Installation

1. Clone this repository

   ```
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenWeatherMap API key:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   NODE_ENV=development
   PORT=3000
   ```

## Running the App

Start the application with:

```
npm start
```

Or for development mode with auto-reload:

```
npm run dev
```

The app will be available at http://localhost:3000

## Testing

Run the tests with:

```
npm test
```

This will run all unit and integration tests and generate a coverage report. The project is configured to maintain a minimum of 75% test coverage.

To run tests in watch mode during development:

```
npm run test:watch
```

## Requirements Completed

This project includes:

1. **Testing**

   - Unit tests with Jest
   - Integration tests with SuperTest
   - Test coverage above 75%

2. **File Organization**

   - Organized code structure
   - Clear separation of concerns

3. **Features**
   - Geolocation support
   - 7-day weather forecast
   - Responsive design
