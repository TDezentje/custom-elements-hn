import { CustomElement } from 'decorators/custom-element.decorator';
import { LinkElement } from 'app/router/link/link.element';
import { CommentElement } from './comment/comment.element';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

interface IElements {
    number: HTMLElement,
    title: LinkElement,
    website: LinkElement,
    score: HTMLElement,
    by: LinkElement,
    time: LinkElement,
    text: HTMLElement,
    commentCount: HTMLElement,
    commentsList: HTMLElement,
    progressIndicator: ProgressIndicatorElement,
    content: HTMLElement
}

@CustomElement({
    selector: 'hn-item',
    requires: [ LinkElement, CommentElement, ProgressIndicatorElement ],
    template: require('./item.html'),
    css: require('./item.scss')
})
export class ItemElement extends HTMLElement {
    private _id: number;
    private $: IElements;

    constructor(id:number) {
        super();
        this._id = id;
    }

    async connectedCallback() {
        this.$.content.style.display = 'none';
        const item = await HackerNewsService.getItem(this._id);

        this.$.score.textContent = item.points;

        this.$.by.text = item.user;
        this.$.by.path = `/user/${item.user}`;

        this.$.time.text = item.time_ago;
        this.$.time.path = `/item/${item.id}`;

        if(item.title) {
            this.$.title.text = item.title;
        } else {
            this.$.title.style.display = 'none';
        }

        if(item.title && item.url) {
            this.$.title.text = item.title;
            this.$.title.path = item.url;

            if(item.domain) {
                this.$.website.text = `(${item.domain})`;
                this.$.website.path = `//${item.domain}`;
            }
        } else if(item.title) {
            this.$.title.text = item.title;
        } else {
            this.$.title.style.display = 'none';
            this.$.website.style.display = 'none';
        }

        if(item.content) {
            this.$.text.innerHTML = item.content;
        } else {
            this.$.text.style.display = 'none';
        }

        if(item.comments) {
            this.$.commentCount.textContent = `${item.comments_count} comments`;
        } else {
            this.$.commentsList.style.display = 'none';
        }

        const documentFragment = document.createDocumentFragment();
        for(let comment of item.comments) {
            documentFragment.appendChild(new CommentElement(comment));
        }
        this.$.commentsList.appendChild(documentFragment);

        this.$.content.style.display = 'block';
        this.$.progressIndicator.hide();
    }
}