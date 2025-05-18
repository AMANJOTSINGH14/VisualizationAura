## Overview

Visualization Aura is a full-stack web application that allows authenticated users to create, view, update, duplicate, report, and delete "cards" containing text, images, tags, and ML-driven embeddings

## Tech stack
Visual Studio Code: Our development is done in Visual Studio Code, a widely-used editor known for its debugging and extension support.
Frontend (React.js): Our frontend is built using React.js, a popular JavaScript library for creating responsive and dynamic user interfaces. Backend (Node.js & Express.js): Our backend is developed with
Node.js and Express.js, providing scalable server-side logic and RESTful API support. Query Language 
(Cypher): We use Cypher as the query language to interact with our graph database effectively. Database
(Neo4j & AuraDB): Our data is stored in Neo4j, a graph database, and hosted on AuraDB’s cloud-based free tier for easy access and management. Firebase 
(Google Authentication): We use Firebase to implement secure and seamless Google Sign-In for user authentication. Frontend Hosting 
Vercel : For hosting frontend (free version).
Render : For hosting backend (free versison).

## Environment variable
Created a `.env` at `/backend` root with:
NEO4J_URI=neo4j+s://<YOUR_AURA_BOLT_URL>
NEO4J_USER=<USERNAME>
NEO4J_PASSWORD=<PASSWORD>
FIREBASE_SERVICE_ACCOUNT_JSON="{...}"  # full JSON

## For frontend
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=<KEY>
REACT_APP_FIREBASE_AUTH_DOMAIN=<DOMAIN>
REACT_APP_FIREBASE_PROJECT_ID=<ID>


## Neo4j Database
No manual schema migrations are needed.
- Label: Card
- Properties: `subject`, `text`, `author`, `imageUrl`, `caption`, `tags` (array), `embedding` (flat float array), `reports` (array of JSON strings)
- Relationship: HAS_TAG edges connect Card nodes that share a tag
  
## Running the Application
Start the backend with "node backend/server.js" and frontend with "npm start".

## Backend Details

 cardController.js:
 getAllCards – get all cards
 createCard – create image, captions, subject, text area, embedding and tag.

 deleteCard – Delete cards from specific id.

 duplicateCard – copy props + embedding
 reportCard – append JSON string to c.reports

 updateCard – recompute embedding if `imageUrl` changed, update props

## Api Endpoint 
GET /cards
Fetch all cards.

POST /cards
Create a new card. Body parameters: subject, text, imageUrl, caption, tags.

DELETE /cards/:id
Delete a card by its Neo4j element ID.

POST /cards/:id/duplicate
Duplicate an owned card.

POST /cards/:id/report
Report a card. Body parameters: email, reportType, additionalInfo.

PUT /cards/:id
Update a card (and optionally re‑compute its embedding if imageUrl changed).


## Frontend

Key Components 

api.js: injects Firebase token, calls backend

CardForm: Create/update form, uploads image URL only

CardList: fetches & displays cards

AuthContext: provides user, signIn, signOut

Sidebar: navigation panel with options to report a card, view overall card details, and browse/display all tags  
