import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { Attribute } from 'decorators/attribute.decorator';

import { RouterElement } from '../router.element';

@CustomElement({
    selector: 'hn-link',
    requires: [RouterElement],
    css: './link.scss'
})
export class LinkElement extends HTMLElement {
    private isExternal: boolean;
    private aElement: HTMLAnchorElement;

    @Attribute()
    public path: string;

    @Attribute('force-refresh')
    public forceRefresh: boolean;

    @Attribute('open-blank')
    public openBlank: boolean;

    init() {
        this.isExternal = this.path.indexOf('http') === 0 || this.path.indexOf('//') === 0;
    }

    render() {
        const me = this;
        if (this.isExternal || this.openBlank) {
            return <a ref="aElement" href={this.path} target="_blank" class="link" rel="noopener">
                <slot/>
            </a>;
        } else {
            return <a ref="aElement" href={this.path} class="link">
                <slot/>
            </a>;
        }
    }

    afterRender() {
        this.isExternal = this.path.indexOf('http') === 0 || this.path.indexOf('//') === 0;
        
        if (!this.isExternal && !this.forceRefresh && !this.openBlank) {
            this.aElement.addEventListener('click', this._onClick);
        }
    }

    @Bind
    private _onClick(event) {
        event.preventDefault();
        RouterElement.getInstance().navigate(this.path);
    }
}
