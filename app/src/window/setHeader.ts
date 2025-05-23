import {isWindow} from "../util/functions";
import {Wnd} from "../layout/Wnd";
import {getAllTabs, getAllWnds} from "../layout/getAll";
import {Editor} from "../editor";
import {Asset} from "../asset";
import {Constants} from "../constants";
import { ipcRenderer } from "electron";

export const setTabPosition = () => {
    if (!isWindow()) {
        return;
    }
    const wndsTemp: Wnd[] = [];
    getAllWnds(window.siyuan.layout.layout, wndsTemp);
    wndsTemp.forEach(async item => {
        const headerElement = item.headersElement.parentElement;
        const rect = headerElement.getBoundingClientRect();
        const dragElement = headerElement.querySelector(".item--readonly .fn__flex-1") as HTMLElement;
        if (rect.top <= 0) {
            dragElement.style.height = dragElement.parentElement.clientHeight + "px";
            (dragElement.style as CSSStyleDeclarationElectron).WebkitAppRegion = "drag";
        } else {
            (dragElement.style as CSSStyleDeclarationElectron).WebkitAppRegion = "";
        }
        const headersLastElement = headerElement.lastElementChild as HTMLElement;
        if ("darwin" === window.siyuan.config.system.os) {
            const isFullScreen = await ipcRenderer.invoke(Constants.SIYUAN_GET, {
                cmd: "isFullScreen",
            });
            if (rect.top <= 0 && rect.left <= 0 && !isFullScreen) {
                // 用 marginLeft 左侧底部无线条
                item.headersElement.style.paddingLeft = "var(--b3-toolbar-left-mac)";
                headersLastElement.style.paddingRight = "42px";
            } else {
                item.headersElement.style.paddingLeft = "";
                headersLastElement.style.paddingRight = "";
            }
        }
        // 显示器缩放后像素存在小数点偏差 https://github.com/siyuan-note/siyuan/issues/7355
        if (rect.top <= 0 && rect.right + 8 >= window.innerWidth) {
            headersLastElement.style.paddingRight = (42 * ("darwin" === window.siyuan.config.system.os ? 1 : 4)) + "px";
        } else {
            headersLastElement.style.paddingRight = "";
        }
    });
};


export const setModelsHash = () => {
    if (!isWindow()) {
        return;
    }
    let hash = "";
    getAllTabs().forEach(tab => {
        if (!tab.model) {
            const initTab = tab.headElement.getAttribute("data-initdata");
            if (initTab) {
                const initTabData = JSON.parse(initTab);
                if (initTabData.instance === "Editor") {
                    hash += initTabData.rootId + Constants.ZWSP;
                }
            }
        } else if (tab.model instanceof Editor) {
            hash += tab.model.editor.protyle.block.rootID + Constants.ZWSP;
        } else if (tab.model instanceof Asset) {
            hash += tab.model.path + Constants.ZWSP;
        }
    });
    window.location.hash = hash;
};
