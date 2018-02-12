(<any>window).bootstrapApplication = async function () {
    const promises = [];

    //load fetch polyfill if needed
    if (!('fetch' in window)) {
        promises.push(System.import(
            /* webpackChunkName: "fetch" */
            'whatwg-fetch/fetch.js'
        ));
    }

    //load custom elements polyfill
    if (!('customElements' in window)) {
        promises.push(System.import(
            /* webpackChunkName: "custom-elements" */
            '@webcomponents/custom-elements/custom-elements.min.js'
        ));
    } else {
        promises.push(System.import(
            /* webpackChunkName: "custom-elements-adapter" */
            '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'
        ));
    }

    if (!Array.from) {
        promises.push(System.import(
            /* webpackChunkName: "corejs" */
            'core-js/shim'
        ));
    }

    //add custom events polyfill if needed
    (function () {
        if (typeof (window as any).CustomEvent === "function") return false; //If not IE

        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEvent.prototype = (window as any).Event.prototype;

        (window as any).Event = CustomEvent;
    })();

    await Promise.all(promises);

    require('app/app.element').App;
}