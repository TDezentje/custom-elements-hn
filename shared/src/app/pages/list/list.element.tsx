import { CustomElement } from 'decorators/custom-element.decorator';
import { Inject } from 'decorators/inject.decorator';
import { Bind } from 'decorators/bind.decorator';
import { LinkElement } from 'app/common/router/link/link.element';
import { ButtonElement } from 'app/common/button/button.element';
import { RouterService } from 'services/router.service';
import { ProgressIndicatorElement } from 'app/common/progress-indicator/progress-indicator.element';
import { Item } from 'models/item.model';
import { HackerNewsService } from 'services/hacker-news.service';

@CustomElement({
    selector: 'hn-list',
    requires: [LinkElement, ButtonElement, ProgressIndicatorElement],
    css: './list.scss'
})
export class ListElement extends HTMLElement {
    @Inject(HackerNewsService)
    private hackerNewsService: HackerNewsService;

    @Inject(RouterService)
    private routerService: RouterService;

    private items: Item[];
    private page = 0;
    private isLoading = false;
    private loadedAllItems = false;

    private itemContainer: HTMLElement;
    private actionsContainer: HTMLElement;
    private sentinel: HTMLElement;
    private progressIndicator: ProgressIndicatorElement;
    private params: any;

    async init() {
        const params = this.routerService.getCurrentParams();

        if (params.page) {
            this.page = params.page;
        }

        this.items = await this.hackerNewsService.getItems(params.type || 'top', this.page);
    }

    public renderLoader() {
        const me = this;
        return <ProgressIndicatorElement />
    }

    public render() {
        const me = this;
        return [
            <div ref="itemContainer" class="item-container">
                {
                    this.renderItems(this.items)
                }
            </div>,
            <div ref="sentinel"></div>,
            <div ref="actionsContainer" class="actions">
                {
                    this.page > 0 ? <LinkElement path={`/?page=${this.page - 1}`}>
                        <ButtonElement>Previous</ButtonElement>
                    </LinkElement> : <div />
                }
                {
                    this.page < 25 && <LinkElement path={`/?page=${this.page + 1}`}>
                        <ButtonElement>Next</ButtonElement>
                    </LinkElement>
                }
            </div>
        ];
    }

    private renderItems(items: Item[]) {
        const me = this;
        return [].concat(...items.map(item => [
            <div class="item">
                <span class="index">{items.indexOf(item) + 1 + (this.page * 20)}</span>
                <div class="content">
                    <div class="title">
                        <LinkElement path={item.url || `/item/${item.id}`}>{item.title}</LinkElement>
                        {
                            item.domain && <span class="domain">&nbsp;
                                ({item.domain})
                            </span>
                        }
                    </div>
                    <div class="details">
                        <span>{item.score} points by</span>&nbsp;
                        <LinkElement path={`/user/${item.by}`} class="user">{item.by}</LinkElement>&nbsp;
                        <span>{item.time}</span>
                        {
                            item.type !== 'job' &&[
                                <span>&nbsp;|&nbsp;</span>,
                                <LinkElement path={`/item/${item.id}`} class="comments">{
                                    item.descendants ? `${item.descendants} comments` : 'discuss'
                                }</LinkElement>
                            ]
                        }
                    </div>
                </div>
            </div>
        ]));
    }


    public afterRender() {
        this.params = this.routerService.getCurrentParams();

        this.actionsContainer.style.display = 'none';
        document.addEventListener('scroll', this.handleScroll);
    }


    public disconnectedCallback() {
        document.removeEventListener('scroll', this.handleScroll);
    }

    @Bind
    private async handleScroll() {
        const rect = this.sentinel.getBoundingClientRect();

        if (!this.loadedAllItems && !this.isLoading && window.innerHeight > rect.top - (window.innerHeight * 0.1)) {
            this.isLoading = true;
            this.page++;


            this.addProgressIndicator();
            const items = await this.hackerNewsService.getItems(this.params.type || 'top', this.page);

            if (items.length > 0) {
                const documentFragment = this.createDocumentFragmentFromNodes(this.renderItems(items));
                this.itemContainer.appendChild(documentFragment);
            }

            if (this.page === 25 || items.length === 0) {
                this.removeProgressIndicator();
                this.loadedAllItems = true;
            }

            this.isLoading = false;
        }
    }

    private addProgressIndicator() {
        if (!this.progressIndicator) {
            this.progressIndicator = new ProgressIndicatorElement();
            this.appendChild(this.progressIndicator);
        }
    }

    private removeProgressIndicator() {
        if (this.progressIndicator) {
            this.removeChild(this.progressIndicator);
            this.progressIndicator = undefined;
        }
    }

    private createDocumentFragmentFromNodes(nodes) {
        const documentFragment = document.createDocumentFragment();
        for (const node of nodes) {
            documentFragment.appendChild(node);
        }
        return documentFragment;
    }
}
