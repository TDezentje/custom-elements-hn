import { CustomElement, raw } from 'decorators/custom-element.decorator';
import { Inject } from 'decorators/inject.decorator';
import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/common/router/link/link.element';
import { Item } from 'models/item.model';

@CustomElement({
    selector: 'hn-comment',
    requires: [LinkElement],
    css: './comment.scss',
    args: ['comment']
})
export class CommentElement extends HTMLElement {
    private comment: Item;
    private toggle: HTMLElement;
    private isExpanded = true;
    private commentsContainer: HTMLElement;
    private textContainer: HTMLElement;

    constructor(comment: Item) {
        super();
        this.comment = comment;
    }

    public render() {
        const me = this;
        return [
            <div class="details">
                <span ref="toggle" class="toggle">[-]</span>
                <LinkElement path={`/user/${this.comment.by}`} class="user">{this.comment.by}</LinkElement>&nbsp;
                <span class="time">{this.comment.time}</span>
            </div>,
            <div ref="textContainer" class="text"> {
                raw(`<div>${this.comment.text}</div>`)
            }</div>,
            this.comment.comments.length > 0 ? <div ref="commentsContainer" class="comments"> {
                this.comment.comments.map(comment => !comment.deleted && <CommentElement comment={comment} />)
            } </div>: null
        ];
    }

    public afterRender() {
        this.toggle.style.display = 'initial';
        this.toggle.addEventListener('click', this.onToggleClick);
    }

    @Bind
    private onToggleClick() {
        this.isExpanded = !this.isExpanded;

        this.toggle.textContent = `[${this.isExpanded ? '-' : '+'}]`;
        this.textContainer.style.display = this.isExpanded ? 'block' : 'none';

        if (this.commentsContainer) {
            this.commentsContainer.style.display = this.isExpanded ? 'block' : 'none';
        }
    }
}
