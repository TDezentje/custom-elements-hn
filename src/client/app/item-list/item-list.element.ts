import { CustomElement } from 'decorators/custom-element.decorator';
import { ItemListRowElement } from './item-list-row/item-list-row.element';
import { LinkElement } from 'app/router/link/link.element';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

interface IElements {
    list: HTMLElement,
    previous: LinkElement,
    next: LinkElement,
    progressIndicator: ProgressIndicatorElement
}

@CustomElement({
    selector: 'hn-item-list',
    requires: [ ItemListRowElement, LinkElement, ProgressIndicatorElement],
    template: require('./item-list.html'),
    css: require('./item-list.scss')
})
export class ItemListElement extends HTMLElement {
    private _type: string;
    private _page: number;
    private $: IElements;

    constructor(type:string, page:number) {
        super();
        this._type = type;
        this._page = page - 1;
    }

    async connectedCallback() {
        const items = await HackerNewsService.getStories(this._type, this._page + 1);
        
        let documentFragment = document.createDocumentFragment();
        for(let i = 0; i <= items.length - 1; i++) {
            let item = items[i];
            documentFragment.appendChild(new ItemListRowElement((this._page * 30) + i + 1, item));
        }
        this.$.list.appendChild(documentFragment);        

        this.$.next.path = `/${this._type}/${this._page+2}`;
        this.$.previous.style.display = '';

        if(this._page > 0) {
            this.$.previous.path = `/${this._type}/${this._page}`;
            this.$.previous.style.display = '';
        } else {
            this.$.previous.style.display = 'none';
        }

        this.$.progressIndicator.hide();
    }
}