import { CustomElement } from 'decorators/custom-element.decorator';
import { HeaderElement } from './common/header/header.element';
import { RouterElement } from './common/router/router.element';
import { LinkElement } from './common/router/link/link.element';

@CustomElement({
    selector: 'hn-app',
    requires: [RouterElement, HeaderElement],
    css: './app.scss'
})
export class AppElement extends HTMLElement {
    public render() {
        const me = this;
        return [
            <HeaderElement class="header" />,
            <RouterElement id="content" class="content" role="main" />
        ]
    }
}
