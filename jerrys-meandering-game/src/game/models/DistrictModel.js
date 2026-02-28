/**
 * This class represents the state of the district objects in the game.
 */
export class DistrictModel {

    /**
     * Constructor initializes the districts array.
     */
    constructor() {
        this.districts = [];
    }

    /**
     * Add a district to the model.
     * 
     * @param {object} district - The district object containing cells and winningColor
     */
    addDistrict(district) {
        this.districts.push(district);
    }

    /**
     * Remove a specific district from the model.
     * 
     * @param {object} district - The district object to remove
     */
    removeDistrict(district) {
        this.districts = this.districts.filter(d => d !== district);
    }

    /**
     * Get all districts currently in the model.
     * 
     * @returns {array} Array of district objects
     */
    getDistricts() {
        return this.districts;
    }

    /**
     * Clear all districts from the model.
     */
    clearDistricts() {
        this.districts = [];
    }

    /**
     * Get the number of districts.
     * 
     * @returns {number} Number of districts
     */
    getDistrictCount() {
        return this.districts.length;
    }
}