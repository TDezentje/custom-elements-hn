import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/router/link/link.element';

interface IElements {
    by: LinkElement,
    time: LinkElement,
    text: HTMLElement,
    commentsList: HTMLElement,
    toggle: HTMLElement
}

@CustomElement({
    selector: 'hn-comment',
    template: require('./comment.html'),
    css: require('./comment.scss')
})
export class CommentElement extends HTMLElement {
    private _item: any;
    private _isVisible: boolean = true;
    private $: IElements;

    constructor(item: any) {
        super();
        this._item = item;
    }

    connectedCallback() {
        this.$.by.text = this._item.user;
        this.$.by.path = `/user/${this._item.user}`;

        this.$.time.text = this._item.time_ago;
        this.$.time.path = `/item/${this._item.id}`;

        this.$.text.innerHTML = this._item.content;

        const documentFragment = document.createDocumentFragment();
        for (let comment of this._item.comments) {
            documentFragment.appendChild(new CommentElement(comment));
        }
        this.$.commentsList.appendChild(documentFragment);
        
        this.$.toggle.addEventListener('click', this._onToggleClick);
    }

    @Bind
    _onToggleClick() {
        if(this._isVisible) {
            this.$.text.style.display = 'none';
            this.$.commentsList.style.display = 'none';
            this.$.toggle.textContent = '[+]';
        } else {
            this.$.text.style.display = 'block';
            this.$.commentsList.style.display = 'block';
            this.$.toggle.textContent = '[-]';
        }

        this._isVisible = !this._isVisible;
    }
}