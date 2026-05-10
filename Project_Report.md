# Project Title
**Design and Implementation of a Complete Microservices-Based CI/CD DevOps Pipeline**

## 1. Title of the Project
Design and Implementation of a Complete Microservices-Based CI/CD DevOps Pipeline

## 2. Aim and Objectives
**Aim:** 
To design, build, automate, and deploy a modern software system using industry-relevant DevOps tools and practices.

**Objectives:**
- Construct a microservices application using Docker Compose with multi-container services.
- Analyze and implement automated builds using Maven.
- Apply Continuous Integration workflows using GitHub Actions for automated builds, testing, image creation, and deployment.
- Develop end-to-end CI/CD pipelines using Jenkins integrating source control, build tools, containers, and deployments.

## 3. System Architecture Diagram
*(You can generate or draw a simple block diagram containing these components for your report)*
- **Frontend Container**: React.js app served via Nginx (Port 80)
- **Backend Container**: Node.js/Express API (Port 3000)
- **Database Container**: MongoDB storing application data (Port 27017)
- **Maven Demo Container**: A standalone Java service simulating a Maven build and lifecycle.
- **CI/CD Tools**: GitHub Actions (cloud CI) & Jenkins (Pipeline automation) integrating all services.

## 4. Description of Each Microservice
1. **Frontend (client)**: A React-based user interface built using Vite. It handles the presentation layer and communicates with the backend via REST APIs. Containerized using a multi-stage Docker build with Nginx for optimized static file serving.
2. **Backend (server)**: A Node.js and Express server that handles business logic, authentication, file uploads, and AI integration (Gemini API). It connects securely to the MongoDB database using environment variables.
3. **Database (mongo)**: An official MongoDB container utilized for persistent data storage. Data is preserved across container restarts using Docker volumes (`mongo-data`).
4. **Maven Demo (demo-maven-service)**: A Java-based module created to demonstrate Maven concepts such as the `pom.xml` structure, dependency management (e.g., JUnit), and lifecycle phases like `clean` and `package`.

## 5. Docker Compose Explanation
The `docker-compose.yml` file defines and runs the multi-container system:
- **Services**: Defines `db`, `backend`, `frontend`, and `demo-maven-service`.
- **Dependencies**: The `depends_on` directive ensures the database starts before the backend, and the backend starts before the frontend.
- **Port Mapping**: Maps container ports to host ports (e.g., `"3000:3000"`).
- **Environment Variables**: Passes configurations like `MONGO_URI=mongodb://db:27017/prephub` safely to the backend.
- **Volumes**: `mongo-data:/data/db` ensures database data persists even if the container is removed.
- **Networks**: `prephub-network` allows seamless communication between containers using their service names.

## 6. Maven Lifecycle and Dependency Explanation
The `demo-maven-service` utilizes a `pom.xml` file to manage its build.
- **Dependencies**: Uses the `<dependencies>` tag to manage external libraries automatically, such as `junit` for testing.
- **Plugins**: Employs `maven-compiler-plugin` and `maven-jar-plugin` to compile Java 11 code and package it into an executable JAR.
- **Lifecycle**: Running `mvn clean package` executes the standard Maven lifecycle: cleaning previous builds, validating, compiling, testing, and packaging the code into a `.jar` artifact ready for Dockerization.

## 7. GitHub Actions Workflow Explanation
The `.github/workflows/ci.yml` automates Continuous Integration:
- **Triggers**: Runs automatically on a `push` or `pull_request` to the `main` branch.
- **Checkout**: Pulls the source code.
- **Build Steps**: Sets up Node.js and runs `npm install` for both backend and frontend. It also builds the React app.
- **Maven Integration**: Sets up JDK 11 and runs `mvn package` for the Java module.
- **Docker Validation**: Runs `docker-compose build` to ensure all Dockerfiles are valid and images compile successfully.

## 8. Jenkins Pipeline Explanation
The `Jenkinsfile` provides full CI/CD automation through Declarative Pipeline syntax:
- **Checkout Stage**: Retrieves the latest source code from Git.
- **Build & Test Backend**: Installs Node dependencies inside the `server` directory.
- **Build & Test Frontend**: Installs dependencies and runs the Vite build inside the `client` directory.
- **Build Maven Module**: Executes Maven packaging for the Java service.
- **Build Docker Images**: Builds all Docker images using `docker-compose build`.
- **Deploy Containers**: Deploys the full stack using `docker-compose up -d`.

## 9. Screenshots of Execution/Output
*(Please insert your screenshots here before submission! Recommended screenshots:)*
1. `docker ps` showing all 4 containers running.
2. The Frontend UI loaded in the browser on `localhost:80`.
3. GitHub Actions workflow success screen.
4. Jenkins Pipeline successful stage view.

## 10. Challenges Faced and Solutions Applied
- **Challenge**: Passing the MongoDB connection string to the backend when containerized.
  - **Solution**: Replaced localhost hardcoding with `process.env.MONGO_URI` and passed `mongodb://db:27017/prephub` via `docker-compose.yml`.
- **Challenge**: Protecting sensitive API keys (Gemini API) during Docker builds.
  - **Solution**: Implemented `.dockerignore` files to explicitly ignore `.env` files, ensuring secrets are not baked into the Docker images.
- **Challenge**: Serving a React Vite app in production mode.
  - **Solution**: Used a multi-stage Docker build, compiling the React code in a Node image and serving the optimized `dist` folder using an Nginx container.

## 11. Learning Outcomes Achieved
- Mastered the deployment of multi-container microservices using Docker Compose.
- Successfully managed dependencies and build lifecycles using both npm (Node.js) and Maven (Java).
- Implemented and understood automated cloud-based CI using GitHub Actions.
- Developed an end-to-end CI/CD declarative pipeline using Jenkins.

## 12. Conclusion
The project successfully bridges the gap between software development and IT operations. By integrating a MERN-stack application alongside a Java Maven service and automating their deployment through Docker, GitHub Actions, and Jenkins, a robust, scalable, and modern DevOps CI/CD pipeline was successfully achieved.
