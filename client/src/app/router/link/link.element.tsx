import { CustomElement, render } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { Child } from 'decorators/child.decorator';
import { Input } from 'decorators/input.decorator';

import { RouterElement } from '../router.element';

@CustomElement({
    selector: 'hn-link',
    requires: [RouterElement],
    template: (el: LinkElement) => {
        if (el.isExternal) {
            return <template>
                <a ref="aElement" href={el.path} target="_blank" rel="noopener">
                    {el.contentSlot}
                </a>
            </template>;
        } else {
            return <template>
                <a ref="aElement" href={el.path}>
                    {el.contentSlot}
                </a>
            </template>;
        }
    }
})
export class LinkElement extends HTMLElement {

    @Child
    public aElement: HTMLAnchorElement;

    @Input
    public path: string;
    public isExternal: boolean;

    public contentSlot;

    constructor() {
        super();
    }

    connectedCallback() {
        this.isExternal = this.path.indexOf('http') === 0 || this.path.indexOf('//') === 0;
    }

    afterConnectedCallback() {
        if(!this.isExternal) {
            this.aElement.addEventListener('click', this._onClick);
        }
    }

    @Bind
    private _onClick(event) {
        event.preventDefault();
        (document.querySelector('hn-router') as RouterElement).navigate(this.aElement.getAttribute('href'));
    }
}
