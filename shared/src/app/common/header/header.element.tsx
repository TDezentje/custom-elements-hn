import { CustomElement } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/common/router/link/link.element';

@CustomElement({
    selector: 'hn-header',
    css: './header.scss'
})
export class HeaderElement extends HTMLElement {
    render() {
        const me = this;
        return <div id="header" class="floating" role="navigation">
            <div class="content">
                <LinkElement path="/" class="icon">
                    <img src="/assets/favicon.png" alt="home" />
                </LinkElement>
                <LinkElement path="/new" class="link">New</LinkElement>
                <LinkElement path="/show" class="link">Show</LinkElement>
                <LinkElement path="/ask" class="link">Ask</LinkElement>
                <LinkElement path="/job" class="link">Jobs</LinkElement>
            </div>
        </div>;
    }
}
