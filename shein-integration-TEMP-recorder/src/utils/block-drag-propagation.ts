export const blockDragPropagation = () => {
    const root = document.getElementById("react");
    if (root != null) {
        root.addEventListener("touchmove", function (event) {
            event.preventDefault();
            event.stopPropagation();
        }, false);
    }
};
