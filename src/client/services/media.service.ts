let listeners: any = [];

window.addEventListener('resize', (event) => {
    MediaService._onChange();
});

export class MediaService {
    static register(cb: ()=>void) {
        listeners.push(cb);
        cb();
    }

    static _onChange() {
        for(let listener of listeners) {
            listener();
        }
    }

    static is(expectation: string) {
        let windowWidth = window.innerWidth;

        switch(expectation) {
            case 'xs':
            return windowWidth <= 599;
            case 'gt-xs':
            return windowWidth > 599;
        }
    }
}
