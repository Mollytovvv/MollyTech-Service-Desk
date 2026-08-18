# MollyTech Service Desk

A full-stack IT service desk system developed to simulate a real-world technical support environment for managing support tickets, user requests, support operations, notifications, and real-time communication through a centralized platform.

The system provides separate workflows for users, administrators, IT support personnel, and technicians, allowing technical concerns to be submitted, assigned, monitored, resolved, and communicated through a structured support workflow.

## Features

### User Management

* User registration
* Administrator approval
* Email verification
* Role-based access
* Account management
* Password recovery
* Password reset
* Protected routes

### Ticket Management

* Create support tickets
* Automatic ticket ID generation
* Ticket search
* Ticket filtering
* Ticket categorization
* Priority management
* Ticket assignment
* Ticket reassignment
* Ticket status tracking
* Ticket resolution
* Ticket cancellation
* Ticket archiving
* Ticket records

### Ticket Categories

* Hardware
* Software
* Network
* Account
* Other

### Priority Levels

* Low
* Medium
* High
* Urgent

### Support Operations

* Administrator ticket assignment
* Technician ticket management
* IT Support ticket management
* Ticket notes
* Notes history
* Assigned staff tracking
* Support activity monitoring
* Live operations feed
* Ticket statistics

### Real-Time Messaging

* Ticket-based conversations
* Real-time message delivery
* User-to-support communication
* Message notifications
* Unread message indicators
* Typing indicators
* Image attachments
* File attachments
* Conversation archiving
* Continued communication after ticket resolution

### Notifications

* New ticket notifications
* Ticket assignment notifications
* New message notifications
* Ticket resolution notifications
* Access request notifications
* Announcement notifications
* Real-time notification updates
* Notification counters

### Dashboard & Analytics

#### Administrator

* Total users
* Total tickets
* Pending tickets
* Resolved tickets
* Live operations feed
* Recently registered users
* Ticket statistics
* Monthly ticket analytics

#### IT Support / Technician

* Assigned tickets
* Pending tickets
* Resolved tickets
* Live support operations
* Ticket statistics
* Recently assigned tickets

#### User

* Total submitted tickets
* Pending tickets
* Resolved tickets
* Messages
* Recent tickets
* Ticket priority and status
* Quick actions
* Announcements

### Announcements

* Create announcements
* Edit announcements
* Delete announcements
* User announcement notifications
* Centralized announcement management

## Technology Stack

* React
* Vite
* JavaScript
* HTML5
* CSS3
* Node.js
* Express.js
* Socket.IO
* MongoDB
* JWT
* Git

## Database

The application uses **MongoDB** as its NoSQL database.

Primary collections include:

* `users`
* `tickets`
* `conversations`
* `messages`
* `notifications`
* `announcements`

The database stores user accounts, support tickets, conversations, messages, notifications, announcements, and relationships between support records.

MongoDB ObjectIds are used to associate users, tickets, conversations, messages, and other system records.

## Authentication & Authorization

The system implements:

* Email and password authentication
* JWT-based authentication
* Password hashing
* Email verification
* Password recovery
* Password reset
* Role-based authorization
* Protected routes
* Administrator approval for user accounts

The system supports four roles:

* User
* Administrator
* IT Support
* Technician

Each role has different permissions and access to system functionality.

## Real-Time Communication

**Socket.IO** is used to provide real-time functionality throughout the system.

Real-time features include:

* Messaging
* Typing indicators
* Notifications
* Ticket updates
* Unread message counters
* Support activity updates

Users and support personnel can communicate without manually refreshing the application.

## Requirements

* Windows
* Node.js
* npm
* MongoDB
* Git
* Modern Web Browser

## Running the Project

1. Clone the repository.
2. Install the required dependencies.

```bash
npm install
```

3. Configure the application's environment variables.
4. Configure the MongoDB connection.
5. Start the backend server.
6. Start the Vite development server.

> The project is currently configured for a local development environment and may require additional configuration depending on the user's machine.

## Project Structure

```text
MollyTech Service Desk/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       ├── socket/
│       ├── templates/
│       └── utils/
│
├── frontend/
│   └── src/
│       ├── admin/
│       ├── api/
│       ├── assets/
│       ├── auth/
│       ├── components/
│       ├── context/
│       ├── socket/
│       ├── user/
│       └── utils/
│
├── .env.example
├── .gitignore
└── README.md
```

## Project Status

**Functional Full-Stack Portfolio Project**

The system is currently functional and has undergone extensive local development and manual testing.

The current version focuses on demonstrating full-stack system development, role-based support workflows, real-time communication, ticket management, authentication, and database integration.

Before production deployment, additional security testing, regression testing, performance testing, scalability testing, and deployment validation would be required.

Future improvements include AI-assisted support, additional notification functionality, improved scalability, performance optimization, stronger security hardening, automated testing, monitoring, and production deployment.

## Developer Role

**Software Engineer / Full-Stack Developer**

Responsible for:

* System architecture and design
* Frontend development
* Backend development
* React and Vite development
* Node.js and Express development
* MongoDB database design and integration
* Authentication and authorization
* Role-based access control
* Ticket management workflows
* Real-time communication
* Socket.IO implementation
* Messaging system
* Notification system
* Dashboard and analytics
* UI/UX implementation
* System integration
* Functional testing
* Debugging and optimization

## Project Purpose

MollyTech Service Desk was independently developed as an engineering-focused project to understand and implement the workflows of a real-world IT service desk environment.

Rather than building a basic CRUD application, the system was designed around actual support operations including ticket submission, administrative assignment, technician workflows, ticket resolution, user communication, notifications, and role-based access control.

The project was also used to strengthen practical experience in system architecture, full-stack development, database design, real-time communication, authentication, debugging, testing, and software engineering practices.

## Author

**Ralph Michael M. Molina**

GitHub: [Mollytovvv](https://github.com/Mollytovvv)
