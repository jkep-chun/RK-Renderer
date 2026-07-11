export class Solution {
    #results;
    #length;
    #rmse;
    #l_infty;

    constructor(results) {
        this.#results = results;
        this.#length = results.length;
        this.#rmse = this.#calculateRMSE();
        this.#l_infty = this.#calculateLInfinity();
    }

    #calculateRMSE() {
        const sumSquaredErrors = this.#results.reduce((sum, point) => sum + Math.pow(point.e, 2), 0);
        return Math.sqrt(sumSquaredErrors / this.#length);
    }

    #calculateLInfinity() {
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