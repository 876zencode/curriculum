# Canonical Curriculum Explorer

This is a full-stack application that uses a Spring Boot backend and a React frontend to display a dynamically generated curriculum for various programming languages. The application fetches data from a remote JSON endpoint, processes it with an LLM to generate a curriculum, and then displays the curriculum to the user.

## Backend

The backend is a Spring Boot application that provides a REST API for the frontend. It has the following endpoints:

- `GET /api/curriculum/metadata`: Returns a list of available languages.
- `GET /api/curriculum/{language}/canonical-sources`: Returns the canonical sources for a given language.
- `GET /api/curriculum/{language}/curriculum`: Returns the curriculum for a given language.

### How to run the backend

1.  Navigate to the `backend` directory.
2.  Create a `.env` file with the following variables:
    ```
    CURRICULUM_DATA_URL=<URL to the curriculum data>
    LLM_API_KEY=<Your LLM API key>
    LLM_MODEL=<The LLM model to use>
    ```
3.  Run the application using the following command:
    ```
    ./mvnw spring-boot:run
    ```

## Frontend

The frontend is a React application that uses Vite and shadcn/ui. It has the following pages:

- `HomePage`: Displays a list of available languages.
- `LanguageCurriculumPage`: Displays the curriculum for a given language.

### How to run the frontend

1.  Navigate to the `frontend` directory.
2.  Create a `.env` file with the following variables:
    ```
    VITE_BACKEND_URL=http://localhost:8080/api
    ```
3.  Install the dependencies using the following command:
    ```
    npm install
    ```
4.  Run the application using the following command:
    ```
    npm run dev
    ```

## How to run the application

1.  Start the backend application.
2.  Start the frontend application.
3.  Open your browser and navigate to `http://localhost:5173`.
