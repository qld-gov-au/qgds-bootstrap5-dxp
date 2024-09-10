/**
 * Blockquote component
 * Common js module to support DXP Component Service.
 */
module.exports = async function (input, info) {
  const getBreadcrumbData = function () {
    let breadcrumbHtml = "";
    const navData = [
      {
        link: "#",
        linktext: "Home",
      },
      {
        link: "#",
        linktext: "Topic 01",
      },
      {
        link: "#",
        linktext: "Topic 02",
      },
      {
        link: "#",
        linktext: "Topic 03",
      },
      {
        link: "#",
        linktext: "Current page",
      },
    ];
    const breadcrumbLength = Number(navData.length);

    for (const navItems in navData) {
      if (Number(navItems) + 1 < breadcrumbLength) {
        breadcrumbHtml += `<li class="breadcrumb-item">
                            <a href="${navData[navItems].link}">
                              ${navData[navItems].linktext}                      
                            </a>
                          </li>`;
      } else {
        breadcrumbHtml += `<li class="breadcrumb-item active" aria-current="page" data-href="${navData[navItems].link}">                  
                            ${navData[navItems].linktext}
                          </li>`;
      }
    }

    return breadcrumbHtml;
  };
  return `
          <div class="container-fluid ${input.colour}">
            <div class="container">
              <div class="row">
                <div class="container-xl">
                  <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                      ${getBreadcrumbData()}
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>`;
};
