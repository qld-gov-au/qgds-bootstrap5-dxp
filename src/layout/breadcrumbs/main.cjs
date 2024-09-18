/**
 * Blockquote component
 * Common js module to support DXP Component Service.
 */
module.exports = async function (input, info) {
  const itemLength = input.breadcrumbs.length;
  const items = input.breadcrumbs
    .map(
      (item, i) => `
      <li class="breadcrumb-item">
        ${i + 1 < itemLength ? `<a href="${item.link}">` : ""}
          ${item.linktext}
        ${i + 1 < itemLength ? `</a>` : ""}
      </li>
    `
    )
    .join("");
  return `
      <div class="container-fluid ${input.brandOverride ? input.brandOverride : ""}">
        <div class="container">
          <div class="row">
            <div class="container-xl">
              <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                  ${items}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    `;
};
