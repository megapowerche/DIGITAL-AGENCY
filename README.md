# American Services AI - Digital Agency Website

A modern digital agency website built with Node.js, Express, and MongoDB.

## Features

- Responsive design
- User authentication
- Service inquiry system
- Admin and user dashboards
- Secure payment integration
- Modern UI with animations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/american-services-ai.git
cd american-services-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

4. Start the server:
```bash
npm start
```

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Deployment

1. Set up your hosting environment (e.g., Heroku, DigitalOcean)
2. Configure environment variables in your hosting platform
3. Deploy the application:
```bash
git push heroku main
```

## Default Admin Credentials

- Username: admin
- Password: admin123

## Directory Structure

```
american-services-ai/
├── public/              # Static files
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── img/            # Images
│   └── lib/            # Third-party libraries
├── admin/              # Admin dashboard files
├── user/               # User dashboard files
├── server.js           # Main server file
├── package.json        # Project dependencies
└── .env               # Environment variables
```

## Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- Protected API routes
- Environment variables for sensitive data

## Support

For support, email support@americanservicesai.com or create an issue in the repository. 