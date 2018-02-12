import { CustomElement, raw } from 'decorators/custom-element.decorator';
import { Inject } from 'decorators/inject.decorator';
import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/common/router/link/link.element';
import { ButtonElement } from 'app/common/button/button.element';
import { RouterService } from 'services/router.service';
import { ProgressIndicatorElement } from 'app/common/progress-indicator/progress-indicator.element';
import { User } from 'models/user.model';
import { HackerNewsService } from 'services/hacker-news.service';
import { CommentElement } from 'app/common/comment/comment.element';

@CustomElement({
    selector: 'hn-user',
    requires: [CommentElement, LinkElement, ButtonElement, ProgressIndicatorElement],
    css: './user.scss'
})
export class UserElement extends HTMLElement {
    @Inject(HackerNewsService)
    private hackerNewsService: HackerNewsService;

    @Inject(RouterService)
    private routerService: RouterService;

    private user: User;

    async init() {
        const params = this.routerService.getCurrentParams();
        this.user = await this.hackerNewsService.getUser(params.id);
    }

    public renderLoader() {
        const me = this;
        return <ProgressIndicatorElement />
    }

    public render() {
        const me = this;
        return [
            <div class="title">
                <span>{this.user.id}</span>
            </div>,
            <div class="details">
                <span>{this.user.karma} karma</span>
                <span>Created {this.user.created}</span>
            </div>,
            this.user.about && <div>
                <div class="about-header">About</div>
                {
                    raw(`<div>${this.user.about}</div>`)
                }
            </div>
        ];
    }

    public afterRender() {

    }



}
