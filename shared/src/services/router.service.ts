export class RouterService {
    private static params;

    public setParams(params) {
        RouterService.params = params;
    }

    public getCurrentParams() {
        return RouterService.params;
    }
}