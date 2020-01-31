'use strict';
window.addEventListener('DOMContentLoaded', async function () {
    browser.runtime.sendMessage(browser.runtime.id, {
        initialized: "pls send all tabs"
    }, function (response) { });
});

document.oncontextmenu = function () {
    //return false;
};

browser.runtime.onMessage.addListener(async function (message, sender) {
    if (message.tabs) { // We've received tabs
        var gettingCurrent = await browser.windows.getCurrent(
        )

        //console.dir('popup window id:' + gettingCurrent.id);

        if (gettingCurrent.id != message.winId) {
            return;
        }
        await render_tabs(message.tabs, sender)
    }
});

async function render_tabs(message, sender) {

    var tabbar = document.getElementById('colorfulTabsContainer');
    while (tabbar.hasChildNodes()) {
        tabbar.removeChild(tabbar.lastChild)
    }
    let newtabbtn = document.createElement('span');
    newtabbtn.id = 'colorfultabs-newtab';
    //newtabbtn.className = 'tab';
    newtabbtn.addEventListener('click', function () {
        browser.runtime.sendMessage(browser.runtime.id, {
            newtab: 'newtab'
        });
    });
    tabbar.appendChild(newtabbtn);
    let tabstrippinned = document.createElement('span');
    tabstrippinned.id = 'tabstrippinned';
    tabstrippinned.className = 'tabstrippinned';
    tabbar.appendChild(tabstrippinned);
    let tabstrip = document.createElement('span');
    tabstrip.id = 'tabstrip';
    tabstrip.className = 'tabstrip';
    tabbar.appendChild(tabstrip);
    for (var i = 0; i < message.length; ++i) {
        let tab = document.createElement('span');
        tab.className = 'tab';
        tab.id = message[i].id;
        var tabClr;
        if (message[i].hasOwnProperty('color')) {
            try {
                tabClr = JSON.parse(message[i].color);
                var gradientstyle = `linear-gradient(to right, hsla(0,0%,100%,.7),hsla(${tabClr.h},${tabClr.s}%,${tabClr.l}%,.5),hsla(${tabClr.h},${tabClr.s}%,${tabClr.l}%,1)),linear-gradient(to left, hsla(${tabClr.h},${tabClr.s}%,${tabClr.l}%,1),hsla(${tabClr.h},${tabClr.s}%,${tabClr.l}%,1))`;
                tab.style = "background-image:" + gradientstyle;
                if (message[i].active == true) {
                    document.body.style.borderRightColor = `hsla(${tabClr.h},${tabClr.s}%,${tabClr.l}%,1)`;
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        //tab.setAttribute("data-ct-color", `hsl(${tabClr.h},${tabClr.s}%,${tabClr.h}%);`);
        if (message[i].active == true) {
            tabstrip.setAttribute('dataactive', message[i].id);
        }
        tab.setAttribute('active', message[i].active);
        let attribs = Object.keys(message[i]);
        tab.title = message[i].title;
        for (var a = 0; a < attribs.length; a++) {
            if (message[i].hasOwnProperty(attribs[a])) {
                tab.setAttribute("data-ct-" + attribs[a], message[i][attribs[a]]);
            }
        }

        if (message[i].pinned == true) {
            tabstrippinned.appendChild(tab);
        } else {
            tabstrip.appendChild(tab);
        }
        tab.addEventListener('click', function (e) {
            let element = e.target;
            while (element.className != 'tab') {
                element = element.parentElement;
            }
            console.dir(element);
            chrome.tabs.update(parseInt(element.id), {
                active: true
            }, async function (data_tabid) {
            });
        });
        let tabicon = document.createElement('span');
        tabicon.className = 'icon';
        try {
            tabicon.style.setProperty('background', 'url(' + message[i].favIconUrl + ') no-repeat center');
        } catch (e) { }
        tabicon.setAttribute('background-size', 'contain');
        tab.appendChild(tabicon);
        let tabtitle = document.createElement('span');
        tabtitle.className = 'title';
        let titletext = document.createTextNode(message[i].title);
        tabtitle.appendChild(titletext);
        tab.appendChild(tabtitle);
        let tabclose = document.createElement('span');
        tabclose.className = 'closebtn';
        tabclose.setAttribute('data-close-id', message[i].id);
        tab.appendChild(tabclose);
        tabclose.addEventListener('click', function (event) {
            event.stopPropagation();
            event.preventDefault();
            let tabclose = this.getAttribute('data-close-id');
            browser.runtime.sendMessage(browser.runtime.id, {
                close: {
                    tabId: parseInt(tabclose)
                }
            }, function (response) { });
        })
    }
}

async function update_tabs() {
    return document.getElementById('colorfulTabsContainer');
}
