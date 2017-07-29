import { CustomElement, render } from 'decorators/custom-element.decorator';
import { ToolbarElement } from './toolbar/toolbar.element';
import { RouterElement } from './router/router.element';
import { LinkElement } from './router/link/link.element';

@CustomElement({
    selector: 'hn-app',
    requires: [RouterElement, ToolbarElement],
    template: (el: App) => <template>
        <ToolbarElement/>
        <RouterElement id="content" role="main"/>
    </template>,
    css: require('./app.scss')
})
export class App extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {}

    afterConnectedCallback() {
        document.body.classList.remove('loading');
    }
}
