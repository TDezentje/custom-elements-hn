import { CustomElement, render } from 'decorators/custom-element.decorator';
import { Input } from 'decorators/input.decorator';
import { LinkElement } from 'app/router/link/link.element';
import { HackerNewsService } from 'services/hacker-news.service';

@CustomElement({
    selector: 'hn-item-list-row',
    requires: [],
    template: (element: ItemListRowElement) => {
        if (element.item) {
            return <template>
                <span class="item-list-row__number">{element.nr}</span>
                <div class="item-list-row__content">
                    <div>
                        <LinkElement class="item-list-row__title" path={element.item.url}>{element.item.title}</LinkElement>&nbsp;
                        {
                            element.item.domain ? <LinkElement class="item-list-row__domain" path={`//${element.item.domain}`}>({element.item.domain})</LinkElement> : null
                        }
                        
                    </div>
                    <div class="item-list-row__details">
                        <span>{element.item.points}</span>&nbsp;
                        <span>points by</span>&nbsp;
                        <LinkElement path={`/user/${element.item.user}`} class="item-list-row__by">{element.item.user}</LinkElement>&nbsp;
                        <span>{element.item.time_ago}</span>&nbsp;
                        <span> | </span>&nbsp;
                        <LinkElement path={`/item/${element.item.id}`} class="item-list-row__comment-count">{ element.item.comments_count > 0 ? `${element.item.comments_count} comments` : 'Discuss' }</LinkElement>
                    </div>
                </div>
            </template>;
        } else {
            return <template><div></div></template>
        }
    },
    css: require('./item-list-row.scss')
})
export class ItemListRowElement extends HTMLElement {
    @Input
    public nr;
    @Input
    public item;

    constructor() {
        super();
    }

    connectedCallback() {
        if (this.item.url) {

            if (this.item.url.indexOf('item?id') === 0) {
                this.item.url = `/${this.item.url.replace('?id=', '/')}`;
            }
        }
    }
}
