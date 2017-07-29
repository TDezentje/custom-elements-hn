import { CustomElement, render } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/router/link/link.element';

@CustomElement({
    selector: 'hn-toolbar',
    requires: [LinkElement],
    template: () => <template>
        <div id="header" class="floating" role="navigation">
            <div class="content">
                <LinkElement path="/" class="icon">
                    <img src="/assets/favicon.png" alt="home" />
                </LinkElement>
                <LinkElement path="/newest/1" class="link">New</LinkElement>
                <LinkElement path="/show/1" class="link">Show</LinkElement>
                <LinkElement path="/ask/1" class="link">Ask</LinkElement>
                <LinkElement path="/jobs/1" class="link">Jobs</LinkElement>
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
