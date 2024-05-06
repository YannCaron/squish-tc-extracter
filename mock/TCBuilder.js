export default class TCBuilder {

    static _instance;

    static get instance() {
        if (!TCBuilder._instance) TCBuilder._instance = new TCBuilder()
        return TCBuilder._instance

    }

    constructor() {
        this._data = []
        this._substitutes = new Map()
    }

    get currentStep() {
        return this._data[this._data.length - 1]
    }

    get data() {
        return this._data
    }

    registerSubstitute(variableName, data) {
        this._substitutes.set(variableName, data)
    }

    appendStep(step) {
        this._data.push({
            ...step,
            verify: [],
            actions: []
        })
    }

    appendVerify(msg) {
        this.currentStep.verify.push(msg)
    }

    appendAction(msg) {
        this.currentStep.actions.push(msg)
    }

}