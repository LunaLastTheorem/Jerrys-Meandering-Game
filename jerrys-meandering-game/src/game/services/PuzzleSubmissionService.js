/**
 * Service class for handling puzzle submission and API communication.
 */
export class PuzzleSubmissionService {
    /**
     * Constructor for PuzzleSubmissionService.
     * 
     * @param {string} apiUrl The base URL for the API (default: http://127.0.0.1:5000)
     */
    constructor(apiUrl = "http://127.0.0.1:5000") {
        this.apiUrl = apiUrl;
    }

    /**
     * Submits puzzle data to the backend and returns computed metrics.
     * 
     * @param {object} payload The formatted district data with the following structure:
     *                         {
     *                             puzzle_id: number,
     *                             districts: array,
     *                             total_votes_party_a: number,
     *                             total_votes_party_b: number
     *                         }
     * 
     * @returns {Promise<object>} The metrics result from the API containing efficiency_gap and polsby_popper
     * @throws {Error} If the API request fails
     */
    async submitPuzzle(payload) {
        const response = await fetch(`${this.apiUrl}/submit-puzzle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        return await response.json();
    }
}
