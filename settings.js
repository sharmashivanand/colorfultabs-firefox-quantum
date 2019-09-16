var defaults = {
    overridetheme: 'no',
    saturation: 61,
    lightness: 73,
    accentcolor: "#fff",
    textcolor: "#000",
    toolbar_text: "#000",
    toolbar_field: "#fff",
    toolbar_field_text: "#000",
};

async function setOption(setting, value) {
    browser.storage.local.set({
        ["options." + setting]: value
    });
    //console.log('setting: ' + setting + "\tvalue:" + value);
}

async function resetOptions(e) {

    e.preventDefault();
    let form = document.querySelector("form");

    let settings = Object.keys(defaults);

    for (var setting of settings) {
        await setOption(setting, defaults[setting]);
    }
    await renderOptionsForm();
}

// Saves all options on submit
async function saveOptions(e) {
    e.preventDefault();
    let form = document.querySelector("form");
    let settings = Object.keys(defaults);
    for (var setting of settings) {
        await setOption(setting, form[setting].value);
    }
}

async function getOption(setting) {
    
    try {
        const found = await browser.storage.local.get("options." + setting);
        if (found.hasOwnProperty("options." + setting)) {
            console.log("setting name: " + setting + '\tsaved value: ' + found["options." + setting]);
            return found["options." + setting];
        } else {
            console.log("setting name: " + setting + '\tsaved value: ' + defaults[setting]);
            return defaults[setting];
        }
    } catch (err) {
        console.log("setting name: " + setting + '\tsaved value: ' + defaults[setting]);
        return defaults[setting];
    }
}

async function renderOptionsForm() {
    try {
        //console.log( await getOption("overridetheme") );
        document.querySelector("#overridetheme").value = await getOption("overridetheme");
        document.querySelector("#saturation").value = await getOption("saturation");
        document.querySelector("#lightness").value = await getOption("lightness");
        document.querySelector("#accentcolor").value = await getOption("accentcolor");
        document.querySelector("#textcolor").value = await getOption("textcolor");
        document.querySelector("#toolbar_text").value = await getOption("toolbar_text");
        document.querySelector("#toolbar_field").value = await getOption("toolbar_field");
        document.querySelector("#toolbar_field_text").value = await getOption("toolbar_field_text");
        overridetheme = await getOption("overridetheme");
        if (overridetheme) {
            document.querySelector("#overridetheme").checked = true;
            console.log('checked');
        } else {
            console.log('unchecked');
        }
    } catch (e) {}
}

document.addEventListener("DOMContentLoaded", renderOptionsForm);
try {
    document.querySelector("form").addEventListener("submit", saveOptions);
    document.querySelector("form").addEventListener("reset", resetOptions);
} catch (e) {}