import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';

import { RouterElement } from '../router.element';

@CustomElement({
    selector: 'hn-link',
    requires: [RouterElement]
})
export class LinkElement extends HTMLElement {
    private _a: HTMLAnchorElement;

    constructor() {
        super();
    }

    get external() {
        return this.hasAttribute('external');
    }

    set external(value) {
        if(value) {
            this.setAttribute('external', '');
        } else {
            this.removeAttribute('external');
        }
        this._processPath();
    }

    get path() {
        return this._a.href;
    }

    set path(path: string) {
        if(path) {
            this._a.href = path;
            this.setAttribute('path', path);
            this.external = path.startsWith('http');
        }
    }

    get text() {
        return this._a.textContent;
    }

    set text(text: string) {
        this._a.textContent = text;
    }

    connectedCallback() {
        this._a = document.createElement('a');
        let child;
        while((child = this.firstChild)) {
            this._a.appendChild(child);
        }

        this._processPath();
        this.appendChild(this._a);

        this.path = this.getAttribute('path');
    }

    private _processPath() {
        if(!this.external) {
            this._a.addEventListener('click', this._onClick);
            this._a.removeAttribute('rel');
            this._a.removeAttribute('target');
        } else {
            this._a.removeEventListener('click', this._onClick);
            this._a.rel = 'noopener';
            this._a.target = '_blank';
        }
    }

    @Bind
    private _onClick(event) {
        event.preventDefault();
        (<RouterElement>document.querySelector('hn-router')).navigate(this.path);
    }
}
