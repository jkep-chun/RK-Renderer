export class Solution {
    #results;
    #length;
    #rmse;
    #l_infty;

    constructor(results) {
        if (Array.isArray(results) && results.length > 0) {
            this.#results = results;
            this.#length = results.length;
            this.#rmse = this.#calculateRMSE();
            this.#l_infty = this.#calculateLInfinity();
        } else {
            this.#results = [];
            this.#length = 0;
            this.#rmse = 0;
            this.#l_infty = 0;
        }
    }

    #calculateRMSE() {
        if (this.#length === 0) return 0;
        const sumSquaredErrors = this.#results.reduce((sum, point) => sum + Math.pow(point.e, 2), 0);
        return Math.sqrt(sumSquaredErrors / this.#length);
    }

    #calculateLInfinity() {
        if (this.#length === 0) return 0;
        return this.#results.reduce((maxError, point) => Math.max(maxError, Math.abs(point.e)), 0);
    }

    getResults() {
        return this.#results;
    }

    getLength() {
        return this.#length;
    }

    getRMSE() {
        return this.#rmse;
    }

    getLInfinity() {
        return this.#l_infty;
    }

}