import { CustomElement } from 'decorators/custom-element.decorator';

@CustomElement({
    selector: 'hn-progress-indicator',
    template: require('./progress-indicator.html'),
    css: require('./progress-indicator.scss')
})
export class ProgressIndicatorElement extends HTMLElement {
    constructor() {
        super();
    }

    hide() {
        this.style.display = 'none';
    }
}