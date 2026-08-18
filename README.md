MollyTech Service Desk

A full-stack IT service desk system developed as an engineering-focused implementation of a real-world technical support environment.

The system is designed to manage technical support requests through a centralized platform, covering ticket submission, administrative review, staff assignment, ticket resolution, user communication, notifications, and support operations.

It provides separate workflows for Users, Administrators, IT Support personnel, and Technicians, with role-based access and functionality based on each user's responsibilities.

Features
User Management
User registration
Administrator approval
Email verification
Role-based access control
Account management
Password recovery
Password reset
Protected routes
Ticket Management
Create support tickets
Automatic ticket ID generation
Ticket search
Ticket filtering
Ticket categorization
Priority management
Ticket assignment
Ticket reassignment
Ticket status tracking
Ticket resolution
Ticket cancellation
Ticket archiving
Archived ticket records
Ticket Categories
Hardware
Software
Network
Account
Other
Priority Levels
Low
Medium
High
Urgent
Support Operations
Administrator ticket assignment
IT Support ticket management
Technician ticket management
Ticket notes
Notes history
Assigned staff tracking
Support activity monitoring
Live operations feed
Ticket statistics
Staff-specific ticket visibility
Real-Time Messaging
Ticket-based conversations
Real-time message delivery
User-to-support communication
Message notifications
Unread message indicators
Typing indicators
Image attachments
File attachments
Conversation archiving
Continued communication after ticket resolution
Notifications
New ticket notifications
Ticket assignment notifications
New message notifications
Ticket resolution notifications
Access request notifications
Announcement notifications
Real-time notification updates
Notification counters
Dashboard & Analytics
Administrator
Total users
Total tickets
Pending tickets
Resolved tickets
Live operations feed
Recently registered users
User approval status
Ticket statistics
Monthly ticket analytics
IT Support / Technician
Assigned tickets
Pending tickets
Resolved tickets
Live support operations
Ticket statistics
Assigned ticket visibility
Recent support activity
User
Total submitted tickets
Pending tickets
Resolved tickets
Message count
Recent tickets
Ticket priority and status
Quick actions
Announcements
Support activity updates
Announcements
Create announcements
Edit announcements
Delete announcements
User announcement notifications
Centralized announcement management
System Workflow
                         ┌──────────────────┐
                         │       User       │
                         └────────┬─────────┘
                                  │
                                  ▼
                       Submit Support Ticket
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Administrator Reviews   │
                    │        Ticket           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                         Assign Support Staff
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │  IT Support  │         │  Technician  │
             └──────┬───────┘         └──────┬───────┘
                    │                        │
                    └───────────┬────────────┘
                                ▼
                       Investigate / Respond
                                │
                                ▼
                         Resolve Ticket
                                │
                                ▼
                       User Notification
                                │
                                ▼
                     Continued Communication

The workflow is designed to represent a structured IT support process where submitted technical concerns are reviewed, assigned to appropriate support personnel, monitored, communicated, and resolved.

Technology Stack
Technology	Purpose
React	Frontend application
Vite	Frontend development and build tooling
JavaScript	Application logic
HTML5	Application structure
CSS3	Styling and UI
Node.js	Backend runtime
Express.js	Backend application framework
Socket.IO	Real-time communication
MongoDB	NoSQL database
JWT	Authentication
Git	Version control
Database

The application uses MongoDB as its NoSQL database.

Primary Collections
users
tickets
conversations
messages
notifications
announcements

The database stores:

User accounts
Support tickets
Ticket assignments
Conversations
Messages
Notifications
Announcements
Support-related records

MongoDB ObjectIds are used to associate users, tickets, conversations, messages, notifications, and other system records.

Authentication & Authorization

The system implements authentication and role-based authorization using:

Email and password authentication
JWT-based authentication
Password hashing
Email verification
Password recovery
Password reset
Role-based authorization
Protected routes
Administrator approval for user accounts
User Roles

The system supports four roles:

User
Administrator
IT Support
Technician

Each role has different permissions and access to system functionality based on its responsibilities within the support workflow.

Real-Time Communication

Socket.IO is used to provide real-time communication throughout the system.

Real-time functionality includes:

Messaging
Typing indicators
Notifications
Unread message counters
Support activity updates

Messages and selected system events can be delivered to connected users without requiring a manual page refresh.

Requirements

Before running the project locally, install the following:

Windows
Node.js
npm
MongoDB
Git
Modern web browser
Running the Project
1. Clone the Repository
git clone <repository-url>
cd "MollyTech Service Desk"
2. Install Backend Dependencies
cd backend
npm install
3. Install Frontend Dependencies

Open another terminal and run:

cd frontend
npm install
4. Configure Environment Variables

Create the required environment configuration files based on .env.example.

Configure the required application settings, including:

MongoDB connection
JWT configuration
Authentication settings
Email configuration
Other environment-specific settings

Do not commit .env files or other sensitive credentials to the repository.

5. Start the Backend

From the backend directory:

npm run dev
6. Start the Frontend

From the frontend directory:

npm run dev

The Vite development server will provide the local frontend address.

The project is currently configured for a local development environment and may require additional configuration depending on the user's machine and environment.

Project Structure
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
Project Status

Functional Full-Stack Portfolio Project

The system is currently functional and has undergone extensive local development, manual testing, debugging, and feature validation.

The current version demonstrates:

Full-stack system development
Role-based support workflows
Authentication and authorization
Ticket management
Real-time communication
Messaging
Notifications
Database integration
Support operations
Dashboard analytics
UI/UX implementation

The project is currently maintained as a local development system.

Before production deployment, additional validation would be required, including:

Security testing
Regression testing
Performance testing
Scalability testing
Automated testing
Deployment validation
Production environment configuration
Monitoring and logging
Planned Improvements

Future development may include:

AI-assisted support
Expanded notification functionality
Improved scalability
Performance optimization
Stronger security hardening
Automated testing
Monitoring and logging
Production deployment
Developer Role
Software Engineer / Full-Stack Developer

I independently designed and developed the system across the full application stack.

Responsibilities included:

System architecture and design
Application planning
Frontend development
Backend development
React and Vite development
Node.js and Express development
MongoDB database design and integration
Authentication and authorization
Role-based access control
Ticket management workflows
Support workflow design
Real-time communication
Socket.IO implementation
Messaging system
Notification system
Dashboard and analytics
UI/UX implementation
System integration
Functional testing
Debugging
Performance and code optimization
Project Purpose

MollyTech Service Desk was independently developed as an engineering-focused project to understand and implement the workflows of a real-world IT service desk environment.

Rather than building a basic CRUD application, the system was intentionally designed around support operations such as:

Ticket submission
Administrative review
Ticket assignment
Technician workflows
IT Support workflows
Ticket resolution
User communication
Real-time messaging
Notifications
Role-based access control

The project was also developed to strengthen practical experience in system architecture, full-stack development, database design, authentication, real-time communication, debugging, testing, and software engineering practices.

The primary goal was not simply to build an application that works, but to understand how the different components of a software system interact and how engineering decisions affect the overall functionality, maintainability, and user experience of the system.

Author

Ralph Michael M. Molina

GitHub: Mollytovvv
