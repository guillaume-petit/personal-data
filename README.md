# Personal Data App

A simple web application for managing personal data, optimized for mobile devices.

## Features

- Input name and birth date to retrieve personal information
- View personal data including name, birth date, baptism date, mobile phone, home phone, address, and emergency contact
- Validate or edit personal information
- Track and display when personal data was last validated
- Password-protected admin page to view all users' personal data
- Mobile-responsive design

## Technologies Used

- **Frontend**: Angular 19
- **Backend**: Node.js with Express.js
- **Storage**: LowDB (lightweight JSON database)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode

To run both the frontend and backend concurrently with auto-reload:

```bash
npm run dev
```

This will start:
- Angular frontend at http://localhost:4200
- Express backend at http://localhost:3000

Both the frontend and backend will automatically reload when changes are detected.

### Running Frontend Only

```bash
npm start
```

### Running Backend Only

```bash
npm run server
```

### Running Backend with Auto-Reload

```bash
npm run server:dev
```

This will start the backend server with nodemon, which automatically restarts the server when changes are detected. Nodemon is configured to ignore the db.json file to prevent restart loops that could occur when the database is updated.

## Usage

### Regular User Flow

1. Open the application in your browser at http://localhost:4200
2. Enter a name and birth date on the initial form
   - For testing, you can use:
     - Name: "John Doe", Birth Date: "1990-05-15"
     - Name: "Jane Smith", Birth Date: "1985-10-25"
3. View your personal information
4. Click "Validate" to confirm the data is correct
   - The system will store the current date and time as the last validation date
   - The last validation date will be displayed in the personal information section
5. Click "Edit" to modify your personal information
6. Save your changes

### Admin Access

1. Navigate to http://localhost:4200/admin/login
2. Enter the admin credentials:
   - Username: admin
   - Password: admin123
3. After successful login, you'll be redirected to the admin dashboard
4. The dashboard displays all users' personal data in a card layout
5. Click "Logout" to end your admin session

## Testing

### Frontend Tests

The application includes comprehensive unit tests for Angular components and services. To run the frontend tests:

```bash
npm test
```

This will execute the Angular tests using Karma and Jasmine.

### Backend Tests

The backend API is tested using Jest and Supertest. To run the backend tests:

```bash
npm run test:backend
```

To run the tests in watch mode (automatically re-run when files change):

```bash
npm run test:backend:watch
```

## Deployment

### Deploying to Render.com

This application is configured for easy deployment to [Render.com](https://render.com/). Follow these steps to deploy:

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: Choose a name for your service
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Select an appropriate plan (Free tier works for testing)

4. Add the following environment variables:
   - `NODE_ENV`: Set to `production`
   - `PORT`: Render will set this automatically, but you can specify a custom port if needed
   - `ADMIN_USERNAME`: Set a secure username for admin access (optional, defaults to 'admin')
   - `ADMIN_PASSWORD`: Set a secure password for admin access (optional, defaults to 'admin123')
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS (optional, if not set, only same-origin requests will be allowed)

5. Click "Create Web Service"

Render will automatically build and deploy your application. The deployment process includes:
- Installing dependencies
- Building the Angular application (via the postinstall script)
- Starting the Node.js server in production mode

### Testing Production Build Locally

Before deploying to Render.com, you can test the production build locally:

1. Build the Angular application:
```bash
npm run build
```

2. Start the server in production mode:
```bash
npm run start:prod
```

3. Open your browser and navigate to http://localhost:3000

This will serve the application exactly as it would be served in production, using the built Angular files from the dist directory.

### Database Considerations

This application uses LowDB, a file-based JSON database. On Render.com, the filesystem is ephemeral, meaning any changes to files (including the database) will be lost when the service restarts or redeploys.

For a production environment, consider:
1. Using a persistent database service like PostgreSQL, MongoDB, or a managed database service
2. Implementing a database adapter in the application to connect to your chosen database
3. Migrating data from the JSON file to your new database

## Project Structure

- `src/app/components/` - Angular components
  - `initial-form/` - Component for the initial name and birth date form
  - `personal-data/` - Component for displaying personal data
  - `edit-personal-data/` - Component for editing personal data
  - `admin-login/` - Component for admin login
  - `admin-dashboard/` - Component for displaying all users' data (admin only)
- `src/app/services/` - Angular services
  - `user.service.ts` - Service for user data operations
  - `auth.service.ts` - Service for authentication
- `src/app/guards/` - Angular route guards
  - `auth.guard.ts` - Guard to protect admin routes
- `server.js` - Express backend server
- `db.json` - LowDB database file (created on first run)
- `server.test.js` - Backend API tests
- `jest.config.js` - Jest configuration for backend tests
