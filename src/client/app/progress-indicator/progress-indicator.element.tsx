import { CustomElement, render } from 'decorators/custom-element.decorator';

@CustomElement({
    selector: 'hn-progress-indicator',
    template: () => <template>
        <div></div>
        <div></div>
        <div></div>
    </template>,
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