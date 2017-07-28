import { CustomElement, render } from 'decorators/custom-element.decorator';

import { LinkElement } from 'app/router/link/link.element';
import { CommentElement } from './comment/comment.element';
import { ProgressIndicatorElement } from 'app/progress-indicator/progress-indicator.element';

import { HackerNewsService } from 'services/hacker-news.service';

@CustomElement({
    selector: 'hn-item',
    requires: [LinkElement, CommentElement, ProgressIndicatorElement],
    template: (el: ItemElement) => <template>
        <div class="content">
            {
                !el.item ? <ProgressIndicatorElement /> :
                    <div>
                        {
                            el.item.title ? <LinkElement class="title" path={el.item.url}>{el.item.title}</LinkElement> : null
                        }

                        {
                            el.item.domain ? <LinkElement class="domain" path={`//${el.item.domain}`}>({el.item.domain})</LinkElement> : null
                        }

                        <div class="details">
                            <span score>{el.item.points}</span>&nbsp;
                            <span>points by</span>&nbsp;
                            <LinkElement class="by" path={`/user/${el.item.user}`}>{el.item.user}</LinkElement>&nbsp;
                            <LinkElement class="time" path={`/item/${el.item.id}`} >{el.item.time_ago}</LinkElement>
                        </div>

                        {
                            el.item.content ? <p text class="text" raw>{el.item.content}</p> : null
                        }

                    </div>
            }
        </div>

        {
            el.item && el.item.comments ?
                <div class="comments">
                    <span class="comment-count" >{el.item.comments_count} comments</span>
                    {
                        el.item.comments.map(comment => <CommentElement comment={comment}/>)
                    }
                    
                </div> : null
        }

    </template>,
    css: require('./item.scss')
})
export class ItemElement extends HTMLElement {
    private _id: number;
    public item;

    constructor(id: number) {
        super();
        this._id = id;
    }

    async connectedCallback() {
        this.item = await HackerNewsService.getItem(this._id);
    }
}