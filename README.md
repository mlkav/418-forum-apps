
# Forum App

Forum App is a forum application built with React and powered by Vite as the build tool. This project is focusing on complete forum functionality, clean architecture, and a solid user experience. The application supports user authentication, thread and comment management, loading indicators, and interactive voting features.

## URL Vercel
```
https://418-forum-apps.vercel.app/
```

## Tech Stack
- React – UI library
- Vite – Fast development server & bundler
- ESLint – Code quality and linting
- Node.js & npm – Package management (v22.19.0)

## Installation

- Make sure Node.js (LTS version) is installed on your system.
    ```
    npm install
    ```
## Running the Project

- Development Mode
    ```
    npm run dev
    ```

    The app will run locally (http://localhost:3001).
- Demo Account
    ```
    Email: myuser@mail.com
    Password: myuser418
    ```

- Linting
    ```
    npm run lint
    ```
    Used to ensure code quality and consistency.

##  Feature

1. **Authentication**
    - User registration (sign up)
    - User login (sign in)

    - Authorization is required for data-modifying actions such as creating threads, comments, and voting

2. **Threads**
    - Display a list of threads
    - Each thread item shows:
        - Thread title
        - Thread body preview
        - Creation time
        - Total number of comments
        - Thread author information:
            - Name
            - Avatar
    - Authenticated users can create new threads

3. **Thread Details & Comments**

    - View thread details, including:
        - Title
        - Full body content
        - Creation time
        - Author information (name & avatar)
    - Display comments within a thread
    - Each comment shows:
        - Comment content
        - Creation time
        - Comment author information (name & avatar)
    - Authenticated users can post comments

4. **Loading Indicator**

    Displays a loading indicator while fetching data from the API to improve user experience

5. **Voting System**
    - Available for both threads and comments
    - Supports upvote and downvote actions
    - Visual indicators reflect voting state:
        - Blue button for upvote
        - Red button for downvote
    - Clicking the same vote again returns the state to neutral
    - Displays total vote count
    - Implements optimistic UI updates for smoother interaction

6. **Leaderboard**
    - Dedicated leaderboard page
    - Displays:
        - User name
        - User avatar
        - Score

7. **Thread Filtering**
    - Filter threads by category on the thread list page
    - Implemented entirely on the front-end by manipulating application state

## Testing and quality checks

Run the complete local verification suite:

```bash
npm run lint
npm test
npm run build
npm run build-storybook
npm run e2e
```

Start the app on port 3001 before running E2E tests, then execute:

```bash
npm run e2e
```

The E2E suite uses Cypress and covers invalid and valid login flows. Start the app on port 3001 before running E2E tests, then execute:

```bash
npm run e2e
```

The E2E suite uses Cypress and covers invalid and valid login flows. Start Storybook separately with `npm run storybook`; it is available at `http://localhost:6006`.

## Deployment and submission checklist

The Vercel configuration is in `vercel.json`. After deployment, record these items in the submission notes:

- Vercel application URL
- `1_ci_check_error.png`: failing CI check on a pull request
- `2_ci_check_pass.png`: passing CI check on a pull request
- `3_branch_protection.png`: branch protection rule blocking merge without passing checks/reviews

The GitHub Actions workflow is defined in `.github/workflows/ci.yml` and runs on push and pull request events for `main` and `master`.

<!-- ## Project Structure (Simplified) -->

<!-- ## Notes -->

<!-- ## License -->
