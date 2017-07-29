import { CustomElement, render } from 'decorators/custom-element.decorator';
import { ItemListRowElement } from './item-list-row/item-list-row.element';
import { LinkElement } from 'app/router/link/link.element';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

@CustomElement({
    selector: 'hn-item-list',
    requires: [ItemListRowElement, LinkElement, ProgressIndicatorElement],
    template: (element: ItemListElement) => {
        if (!element.items) {
            return <template>
                <div class="container">
                    <ProgressIndicatorElement/>
                </div>
            </template>;
        } else {
            return <template>
                <div class="container">
                    {
                        element.items.map((item, i) => <ItemListRowElement item={item} nr={element.page * 30 + i + 1} />)
                    }
                </div>
                <div class="navigation">
                    {
                        element.page > 0 ? <LinkElement path={`/${element.type}/${element.page}`} class="navigation-button">&lt; previous</LinkElement> : ''
                    }
                    <LinkElement path={`/${element.type}/${element.page + 2}`} class="navigation-button"> next &gt;</LinkElement>
                </div>
            </template>;
        }
    },
    css: require('./item-list.scss')
})
export class ItemListElement extends HTMLElement {
    public type: string;
    public page: number;
    public items: any[];

    constructor(type: string, page: number) {
        super();
        this.type = type;
        this.page = page - 1;
    }

    async connectedCallback() {
        this.items = await HackerNewsService.getStories(this.type, this.page + 1);
    }
}