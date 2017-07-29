import { CustomElement, render, raw } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

@CustomElement({
    selector: 'hn-user',
    requires: [ProgressIndicatorElement],
    template: (el: UserElement) => {
        return <template>
            <div class="content">
                {
                    !el.user ? <ProgressIndicatorElement /> :
                        <div>
                            <span class="id">{el.user.id}</span>

                            <div class="details">
                                <span>{el.user.created}</span>&nbsp;
                                <span>|</span>&nbsp;
                                <span>{el.user.karma} Karma</span>
                            </div>

                            <p class="text">{ raw(el.user.about)}</p>
                        </div>
                }
            </div>
        </template>
    },
    css: require('./user.scss')
})
export class UserElement extends HTMLElement {
    private _userId: string;
    public user;

    constructor(userId: string) {
        super();

        this._userId = userId;
    }

    async connectedCallback() {
        this.user = await HackerNewsService.getUser(this._userId);
    }
}