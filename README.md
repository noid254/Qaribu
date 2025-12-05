# Niko Soko - Service Finder App

This is a single-page application for finding and connecting with local service providers, built with React and Tailwind CSS.

## Running the Project Locally

This project is built with modern web technologies and does not require a complex build setup to run for development.

1.  **No Installation Needed:** All dependencies like React and Tailwind CSS are loaded directly from a CDN via ES modules in the `index.html` file.
2.  **Serve the Directory:** To run the app, you just need a simple local HTTP server.
    *   **Using Python:** If you have Python installed, navigate to the project's root directory in your terminal and run:
        ```sh
        # For Python 3
        python -m http.server
        ```
    *   **Using VS Code:** If you use Visual Studio Code, you can install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. Once installed, right-click on `index.html` and choose "Open with Live Server".
3.  **Access the App:** Open your web browser and navigate to the local address provided by your server (e.g., `http://localhost:8000`).

## Project Structure

-   `index.html`: The main entry point of the application. It includes CDN links and the root div.
-   `index.tsx`: The main React script that renders the `App` component.
-   `App.tsx`: The root component containing the main application logic and view routing.
-   `package.json`: Documents project dependencies and basic info.
-   `components/`: Contains all the reusable React components.
-   `constants.tsx`: Mock data for the application.
-   `types.ts`: TypeScript type definitions.
