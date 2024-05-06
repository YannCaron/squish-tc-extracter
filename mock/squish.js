import TCBuilder from "./TCBuilder.js";

export function startApplication(cmd) {
    TCBuilder.instance.appendAction(`Start application: ${cmd}`)
}

export function waitForObject(obj, timeout) {
    TCBuilder.instance.appendAction(`Wait for object: ${obj}, ${timeout}`)
}

export function currentApplicationContext() {
    return "TODO: currentApplicationContext";
}

export function findObject(name) {
    // TODO
    return {

    }
}

export function clickButton(obj) {
    TCBuilder.instance.appendAction(`Click on: ${obj}`);
}

export function doubleClick(obj) {
    TCBuilder.instance.appendAction(`Double click on: ${obj}`);
}

export const Button = {
    Button1: "BUTTON1",
    Button2: "BUTTON2",
    Button3: "BUTTON3"
}

export class SQobject {

    // TODO
    static children(obj) {
        return []
    }

    static globalBounds(obj) {
        return {
            x: 0,
            y: 0,
            width: 1,
            height: 1
        }
    }

    static exists(obj) {
        return true
    }

}

export class objectMap {}