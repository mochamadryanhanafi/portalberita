# Wanderlust API Testing with Postman

## Favorite Controller Tests

This directory contains Postman collections for testing the Wanderlust API endpoints, specifically for the Favorite Controller functionality.

### Setup Instructions

1. **Install Postman**: Download and install Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

2. **Import the Collection**:
   - Open Postman
   - Click on "Import" button
   - Select the `favorite-controller.postman_collection.json` file
   - Click "Import"

3. **Configure Environment Variables**:
   - Create a new environment in Postman
   - Set the following variables:
     - `base_url`: Your API base URL (default is `http://localhost:5000`)
     - `news_id`: A valid news ID from your database

### Running the Tests

1. **Authentication**:
   - First run the "Login User" request to authenticate
   - This will automatically set the `access_token` for subsequent requests

2. **Test Favorite Functionality**:
   - Run the requests in the "Favorites" folder to test:
     - Adding a news article to favorites
     - Checking if a news article is in favorites
     - Getting all favorite news articles
     - Removing a news article from favorites

### Test Cases

The collection includes tests for:

- **Authentication**: Verifies login functionality and token storage
- **Add to Favorites**: Tests adding news to favorites with appropriate status codes (201 for new, 200 for already saved)
- **Check Is Favorite**: Verifies the endpoint correctly reports if a news article is saved
- **Get User Favorites**: Tests pagination and response structure for retrieving saved articles
- **Remove from Favorites**: Verifies proper removal of saved articles

### Notes

- All requests automatically include authentication via cookies
- Tests validate both status codes and response structure
- The collection uses variables to maintain state between requests