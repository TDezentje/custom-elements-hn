import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

interface IElements {
    id: HTMLElement,
    created: HTMLElement,
    karma: HTMLElement,
    text: HTMLElement,
    progressIndicator: ProgressIndicatorElement,
    content: HTMLElement
}

@CustomElement({
    selector: 'hn-user',
    requires: [ProgressIndicatorElement],
    template: require('./user.html'),
    css: require('./user.scss')
})
export class UserElement extends HTMLElement {
    private $: IElements;
    private _userId: string;

    constructor(userId: string) {
        super();

        this._userId = userId;
    }

    async connectedCallback() {
        this.$.content.style.display = 'none';
        const user = await HackerNewsService.getUser(this._userId);

        this.$.id.textContent = user.id;
        this.$.created.textContent = user.created;
        this.$.karma.textContent = `${user.karma} Karma`;

        if(user.about) {
            this.$.text.innerHTML = user.about;
        } else {
            this.$.text.style.display = 'none';
        }
        
        this.$.content.style.display = 'block';
        this.$.progressIndicator.hide();
    }
}