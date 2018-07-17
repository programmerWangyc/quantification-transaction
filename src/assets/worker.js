function calc(interval) {
    console.log("exec.begin");

    const before = new Date();

    while (true) {
        const now = new Date();
        if (now.valueOf() - before.valueOf() > interval) {
            break;
        }
    }

    console.log("exec.end");

    return 42;
}


addEventListener("message", function (e) {
    const message = e.data;

    if (message.type == "CALC") {
        const retVal = calc(message.interval);

        const response = {
            id: message.id,
            type: "CALC_DONE",
            retVal: retVal,
        };

        postMessage(response, undefined);
    }
});
