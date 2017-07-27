import { CustomElement, render } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/router/link/link.element';

@CustomElement({
    selector: 'hn-toolbar',
    requires: [LinkElement],
    template: () => <template>
        <div id="header" class="toolbar__floating" role="navigation">
            <div class="toolbar__content">
                <LinkElement path="/" class="toolbar__icon">
                    <img src="/assets/icons/favicon.png" alt="home" />
                </LinkElement>
                <LinkElement path="/newest/1" class="toolbar__link">New</LinkElement>
                <LinkElement path="/show/1" class="toolbar__link">Show</LinkElement>
                <LinkElement path="/ask/1" class="toolbar__link">Ask</LinkElement>
                <LinkElement path="/jobs/1" class="toolbar__link">Jobs</LinkElement>
            </div>
        </div>
    </template>,
    css: require('./toolbar.scss')
})
export class ToolbarElement extends HTMLElement {
    constructor() {
        super();
    }
}
