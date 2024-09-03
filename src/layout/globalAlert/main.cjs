/**
 * Accordion component
 * Common js module to support DXP Component Service.
 */
module.exports = async function (input, info) {
    const items = input.alertItems.map(item => `
<section class="global-alert global-alert-${item.variant}">
    <div class="container-fluid">
      <div class="qld-global-alert-main">
        <div class="global-alert-icon"></div>
        <div class="global-alert-content">
          <div class="global-alert-message">
            ${item.content}
          </div>
          <div class="global-alert-action">
            ${item.action?item.action:""}
          </div>
        </div>
        <div class="global-alert-close">
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">Close</button>
        </div>
      </div>
    </div>
</section>
`).join('');

    return `
<!-- QGDS Component: Global Alert -->
<div class="global-alert-include">
  ${items}
</div>
`
};

