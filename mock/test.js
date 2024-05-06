import TCBuilder from "./TCBuilder.js";

export default class test {

    static startSection(msg, step) {
        TCBuilder.instance.appendStep(step)
        TCBuilder.instance.appendAction(`Section started with message: ${msg}`)
    }

    static log(msg) {
        TCBuilder.instance.appendAction(`Log: ${msg}`)
    }

    static verify(obj, msg) {
        TCBuilder.instance.appendVerify(msg)

    }

}