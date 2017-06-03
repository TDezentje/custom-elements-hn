import { CustomElement } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/router/link/link.element';

interface IElements {
    number: HTMLElement,
    title: LinkElement,
    website: LinkElement,
    score: HTMLElement,
    by: LinkElement,
    time: HTMLElement,
    commentCount: LinkElement
}

@CustomElement({
    selector: 'hn-item-list-row',
    requires: [],
    template: require('./item-list-row.html'),
    css: require('./item-list-row.scss')
})
export class ItemListRowElement extends HTMLElement {
    private $: IElements;
    private _item;
    private _nr;

    constructor(nr: number, item: any) {
        super();
        this._item = item;
        this._nr = nr;
    }

    connectedCallback() {
        this.$.number.textContent = this._nr;

        this.$.score.textContent = this._item.points;
        this.$.time.textContent = this._item.time_ago;

        this.$.by.text = this._item.user;
        this.$.by.path = `/user/${this._item.user}`;
        
        this.$.commentCount.text = this._item.comments_count > 0 ? `${this._item.comments_count} comments`: 'Discuss';
        this.$.commentCount.path = `/item/${this._item.id}`;

        this.$.title.text = this._item.title;

        if(this._item.url) {

            if(this._item.url.startsWith('item?id')) {
                this._item.url = `/${this._item.url.replace('?id=', '/')}`;
            }

            this.$.title.path = this._item.url;

            if(this._item.domain) {
                this.$.website.text = `(${this._item.domain})`;
                this.$.website.path = `//${this._item.domain}`;
            }
        }
    }
}
