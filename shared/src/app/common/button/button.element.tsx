import { CustomElement } from 'decorators/custom-element.decorator';
import { Bind } from 'decorators/bind.decorator';
import { Attribute } from 'decorators/attribute.decorator';

@CustomElement({
    selector: 'hn-button',
    css: './button.scss'
})
export class ButtonElement extends HTMLElement {
    @Attribute()
    public flat: boolean;
    @Attribute()
    public fab: boolean;
    @Attribute()
    public critical: boolean;

    @Attribute()
    public name: string;

    render() {
        const me = this;

        return <button name={this.name} value={this.name ? 'true': undefined} class="button">
            <slot/>
        </button>;
    }
}