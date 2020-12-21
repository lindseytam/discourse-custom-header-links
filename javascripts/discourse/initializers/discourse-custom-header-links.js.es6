import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
    name: "discourse-custom-dropdown-header",

    initialize() {
        withPluginApi("0.8.20", (api) => {
            const customHeaderLinks = settings.Custom_header_links;
            const customSubHeaderLinks = settings.Custom_subheader_links;
            const customHeaderTxt = settings.Custom_header_text;

            if (!customHeaderLinks.length) {
                return;
            }

            const linksPosition =
                settings.links_position === "right" ?
                "header-buttons:before" :
                "home-logo:after";

            const headerLinks = [];
            const subHeaderLinks = {};

            customSubHeaderLinks
                .split("|")
                .filter(Boolean)
                .map((customSubHeaderLinksArray) => {
                    const [
                        linkText,
                        linkTitle,
                        linkHref,
                        device,
                        target,
                        keepOnScroll,
                        link
                    ] = customSubHeaderLinksArray
                        .split(",")
                        .filter(Boolean)
                        .map((x) => x.trim());

                    const linkTarget = target === "self" ? "" : "_blank";

                    const anchorAttributes = {
                        title: linkTitle,
                        href: linkHref,
                    };
                    if (linkTarget) {
                        anchorAttributes.target = linkTarget;
                    }

                    if (link in subHeaderLinks) {
                        subHeaderLinks[link].push(h("a", anchorAttributes, linkText))
                    } else {
                        subHeaderLinks[link] = [];
                        subHeaderLinks[link].push(h("a", anchorAttributes, linkText))
                    }

                });


            customHeaderLinks
                .split("|")
                .filter(Boolean)
                .map((customHeaderLinksArray) => {
                    const [
                        linkText,
                        linkTitle,
                        linkHref,
                        device,
                        target,
                        keepOnScroll,
                    ] = customHeaderLinksArray
                        .split(",")
                        .filter(Boolean)
                        .map((x) => x.trim());

                    const deviceClass = `.${device}`;
                    const linkTarget = target === "self" ? "" : "_blank";
                    const keepOnScrollClass = keepOnScroll === "keep" ? ".keep" : "";
                    const linkClass = `.${linkText
          .toLowerCase()
          .replace(/\s/gi, "-")}-custom-header-links`;

                    const anchorAttributes = {
                        title: linkTitle,
                        href: linkHref,
                    };
                    if (linkTarget) {
                        anchorAttributes.target = linkTarget;
                    }

                    if (!(linkText in subHeaderLinks)) {

                        headerLinks.push(
                            h(`li.headerLink${deviceClass}${keepOnScrollClass}${linkClass}`,
                                h("a", anchorAttributes, linkText)
                            ));

                    } else {

                        headerLinks.push(
                            h(
                                `li.headerLink${deviceClass}${keepOnScrollClass}${linkClass}`,

                                [h('div#dropdown', [
                                    h("a", anchorAttributes, linkText),
                                    h("span.caret"),
                                    h("div.dropdown-content", subHeaderLinks[linkText])
                                ])])

                        );

                    }
                });


            api.decorateWidget(linksPosition, (helper) => {
                return helper.h("ul.custom-header-links", headerLinks);
            });

            api.decorateWidget('home-logo:after', helper => {
                return helper.h("div.ml4 ", customHeaderTxt)
            });

            api.decorateWidget("home-logo:after", (helper) => {
                const dHeader = document.querySelector(".d-header");

                if (!dHeader) {
                    return;
                }

                const isTitleVisible = helper.attrs.minimized;
                if (isTitleVisible) {
                    dHeader.classList.add("hide-menus");
                } else {
                    dHeader.classList.remove("hide-menus");
                }
            });
        });
    },
};