# RegScope: Global Ingredient Compliance Dashboard

RegScope is a sophisticated, single-view dashboard prototype designed for regulatory affairs teams. It provides a "command center" for monitoring and checking the compliance of wellness product ingredients against drug regulations in various countries.

The entire application is built as a responsive, single-page application (SPA) that fits the screen without scrolling, providing an immediate, holistic view of the global compliance landscape.

## Key Features

- **Command Center UI:** A single, non-scrolling dashboard with all critical information visible at a glance.
- **Interactive Charts:** A 2x3 grid of charts providing a high-level overview of compliance status, trends, and flagged ingredients.
- **Dynamic Ingredient Analysis:** Select an ingredient to see a detailed drill-down view with country-by-country compliance status and beautifully formatted reports.
- **Advanced Filtering & Search:** Instantly search the ingredient list and filter by color-coded ingredient types.
- **Fully Responsive:** The layout seamlessly adapts from large desktop monitors to tablets and mobile devices.
- **Collapsible Sidebar:** Maximize screen real estate by collapsing the ingredient list into a compact, acronym-based view.
- **Configurable Auto-Refresh:** Keep the dashboard data current with a configurable auto-refresh timer.
- **Themed UI:** Features a sleek, Spotify-inspired dark mode (default) and a clean light mode, complete with themed scrollbars.
- **Mock Data Layer:** Simulates realistic data fetching with loaders, making it easy to plug in a real backend.

## Technology Stack

- **React:** For building the user interface.
- **TypeScript:** For static typing and improved developer experience.
- **Tailwind CSS:** For rapid, utility-first styling.

## Project Structure

- `src/components/`: Contains all React components, organized by feature.
- `src/services/`: A service layer that acts as a bridge between the UI and the data-fetching logic.
- `src/api/`: **Contains the mock API calls.** This is where you'll connect to your backend.
- `src/constants/`: Contains static mock data like the list of ingredients and countries.
- `src/types.ts`: Defines shared TypeScript types used throughout the application.

## Connecting to a Real Backend

This prototype uses a mock API to simulate data fetching. All mock data fetching functions are centralized in one file for easy replacement.

**File to Edit:** `src/api/complianceApi.ts`

To connect to your real backend, you will need to replace the mock logic inside the functions in this file with actual API calls (e.g., using `fetch` or a library like `axios`).

### Example:

Here is the current mock implementation for fetching a compliance report:

```typescript
// in src/api/complianceApi.ts

export const fetchComplianceInfo = async (ingredientName: string, countryName:string): Promise<string> => {
    // Simulate a longer network delay
    await sleep(500 + Math.random() * 500);

    // MOCK LOGIC TO BE REPLACED
    const mockReport = `### OVERALL COMPLIANCE STATUS...`;
    return mockReport.trim();
};
```

You would replace it with your actual API call like this:

```typescript
// in src/api/complianceApi.ts

export const fetchComplianceInfo = async (ingredientName: string, countryName:string): Promise<string> => {
    try {
        const response = await fetch(`https://your-api.com/compliance/report?ingredient=${encodeURIComponent(ingredientName)}&country=${encodeURIComponent(countryName)}`);

        if (!response.ok) {
            // Handle HTTP errors
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.report; // Assuming your API returns { "report": "..." }
    } catch (error) {
        console.error("Failed to fetch compliance info:", error);
        return "Failed to load detailed report due to a network or server error.";
    }
};
```

You would do the same for the other functions in `src/api/complianceApi.ts`:
- `fetchSimpleComplianceStatus`
- `fetchIngredientSummary`

No other files need to be changed to connect the data layer.

## Getting Started (for future development)

This is a prototype environment. For a standard local development setup, you would typically run:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```