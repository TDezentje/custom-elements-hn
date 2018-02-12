import { CustomElement } from 'decorators/custom-element.decorator';

@CustomElement({
    selector: 'hn-progress-indicator',
    css: './progress-indicator.scss'
})
export class ProgressIndicatorElement extends HTMLElement {
    public render() {
        const me = this;
        return [
            <div></div>,
            <div></div>,
            <div></div>,
            <div></div>,
            <div></div>
        ];
    }
}