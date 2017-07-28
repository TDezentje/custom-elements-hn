async function bootstrap() {
    const promises = [];

    if (!('fetch' in window)) {
        promises.push(System.import('whatwg-fetch/fetch.js'));
    }

    if (!('customElements' in window)) {
        promises.push(System.import('@webcomponents/custom-elements/custom-elements.min.js'));
    } else {
        promises.push(System.import('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'));
    }

    await Promise.all(promises);

    require('./app/app.element').App;
}

bootstrap();