import { CustomElement, render } from 'decorators/custom-element.decorator';
import { Child } from 'decorators/child.decorator';
import { Input } from 'decorators/input.decorator';

import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/router/link/link.element';

@CustomElement({
    selector: 'hn-comment',
    template: (el: CommentElement) => <template>
        <span ref="toggle" class="toggle">[-]</span>
        <LinkElement class="by" path={`/user/${el.comment.user}`}>{el.comment.user}</LinkElement>
        <LinkElement class="time" path={`/item/${el.comment.id}`}>{el.comment.time_ago}</LinkElement>

        <p ref="text" class="text" raw>{el.comment.content}</p>
        <div class="comments" ref="commentsList">
            {
                el.comment.comments.map(comment => <CommentElement comment={comment}/>)
            }
        </div>
    </template>,
    css: require('./comment.scss')
})
export class CommentElement extends HTMLElement {
    private _isVisible: boolean = true;

    @Input
    public comment;

    @Child 
    public text: HTMLElement;
    @Child 
    public commentsList: HTMLElement;

    @Child 
    public toggle: HTMLElement;

    constructor() {
        super();
    }

    afterConnectedCallback() {
        this._isVisible = true;    
        this.toggle.addEventListener('click', this._onToggleClick);
    }

    @Bind
    _onToggleClick() {
        if(this._isVisible) {
            this.text.style.display = 'none';
            this.commentsList.style.display = 'none';
            this.toggle.textContent = '[+]';
        } else {
            this.text.style.display = 'block';
            this.commentsList.style.display = 'block';
            this.toggle.textContent = '[-]';
        }

        this._isVisible = !this._isVisible;
    }
}