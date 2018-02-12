import { CustomElement, raw } from 'decorators/custom-element.decorator';
import { Inject } from 'decorators/inject.decorator';
import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/common/router/link/link.element';
import { ButtonElement } from 'app/common/button/button.element';
import { RouterService } from 'services/router.service';
import { ProgressIndicatorElement } from 'app/common/progress-indicator/progress-indicator.element';
import { Item } from 'models/item.model';
import { HackerNewsService } from 'services/hacker-news.service';
import { CommentElement } from 'app/common/comment/comment.element';

@CustomElement({
    selector: 'hn-item',
    requires: [CommentElement, LinkElement, ButtonElement, ProgressIndicatorElement],
    css: './item.scss'
})
export class ItemElement extends HTMLElement {
    @Inject(HackerNewsService)
    private hackerNewsService: HackerNewsService;

    @Inject(RouterService)
    private routerService: RouterService;

    private item: Item;

    async init() {
        const params = this.routerService.getCurrentParams();
        this.item = await this.hackerNewsService.getItem(params.id);
    }

    public renderLoader() {
        const me = this;
        return <ProgressIndicatorElement />
    }

    public render() {
        const me = this;
        return [
            <div class="title">
                {
                    this.item.url ? <LinkElement path={this.item.url}>{this.item.title}</LinkElement> :
                        <span>{this.item.title}</span>
                }
                {
                    this.item.domain && <span class="domain">&nbsp;
                        ({this.item.domain})
                    </span>
                }
            </div>,
            <div class="details">
                <span>{this.item.score} points by</span>&nbsp;
                <LinkElement path={`/user/${this.item.by}`} class="user">{this.item.by}</LinkElement>&nbsp;
                <span>{this.item.time}</span>
            </div>,
            this.item.text && <div> {
                raw(`<div>${this.item.text}</div>`)
            }</div>,
            this.item.descendants && [
                <span class="comments-counter">{`${this.item.descendants} comments`}</span>,
                this.item.comments.map(comment => !comment.deleted && <CommentElement comment={comment} />)
            ]
        ];
    }

    public afterRender() {

    }



}
