import { CustomElement } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/router/link/link.element';

@CustomElement({
    selector: 'hn-toolbar',
    requires: [ LinkElement ],
    template: require('./toolbar.html'),
    css: require('./toolbar.scss')
})
export class ToolbarElement extends HTMLElement {
    constructor() {
        super();
    }
}
