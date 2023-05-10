const ctx: Worker = self as any;

ctx.onmessage = e => {

    ctx.postMessage("end");

}