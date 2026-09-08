import Popup from "../../../src/js/core/tools/Popup";

describe("Popup tool", () => {
    let popup;
    let tableElement;
    let popupElement;
    let originalClientWidth;
    let originalClientHeight;
    let originalScrollLeft;
    let originalScrollTop;
    let originalBodyOffsetWidth;

    function setReadonlyDimension(element, property, value) {
        Object.defineProperty(element, property, {
            configurable: true,
            get: () => value,
        });
    }

    beforeEach(() => {
        originalClientWidth = Object.getOwnPropertyDescriptor(document.documentElement, "clientWidth");
        originalClientHeight = Object.getOwnPropertyDescriptor(document.documentElement, "clientHeight");
        originalScrollLeft = Object.getOwnPropertyDescriptor(document.documentElement, "scrollLeft");
        originalScrollTop = Object.getOwnPropertyDescriptor(document.documentElement, "scrollTop");
        originalBodyOffsetWidth = Object.getOwnPropertyDescriptor(document.body, "offsetWidth");

        setReadonlyDimension(document.documentElement, "clientWidth", 650);
        setReadonlyDimension(document.documentElement, "clientHeight", 600);
        setReadonlyDimension(document.documentElement, "scrollLeft", 0);
        setReadonlyDimension(document.documentElement, "scrollTop", 0);
        setReadonlyDimension(document.body, "offsetWidth", 620);

        tableElement = document.createElement("div");
        document.body.appendChild(tableElement);

        popupElement = document.createElement("div");
        setReadonlyDimension(popupElement, "offsetWidth", 96);
        setReadonlyDimension(popupElement, "offsetHeight", 200);

        popup = new Popup({
            destroyed: false,
            element: tableElement,
            options: {
                popupContainer: false,
            },
            eventBus: {
                subscribe: jest.fn(),
                unsubscribe: jest.fn(),
            },
        }, popupElement);
    });

    afterEach(() => {
        popupElement?.remove();
        tableElement?.remove();

        [
            [document.documentElement, "clientWidth", originalClientWidth],
            [document.documentElement, "clientHeight", originalClientHeight],
            [document.documentElement, "scrollLeft", originalScrollLeft],
            [document.documentElement, "scrollTop", originalScrollTop],
            [document.body, "offsetWidth", originalBodyOffsetWidth],
        ].forEach(([element, property, descriptor]) => {
            if(descriptor){
                Object.defineProperty(element, property, descriptor);
            }else{
                delete element[property];
            }
        });
    });

    it("positions body-hosted popups against the viewport instead of body width", () => {
        popup.element.style.left = "554px";
        popup.element.style.top = "202px";

        popup._fitToScreen(554, 202, {offsetHeight: 34}, {left: 554}, "bottom");

        expect(popup.element.style.left).toBe("554px");
        expect(popup.element.style.right).toBe("");
    });

    it("positions body-hosted popups against the scrolled viewport", () => {
        setReadonlyDimension(document.documentElement, "scrollLeft", 400);
        popup.element.style.left = "554px";
        popup.element.style.top = "202px";

        popup._fitToScreen(554, 202, {offsetHeight: 34}, {left: 554}, "bottom");

        expect(popup.element.style.left).toBe("554px");
        expect(popup.element.style.right).toBe("");
    });

    it("reverses body-hosted popups with page coordinates when horizontally scrolled", () => {
        setReadonlyDimension(document.documentElement, "clientWidth", 200);
        setReadonlyDimension(document.documentElement, "scrollLeft", 400);
        popup.element.style.left = "554px";
        popup.element.style.top = "202px";

        popup._fitToScreen(554, 202, {offsetHeight: 34}, {left: 554}, "bottom");

        expect(popup.element.style.left).toBe("458px");
        expect(popup.element.style.right).toBe("");
    });

    it("reverses child popups within container bounds", () => {
        const container = document.createElement("div");
        setReadonlyDimension(container, "offsetWidth", 650);
        setReadonlyDimension(container, "offsetHeight", 600);
        setReadonlyDimension(container, "scrollLeft", 0);
        setReadonlyDimension(container, "scrollTop", 0);
        setReadonlyDimension(popupElement, "offsetWidth", 100);
        popup.container = container;
        popup.element.style.left = "630px";
        popup.element.style.top = "100px";

        popup._fitToScreen(630, 100, {offsetWidth: 40, offsetHeight: 20}, {left: 610}, "right");

        expect(popup.element.style.left).toBe("510px");
        expect(popup.element.style.right).toBe("");
        expect(popup.reversedX).toBe(true);
    });

    it("resets reversed positioning when a root popup is reused", () => {
        const parentElement = document.createElement("div");
        tableElement.appendChild(parentElement);
        setReadonlyDimension(parentElement, "offsetWidth", 40);
        setReadonlyDimension(parentElement, "offsetHeight", 20);
        popup.elementPositionCoords = jest.fn(() => {
            return {x: 200, y: 100, offset: {left: 200, top: 100}};
        });
        popup.subscribe = jest.fn();
        popup.reversedX = true;
        popup.element.style.right = "40px";

        popup.show(parentElement, "bottom");

        expect(popup.element.style.left).toBe("200px");
        expect(popup.element.style.right).toBe("");
        expect(popup.reversedX).toBe(false);
    });
});
